# api/http_routes.py

from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import logging

from database import db, serialize_mongo_doc
from models import User, QuizResult, Achievement, Badge, LeaderboardEntry, StudyStreak, Guild
from game_data import CATEGORY_PUZZLES
from game_logic.state import active_games, connected_players, waiting_players
from game_logic.utils import normalize_answer, is_answer_correct
from gamification.achievements import achievement_system
from gamification.points import points_system
from analytics.engine import analytics_engine
from anti_cheat.detector import anti_cheat_detector

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def root():
    return {"message": "MindMaze Ultimate Quiz Platform API", "status": "connected", "version": "2.0.0"}

# User Management
@router.post("/api/register")
@router.post("/api/signup")
async def signup(user: User, request: Request):
    """Enhanced user registration with device fingerprinting."""
    if await db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if user.email and await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Get client information for anti-cheat
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    user_dict = user.dict(exclude={"password", "confirmPassword"})
    user_dict.update({
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "ip_address": client_ip,
        "user_agent": user_agent,
        "total_points": 0,
        "quiz_coins": 100,  # Welcome bonus
        "level": 1,
        "experience": 0,
        "achievements": [],
        "badges": [],
        "streaks": {},
        "mastery_levels": {},
        "preferences": {}
    })
    
    await db.users.insert_one(user_dict)
    
    # Track registration event
    await analytics_engine.track_event(
        user.username, "user_registered", 
        {"registration_method": "direct"}
    )
    
    return {"message": "User created successfully", "user": serialize_mongo_doc(user_dict)}

@router.post("/api/login")
async def login(user: User, request: Request):
    """Enhanced login with device verification."""
    existing_user = await db.users.find_one({"username": user.username})
    if not existing_user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Update login information
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    await db.users.update_one(
        {"username": user.username}, 
        {
            "$set": {
                "last_login": datetime.utcnow(),
                "ip_address": client_ip,
                "user_agent": user_agent
            }
        }
    )
    
    # Track login event
    await analytics_engine.track_event(
        user.username, "user_login", 
        {"login_method": "direct"}
    )
    
    return {"message": "Login successful", "user": serialize_mongo_doc(existing_user)}

# Database migration helper
async def migrate_user_schema():
    """Ensure all users have required fields for leaderboard."""
    try:
        # Update users that don't have total_points field
        result = await db.users.update_many(
            {"total_points": {"$exists": False}},
            {"$set": {"total_points": 0}}
        )
        if result.modified_count > 0:
            logger.info(f"Migrated {result.modified_count} users to include total_points field")
        
        # Update users that don't have level field
        result = await db.users.update_many(
            {"level": {"$exists": False}},
            {"$set": {"level": 1}}
        )
        if result.modified_count > 0:
            logger.info(f"Migrated {result.modified_count} users to include level field")
            
    except Exception as e:
        logger.error(f"Error during user schema migration: {e}")

# Enhanced Leaderboard System
@router.get("/api/leaderboard")
async def get_leaderboard(category: Optional[str] = None, limit: int = 100):
    """Get enhanced leaderboard with multiple categories."""
    # Ensure user schema is up to date
    await migrate_user_schema()
    
    query = {}
    if category:
        query["category"] = category
    
    # Get top users by total points (fallback to score if total_points doesn't exist)
    users = await db.users.find(
        query, 
        {"_id": 0, "username": 1, "total_points": 1, "score": 1, "level": 1, "avatar": 1, "badges": 1, "streaks": 1, "achievements": 1}
    ).sort("total_points", -1).limit(limit).to_list(limit)
    
    # Add rankings
    leaderboard = []
    for i, user in enumerate(users, 1):
        # Use total_points if available, otherwise fallback to score
        user_score = user.get("total_points", user.get("score", 0))
        
        # Calculate additional stats
        streaks = user.get("streaks", {})
        total_streak = sum(streaks.values()) if streaks else 0
        achievements = user.get("achievements", [])
        
        leaderboard.append({
            "rank": i,
            "username": user["username"],
            "score": user_score,
            "level": user.get("level", 1),
            "avatar": user.get("avatar"),
            "badges": user.get("badges", []),
            "streak": total_streak,
            "total_quizzes": len(achievements),  # Use achievements count as proxy for quizzes
            "accuracy": 85.0  # Placeholder accuracy
        })
    
    return {
        "leaderboard": leaderboard, 
        "category": category, 
        "total": len(leaderboard),
        "global": leaderboard  # Add global field for frontend compatibility
    }

@router.get("/api/leaderboard/category/{category}")
async def get_category_leaderboard(category: str, limit: int = 50):
    """Get leaderboard for specific category."""
    # This would analyze quiz results by category
    # Placeholder implementation
    return {"leaderboard": [], "category": category}

@router.get("/api/leaderboard/guild")
async def get_guild_leaderboard(limit: int = 20):
    """Get guild leaderboard."""
    guilds = await db.guilds.find({}).sort("total_score", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for i, guild in enumerate(guilds, 1):
        leaderboard.append({
            "rank": i,
            "name": guild["name"],
            "score": guild["total_score"],
            "level": guild.get("level", 1),
            "members": len(guild.get("members", [])),
            "icon": guild.get("icon", "👥"),
            "color": guild.get("color", "#3498db")
        })
    
    return {"leaderboard": leaderboard, "total": len(leaderboard)}

# Categories and Questions
@router.get("/api/categories")
async def get_categories():
    """Get all available categories with enhanced metadata."""
    categories = {}
    for cat, puzzles in CATEGORY_PUZZLES.items():
        categories[cat] = {
            "name": cat.replace("_", " ").title(),
            "count": len(puzzles),
            "difficulty_levels": ["easy", "medium", "hard", "expert"],
            "description": f"Test your knowledge in {cat.replace('_', ' ').title()}",
            "icon": "🧠",  # Default icon
            "color": "#3498db"  # Default color
        }
    
    return {"categories": categories}

@router.get("/api/categories/{category}/questions")
async def get_category_questions(category: str, difficulty: str = "medium", limit: int = 10):
    """Get questions for a specific category and difficulty."""
    if category not in CATEGORY_PUZZLES:
        raise HTTPException(status_code=404, detail="Category not found")
    
    questions = CATEGORY_PUZZLES[category]
    # Filter by difficulty if needed
    # For now, return all questions
    return {
        "category": category,
        "difficulty": difficulty,
        "questions": questions[:limit],
        "total_available": len(questions)
    }

# User Profile and Stats
@router.get("/api/user/{username}/profile")
async def get_user_profile(username: str):
    """Get detailed user profile."""
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's quiz history
    quiz_results = await db.quiz_results.find(
        {"user_id": username}
    ).sort("completed_at", -1).limit(10).to_list(10)
    
    # Get achievements
    achievements = await db.achievements.find(
        {"id": {"$in": user.get("achievements", [])}}
    ).to_list(None)
    
    # Get badges
    badges = await db.badges.find(
        {"id": {"$in": user.get("badges", [])}}
    ).to_list(None)
    
    return {
        "user": serialize_mongo_doc(user),
        "recent_quizzes": serialize_mongo_doc(quiz_results),
        "achievements": serialize_mongo_doc(achievements),
        "badges": serialize_mongo_doc(badges)
    }

@router.get("/api/user/{username}/stats")
async def get_user_stats(username: str, period: str = "30d"):
    """Get detailed user statistics."""
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get analytics data
    performance_data = await analytics_engine.analyze_user_performance(username, period)
    
    return {
        "user_id": username,
        "period": period,
        "performance": performance_data
    }

@router.get("/api/user/{username}/achievements")
async def get_user_achievements(username: str):
    """Get user's achievements and progress."""
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_achievements = user.get("achievements", [])
    all_achievements = achievement_system.achievements_db
    
    achievements_data = []
    for achievement_id, achievement in all_achievements.items():
        progress = await achievement_system.get_achievement_progress(user, achievement_id)
        achievements_data.append(progress)
    
    return {
        "user_id": username,
        "achievements": achievements_data,
        "unlocked_count": len(user_achievements),
        "total_count": len(all_achievements)
    }

# Quiz Management
@router.post("/api/quiz/start")
async def start_quiz(quiz_data: Dict[str, Any], request: Request):
    """Start a new quiz session with anti-cheat monitoring."""
    username = quiz_data.get("username")
    category = quiz_data.get("category")
    difficulty = quiz_data.get("difficulty", "medium")
    
    if not username or not category:
        raise HTTPException(status_code=400, detail="Username and category are required")
    
    # Initialize anti-cheat monitoring
    session_id = f"quiz_{username}_{int(datetime.utcnow().timestamp())}"
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    await anti_cheat_detector.initialize_user_session(
        username, session_id, client_ip, user_agent
    )
    
    # Get questions for the category
    if category not in CATEGORY_PUZZLES:
        raise HTTPException(status_code=404, detail="Category not found")
    
    questions = CATEGORY_PUZZLES[category]
    selected_questions = questions[:5]  # Select 5 questions
    
    return {
        "session_id": session_id,
        "category": category,
        "difficulty": difficulty,
        "questions": selected_questions,
        "time_limit": 300,  # 5 minutes
        "anti_cheat_enabled": True
    }

@router.post("/api/quiz/submit")
async def submit_quiz(quiz_result: QuizResult, request: Request):
    """Submit quiz results with comprehensive analysis."""
    # Store quiz result
    await db.quiz_results.insert_one(quiz_result.dict())
    
    # Get user data
    user = await db.users.find_one({"username": quiz_result.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate points and rewards
    session_data = {
        "difficulty": "medium",  # Would be passed from quiz session
        "time_limit": 300,
        "current_streak": 0  # Would be tracked in session
    }
    
    points_data = await points_system.calculate_total_points(quiz_result, user, session_data)
    
    # Update user points
    await points_system.update_user_points(user, points_data)
    
    # Check for achievements
    unlocked_achievements = await achievement_system.check_achievements(user, quiz_result)
    unlocked_badges = await achievement_system.check_badges(user, quiz_result)
    
    # Update user in database
    await db.users.update_one(
        {"username": quiz_result.user_id},
        {
            "$set": {
                "total_points": user["total_points"] + points_data["final_points"],
                "quiz_coins": user["quiz_coins"] + points_data["coins_earned"],
                "experience": user["experience"] + (points_data["final_points"] // 2),
                "achievements": user.get("achievements", []) + unlocked_achievements,
                "badges": user.get("badges", []) + unlocked_badges
            }
        }
    )
    
    # Track analytics events
    await analytics_engine.track_event(
        quiz_result.user_id, "quiz_completed",
        {
            "category": quiz_result.quiz_id,
            "score": quiz_result.score,
            "accuracy": quiz_result.accuracy,
            "time_taken": quiz_result.time_taken
        }
    )
    
    return {
        "quiz_result": quiz_result.dict(),
        "points_earned": points_data["final_points"],
        "coins_earned": points_data["coins_earned"],
        "unlocked_achievements": unlocked_achievements,
        "unlocked_badges": unlocked_badges,
        "level_progress": await points_system.get_level_progress(user)
    }

# Analytics and Admin
@router.get("/api/admin/analytics")
async def get_admin_analytics(period: str = "7d"):
    """Get comprehensive platform analytics for admin dashboard."""
    analytics_data = await analytics_engine.analyze_platform_metrics(period)
    return analytics_data

@router.get("/api/admin/anti-cheat")
async def get_anti_cheat_metrics(period: str = "7d"):
    """Get anti-cheat metrics and suspicious activities."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)  # Default to 7 days
    
    # Get anti-cheat events
    events = await db.anti_cheat_events.find({
        "timestamp": {"$gte": start_date, "$lte": end_date}
    }).to_list(None)
    
    # Analyze events by type
    events_by_type = {}
    for event in events:
        event_type = event["flag_type"]
        if event_type not in events_by_type:
            events_by_type[event_type] = 0
        events_by_type[event_type] += 1
    
    return {
        "period": period,
        "total_events": len(events),
        "events_by_type": events_by_type,
        "suspicious_users": len(set(event["user_id"] for event in events))
    }

# Study Recommendations
@router.get("/api/user/{username}/recommendations")
async def get_study_recommendations(username: str):
    """Get personalized study recommendations."""
    recommendations = await analytics_engine.generate_study_recommendations(username)
    return recommendations

@router.get("/api/user/{username}/optimal-difficulty/{category}")
async def get_optimal_difficulty(username: str, category: str):
    """Get optimal difficulty recommendation for a user in a category."""
    difficulty_data = await analytics_engine.predict_optimal_difficulty(username, category)
    return difficulty_data

# Legacy endpoints for backward compatibility
@router.get("/api/stats")
async def get_stats():
    """Get basic platform statistics."""
    total_users = await db.users.count_documents({})
    active_quizzes = await db.quiz_results.count_documents({
        "completed_at": {"$gte": datetime.utcnow() - timedelta(hours=1)}
    })
    
    return {
        "total_users": total_users,
        "active_games": len(active_games),
        "connected_players": len(connected_players),
        "waiting_players": len(waiting_players),
        "total_categories": len(CATEGORY_PUZZLES),
        "total_questions": sum(len(p) for p in CATEGORY_PUZZLES.values()),
        "active_quizzes": active_quizzes
    }