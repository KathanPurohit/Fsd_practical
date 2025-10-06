# analytics/engine.py

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict, Counter
import json

from models import User, QuizResult, AnalyticsEvent, AntiCheatEvent
from database import db

logger = logging.getLogger(__name__)

class AnalyticsEngine:
    """Advanced analytics engine for comprehensive data analysis."""
    
    def __init__(self):
        self.event_cache = defaultdict(list)
        self.real_time_metrics = {}
        self.aggregated_data = {}
    
    async def track_event(self, user_id: str, event_type: str, 
                         metadata: Dict[str, Any] = None, 
                         session_id: str = None) -> None:
        """Track user events for analytics."""
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            session_id=session_id,
            metadata=metadata or {},
            ip_address=None  # Would be set from request context
        )
        
        # Store in cache for real-time processing
        self.event_cache[event_type].append(event)
        
        # Store in database
        try:
            await db.analytics_events.insert_one(event.dict())
        except Exception as e:
            logger.error(f"Failed to store analytics event: {e}")
    
    async def analyze_user_performance(self, user_id: str, 
                                     time_period: str = "30d") -> Dict[str, Any]:
        """Analyze individual user performance."""
        end_date = datetime.utcnow()
        start_date = self._get_start_date(time_period, end_date)
        
        # Get user's quiz results
        quiz_results = await db.quiz_results.find({
            "user_id": user_id,
            "completed_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(None)
        
        if not quiz_results:
            return {"error": "No data found for the specified period"}
        
        # Calculate performance metrics
        total_quizzes = len(quiz_results)
        total_questions = sum(r["total_questions"] for r in quiz_results)
        total_correct = sum(r["correct_answers"] for r in quiz_results)
        total_time = sum(r["time_taken"] for r in quiz_results)
        
        accuracy = total_correct / total_questions if total_questions > 0 else 0
        avg_time_per_question = total_time / total_questions if total_questions > 0 else 0
        
        # Category performance
        category_performance = defaultdict(lambda: {"correct": 0, "total": 0, "time": 0})
        for result in quiz_results:
            category = result.get("category", "unknown")
            category_performance[category]["correct"] += result["correct_answers"]
            category_performance[category]["total"] += result["total_questions"]
            category_performance[category]["time"] += result["time_taken"]
        
        # Calculate category accuracies
        category_accuracies = {}
        for category, data in category_performance.items():
            if data["total"] > 0:
                category_accuracies[category] = {
                    "accuracy": data["correct"] / data["total"],
                    "avg_time": data["time"] / data["total"],
                    "questions_attempted": data["total"]
                }
        
        # Difficulty performance
        difficulty_performance = self._analyze_difficulty_performance(quiz_results)
        
        # Time-based analysis
        time_analysis = self._analyze_time_patterns(quiz_results)
        
        # Improvement trends
        improvement_trends = self._analyze_improvement_trends(quiz_results)
        
        return {
            "user_id": user_id,
            "period": time_period,
            "summary": {
                "total_quizzes": total_quizzes,
                "total_questions": total_questions,
                "total_correct": total_correct,
                "overall_accuracy": accuracy,
                "avg_time_per_question": avg_time_per_question,
                "total_time_spent": total_time
            },
            "category_performance": category_accuracies,
            "difficulty_performance": difficulty_performance,
            "time_analysis": time_analysis,
            "improvement_trends": improvement_trends
        }
    
    async def analyze_platform_metrics(self, time_period: str = "7d") -> Dict[str, Any]:
        """Analyze platform-wide metrics."""
        end_date = datetime.utcnow()
        start_date = self._get_start_date(time_period, end_date)
        
        # User metrics
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({
            "last_login": {"$gte": start_date}
        })
        new_users = await db.users.count_documents({
            "created_at": {"$gte": start_date}
        })
        
        # Quiz metrics
        total_quizzes = await db.quiz_results.count_documents({
            "completed_at": {"$gte": start_date, "$lte": end_date}
        })
        
        # Performance metrics
        quiz_results = await db.quiz_results.find({
            "completed_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(None)
        
        if quiz_results:
            total_questions = sum(r["total_questions"] for r in quiz_results)
            total_correct = sum(r["correct_answers"] for r in quiz_results)
            platform_accuracy = total_correct / total_questions if total_questions > 0 else 0
        else:
            platform_accuracy = 0
        
        # Category popularity
        category_stats = await self._analyze_category_popularity(start_date, end_date)
        
        # Engagement metrics
        engagement_metrics = await self._analyze_engagement_metrics(start_date, end_date)
        
        # Anti-cheat metrics
        anti_cheat_metrics = await self._analyze_anti_cheat_metrics(start_date, end_date)
        
        return {
            "period": time_period,
            "user_metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "new_users": new_users,
                "user_growth_rate": self._calculate_growth_rate(new_users, total_users)
            },
            "quiz_metrics": {
                "total_quizzes": total_quizzes,
                "platform_accuracy": platform_accuracy,
                "avg_quizzes_per_user": total_quizzes / active_users if active_users > 0 else 0
            },
            "category_stats": category_stats,
            "engagement_metrics": engagement_metrics,
            "anti_cheat_metrics": anti_cheat_metrics
        }
    
    async def predict_optimal_difficulty(self, user_id: str, category: str) -> Dict[str, Any]:
        """Predict optimal difficulty for a user in a category."""
        # Get user's historical performance in this category
        category_results = await db.quiz_results.find({
            "user_id": user_id,
            "category": category
        }).sort("completed_at", -1).limit(20).to_list(20)
        
        if not category_results:
            return {"recommended_difficulty": "medium", "confidence": 0.5}
        
        # Analyze recent performance
        recent_accuracy = sum(r["accuracy"] for r in category_results[:5]) / min(5, len(category_results))
        recent_time = sum(r["time_taken"] for r in category_results[:5]) / min(5, len(category_results))
        
        # Calculate difficulty recommendation
        if recent_accuracy >= 0.9 and recent_time < 180:  # High accuracy, fast completion
            recommended = "hard"
            confidence = 0.8
        elif recent_accuracy >= 0.7 and recent_time < 300:  # Good accuracy, reasonable time
            recommended = "medium"
            confidence = 0.7
        elif recent_accuracy < 0.5:  # Low accuracy
            recommended = "easy"
            confidence = 0.6
        else:
            recommended = "medium"
            confidence = 0.5
        
        return {
            "recommended_difficulty": recommended,
            "confidence": confidence,
            "analysis": {
                "recent_accuracy": recent_accuracy,
                "recent_avg_time": recent_time,
                "samples_analyzed": len(category_results)
            }
        }
    
    async def detect_learning_patterns(self, user_id: str) -> Dict[str, Any]:
        """Detect learning patterns and preferences."""
        # Get user's quiz history
        quiz_results = await db.quiz_results.find({
            "user_id": user_id
        }).sort("completed_at", -1).limit(50).to_list(50)
        
        if not quiz_results:
            return {"error": "Insufficient data for pattern analysis"}
        
        # Analyze time patterns
        time_patterns = self._analyze_time_patterns(quiz_results)
        
        # Analyze category preferences
        category_preferences = self._analyze_category_preferences(quiz_results)
        
        # Analyze difficulty preferences
        difficulty_preferences = self._analyze_difficulty_preferences(quiz_results)
        
        # Analyze improvement patterns
        improvement_patterns = self._analyze_improvement_patterns(quiz_results)
        
        return {
            "user_id": user_id,
            "time_patterns": time_patterns,
            "category_preferences": category_preferences,
            "difficulty_preferences": difficulty_preferences,
            "improvement_patterns": improvement_patterns
        }
    
    async def generate_study_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Generate personalized study recommendations."""
        # Get user's performance data
        performance_data = await self.analyze_user_performance(user_id, "30d")
        
        if "error" in performance_data:
            return {"error": "Insufficient data for recommendations"}
        
        recommendations = []
        
        # Category-based recommendations
        category_performance = performance_data.get("category_performance", {})
        for category, data in category_performance.items():
            if data["accuracy"] < 0.7:  # Low accuracy
                recommendations.append({
                    "type": "category_focus",
                    "category": category,
                    "reason": f"Low accuracy ({data['accuracy']:.1%}) in {category}",
                    "priority": "high",
                    "suggested_actions": [
                        f"Practice more {category} questions",
                        "Review fundamental concepts",
                        "Try easier difficulty first"
                    ]
                })
        
        # Time-based recommendations
        time_analysis = performance_data.get("time_analysis", {})
        if time_analysis.get("avg_time_per_question", 0) > 60:  # More than 1 minute per question
            recommendations.append({
                "type": "time_management",
                "reason": "Slow response times detected",
                "priority": "medium",
                "suggested_actions": [
                    "Practice speed quizzes",
                    "Focus on quick recall",
                    "Use time management techniques"
                ]
            })
        
        # Difficulty recommendations
        difficulty_performance = performance_data.get("difficulty_performance", {})
        if difficulty_performance:
            # Recommend appropriate difficulty level
            recommendations.append({
                "type": "difficulty_adjustment",
                "reason": "Optimize difficulty for better learning",
                "priority": "medium",
                "suggested_actions": [
                    "Try medium difficulty questions",
                    "Gradually increase difficulty",
                    "Focus on accuracy over speed"
                ]
            })
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "high_priority": len([r for r in recommendations if r["priority"] == "high"])
        }
    
    def _get_start_date(self, time_period: str, end_date: datetime) -> datetime:
        """Get start date based on time period."""
        periods = {
            "1d": timedelta(days=1),
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "1y": timedelta(days=365)
        }
        return end_date - periods.get(time_period, timedelta(days=30))
    
    def _analyze_difficulty_performance(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze performance by difficulty level."""
        difficulty_stats = defaultdict(lambda: {"correct": 0, "total": 0, "time": 0})
        
        for result in quiz_results:
            difficulty = result.get("difficulty", "medium")
            difficulty_stats[difficulty]["correct"] += result["correct_answers"]
            difficulty_stats[difficulty]["total"] += result["total_questions"]
            difficulty_stats[difficulty]["time"] += result["time_taken"]
        
        performance = {}
        for difficulty, stats in difficulty_stats.items():
            if stats["total"] > 0:
                performance[difficulty] = {
                    "accuracy": stats["correct"] / stats["total"],
                    "avg_time": stats["time"] / stats["total"],
                    "questions_attempted": stats["total"]
                }
        
        return performance
    
    def _analyze_time_patterns(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze time-based patterns."""
        if not quiz_results:
            return {}
        
        # Group by hour of day
        hour_performance = defaultdict(list)
        for result in quiz_results:
            hour = result["completed_at"].hour
            hour_performance[hour].append(result["accuracy"])
        
        # Calculate average accuracy by hour
        hourly_accuracy = {}
        for hour, accuracies in hour_performance.items():
            hourly_accuracy[hour] = sum(accuracies) / len(accuracies)
        
        # Find best performing hours
        best_hours = sorted(hourly_accuracy.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "hourly_accuracy": hourly_accuracy,
            "best_performing_hours": [h[0] for h in best_hours],
            "avg_accuracy": sum(hourly_accuracy.values()) / len(hourly_accuracy) if hourly_accuracy else 0
        }
    
    def _analyze_improvement_trends(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze improvement trends over time."""
        if len(quiz_results) < 5:
            return {"trend": "insufficient_data"}
        
        # Sort by completion time
        sorted_results = sorted(quiz_results, key=lambda x: x["completed_at"])
        
        # Calculate moving average
        window_size = min(5, len(sorted_results) // 3)
        recent_accuracy = sum(r["accuracy"] for r in sorted_results[-window_size:]) / window_size
        early_accuracy = sum(r["accuracy"] for r in sorted_results[:window_size]) / window_size
        
        improvement = recent_accuracy - early_accuracy
        
        if improvement > 0.1:
            trend = "improving"
        elif improvement < -0.1:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "improvement_rate": improvement,
            "recent_accuracy": recent_accuracy,
            "early_accuracy": early_accuracy
        }
    
    async def _analyze_category_popularity(self, start_date: datetime, 
                                         end_date: datetime) -> Dict[str, Any]:
        """Analyze category popularity and performance."""
        # This would query the database for category statistics
        # Placeholder implementation
        return {}
    
    async def _analyze_engagement_metrics(self, start_date: datetime, 
                                        end_date: datetime) -> Dict[str, Any]:
        """Analyze user engagement metrics."""
        # This would analyze user engagement patterns
        # Placeholder implementation
        return {}
    
    async def _analyze_anti_cheat_metrics(self, start_date: datetime, 
                                        end_date: datetime) -> Dict[str, Any]:
        """Analyze anti-cheat metrics."""
        # This would analyze anti-cheat events
        # Placeholder implementation
        return {}
    
    def _calculate_growth_rate(self, new_users: int, total_users: int) -> float:
        """Calculate user growth rate."""
        if total_users == 0:
            return 0
        return (new_users / total_users) * 100
    
    def _analyze_category_preferences(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze user's category preferences."""
        category_counts = Counter(r.get("category", "unknown") for r in quiz_results)
        total_quizzes = len(quiz_results)
        
        preferences = {}
        for category, count in category_counts.items():
            preferences[category] = {
                "quiz_count": count,
                "percentage": (count / total_quizzes) * 100
            }
        
        return preferences
    
    def _analyze_difficulty_preferences(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze user's difficulty preferences."""
        difficulty_counts = Counter(r.get("difficulty", "medium") for r in quiz_results)
        total_quizzes = len(quiz_results)
        
        preferences = {}
        for difficulty, count in difficulty_counts.items():
            preferences[difficulty] = {
                "quiz_count": count,
                "percentage": (count / total_quizzes) * 100
            }
        
        return preferences
    
    def _analyze_improvement_patterns(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Analyze improvement patterns."""
        if len(quiz_results) < 3:
            return {"pattern": "insufficient_data"}
        
        # Sort by completion time
        sorted_results = sorted(quiz_results, key=lambda x: x["completed_at"])
        
        # Calculate improvement rate
        accuracies = [r["accuracy"] for r in sorted_results]
        improvement_rate = (accuracies[-1] - accuracies[0]) / len(accuracies)
        
        return {
            "improvement_rate": improvement_rate,
            "pattern": "improving" if improvement_rate > 0 else "stable" if improvement_rate == 0 else "declining"
        }

# Global analytics engine instance
analytics_engine = AnalyticsEngine()
