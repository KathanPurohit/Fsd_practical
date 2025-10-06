# database.py

import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId

logger = logging.getLogger(__name__)
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL environment variable is not set")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.mindmaze

async def startup_db_client():
    """Connect to MongoDB on application startup."""
    try:
        await client.admin.command('ping')
        logger.info("Connected to MongoDB Atlas successfully!")
        
        # Create indexes for all collections
        await create_database_indexes()
        logger.info("Database indexes ensured")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")
        raise

async def create_database_indexes():
    """Create all necessary database indexes."""
    try:
        # Users collection indexes
        await db.users.create_index("username", unique=True)
        await db.users.create_index("email", unique=True, sparse=True)
        await db.users.create_index("total_points")
        await db.users.create_index("level")
        await db.users.create_index("last_login")
        await db.users.create_index("created_at")
        
        # Quiz results collection indexes
        await db.quiz_results.create_index("user_id")
        await db.quiz_results.create_index("quiz_id")
        await db.quiz_results.create_index("category")
        await db.quiz_results.create_index("completed_at")
        await db.quiz_results.create_index([("user_id", 1), ("completed_at", -1)])
        await db.quiz_results.create_index([("category", 1), ("completed_at", -1)])
        
        # Analytics events collection indexes
        await db.analytics_events.create_index("user_id")
        await db.analytics_events.create_index("event_type")
        await db.analytics_events.create_index("timestamp")
        await db.analytics_events.create_index([("user_id", 1), ("timestamp", -1)])
        await db.analytics_events.create_index([("event_type", 1), ("timestamp", -1)])
        
        # Anti-cheat events collection indexes
        await db.anti_cheat_events.create_index("user_id")
        await db.anti_cheat_events.create_index("session_id")
        await db.anti_cheat_events.create_index("flag_type")
        await db.anti_cheat_events.create_index("timestamp")
        await db.anti_cheat_events.create_index([("user_id", 1), ("timestamp", -1)])
        await db.anti_cheat_events.create_index([("flag_type", 1), ("timestamp", -1)])
        
        # Questions collection indexes
        await db.questions.create_index("category")
        await db.questions.create_index("difficulty")
        await db.questions.create_index("created_by")
        await db.questions.create_index("created_at")
        await db.questions.create_index([("category", 1), ("difficulty", 1)])
        
        # Achievements collection indexes
        await db.achievements.create_index("type")
        await db.achievements.create_index("category")
        await db.achievements.create_index("rarity")
        
        # Study streaks collection indexes
        await db.study_streaks.create_index("user_id", unique=True)
        await db.study_streaks.create_index("streak_category")
        await db.study_streaks.create_index("last_activity")
        
        # Guilds collection indexes
        await db.guilds.create_index("name", unique=True)
        await db.guilds.create_index("leader")
        await db.guilds.create_index("total_score")
        await db.guilds.create_index("created_at")
        
        logger.info("All database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")
        raise

def shutdown_db_client():
    """Close MongoDB connection on application shutdown."""
    client.close()
    logger.info("MongoDB connection closed")

def serialize_mongo_doc(doc):
    """Convert MongoDB document to JSON serializable format."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    if isinstance(doc, dict):
        serialized = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                serialized[key] = str(value)
            elif isinstance(value, dict):
                serialized[key] = serialize_mongo_doc(value)
            elif isinstance(value, list):
                serialized[key] = [serialize_mongo_doc(item) for item in value]
            else:
                serialized[key] = value
        return serialized
    return doc


