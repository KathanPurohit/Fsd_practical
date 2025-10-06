// Votes object to keep track of counts
const votes = {
    "JavaScript": 0,
    "Python": 0,
    "Java": 0
};

// Update the displayed vote counts
function updateVotes() {
    document.getElementById('jsVotes').textContent = "JavaScript: " + votes["JavaScript"];
    document.getElementById('pyVotes').textContent = "Python: " + votes["Python"];
    document.getElementById('javaVotes').textContent = "Java: " + votes["Java"];
}

// Called when a user clicks a vote button
function vote(language) {
    if (votes.hasOwnProperty(language)) {
        votes[language]++;
        updateVotes();
    }
}

// Simulate real-time voting by random users
setInterval(() => {
    // Randomly pick a language to increment
    const langs = Object.keys(votes);
    console.log(langs);
    const randomLang = langs[Math.floor(Math.random() * langs.length)];
    votes[randomLang]++;
    updateVotes();
}, 2000);

// Initialize vote display on page load
window.onload = updateVotes;