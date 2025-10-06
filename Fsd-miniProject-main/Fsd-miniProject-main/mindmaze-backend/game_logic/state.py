# game_logic/state.py

from fastapi import WebSocket
from typing import Dict
from models import GameSession

# In-memory storage for active games and players
active_games: Dict[str, GameSession] = {}
connected_players: Dict[str, WebSocket] = {}
waiting_players: Dict[str, Dict] = {}