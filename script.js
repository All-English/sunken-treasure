// Sample vocabulary words - can be modified as needed
const vocabularyWords = [
  "anchor",
  "beach",
  "coral",
  "dolphin",
  "eel",
  "fish",
  "gull",
  "harbor",
  "island",
  "jellyfish",
  "kelp",
  "lighthouse",
  "mermaid",
  "narwhal",
  "ocean",
  "pearl",
  "quay",
  "reef",
  "shell",
  "tide",
  "umbrella",
  "vessel",
  "wave",
  "xiphosura",
  "yacht",
  "zebra fish",
  "seaweed",
  "turtle",
  "starfish",
  "seahorse",
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

  for (let i = 0; i < 15; i++) {
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

function createBubble() {
  const gameBoard = document.getElementById("game-board")

  if (!gameBoard) return

  const bubble = document.createElement("div")
  bubble.classList.add("bubble")

  // Randomize size
  const size = Math.random() * 30 + 10
  bubble.style.width = `${size}px`
  bubble.style.height = `${size}px`

  // Position near the clicked area
  bubble.style.left = `${Math.random() * 100}%`
  bubble.style.top = `${Math.random() * 100}%`

  // Randomize animation duration
  bubble.style.animationDuration = `${Math.random() * 3 + 2}s`

  gameBoard.appendChild(bubble)

  // Remove bubble after animation
  bubble.addEventListener("animationend", () => {
    bubble.remove()
  })
}

function addUnavailableCells(cell, unavailableCells, gridColumns, gridRows) {
  const offsets = [
    -gridColumns, // directly above
    gridColumns, // directly below
    1, // to the right
  ]

  const gameBoard = document.getElementById("game-board")

  offsets.forEach((offset) => {
    const surroundingCell = cell + offset

    // Check if the surrounding cell is within grid bounds
    if (
      surroundingCell >= 0 &&
      surroundingCell < gridColumns * gridRows &&
      !unavailableCells.has(surroundingCell) && // prevent multiple divs being created
      // Ensure we don't wrap around rows
      Math.abs((surroundingCell % gridColumns) - (cell % gridColumns)) <= 1
    ) {
      unavailableCells.add(surroundingCell)

      // Create visual element for used cell
      const usedCellDiv = document.createElement("div")
      usedCellDiv.className = "unavailable-cell"
      usedCellDiv.style.gridColumn = `${(surroundingCell % gridColumns) + 1}`
      usedCellDiv.style.gridRow = `${
        Math.floor(surroundingCell / gridColumns) + 1
      }`
      gameBoard.appendChild(usedCellDiv)
    }
  })

  unavailableCells.add(cell)
}
function setupGridColumnControl() {
  const gridColumnsInput = document.getElementById("grid-columns")

  if (gridColumnsInput) {
    gridColumnsInput.addEventListener("change", () => {
      const newGridColumns = parseInt(gridColumnsInput.value)
      initializeGame(newGridColumns)
    })
  }
}

function updateWordCardCount(count) {
  const wordCardCountElement = document.getElementById("word-card-count")
  if (wordCardCountElement) {
    wordCardCountElement.textContent = `Total Word Cards: ${count}`
  }
}

function initializeGame(gridColumns = 18) {
  const gameBoard = document.getElementById("game-board")
  const restartBtn = document.getElementById("restart-btn")

  if (!gameBoard || !restartBtn) return

  gameBoard.innerHTML = ""
  restartBtn.classList.add("hidden")
  gameActive = true

  //   const gridColumns = 18

  // For 16:10
  //   const gridRows = Math.round(gridColumns * (10 / 16))

  // For 4:3
  //   const gridRows = Math.round(gridColumns * (3 / 4))

  // For golden ratio
  const gridRows = Math.round(gridColumns / 1.618)

  const unavailableCells = new Set()

  // Set CSS custom properties
  gameBoard.style.setProperty("--gridColumns", gridColumns)
  gameBoard.style.setProperty("--gridRows", gridRows)

  let treasureCell
  do {
    treasureCell = Math.floor(Math.random() * (gridColumns * gridRows)) // Randomly select treasure location
  } while (treasureCell % gridColumns >= gridColumns - 1) // Prevent placement in the last column

  addUnavailableCells(treasureCell, unavailableCells, gridColumns, gridRows)
  //   unavailableCells.add(treasureCell)
  //   unavailableCells.add(treasureCell + 1)

  // Create treasure div
  const treasureDiv = document.createElement("div")
  treasureDiv.className = "treasure-div"
  treasureDiv.textContent = "💎"
  treasureDiv.style.gridColumn = `${(treasureCell % gridColumns) + 1} / span 2`
  treasureDiv.style.gridRow = `${Math.floor(treasureCell / gridColumns) + 1}`
  gameBoard.appendChild(treasureDiv)

  // Find a word to place on the treasure cell
  const treasureWordIndex = Math.floor(Math.random() * vocabularyWords.length)

  vocabularyWords.forEach((word, index) => {
    let cell

    // If this is the chosen treasure word, place it on the treasure cell
    if (index === treasureWordIndex) {
      cell = treasureCell
    } else {
      let attempts = 0
      const maxAttempts = 2000 // Adjust this number as needed

      do {
        cell = Math.floor(Math.random() * (gridColumns * gridRows))
        attempts++

        if (attempts >= maxAttempts) {
          console.log(
            `Could not place word: ${word} after ${maxAttempts} attempts`
          )
          return // Skip this word
        }
      } while (
        unavailableCells.has(cell) ||
        unavailableCells.has(cell + 1) || // Prevent 2-cell words from overlapping
        // Prevent placement in the last column
        cell % gridColumns >= gridColumns - 1
      )
    }
    // unavailableCells.add(cell)
    // unavailableCells.add(cell + 1)
    addUnavailableCells(cell, unavailableCells, gridColumns, gridRows)

    const wordCard = document.createElement("div")
    wordCard.className = "word-card"
    wordCard.textContent = word

    // Position in grid
    wordCard.style.gridColumn = `${(cell % gridColumns) + 1} / span 2`
    wordCard.style.gridRow = `${Math.floor(cell / gridColumns) + 1}`

    wordCard.addEventListener("click", () =>
      handleWordClick(wordCard, treasureCell, cell)
    )
    gameBoard.appendChild(wordCard)
  })
  // After creating word cards, update the count
  const wordCards = document.querySelectorAll(".word-card")
  updateWordCardCount(wordCards.length)

  createBubbles()
}

function handleWordClick(wordCard, treasureCell, currentCell) {
  if (!gameActive || wordCard.classList.contains("clicked")) return

  // Create multiple bubbles on click
  for (let i = 0; i < 3; i++) {
    createBubble()
  }

  // Add ripple effect
  const ripple = document.createElement("div")
  ripple.className = "click-ripple"
  wordCard.appendChild(ripple)

  setTimeout(() => ripple.remove(), 600)

  wordCard.classList.add("clicked")

  // Check if clicked cell is near treasure cell
  if (currentCell === treasureCell) {
    // Found the treasure!
    gameActive = false
    playSoundSafely(winSound)

    // Fade out the word card
    wordCard.style.opacity = "0"

    // Reveal treasure
    const treasureDiv = document.querySelector(".treasure-div")
    if (treasureDiv) {
      treasureDiv.style.display = "flex"
    }

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

// Call this when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setupGridColumnControl()
  initializeGame()
})
