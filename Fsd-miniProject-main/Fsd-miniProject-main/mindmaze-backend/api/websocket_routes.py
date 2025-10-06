# api/websocket_routes.py

import json
import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from typing import Dict, List, Optional, Any

from game_logic.state import connected_players
from game_logic.handlers import (
    handle_matchmaking,
    handle_answer,
    handle_cancel_search,
    cleanup_player,
)
from anti_cheat.detector import anti_cheat_detector
from anti_cheat.monitor import real_time_monitor
from analytics.engine import analytics_engine
from gamification.achievements import achievement_system

router = APIRouter()
logger = logging.getLogger(__name__)

# Real-time leaderboard updates
class LeaderboardManager:
    def __init__(self):
        self.subscribers: Dict[str, List[WebSocket]] = {}
        self.update_interval = 30  # seconds
        self.last_update = datetime.utcnow()
    
    async def add_subscriber(self, username: str, websocket: WebSocket):
        if username not in self.subscribers:
            self.subscribers[username] = []
        self.subscribers[username].append(websocket)
    
    async def remove_subscriber(self, username: str, websocket: WebSocket):
        if username in self.subscribers:
            try:
                self.subscribers[username].remove(websocket)
                if not self.subscribers[username]:
                    del self.subscribers[username]
            except ValueError:
                pass
    
    async def broadcast_leaderboard_update(self, leaderboard_data: Dict[str, Any]):
        """Broadcast leaderboard updates to all subscribers."""
        message = {
            "type": "leaderboard_update",
            "data": leaderboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for username, websockets in self.subscribers.items():
            for websocket in websockets:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send leaderboard update to {username}: {e}")

# Global leaderboard manager
leaderboard_manager = LeaderboardManager()

# Real-time notifications
class NotificationManager:
    def __init__(self):
        self.user_notifications: Dict[str, List[WebSocket]] = {}
    
    async def add_user_connection(self, username: str, websocket: WebSocket):
        if username not in self.user_notifications:
            self.user_notifications[username] = []
        self.user_notifications[username].append(websocket)
    
    async def remove_user_connection(self, username: str, websocket: WebSocket):
        if username in self.user_notifications:
            try:
                self.user_notifications[username].remove(websocket)
                if not self.user_notifications[username]:
                    del self.user_notifications[username]
            except ValueError:
                pass
    
    async def send_notification(self, username: str, notification: Dict[str, Any]):
        """Send notification to specific user."""
        if username in self.user_notifications:
            message = {
                "type": "notification",
                "data": notification,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            for websocket in self.user_notifications[username]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send notification to {username}: {e}")

# Global notification manager
notification_manager = NotificationManager()

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    """Enhanced WebSocket endpoint with real-time features."""
    await websocket.accept()
    connected_players[username] = websocket
    
    # Add to notification system
    await notification_manager.add_user_connection(username, websocket)
    
    logger.info(f"✅ WebSocket connected for user: {username}")
    
    try:
        # Send welcome message with user data
        await websocket.send_text(json.dumps({
            "type": "connected", 
            "message": f"Welcome {username}!",
            "timestamp": datetime.utcnow().isoformat(),
            "features": {
                "real_time_leaderboard": True,
                "achievement_notifications": True,
                "anti_cheat_monitoring": True,
                "live_updates": True
            }
        }))
        
        # Start real-time monitoring
        await real_time_monitor.start_monitoring(f"session_{username}", username)
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get("type")
                
                # Handle different message types
                if message_type == "find_match":
                    await handle_find_match(username, websocket, message)
                    
                elif message_type == "submit_answer":
                    await handle_submit_answer(username, websocket, message)
                    
                elif message_type == "cancel_search":
                    await handle_cancel_search(username, websocket, message)
                    
                elif message_type == "anti_cheat_event":
                    await handle_anti_cheat_event(username, websocket, message)
                    
                elif message_type == "subscribe_leaderboard":
                    await handle_subscribe_leaderboard(username, websocket, message)
                    
                elif message_type == "unsubscribe_leaderboard":
                    await handle_unsubscribe_leaderboard(username, websocket, message)
                    
                elif message_type == "get_achievements":
                    await handle_get_achievements(username, websocket, message)
                    
                elif message_type == "get_recommendations":
                    await handle_get_recommendations(username, websocket, message)
                    
                elif message_type == "cheating_detected":
                    # Handle cheating detection events from frontend
                    await handle_cheating_detected(username, websocket, message)
                    
                else:
                    await websocket.send_text(json.dumps({
                        "type": "error", 
                        "message": f"Unknown message type: {message_type}"
                    }))
                    logger.warning(f"Unknown message type '{message_type}' from {username}")
                    
            except json.JSONDecodeError as e:
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Invalid JSON format"
                }))
                logger.error(f"JSON decode error from {username}: {e}")
                
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "An error occurred processing your request"
                }))
                logger.error(f"Message processing error for {username}: {e}")
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user: {username}")
    except Exception as e:
        logger.error(f"WebSocket error for {username}: {e}")
    finally:
        # Cleanup
        await cleanup_player(username)
        await notification_manager.remove_user_connection(username, websocket)
        await leaderboard_manager.remove_subscriber(username, websocket)
        await real_time_monitor.stop_monitoring(f"session_{username}")

async def handle_find_match(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle matchmaking requests."""
    category = message.get("category", "general_knowledge")
    if not category:
        await websocket.send_text(json.dumps({
            "type": "error", 
            "message": "Category is required for matchmaking"
        }))
        return
    
    logger.info(f"Processing find_match for {username} in category {category}")
    await handle_matchmaking(username, websocket, category)

async def handle_submit_answer(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle answer submissions with anti-cheat monitoring."""
    answer = message.get("answer", "").strip()
    if not answer:
        await websocket.send_text(json.dumps({
            "type": "error", 
            "message": "Answer cannot be empty"
        }))
        return
    
    # Anti-cheat analysis
    session_id = message.get("session_id", f"session_{username}")
    response_time = message.get("response_time", 0)
    
    # Analyze response timing
    await anti_cheat_detector.analyze_response_timing(
        session_id, "question_1", response_time, "medium"
    )
    
    # Analyze answer patterns
    await anti_cheat_detector.analyze_answer_patterns(session_id, [answer])
    
    logger.info(f"Processing answer submission for {username}: {answer}")
    await handle_answer(username, answer, websocket)

async def handle_cancel_search(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle search cancellation."""
    logger.info(f"Processing search cancellation for {username}")
    await handle_cancel_search(username, websocket)

async def handle_anti_cheat_event(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle anti-cheat events from frontend."""
    event_type = message.get("event_type")
    event_data = message.get("data", {})
    session_id = message.get("session_id", f"session_{username}")
    
    # Process different types of anti-cheat events
    if event_type == "tab_switch":
        await anti_cheat_detector.detect_tab_switching(session_id, event_data)
    elif event_type == "copy_paste":
        await anti_cheat_detector.detect_copy_paste(session_id, event_data)
    elif event_type == "multiple_windows":
        await anti_cheat_detector.detect_multiple_windows(session_id, event_data)
    elif event_type == "screen_recording":
        await anti_cheat_detector.detect_screen_recording(session_id, event_data)
    
    # Send acknowledgment
    await websocket.send_text(json.dumps({
        "type": "anti_cheat_ack",
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat()
    }))

async def handle_subscribe_leaderboard(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle leaderboard subscription."""
    category = message.get("category")
    await leaderboard_manager.add_subscriber(username, websocket)
    
    await websocket.send_text(json.dumps({
        "type": "leaderboard_subscribed",
        "category": category,
        "message": "Subscribed to leaderboard updates"
    }))

async def handle_unsubscribe_leaderboard(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle leaderboard unsubscription."""
    await leaderboard_manager.remove_subscriber(username, websocket)
    
    await websocket.send_text(json.dumps({
        "type": "leaderboard_unsubscribed",
        "message": "Unsubscribed from leaderboard updates"
    }))

async def handle_get_achievements(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle achievement requests."""
    # Get user achievements
    from database import db
    user = await db.users.find_one({"username": username})
    if not user:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "User not found"
        }))
        return
    
    # Get achievement progress
    achievements_data = []
    for achievement_id, achievement in achievement_system.achievements_db.items():
        progress = await achievement_system.get_achievement_progress(user, achievement_id)
        achievements_data.append(progress)
    
    await websocket.send_text(json.dumps({
        "type": "achievements_data",
        "achievements": achievements_data,
        "unlocked_count": len(user.get("achievements", [])),
        "total_count": len(achievement_system.achievements_db)
    }))

async def handle_get_recommendations(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle study recommendations requests."""
    recommendations = await analytics_engine.generate_study_recommendations(username)
    
    await websocket.send_text(json.dumps({
        "type": "recommendations_data",
        "recommendations": recommendations
    }))

async def handle_cheating_detected(username: str, websocket: WebSocket, message: Dict[str, Any]):
    """Handle cheating detection events from frontend."""
    event_type = message.get("event_type")
    event_data = message.get("data", {})
    session_id = message.get("session_id", f"session_{username}")
    
    # Log the cheating detection event
    logger.info(f"Cheating detected for {username}: {event_type} - {event_data}")
    
    # Process different types of cheating events
    if event_type == "tab_switch":
        await anti_cheat_detector.detect_tab_switching(session_id, event_data)
    elif event_type == "copy_paste":
        await anti_cheat_detector.detect_copy_paste(session_id, event_data)
    elif event_type == "multiple_windows":
        await anti_cheat_detector.detect_multiple_windows(session_id, event_data)
    elif event_type == "screen_recording":
        await anti_cheat_detector.detect_screen_recording(session_id, event_data)
    
    # Send acknowledgment
    await websocket.send_text(json.dumps({
        "type": "cheating_detected_ack",
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat()
    }))

# Background tasks for real-time updates
async def broadcast_leaderboard_updates():
    """Background task to broadcast leaderboard updates."""
    while True:
        try:
            await asyncio.sleep(30)  # Update every 30 seconds
            
            # Get current leaderboard data
            from database import db
            users = await db.users.find(
                {}, 
                {"_id": 0, "username": 1, "total_points": 1, "score": 1, "level": 1, "avatar": 1, "badges": 1, "streaks": 1, "achievements": 1}
            ).sort("total_points", -1).limit(100).to_list(100)
            
            leaderboard_data = []
            for i, user in enumerate(users, 1):
                # Use total_points if available, otherwise fallback to score
                user_score = user.get("total_points", user.get("score", 0))
                
                # Calculate additional stats
                streaks = user.get("streaks", {})
                total_streak = sum(streaks.values()) if streaks else 0
                achievements = user.get("achievements", [])
                
                leaderboard_data.append({
                    "rank": i,
                    "username": user["username"],
                    "score": user_score,
                    "level": user.get("level", 1),
                    "avatar": user.get("avatar"),
                    "badges": user.get("badges", []),
                    "streak": total_streak,
                    "total_quizzes": len(achievements),
                    "accuracy": 85.0
                })
            
            # Broadcast to all subscribers
            await leaderboard_manager.broadcast_leaderboard_update({
                "leaderboard": leaderboard_data,
                "total": len(leaderboard_data)
            })
            
        except Exception as e:
            logger.error(f"Error in leaderboard broadcast: {e}")
            await asyncio.sleep(5)

# Start background tasks
async def start_background_tasks():
    """Start background tasks for real-time features."""
    asyncio.create_task(broadcast_leaderboard_updates())