# game_data.py

CATEGORY_PUZZLES = {
    "very_basic_math": [
        {"question": "What is 2 + 2?", "answer": "4"},
        {"question": "What is 5 x 3?", "answer": "15"},
        {"question": "What is 10 - 7?", "answer": "3"},
        {"question": "What is 8 ÷ 2?", "answer": "4"},
        {"question": "What is 6 + 4?", "answer": "10"}
    ],
    "Oral_math": [
        {"question": "What is the square of 17?", "answer": "289"},
        {"question": "What is 15% of 240?", "answer": "36"},
        {"question": "If 3x = 45, what is x?", "answer": "15"},
        {"question": "What is the value of 2⁵ + 2³?", "answer": "40"},
        {"question": "What is the cube root of 64?", "answer": "4"}
    ],
    "social_science": [
        {"question": "What is the capital of France?", "answer": "paris"},
        {"question": "Who was the first President of the United States?", "answer": "george washington"},
        {"question": "In which year did World War II end?", "answer": "1945"},
        {"question": "What is the largest country by area?", "answer": "russia"},
        {"question": "Which river is the longest in the world?", "answer": "nile"}
    ],
    "general_knowledge": [
        {"question": "How many sides does a triangle have?", "answer": "3"},
        {"question": "What is the largest planet in our solar system?", "answer": "jupiter"},
        {"question": "How many minutes are in an hour?", "answer": "60"},
        {"question": "What animal says 'moo'?", "answer": "cow"},
        {"question": "How many days are in a leap year?", "answer": "366"}
    ],
    "riddles": [
        {"question": "What has keys but no locks, space but no room?", "answer": "keyboard"},
        {"question": "What gets wet while drying?", "answer": "towel"},
        {"question": "What has hands but cannot clap?", "answer": "clock"},
        {"question": "What goes up but never comes down?", "answer": "age"},
        {"question": "What has a head, a tail, but no body?", "answer": "coin"}
    ],
    "word_games": [
        {"question": "What is the opposite of 'hot'?", "answer": "cold"},
        {"question": "What word rhymes with 'cat'?", "answer": "bat"},
        {"question": "How many letters are in the word 'COMPUTER'?", "answer": "8"},
        {"question": "What is the plural of 'mouse' (animal)?", "answer": "mice"},
        {"question": "What word means the same as 'big'?", "answer": "large"}
    ],
    "movies": [
        {"question": "Who directed the movie 'Titanic'?", "answer": "james cameron"},
        {"question": "What movie features the quote 'May the Force be with you'?", "answer": "star wars"},
        {"question": "Which movie won the Academy Award for Best Picture in 2020?", "answer": "parasite"},
        {"question": "Who played Jack Sparrow in Pirates of the Caribbean?", "answer": "johnny depp"},
        {"question": "What is the highest-grossing movie of all time?", "answer": "avatar"}
    ],
    "music": [
        {"question": "How many strings does a standard guitar have?", "answer": "6"},
        {"question": "Which instrument has 88 keys?", "answer": "piano"},
        {"question": "Who composed 'The Four Seasons'?", "answer": "vivaldi"},
        {"question": "What does 'forte' mean in music?", "answer": "loud"},
        {"question": "How many beats are in a whole note?", "answer": "4"}
    ],
    "gaming": [
        {"question": "What company created Super Mario?", "answer": "nintendo"},
        {"question": "What is the main character's name in The Legend of Zelda?", "answer": "link"},
        {"question": "Which game features Master Chief?", "answer": "halo"},
        {"question": "What does 'RPG' stand for in gaming?", "answer": "role playing game"},
        {"question": "In which game do you catch Pokémon?", "answer": "pokemon"}
    ],
    "funny": [
        {"question": "What do you call a sleeping bull?", "answer": "bulldozer"},
        {"question": "Why don't scientists trust atoms?", "answer": "because they make up everything"},
        {"question": "What do you call a bear with no teeth?", "answer": "gummy bear"},
        {"question": "Why don't eggs tell jokes?", "answer": "they would crack up"},
        {"question": "What do you call a fake noodle?", "answer": "impasta"}
    ],
    "science": [
        {"question": "What is the chemical symbol for water?", "answer": "H2O"},
        {"question": "What planet is known as the Red Planet?", "answer": "Mars"},
        {"question": "What is the primary source of energy for Earth's climate?", "answer": "Sun"},
        {"question": "What gas makes up about 78% of Earth's atmosphere?", "answer": "Nitrogen"},
        {"question": "What is the boiling point of water in Celsius?", "answer": "100"}
    ],
    "art_design": [
        {"question": "Who painted the Mona Lisa?", "answer": "Leonardo da Vinci"},
        {"question": "What art movement is associated with Picasso's 'Guernica'?", "answer": "Cubism"},
        {"question": "What is the primary color that, when mixed with blue, makes purple?", "answer": "Red"},
        {"question": "What is the name of the famous sculpture by Michelangelo depicting a biblical hero?", "answer": "David"},
        {"question": "Which art style emphasizes light and its changing qualities?", "answer": "Impressionism"}
    ],
    "travel_adventure": [
        {"question": "What is the capital city of Brazil?", "answer": "Brasilia"},
        {"question": "Which country is home to the Great Barrier Reef?", "answer": "Australia"},
        {"question": "What is the tallest mountain in the world?", "answer": "Mount Everest"},
        {"question": "Which city is famous for its Leaning Tower?", "answer": "Pisa"},
        {"question": "What is the longest river in South America?", "answer": "Amazon"}
    ],
    "cooking_cuisine": [
        {"question": "What is the main ingredient in guacamole?", "answer": "Avocado"},
        {"question": "Which country is known for sushi?", "answer": "Japan"},
        {"question": "What is the primary grain used in risotto?", "answer": "Arborio Rice"},
        {"question": "What herb is commonly used in pesto sauce?", "answer": "Basil"},
        {"question": "What is the traditional French dish made with beef and red wine?", "answer": "Beef Bourguignon"}
    ],
    "health_medicine": [
        {"question": "What is the largest organ in the human body?", "answer": "Skin"},
        {"question": "What vitamin is primarily obtained from sunlight?", "answer": "Vitamin D"},
        {"question": "What is the medical term for high blood pressure?", "answer": "Hypertension"},
        {"question": "Which organ filters blood and removes waste as urine?", "answer": "Kidney"},
        {"question": "What is the name of the protein that carries oxygen in blood?", "answer": "Hemoglobin"}
    ],
    "programming": [
        {"question": "What does HTML stand for?", "answer": "HyperText Markup Language"},
        {"question": "Which programming language uses indentation to define code blocks?", "answer": "Python"},
        {"question": "What does this output?\n\n```js\nconsole.log(typeof null);\n```", "answer": "object"},
        {"question": "What does CSS stand for?", "answer": "Cascading Style Sheets"},
        {"question": "Which symbol is used for comments in Python?", "answer": "#"}
    ],
    "photography": [
        {"question": "What does ISO measure in photography?", "answer": "Light Sensitivity"},
        {"question": "What is the term for the amount of light entering a camera lens?", "answer": "Aperture"},
        {"question": "Which camera brand is known for its EOS series?", "answer": "Canon"},
        {"question": "What is the technique for capturing a subject in motion with a blurred background?", "answer": "Panning"},
        {"question": "What does a high shutter speed help to achieve?", "answer": "Freeze Motion"}
    ],
    "nature_wildlife": [
        {"question": "What is the largest land animal on Earth?", "answer": "African Elephant"},
        {"question": "Which bird is known for its inability to fly and lives in Antarctica?", "answer": "Penguin"},
        {"question": "What is the largest species of big cat?", "answer": "Tiger"},
        {"question": "Which plant is known for its ability to trap and digest insects?", "answer": "Venus Flytrap"},
        {"question": "What is the primary food source for a giant panda?", "answer": "Bamboo"}
        ]
        }