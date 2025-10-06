# gamification/points.py

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from models import User, QuizResult, DifficultyLevel

logger = logging.getLogger(__name__)

class PointsSystem:
    """Advanced points and scoring system with multipliers and bonuses."""
    
    def __init__(self):
        self.difficulty_multipliers = {
            DifficultyLevel.EASY: 1.0,
            DifficultyLevel.MEDIUM: 1.5,
            DifficultyLevel.HARD: 2.0,
            DifficultyLevel.EXPERT: 3.0
        }
        
        self.streak_multipliers = {
            3: 1.2,   # 3x streak = 1.2x points
            5: 1.5,   # 5x streak = 1.5x points
            10: 2.0,  # 10x streak = 2.0x points
            15: 2.5,  # 15x streak = 2.5x points
            20: 3.0   # 20x streak = 3.0x points
        }
    
    async def calculate_base_points(self, correct_answers: int, 
                                  difficulty: DifficultyLevel) -> int:
        """Calculate base points for correct answers."""
        base_points = {
            DifficultyLevel.EASY: 10,
            DifficultyLevel.MEDIUM: 15,
            DifficultyLevel.HARD: 25,
            DifficultyLevel.EXPERT: 40
        }
        
        return correct_answers * base_points[difficulty]
    
    async def calculate_speed_multiplier(self, time_taken: int, 
                                       time_limit: int) -> float:
        """Calculate speed multiplier based on response time."""
        if time_taken <= time_limit * 0.25:  # Within 25% of time limit
            return 2.0
        elif time_taken <= time_limit * 0.5:  # Within 50% of time limit
            return 1.5
        elif time_taken <= time_limit * 0.75:  # Within 75% of time limit
            return 1.2
        else:
            return 1.0
    
    async def calculate_streak_multiplier(self, current_streak: int) -> float:
        """Calculate streak multiplier based on consecutive correct answers."""
        for streak_threshold in sorted(self.streak_multipliers.keys(), reverse=True):
            if current_streak >= streak_threshold:
                return self.streak_multipliers[streak_threshold]
        return 1.0
    
    async def calculate_difficulty_bonus(self, difficulty: DifficultyLevel) -> int:
        """Calculate bonus points for attempting higher difficulty."""
        bonus_points = {
            DifficultyLevel.EASY: 0,
            DifficultyLevel.MEDIUM: 5,
            DifficultyLevel.HARD: 15,
            DifficultyLevel.EXPERT: 30
        }
        
        return bonus_points[difficulty]
    
    async def calculate_participation_reward(self, quiz_completed: bool) -> int:
        """Calculate points for just completing a quiz."""
        return 5 if quiz_completed else 0
    
    async def calculate_accuracy_bonus(self, accuracy: float) -> int:
        """Calculate bonus points based on accuracy."""
        if accuracy >= 0.95:  # 95%+ accuracy
            return 50
        elif accuracy >= 0.90:  # 90%+ accuracy
            return 25
        elif accuracy >= 0.80:  # 80%+ accuracy
            return 10
        else:
            return 0
    
    async def calculate_time_bonus(self, time_taken: int, 
                                  average_time: int) -> int:
        """Calculate bonus for completing faster than average."""
        if time_taken < average_time * 0.5:  # 50% faster than average
            return 20
        elif time_taken < average_time * 0.75:  # 25% faster than average
            return 10
        else:
            return 0
    
    async def calculate_total_points(self, quiz_result: QuizResult, 
                                   user: User, session_data: Dict[str, Any]) -> Dict[str, int]:
        """Calculate total points with all bonuses and multipliers."""
        
        # Base points
        base_points = await self.calculate_base_points(
            quiz_result.correct_answers, 
            session_data.get("difficulty", "medium")
        )
        
        # Speed multiplier
        speed_multiplier = await self.calculate_speed_multiplier(
            quiz_result.time_taken,
            session_data.get("time_limit", 300)
        )
        
        # Streak multiplier
        current_streak = session_data.get("current_streak", 0)
        streak_multiplier = await self.calculate_streak_multiplier(current_streak)
        
        # Difficulty bonus
        difficulty_bonus = await self.calculate_difficulty_bonus(
            session_data.get("difficulty", "medium")
        )
        
        # Participation reward
        participation_reward = await self.calculate_participation_reward(True)
        
        # Accuracy bonus
        accuracy_bonus = await self.calculate_accuracy_bonus(quiz_result.accuracy)
        
        # Time bonus
        average_time = session_data.get("average_time", quiz_result.time_taken)
        time_bonus = await self.calculate_time_bonus(quiz_result.time_taken, average_time)
        
        # Calculate final points
        base_with_bonuses = base_points + difficulty_bonus + participation_reward + accuracy_bonus + time_bonus
        final_points = int(base_with_bonuses * speed_multiplier * streak_multiplier)
        
        # Calculate coins (1 coin per 10 points)
        coins_earned = final_points // 10
        
        return {
            "base_points": base_points,
            "speed_multiplier": speed_multiplier,
            "streak_multiplier": streak_multiplier,
            "difficulty_bonus": difficulty_bonus,
            "participation_reward": participation_reward,
            "accuracy_bonus": accuracy_bonus,
            "time_bonus": time_bonus,
            "final_points": final_points,
            "coins_earned": coins_earned
        }
    
    async def update_user_points(self, user: User, points_data: Dict[str, int]) -> None:
        """Update user's total points and coins."""
        user.total_points += points_data["final_points"]
        user.quiz_coins += points_data["coins_earned"]
        
        # Update experience
        experience_gained = points_data["final_points"] // 2
        user.experience += experience_gained
        
        # Check for level up
        new_level = await self.calculate_level(user.experience)
        if new_level > user.level:
            user.level = new_level
            logger.info(f"User {user.username} leveled up to level {new_level}")
    
    async def calculate_level(self, experience: int) -> int:
        """Calculate user level based on experience."""
        # Exponential leveling: level = sqrt(experience / 100)
        return int((experience / 100) ** 0.5) + 1
    
    async def get_level_progress(self, user: User) -> Dict[str, Any]:
        """Get progress towards next level."""
        current_level = user.level
        current_exp = user.experience
        
        # Calculate experience needed for current level
        exp_for_current = (current_level - 1) ** 2 * 100
        exp_for_next = current_level ** 2 * 100
        
        progress = (current_exp - exp_for_current) / (exp_for_next - exp_for_current)
        progress = max(0, min(1, progress))  # Clamp between 0 and 1
        
        return {
            "current_level": current_level,
            "current_experience": current_exp,
            "experience_needed": exp_for_next - current_exp,
            "progress_percentage": int(progress * 100),
            "exp_for_current_level": exp_for_current,
            "exp_for_next_level": exp_for_next
        }
    
    async def calculate_daily_bonus(self, user: User) -> Dict[str, int]:
        """Calculate daily login bonus."""
        today = datetime.utcnow().date()
        last_login = user.last_login.date() if user.last_login else None
        
        if last_login == today:
            return {"bonus_points": 0, "bonus_coins": 0, "message": "Already claimed today"}
        
        # Calculate streak bonus
        streak_bonus = min(user.streaks.get("daily", 0) * 5, 50)  # Max 50 bonus
        base_bonus = 10
        
        total_points = base_bonus + streak_bonus
        total_coins = total_points // 5
        
        return {
            "bonus_points": total_points,
            "bonus_coins": total_coins,
            "streak_bonus": streak_bonus,
            "message": f"Daily bonus: {total_points} points, {total_coins} coins"
        }
    
    async def calculate_weekly_challenge_bonus(self, user: User, 
                                             challenge_data: Dict[str, Any]) -> Dict[str, int]:
        """Calculate bonus points for weekly challenges."""
        if not challenge_data.get("completed", False):
            return {"bonus_points": 0, "bonus_coins": 0}
        
        base_bonus = challenge_data.get("base_bonus", 100)
        difficulty_multiplier = challenge_data.get("difficulty_multiplier", 1.0)
        
        total_points = int(base_bonus * difficulty_multiplier)
        total_coins = total_points // 10
        
        return {
            "bonus_points": total_points,
            "bonus_coins": total_coins,
            "challenge_name": challenge_data.get("name", "Weekly Challenge")
        }
    
    async def get_points_breakdown(self, quiz_result: QuizResult, 
                                 session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get detailed breakdown of points calculation."""
        points_data = await self.calculate_total_points(quiz_result, None, session_data)
        
        return {
            "quiz_result": {
                "correct_answers": quiz_result.correct_answers,
                "total_questions": quiz_result.total_questions,
                "accuracy": quiz_result.accuracy,
                "time_taken": quiz_result.time_taken
            },
            "points_breakdown": points_data,
            "multipliers": {
                "speed": points_data["speed_multiplier"],
                "streak": points_data["streak_multiplier"]
            },
            "bonuses": {
                "difficulty": points_data["difficulty_bonus"],
                "participation": points_data["participation_reward"],
                "accuracy": points_data["accuracy_bonus"],
                "time": points_data["time_bonus"]
            }
        }
    
    async def get_leaderboard_points(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get leaderboard with points and rankings."""
        # This would query the database for top users by total_points
        # Placeholder implementation
        return []
    
    async def get_user_rank(self, user: User) -> Dict[str, Any]:
        """Get user's rank and percentile."""
        # This would calculate user's rank among all users
        # Placeholder implementation
        return {
            "rank": 1,
            "total_users": 1000,
            "percentile": 99.9,
            "points": user.total_points,
            "level": user.level
        }

# Global points system instance
points_system = PointsSystem()
