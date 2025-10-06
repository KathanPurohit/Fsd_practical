# anti_cheat/detector.py

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict, deque
import hashlib
import json

from models import AntiCheatFlag, AntiCheatEvent, User

logger = logging.getLogger(__name__)

class AntiCheatDetector:
    """Advanced anti-cheat detection system with real-time monitoring."""
    
    def __init__(self):
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
        self.suspicious_activities: Dict[str, List[AntiCheatEvent]] = defaultdict(list)
        self.response_time_baselines: Dict[str, Dict[str, float]] = defaultdict(dict)
        self.device_fingerprints: Dict[str, str] = {}
        self.ip_addresses: Dict[str, str] = {}
        
    async def initialize_user_session(self, user_id: str, session_id: str, 
                                    ip_address: str, user_agent: str, 
                                    device_fingerprint: str = None) -> None:
        """Initialize monitoring for a new user session."""
        self.user_sessions[session_id] = {
            "user_id": user_id,
            "start_time": datetime.utcnow(),
            "tab_switches": 0,
            "copy_paste_attempts": 0,
            "window_focus_loss": 0,
            "screen_recording_detected": False,
            "response_times": deque(maxlen=20),
            "answer_patterns": [],
            "pause_analysis": [],
            "ip_address": ip_address,
            "user_agent": user_agent,
            "device_fingerprint": device_fingerprint,
            "geolocation": None,
            "last_activity": datetime.utcnow(),
            "suspicious_score": 0
        }
        
        if device_fingerprint:
            self.device_fingerprints[user_id] = device_fingerprint
        self.ip_addresses[user_id] = ip_address
        
        logger.info(f"Initialized anti-cheat monitoring for user {user_id} in session {session_id}")
    
    async def detect_tab_switching(self, session_id: str, event_data: Dict[str, Any]) -> bool:
        """Detect tab switching behavior."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["tab_switches"] += 1
        session["last_activity"] = datetime.utcnow()
        
        # Flag if more than 3 tab switches in a session
        if session["tab_switches"] > 3:
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.TAB_SWITCH, "high", 
                {"tab_switches": session["tab_switches"]}
            )
            return True
        return False
    
    async def detect_copy_paste(self, session_id: str, event_data: Dict[str, Any]) -> bool:
        """Detect copy-paste attempts."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["copy_paste_attempts"] += 1
        
        # Any copy-paste attempt is suspicious
        await self._flag_suspicious_activity(
            session_id, AntiCheatFlag.COPY_PASTE, "high",
            {"attempts": session["copy_paste_attempts"]}
        )
        return True
    
    async def detect_multiple_windows(self, session_id: str, event_data: Dict[str, Any]) -> bool:
        """Detect multiple browser windows/tabs."""
        if session_id not in self.user_sessions:
            return False
            
        window_count = event_data.get("window_count", 1)
        if window_count > 1:
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.MULTIPLE_WINDOWS, "medium",
                {"window_count": window_count}
            )
            return True
        return False
    
    async def detect_screen_recording(self, session_id: str, event_data: Dict[str, Any]) -> bool:
        """Detect screen recording software."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["screen_recording_detected"] = True
        
        await self._flag_suspicious_activity(
            session_id, AntiCheatFlag.SCREEN_RECORDING, "critical",
            {"recording_software": event_data.get("software", "unknown")}
        )
        return True
    
    async def analyze_response_timing(self, session_id: str, question_id: str, 
                                    response_time: float, difficulty: str) -> bool:
        """Analyze response timing for suspicious patterns."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["response_times"].append(response_time)
        
        # Calculate baseline for this user
        user_id = session["user_id"]
        if user_id not in self.response_time_baselines:
            self.response_time_baselines[user_id] = {}
        
        baseline_key = f"{question_id}_{difficulty}"
        if baseline_key not in self.response_time_baselines[user_id]:
            self.response_time_baselines[user_id][baseline_key] = response_time
            return False
        
        baseline = self.response_time_baselines[user_id][baseline_key]
        
        # Flag if response is suspiciously fast (less than 25% of baseline)
        if response_time < baseline * 0.25:
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.SUSPICIOUS_TIMING, "high",
                {
                    "response_time": response_time,
                    "baseline": baseline,
                    "ratio": response_time / baseline
                }
            )
            return True
        
        # Update baseline with weighted average
        self.response_time_baselines[user_id][baseline_key] = (
            baseline * 0.7 + response_time * 0.3
        )
        return False
    
    async def analyze_answer_patterns(self, session_id: str, answers: List[str]) -> bool:
        """Analyze answer patterns for suspicious behavior."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["answer_patterns"].extend(answers)
        
        # Check for patterns like all same letter answers
        if len(answers) >= 3:
            if all(answer.upper() == answers[0].upper() for answer in answers):
                await self._flag_suspicious_activity(
                    session_id, AntiCheatFlag.ANSWER_PATTERN, "medium",
                    {"pattern": "all_same_letter", "answers": answers}
                )
                return True
            
            # Check for alternating patterns
            if len(answers) >= 4:
                alternating = all(
                    answers[i] != answers[i+1] for i in range(len(answers)-1)
                )
                if alternating:
                    await self._flag_suspicious_activity(
                        session_id, AntiCheatFlag.ANSWER_PATTERN, "medium",
                        {"pattern": "alternating", "answers": answers}
                    )
                    return True
        
        return False
    
    async def analyze_pause_patterns(self, session_id: str, pause_duration: float) -> bool:
        """Analyze pause patterns for suspicious behavior."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        session["pause_analysis"].append(pause_duration)
        
        # Flag unusually long pauses (might indicate external consultation)
        if pause_duration > 300:  # 5 minutes
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.PAUSE_ANALYSIS, "medium",
                {"pause_duration": pause_duration}
            )
            return True
        
        return False
    
    async def verify_device_fingerprint(self, session_id: str, current_fingerprint: str) -> bool:
        """Verify device fingerprint consistency."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        stored_fingerprint = session.get("device_fingerprint")
        
        if stored_fingerprint and stored_fingerprint != current_fingerprint:
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.DEVICE_FINGERPRINT, "high",
                {
                    "stored": stored_fingerprint,
                    "current": current_fingerprint
                }
            )
            return True
        
        return False
    
    async def verify_ip_address(self, session_id: str, current_ip: str) -> bool:
        """Verify IP address consistency."""
        if session_id not in self.user_sessions:
            return False
            
        session = self.user_sessions[session_id]
        stored_ip = session.get("ip_address")
        
        if stored_ip and stored_ip != current_ip:
            await self._flag_suspicious_activity(
                session_id, AntiCheatFlag.IP_MISMATCH, "medium",
                {
                    "stored": stored_ip,
                    "current": current_ip
                }
            )
            return True
        
        return False
    
    async def _flag_suspicious_activity(self, session_id: str, flag_type: AntiCheatFlag, 
                                      severity: str, metadata: Dict[str, Any]) -> None:
        """Flag suspicious activity and create event."""
        if session_id not in self.user_sessions:
            return
            
        session = self.user_sessions[session_id]
        user_id = session["user_id"]
        
        # Increase suspicious score
        severity_scores = {"low": 1, "medium": 3, "high": 5, "critical": 10}
        session["suspicious_score"] += severity_scores.get(severity, 1)
        
        # Create anti-cheat event
        event = AntiCheatEvent(
            user_id=user_id,
            session_id=session_id,
            flag_type=flag_type,
            severity=severity,
            timestamp=datetime.utcnow(),
            metadata=metadata,
            ip_address=session.get("ip_address"),
            user_agent=session.get("user_agent")
        )
        
        self.suspicious_activities[user_id].append(event)
        
        logger.warning(f"Anti-cheat flag: {flag_type} for user {user_id} in session {session_id}")
    
    async def get_suspicious_activities(self, user_id: str) -> List[AntiCheatEvent]:
        """Get all suspicious activities for a user."""
        return self.suspicious_activities.get(user_id, [])
    
    async def get_session_suspicious_score(self, session_id: str) -> int:
        """Get suspicious score for a session."""
        if session_id not in self.user_sessions:
            return 0
        return self.user_sessions[session_id]["suspicious_score"]
    
    async def cleanup_session(self, session_id: str) -> None:
        """Clean up session data."""
        if session_id in self.user_sessions:
            del self.user_sessions[session_id]
            logger.info(f"Cleaned up anti-cheat session {session_id}")

# Global anti-cheat detector instance
anti_cheat_detector = AntiCheatDetector()
