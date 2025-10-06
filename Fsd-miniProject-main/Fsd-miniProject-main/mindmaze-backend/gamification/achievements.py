# gamification/achievements.py

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from models import Achievement, AchievementType, User, QuizResult

logger = logging.getLogger(__name__)

class AchievementSystem:
    """Revolutionary gamification system with achievements and rewards."""
    
    def __init__(self):
        self.achievements_db = self._initialize_achievements()
        self.badges_db = self._initialize_badges()
    
    def _initialize_achievements(self) -> Dict[str, Achievement]:
        """Initialize all available achievements."""
        achievements = {}
        
        # Performance Achievements
        achievements["accuracy_master"] = Achievement(
            id="accuracy_master",
            name="Accuracy Master",
            description="Achieve 95% accuracy in any quiz",
            type=AchievementType.PERFORMANCE,
            icon="🎯",
            points_reward=100,
            coins_reward=50,
            requirements={"accuracy": 0.95},
            rarity="rare",
            category="performance"
        )
        
        achievements["speed_demon"] = Achievement(
            id="speed_demon",
            name="Speed Demon",
            description="Complete a quiz in under 60 seconds",
            type=AchievementType.PERFORMANCE,
            icon="⚡",
            points_reward=150,
            coins_reward=75,
            requirements={"time_limit": 60},
            rarity="epic",
            category="performance"
        )
        
        achievements["perfect_score_hero"] = Achievement(
            id="perfect_score_hero",
            name="Perfect Score Hero",
            description="Get 100% accuracy in a quiz",
            type=AchievementType.PERFORMANCE,
            icon="💯",
            points_reward=200,
            coins_reward=100,
            requirements={"accuracy": 1.0},
            rarity="legendary",
            category="performance"
        )
        
        # Streak Achievements
        achievements["fire_streak"] = Achievement(
            id="fire_streak",
            name="Fire Streak",
            description="Get 5 consecutive correct answers",
            type=AchievementType.STREAK,
            icon="🔥",
            points_reward=50,
            coins_reward=25,
            requirements={"consecutive_correct": 5},
            rarity="common",
            category="streak"
        )
        
        achievements["lightning_bolt"] = Achievement(
            id="lightning_bolt",
            name="Lightning Bolt",
            description="Get 10 consecutive correct answers",
            type=AchievementType.STREAK,
            icon="⚡",
            points_reward=100,
            coins_reward=50,
            requirements={"consecutive_correct": 10},
            rarity="rare",
            category="streak"
        )
        
        achievements["unstoppable"] = Achievement(
            id="unstoppable",
            name="Unstoppable",
            description="Get 15 consecutive correct answers",
            type=AchievementType.STREAK,
            icon="🚀",
            points_reward=200,
            coins_reward=100,
            requirements={"consecutive_correct": 15},
            rarity="epic",
            category="streak"
        )
        
        # Mastery Achievements
        achievements["bronze_master"] = Achievement(
            id="bronze_master",
            name="Bronze Master",
            description="Reach Bronze level in any subject",
            type=AchievementType.MASTERY,
            icon="🥉",
            points_reward=75,
            coins_reward=30,
            requirements={"mastery_level": 1},
            rarity="common",
            category="mastery"
        )
        
        achievements["silver_master"] = Achievement(
            id="silver_master",
            name="Silver Master",
            description="Reach Silver level in any subject",
            type=AchievementType.MASTERY,
            icon="🥈",
            points_reward=150,
            coins_reward=60,
            requirements={"mastery_level": 2},
            rarity="rare",
            category="mastery"
        )
        
        achievements["gold_master"] = Achievement(
            id="gold_master",
            name="Gold Master",
            description="Reach Gold level in any subject",
            type=AchievementType.MASTERY,
            icon="🥇",
            points_reward=300,
            coins_reward=120,
            requirements={"mastery_level": 3},
            rarity="epic",
            category="mastery"
        )
        
        achievements["platinum_master"] = Achievement(
            id="platinum_master",
            name="Platinum Master",
            description="Reach Platinum level in any subject",
            type=AchievementType.MASTERY,
            icon="💎",
            points_reward=500,
            coins_reward=200,
            requirements={"mastery_level": 4},
            rarity="legendary",
            category="mastery"
        )
        
        achievements["diamond_master"] = Achievement(
            id="diamond_master",
            name="Diamond Master",
            description="Reach Diamond level in any subject",
            type=AchievementType.MASTERY,
            icon="💠",
            points_reward=1000,
            coins_reward=400,
            requirements={"mastery_level": 5},
            rarity="legendary",
            category="mastery"
        )
        
        # Time-based Achievements
        achievements["early_bird"] = Achievement(
            id="early_bird",
            name="Early Bird",
            description="Be the first to complete a quiz",
            type=AchievementType.TIME_BASED,
            icon="🐦",
            points_reward=100,
            coins_reward=50,
            requirements={"first_completion": True},
            rarity="rare",
            category="time"
        )
        
        achievements["night_owl"] = Achievement(
            id="night_owl",
            name="Night Owl",
            description="Complete a quiz after 10 PM",
            type=AchievementType.TIME_BASED,
            icon="🦉",
            points_reward=75,
            coins_reward=30,
            requirements={"late_night_completion": True},
            rarity="common",
            category="time"
        )
        
        achievements["consistent_performer"] = Achievement(
            id="consistent_performer",
            name="Consistent Performer",
            description="Complete quizzes for 7 consecutive days",
            type=AchievementType.TIME_BASED,
            icon="📅",
            points_reward=200,
            coins_reward=100,
            requirements={"daily_streak": 7},
            rarity="epic",
            category="time"
        )
        
        # Collaboration Achievements
        achievements["team_player"] = Achievement(
            id="team_player",
            name="Team Player",
            description="Participate in 5 group quizzes",
            type=AchievementType.COLLABORATION,
            icon="👥",
            points_reward=150,
            coins_reward=75,
            requirements={"group_quizzes": 5},
            rarity="rare",
            category="collaboration"
        )
        
        achievements["mentor"] = Achievement(
            id="mentor",
            name="Mentor",
            description="Help 3 other players improve their scores",
            type=AchievementType.COLLABORATION,
            icon="🎓",
            points_reward=300,
            coins_reward=150,
            requirements={"mentored_players": 3},
            rarity="epic",
            category="collaboration"
        )
        
        achievements["study_buddy"] = Achievement(
            id="study_buddy",
            name="Study Buddy",
            description="Form a study group with 5+ members",
            type=AchievementType.COLLABORATION,
            icon="🤝",
            points_reward=250,
            coins_reward=125,
            requirements={"study_group_size": 5},
            rarity="epic",
            category="collaboration"
        )
        
        # Special Achievements
        achievements["quiz_master"] = Achievement(
            id="quiz_master",
            name="Quiz Master",
            description="Complete 100 quizzes",
            type=AchievementType.SPECIAL,
            icon="👑",
            points_reward=1000,
            coins_reward=500,
            requirements={"total_quizzes": 100},
            rarity="legendary",
            category="special"
        )
        
        achievements["category_explorer"] = Achievement(
            id="category_explorer",
            name="Category Explorer",
            description="Complete quizzes in all available categories",
            type=AchievementType.SPECIAL,
            icon="🗺️",
            points_reward=500,
            coins_reward=250,
            requirements={"all_categories": True},
            rarity="epic",
            category="special"
        )
        
        achievements["century_club"] = Achievement(
            id="century_club",
            name="Century Club",
            description="Score 100+ points in a single quiz",
            type=AchievementType.SPECIAL,
            icon="💯",
            points_reward=300,
            coins_reward=150,
            requirements={"single_quiz_score": 100},
            rarity="rare",
            category="special"
        )
        
        return achievements
    
    def _initialize_badges(self) -> Dict[str, Dict]:
        """Initialize all available badges."""
        return {
            "newcomer": {
                "id": "newcomer",
                "name": "Newcomer",
                "description": "Welcome to the platform!",
                "icon": "🆕",
                "color": "#4CAF50",
                "requirements": {"first_login": True},
                "rarity": "common"
            },
            "dedicated": {
                "id": "dedicated",
                "name": "Dedicated",
                "description": "Complete 10 quizzes",
                "icon": "💪",
                "color": "#2196F3",
                "requirements": {"total_quizzes": 10},
                "rarity": "common"
            },
            "scholar": {
                "id": "scholar",
                "name": "Scholar",
                "description": "Maintain 90%+ accuracy for 5 quizzes",
                "icon": "🎓",
                "color": "#FF9800",
                "requirements": {"accuracy_streak": 5},
                "rarity": "rare"
            },
            "genius": {
                "id": "genius",
                "name": "Genius",
                "description": "Achieve perfect score in 3 different categories",
                "icon": "🧠",
                "color": "#9C27B0",
                "requirements": {"perfect_scores": 3},
                "rarity": "epic"
            },
            "legend": {
                "id": "legend",
                "name": "Legend",
                "description": "Reach the top 1% of all players",
                "icon": "⭐",
                "color": "#F44336",
                "requirements": {"top_percentile": 1},
                "rarity": "legendary"
            }
        }
    
    async def check_achievements(self, user: User, quiz_result: QuizResult) -> List[str]:
        """Check and unlock achievements for a user."""
        unlocked_achievements = []
        
        for achievement_id, achievement in self.achievements_db.items():
            if achievement_id in user.achievements:
                continue  # Already unlocked
            
            if await self._check_achievement_requirements(user, achievement, quiz_result):
                unlocked_achievements.append(achievement_id)
                user.achievements.append(achievement_id)
                user.total_points += achievement.points_reward
                user.quiz_coins += achievement.coins_reward
                
                logger.info(f"Unlocked achievement {achievement.name} for user {user.username}")
        
        return unlocked_achievements
    
    async def check_badges(self, user: User, quiz_result: QuizResult) -> List[str]:
        """Check and unlock badges for a user."""
        unlocked_badges = []
        
        for badge_id, badge in self.badges_db.items():
            if badge_id in user.badges:
                continue  # Already unlocked
            
            if await self._check_badge_requirements(user, badge, quiz_result):
                unlocked_badges.append(badge_id)
                user.badges.append(badge_id)
                
                logger.info(f"Unlocked badge {badge.name} for user {user.username}")
        
        return unlocked_badges
    
    async def _check_achievement_requirements(self, user: User, achievement: Achievement, 
                                            quiz_result: QuizResult) -> bool:
        """Check if achievement requirements are met."""
        requirements = achievement.requirements
        
        if achievement.type == AchievementType.PERFORMANCE:
            if "accuracy" in requirements:
                if quiz_result.accuracy >= requirements["accuracy"]:
                    return True
            
            if "time_limit" in requirements:
                if quiz_result.time_taken <= requirements["time_limit"]:
                    return True
        
        elif achievement.type == AchievementType.STREAK:
            if "consecutive_correct" in requirements:
                # This would need to be tracked in the user's session
                return False  # Placeholder
        
        elif achievement.type == AchievementType.MASTERY:
            if "mastery_level" in requirements:
                for subject, level in user.mastery_levels.items():
                    if level >= requirements["mastery_level"]:
                        return True
        
        elif achievement.type == AchievementType.TIME_BASED:
            if "first_completion" in requirements:
                # This would need to be tracked in the quiz session
                return False  # Placeholder
            
            if "late_night_completion" in requirements:
                hour = quiz_result.completed_at.hour
                if hour >= 22 or hour <= 2:  # 10 PM to 2 AM
                    return True
        
        elif achievement.type == AchievementType.SPECIAL:
            if "total_quizzes" in requirements:
                # This would need to be tracked in user stats
                return False  # Placeholder
        
        return False
    
    async def _check_badge_requirements(self, user: User, badge: Dict, 
                                      quiz_result: QuizResult) -> bool:
        """Check if badge requirements are met."""
        requirements = badge["requirements"]
        
        if "first_login" in requirements:
            return user.created_at and (datetime.utcnow() - user.created_at).days < 1
        
        if "total_quizzes" in requirements:
            # This would need to be tracked in user stats
            return False  # Placeholder
        
        return False
    
    async def calculate_experience(self, quiz_result: QuizResult, 
                                 difficulty_multiplier: float = 1.0) -> int:
        """Calculate experience points earned from a quiz."""
        base_exp = quiz_result.correct_answers * 10
        accuracy_bonus = int(quiz_result.accuracy * 50)
        speed_bonus = max(0, 100 - quiz_result.time_taken) // 10
        difficulty_bonus = int(base_exp * difficulty_multiplier)
        
        total_exp = base_exp + accuracy_bonus + speed_bonus + difficulty_bonus
        return max(1, total_exp)
    
    async def calculate_level(self, experience: int) -> int:
        """Calculate user level based on experience."""
        # Exponential leveling: level = sqrt(experience / 100)
        return int((experience / 100) ** 0.5) + 1
    
    async def calculate_mastery_level(self, subject: str, user: User) -> int:
        """Calculate mastery level for a subject."""
        # This would be based on performance in that subject
        # Placeholder implementation
        return user.mastery_levels.get(subject, 0)
    
    async def get_leaderboard_data(self, limit: int = 100) -> List[Dict]:
        """Get leaderboard data with rankings."""
        # This would query the database for top users
        # Placeholder implementation
        return []
    
    async def get_achievement_progress(self, user: User, achievement_id: str) -> Dict:
        """Get progress towards an achievement."""
        if achievement_id not in self.achievements_db:
            return {"error": "Achievement not found"}
        
        achievement = self.achievements_db[achievement_id]
        requirements = achievement.requirements
        
        # Calculate progress based on requirements
        progress = {
            "achievement_id": achievement_id,
            "name": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "rarity": achievement.rarity,
            "progress": 0,  # 0-100
            "requirements": requirements,
            "unlocked": achievement_id in user.achievements
        }
        
        return progress

# Global achievement system instance
achievement_system = AchievementSystem()
