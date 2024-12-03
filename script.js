// Sample vocabulary words - can be modified as needed
const vocabularyWords = [
    'ocean', 'island', 'beach', 'wave', 'shell', 
    'coral', 'shark', 'whale', 'ship', 'anchor',
    'dolphin', 'turtle', 'reef', 'sand', 'pearl'
];

let treasureIndex;
let gameActive = true;
let remainingGuesses;

// Create audio elements programmatically
const clickSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDw8PDw8PFBQUFBQUG5ubm5ubm6MjIyMjIykoKCgoKCg1NTU1NTU4ODg4ODg4PT09PT09P////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAA9RjpZxRwAImU+W8eshaFpAQgALAAYALATx/nYDYCMJ0HITQYYA7AH4c7MoGsnCMU5pnW+OQnBcDrQ9Xx7w37/D+PimYavV8elKUpT5fqx5VjV6vZ38eJR48eRKa9KUp7v396UgPHkQwMAAAAAA//8MAOp39CECAAhlIEEIIECBAgTT1oj///tEQYT0wgEIYxgDC09aIiE7u7u7u");
const winSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAUhgANDQ0NDRoaGhoaGigoKCgoKDU1NTU1NUNDQ0NDQ1BQUFBQUGRkZGRkZHFxcXFxcX9/f39/f4yMjIyMjJmZmZmZmaampqamprS0tLS0tMHBwcHBwc7Ozs7OztPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAFFobPxR6JAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
const wrongSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAGhg3tzzMAAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");

// Safe sound play function
function playSoundSafely(sound) {
    if (sound instanceof HTMLAudioElement) {
        sound.play().catch(() => {
            // Silently handle any playback errors
        });
    }
}

function initializeGame() {
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const restartBtn = document.getElementById('restart-btn');
    const guessCount = document.getElementById('guess-count');
    
    if (!gameBoard || !message || !restartBtn || !guessCount) return;

    gameBoard.innerHTML = '';
    message.textContent = '';
    restartBtn.classList.add('hidden');
    gameActive = true;
    remainingGuesses = vocabularyWords.length;
    guessCount.textContent = String(remainingGuesses);

    // Randomly select treasure location
    treasureIndex = Math.floor(Math.random() * vocabularyWords.length);

    // Create and place word cards
    vocabularyWords.forEach((word, index) => {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        wordCard.textContent = word;
        
        // Random position within constraints
        const angle = (index / vocabularyWords.length) * 2 * Math.PI;
        const radius = 100; // Adjust based on game board size
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        wordCard.style.transform = `translate(${x}px, ${y}px)`;
        
        wordCard.addEventListener('click', () => handleWordClick(wordCard, index));
        gameBoard.appendChild(wordCard);
    });
}

function handleWordClick(wordCard, index) {
    if (!gameActive || wordCard.classList.contains('clicked')) return;

    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    wordCard.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);

    wordCard.classList.add('clicked');
    remainingGuesses--;
    
    const guessCount = document.getElementById('guess-count');
    if (guessCount) {
        guessCount.textContent = String(remainingGuesses);
    }

    if (index === treasureIndex) {
        // Found the treasure!
        gameActive = false;
        playSoundSafely(winSound);
        
        const treasureIcon = document.createElement('div');
        treasureIcon.className = 'treasure-icon';
        treasureIcon.textContent = '💎';
        wordCard.appendChild(treasureIcon);
        
        wordCard.classList.add('treasure');
        const message = document.getElementById('message');
        if (message) message.textContent = 'Congratulations! You found the treasure! 🎉';
        
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.classList.remove('hidden');
            restartBtn.textContent = 'Play Again! 🎮';
        }
    } else {
        // Wrong guess
        playSoundSafely(wrongSound);
        setTimeout(() => {
            wordCard.style.visibility = 'hidden';
        }, 1000);

        // Update message based on remaining guesses
        const message = document.getElementById('message');
        if (message) {
            if (remainingGuesses > 5) {
                message.textContent = 'Keep searching! The treasure is still out there!';
            } else if (remainingGuesses > 2) {
                message.textContent = 'Getting closer! Don\'t give up!';
            } else {
                message.textContent = 'Almost there! Choose wisely!';
            }
        }
    }
}

// Initialize click sound
function playClickSound() {
    if (clickSound.currentTime) {
        clickSound.currentTime = 0;
    }
    playSoundSafely(clickSound);
}

// Add click sound to all word cards
document.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('word-card')) {
        playClickSound();
    }
});

// Restart button handler
const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        const message = document.getElementById('message');
        if (message) message.textContent = '';
        initializeGame();
    });
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    initializeGame();
});
