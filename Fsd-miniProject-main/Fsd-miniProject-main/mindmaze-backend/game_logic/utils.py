# game_logic/utils.py

import logging

logger = logging.getLogger(__name__)

def normalize_answer(answer: str) -> str:
    """Normalize answer for comparison."""
    if not answer:
        return ""
    normalized = answer.strip().lower()
    superscript_map = { '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '¹': '1', '⁰': '0' }
    for sup, reg in superscript_map.items():
        normalized = normalized.replace(sup, reg)
    return normalized

def is_answer_correct(user_answer: str, correct_answer: str) -> bool:
    """Check if user answer matches correct answer with flexible matching."""
    if not user_answer or not correct_answer:
        logger.debug(f"Empty answer detected: user='{user_answer}', correct='{correct_answer}'")
        return False
    
    # Convert both to strings in case they're not
    user_answer = str(user_answer).strip()
    correct_answer = str(correct_answer).strip()
    
    logger.debug(f"Raw comparison: user='{user_answer}', correct='{correct_answer}'")
    
    # Try direct comparison first (case-insensitive)
    if user_answer.lower() == correct_answer.lower():
        logger.debug("Direct case-insensitive match successful")
        return True
    
    # Normalize both answers
    user_norm = normalize_answer(user_answer)
    correct_norm = normalize_answer(correct_answer)
    
    logger.debug(f"Normalized comparison: user_norm='{user_norm}', correct_norm='{correct_norm}'")
    
    # Normalized string comparison
    if user_norm == correct_norm:
        logger.debug("Normalized string match successful")
        return True
    
    # Try numeric comparison for math problems
    try:
        user_float = float(user_norm)
        correct_float = float(correct_norm)
        if abs(user_float - correct_float) < 0.0001:  # Handle floating point precision
            logger.debug("Numeric comparison successful")
            return True
    except (ValueError, TypeError) as e:
        logger.debug(f"Numeric comparison failed: {e}")
        pass
    
    # Try alphanumeric only comparison (remove all punctuation and spaces)
    user_clean = ''.join(c for c in user_norm if c.isalnum())
    correct_clean = ''.join(c for c in correct_norm if c.isalnum())
    
    logger.debug(f"Alphanumeric comparison: user_clean='{user_clean}', correct_clean='{correct_clean}'")
    
    if user_clean == correct_clean:
        logger.debug("Alphanumeric comparison successful")
        return True
    
    logger.debug("All comparison methods failed")
    return False

def get_points_for_category(category: str) -> int:
    """Return points based on category difficulty."""
    difficulty_points = {
        "basic_math": 5, "very_basic_math": 3, "word_games": 10, "movies": 15,
        "music": 15, "funny": 10, "general_knowledge": 10, "social_science": 10,
        "science": 10, "riddles": 15, "gaming": 10, "Oral_math": 15,
        "nature_wildlife": 10, "photography": 10, "health_medicine": 10,
        "programming": 10, "cooking_cuisine": 10, "travel_adventure": 5, "art_design": 5
    }
    points = difficulty_points.get(category, 10)
    logger.debug(f"Points for category '{category}': {points}")
    return points