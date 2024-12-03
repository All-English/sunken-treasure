// Sample vocabulary words - can be modified as needed
const vocabularyWords = [
  "ocean",
  "island",
  "beach",
  "wave",
  "shell",
  "coral",
  "shark",
  "whale",
  "ship",
  "anchor",
  "dolphin",
  "turtle",
  "reef",
  "sand",
  "pearl",
]

let treasureIndex
let gameActive = true

// Create audio elements programmatically
const clickSound = new Audio(
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDw8PDw8PFBQUFBQUG5ubm5ubm6MjIyMjIykoKCgoKCg1NTU1NTU4ODg4ODg4PT09PT09P////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAA9RjpZxRwAImU+W8eshaFpAQgALAAYALATx/nYDYCMJ0HITQYYA7AH4c7MoGsnCMU5pnW+OQnBcDrQ9Xx7w37/D+PimYavV8elKUpT5fqx5VjV6vZ38eJR48eRKa9KUp7v396UgPHkQwMAAAAAA//8MAOp39CECAAhlIEEIIECBAgTT1oj///tEQYT0wgEIYxgDC09aIiE7u7u7u"
)
const winSound = new Audio(
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAUhgANDQ0NDRoaGhoaGigoKCgoKDU1NTU1NUNDQ0NDQ1BQUFBQUGRkZGRkZHFxcXFxcX9/f39/f4yMjIyMjJmZmZmZmaampqamprS0tLS0tMHBwcHBwc7Ozs7OztPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAFFobPxR6JAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
)
const wrongSound = new Audio(
  "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAGhg3tzzMAAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
)

// Safe sound play function
function playSoundSafely(sound) {
  if (sound instanceof HTMLAudioElement) {
    sound.play().catch(() => {
      // Silently handle any playback errors
    })
  }
}

function createBubbles() {
  const gameBoard = document.getElementById("game-board")

  if (!gameBoard) return

  for (let i = 0; i < 5; i++) {
    const bubble = document.createElement("div")
    bubble.classList.add("bubble")
    bubble.style.width = `${Math.random() * 30 + 10}px`
    bubble.style.height = bubble.style.width
    bubble.style.left = `${Math.random() * 100}%`
    bubble.style.top = `${Math.random() * 100}%`
    bubble.style.animationDuration = `${Math.random() * 2 + 2}s`
    gameBoard.appendChild(bubble)

    // Optional: Remove bubble after animation
    bubble.addEventListener("animationend", () => {
      bubble.remove()
    })
  }
}

function initializeGame() {
  const gameBoard = document.getElementById("game-board")
  const restartBtn = document.getElementById("restart-btn")

  if (!gameBoard || !restartBtn) return

  gameBoard.innerHTML = ""
  restartBtn.classList.add("hidden")
  gameActive = true

  const gridColumns = 16
  const gridRows = 12
  const usedCells = new Set()

  // Randomly select treasure location
  treasureIndex = Math.floor(Math.random() * vocabularyWords.length)

  // Create and place word cards
  vocabularyWords.forEach((word, index) => {
    let cell
    do {
      cell = Math.floor(Math.random() * (gridColumns * gridRows))
    } while (
      usedCells.has(cell) ||
      usedCells.has(cell + 1) ||
      cell % gridColumns === gridColumns - 1
    )

    usedCells.add(cell)
    usedCells.add(cell + 1)

    const wordCard = document.createElement("div")
    wordCard.className = "word-card"
    wordCard.textContent = word

    // Position in grid
    wordCard.style.gridColumn = `${(cell % gridColumns) + 1} / span 2`
    wordCard.style.gridRow = `${Math.floor(cell / gridColumns) + 1}`

    wordCard.addEventListener("click", () => handleWordClick(wordCard, index))
    gameBoard.appendChild(wordCard)
  })
    
  createBubbles()
}

function handleWordClick(wordCard, index) {
  if (!gameActive || wordCard.classList.contains("clicked")) return

  // Add ripple effect
  const ripple = document.createElement("div")
  ripple.className = "click-ripple"
  wordCard.appendChild(ripple)

  setTimeout(() => ripple.remove(), 600)

  wordCard.classList.add("clicked")

  if (index === treasureIndex) {
    // Found the treasure!
    gameActive = false
    playSoundSafely(winSound)

    const treasureIcon = document.createElement("div")
    treasureIcon.className = "treasure-icon"
    treasureIcon.textContent = "💎"
    wordCard.appendChild(treasureIcon)

    wordCard.classList.add("treasure")

    const restartBtn = document.getElementById("restart-btn")
    if (restartBtn) {
      restartBtn.classList.remove("hidden")
      restartBtn.textContent = "Play Again! 🎮"
    }
  } else {
    // Wrong guess
    playSoundSafely(wrongSound)
    setTimeout(() => {
      wordCard.style.visibility = "hidden"
    }, 1000)
  }
}

// Initialize click sound
function playClickSound() {
  if (clickSound.currentTime) {
    clickSound.currentTime = 0
  }
  playSoundSafely(clickSound)
}

// Add click sound to all word cards
document.addEventListener("click", (e) => {
  if (
    e.target instanceof HTMLElement &&
    e.target.classList.contains("word-card")
  ) {
    playClickSound()
  }
})

// Restart button handler
const restartBtn = document.getElementById("restart-btn")
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    initializeGame()
  })
}

// Initialize the game when the page loads
window.addEventListener("load", () => {
  initializeGame()
})
