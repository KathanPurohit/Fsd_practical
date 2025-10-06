# game_logic/handlers.py

import json
import random
import logging
from datetime import datetime
from fastapi import WebSocket

from database import db
from models import GameSession
from game_logic.state import active_games, connected_players, waiting_players
from game_logic.utils import is_answer_correct, get_points_for_category
from game_data import CATEGORY_PUZZLES

logger = logging.getLogger(__name__)

async def handle_matchmaking(username: str, websocket: WebSocket, category: str):
    """Handle matchmaking logic by fetching questions from game_data.py."""
    try:
        # Validate category exists in CATEGORY_PUZZLES
        if category not in CATEGORY_PUZZLES:
            await websocket.send_text(json.dumps({
                "type": "error", 
                "message": f"Invalid category: {category}. Available categories: {list(CATEGORY_PUZZLES.keys())}"
            }))
            logger.error(f"Category '{category}' not found in CATEGORY_PUZZLES")
            return

        # Clean up any existing waiting state for this user
        if username in waiting_players:
            del waiting_players[username]

        # Look for waiting opponent in the same category
        waiting_opponent = None
        for waiting_username, info in list(waiting_players.items()):
            if (info["category"] == category and 
                waiting_username != username and 
                waiting_username in connected_players):
                waiting_opponent = waiting_username
                break

        if waiting_opponent:
            # Remove both players from waiting list
            del waiting_players[waiting_opponent]
            
            # Generate unique game ID
            game_id = f"game_{int(datetime.utcnow().timestamp() * 1000)}_{random.randint(1000, 9999)}"
            
            # Get questions from CATEGORY_PUZZLES and select 5 random ones
            try:
                category_questions = CATEGORY_PUZZLES[category]
                
                if not category_questions or len(category_questions) < 5:
                    error_msg = f"Insufficient questions found for category '{category}'. Found {len(category_questions) if category_questions else 0}, need 5."
                    await websocket.send_text(json.dumps({
                        "type": "error", 
                        "message": error_msg
                    }))
                    if waiting_opponent in connected_players:
                        await connected_players[waiting_opponent].send_text(json.dumps({
                            "type": "error", 
                            "message": error_msg
                        }))
                    logger.error(error_msg)
                    return
                
                # Select 5 random questions
                selected_questions = random.sample(category_questions, min(5, len(category_questions)))
                
                # Convert to the expected format (add IDs if needed)
                puzzles = []
                for i, q in enumerate(selected_questions):
                    puzzle = {
                        "_id": f"puzzle_{game_id}_{i}",
                        "question": q["question"],
                        "answer": str(q["answer"]),  # Ensure answer is always a string
                        "category": category
                    }
                    puzzles.append(puzzle)
                
                # Create game session
                active_games[game_id] = GameSession(
                    players=[username, waiting_opponent],
                    category=category,
                    questions=puzzles,
                    player_scores={username: 0, waiting_opponent: 0}
                )

                # Notify both players that game has started
                game_start_data = {
                    "type": "game_start", 
                    "game_id": game_id, 
                    "category": category,
                    "puzzle": puzzles[0]["question"], 
                    "question_number": 1, 
                    "total_questions": len(puzzles)
                }
                
                
                # Send to current player
                game_start_data["opponent"] = waiting_opponent
                await websocket.send_text(json.dumps(game_start_data))
                
                # Send to waiting opponent
                if waiting_opponent in connected_players:
                    game_start_data["opponent"] = username
                    await connected_players[waiting_opponent].send_text(json.dumps(game_start_data))
                
                logger.info(f"Game started: {game_id} between {username} and {waiting_opponent} in category {category}")
                
            except Exception as e:
                error_msg = f"Failed to create game: {str(e)}"
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": error_msg
                }))
                logger.error(f"Error during game creation: {e}")
                return
        else:
            # No opponent found, add to waiting list
            waiting_players[username] = {
                "category": category, 
                "timestamp": datetime.utcnow()
            }
            
            await websocket.send_text(json.dumps({
                "type": "waiting_for_opponent", 
                "category": category,
                "message": f"Searching for opponent in {category.replace('_', ' ').title()}..."
            }))
            logger.info(f"Player {username} is waiting for a match in {category}")
            
    except Exception as e:
        error_msg = f"Matchmaking error: {str(e)}"
        await websocket.send_text(json.dumps({
            "type": "error", 
            "message": error_msg
        }))
        logger.error(f"Matchmaking error for {username}: {e}")

async def handle_answer(username: str, answer: str, websocket: WebSocket):
    """
    Handle answer submission with protection against race conditions.
    """
    try:
        # Find the game this player is in
        game_id, game = next(((gid, g) for gid, g in active_games.items() if username in g.players), (None, None))
        if not game:
            await websocket.send_text(json.dumps({
                "type": "error", 
                "message": "No active game found"
            }))
            return

        # Store the current question index locally to prevent race conditions
        q_index = game.current_question_index

        # Check if the game has already ended
        if q_index >= len(game.questions):
            await websocket.send_text(json.dumps({
                "type": "error", 
                "message": "Game has already ended"
            }))
            return

        # Get the current question
        current_question = game.questions[q_index]

        # Debug logging
        logger.info(f"Player {username} submitted answer: '{answer}' (type: {type(answer)}) for question: '{current_question['question']}'")
        logger.info(f"Expected answer: '{current_question['answer']}' (type: {type(current_question['answer'])})")
        
        # Test the answer comparison
        is_correct = is_answer_correct(answer, current_question["answer"])
        logger.info(f"Answer comparison result: {is_correct}")
        
        if is_correct:
            logger.info(f"Answer is correct for {username}")
            # Double-check that we're still on the same question (race condition protection)
            if game.current_question_index == q_index:
                # Award points for first correct answer
                points = get_points_for_category(game.category)
                game.player_scores[username] += points
                
                # Update user's total score in database
                try:
                    await db.users.update_one(
                        {"username": username}, 
                        {"$inc": {"score": points}}
                    )
                except Exception as e:
                    logger.error(f"Failed to update score for {username}: {e}")
                
                # Advance to next question
                game.current_question_index += 1
                
                if game.current_question_index >= len(game.questions):
                    # Game over - determine winner
                    winner = max(game.player_scores, key=game.player_scores.get)
                    
                    game_end_data = {
                        "type": "game_end", 
                        "winner": winner,
                        "correct_answer": current_question["answer"],
                        "final_scores": game.player_scores
                    }
                    
                    # Notify all players
                    for player in game.players:
                        if player in connected_players:
                            try:
                                await connected_players[player].send_text(json.dumps(game_end_data))
                            except Exception as e:
                                logger.error(f"Failed to notify {player} of game end: {e}")
                    
                    # Clean up the game
                    del active_games[game_id]
                    logger.info(f"Game {game_id} ended. Winner: {winner}")
                    
                else:
                    # Continue to next question
                    next_question = game.questions[game.current_question_index]
                    
                    
                    next_round_data = {
                        "type": "correct_answer", 
                        "winner_of_round": username,
                        "correct_answer": current_question["answer"],
                        "next_question": next_question["question"],
                        "question_number": game.current_question_index + 1,
                        "current_scores": game.player_scores
                    }
                    
                    # Notify all players
                    for player in game.players:
                        if player in connected_players:
                            try:
                                await connected_players[player].send_text(json.dumps(next_round_data))
                            except Exception as e:
                                logger.error(f"Failed to notify {player} of next round: {e}")
            else:
                # Player was correct but too slow
                await websocket.send_text(json.dumps({
                    "type": "too_slow", 
                    "message": "Correct, but your opponent was faster!"
                }))
        else:
            # Wrong answer
            logger.info(f"Answer '{answer}' is wrong for {username}. Expected: '{current_question['answer']}'")
            await websocket.send_text(json.dumps({
                "type": "wrong_answer", 
                "message": "Wrong answer! Keep trying."
            }))
            
    except Exception as e:
        error_msg = f"Error processing answer: {str(e)}"
        await websocket.send_text(json.dumps({
            "type": "error", 
            "message": error_msg
        }))
        logger.error(f"Answer handling error for {username}: {e}")

async def handle_cancel_search(username: str, websocket: WebSocket):
    """Handle when a player cancels matchmaking."""
    try:
        if username in waiting_players:
            del waiting_players[username]
            await websocket.send_text(json.dumps({
                "type": "search_cancelled", 
                "message": "Matchmaking cancelled successfully"
            }))
            logger.info(f"Player {username} cancelled matchmaking")
        else:
            await websocket.send_text(json.dumps({
                "type": "info", 
                "message": "No active search to cancel"
            }))
            
    except Exception as e:
        logger.error(f"Error cancelling search for {username}: {e}")

async def cleanup_player(username: str):
    """Clean up player data on disconnect."""
    try:
        # Remove from connected players
        if username in connected_players:
            del connected_players[username]
            logger.info(f"Removed {username} from connected players")
        
        # Remove from waiting players
        if username in waiting_players:
            del waiting_players[username]
            logger.info(f"Removed {username} from waiting players")
        
        # Handle active games
        games_to_remove = []
        for game_id, game in active_games.items():
            if username in game.players:
                games_to_remove.append(game_id)
                
                # Notify remaining players
                for player in game.players:
                    if player != username and player in connected_players:
                        try:
                            await connected_players[player].send_text(json.dumps({
                                "type": "opponent_disconnected", 
                                "message": "Your opponent disconnected. You win by default!"
                            }))
                        except Exception as e:
                            logger.error(f"Error notifying player {player} of disconnect: {e}")
        
        # Remove games where disconnected player was involved
        for game_id in games_to_remove:
            if game_id in active_games:
                del active_games[game_id]
                logger.info(f"Removed game {game_id} due to player {username} disconnect")
                
    except Exception as e:
        logger.error(f"Error during cleanup for {username}: {e}")   