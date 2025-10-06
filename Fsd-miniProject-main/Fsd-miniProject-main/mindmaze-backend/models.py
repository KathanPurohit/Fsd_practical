# models.py

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"

class AchievementType(str, Enum):
    PERFORMANCE = "performance"
    STREAK = "streak"
    MASTERY = "mastery"
    TIME_BASED = "time_based"
    COLLABORATION = "collaboration"
    SPECIAL = "special"

class AntiCheatFlag(str, Enum):
    TAB_SWITCH = "tab_switch"
    COPY_PASTE = "copy_paste"
    MULTIPLE_WINDOWS = "multiple_windows"
    SCREEN_RECORDING = "screen_recording"
    SUSPICIOUS_TIMING = "suspicious_timing"
    IP_MISMATCH = "ip_mismatch"
    DEVICE_FINGERPRINT = "device_fingerprint"
    ANSWER_PATTERN = "answer_pattern"
    PAUSE_ANALYSIS = "pause_analysis"

class User(BaseModel):
    username: str
    score: int = 0
    total_points: int = 0
    quiz_coins: int = 0
    level: int = 1
    experience: int = 0
    password: str = Field(default="", exclude=True)
    confirmPassword: str = Field(default="", exclude=True)
    email: str = Field(default="", exclude=True)
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    avatar: Optional[str] = None
    theme: str = "default"
    achievements: List[str] = []
    badges: List[str] = []
    streaks: Dict[str, int] = {}  # subject -> streak count
    mastery_levels: Dict[str, int] = {}  # subject -> mastery level
    device_fingerprint: Optional[str] = None
    ip_address: Optional[str] = None
    geolocation: Optional[Dict[str, float]] = None
    preferences: Dict[str, Any] = {}

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    type: AchievementType
    icon: str
    points_reward: int
    coins_reward: int
    requirements: Dict[str, Any]
    rarity: str = "common"  # common, rare, epic, legendary
    category: Optional[str] = None

class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    color: str
    requirements: Dict[str, Any]
    rarity: str = "common"

class Question(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    difficulty: DifficultyLevel
    points: int
    time_limit: int  # seconds
    options: Optional[List[str]] = None
    explanation: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # image, video, audio
    tags: List[str] = []
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class QuizSession(BaseModel):
    id: str
    players: List[str]
    category: str
    difficulty: DifficultyLevel
    questions: List[Question]
    current_question_index: int = 0
    player_scores: Dict[str, int] = {}
    player_answers: Dict[str, List[Dict]] = {}  # player -> list of answers
    time_limits: Dict[str, int] = {}  # player -> time remaining
    start_time: datetime
    end_time: Optional[datetime] = None
    winner: Optional[str] = None
    anti_cheat_flags: Dict[str, List[AntiCheatFlag]] = {}  # player -> list of flags
    session_metadata: Dict[str, Any] = {}

class GameSession(BaseModel):
    players: List[str]
    category: str
    questions: List[Dict[str, str]]
    current_question_index: int = 0
    player_scores: Dict[str, int] = {}
    answers: Dict[str, str] = {}
    winner: Optional[str] = None
    questions_per_round: int = 5

class AntiCheatEvent(BaseModel):
    user_id: str
    session_id: str
    flag_type: AntiCheatFlag
    severity: str  # low, medium, high, critical
    timestamp: datetime
    metadata: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AnalyticsEvent(BaseModel):
    user_id: str
    event_type: str
    timestamp: datetime
    session_id: Optional[str] = None
    metadata: Dict[str, Any]
    ip_address: Optional[str] = None

class LeaderboardEntry(BaseModel):
    username: str
    score: int
    rank: int
    avatar: Optional[str] = None
    badges: List[str] = []
    level: int = 1

class WebSocketMessage(BaseModel):
    type: str
    message: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

class QuizResult(BaseModel):
    user_id: str
    quiz_id: str
    score: int
    total_questions: int
    correct_answers: int
    time_taken: int  # seconds
    accuracy: float
    rank: Optional[int] = None
    achievements_unlocked: List[str] = []
    points_earned: int = 0
    coins_earned: int = 0
    completed_at: datetime

class StudyStreak(BaseModel):
    user_id: str
    current_streak: int
    longest_streak: int
    last_activity: datetime
    streak_category: str  # daily, weekly, subject-specific

class Guild(BaseModel):
    id: str
    name: str
    description: str
    members: List[str]
    leader: str
    created_at: datetime
    total_score: int = 0
    level: int = 1
    achievements: List[str] = []
    color: str = "#3498db"
    icon: str = "👥"