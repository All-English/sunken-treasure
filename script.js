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
const showUsedCellsCheckbox = document.getElementById("show-used-cells") // used for debugging
let treasureIndex
let gameActive = true

// Create audio elements programmatically
// const clickSound = new Audio(
//   "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDw8PDw8PFBQUFBQUG5ubm5ubm6MjIyMjIykoKCgoKCg1NTU1NTU4ODg4ODg4PT09PT09P////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAHjOZTf9/AAAAAAAAAAAAAAAAAAAAAP/7kGQAAANUMEoFPeACNQV40KEYABEY41g5vAAA9RjpZxRwAImU+W8eshaFpAQgALAAYALATx/nYDYCMJ0HITQYYA7AH4c7MoGsnCMU5pnW+OQnBcDrQ9Xx7w37/D+PimYavV8elKUpT5fqx5VjV6vZ38eJR48eRKa9KUp7v396UgPHkQwMAAAAAA//8MAOp39CECAAhlIEEIIECBAgTT1oj///tEQYT0wgEIYxgDC09aIiE7u7u7u"
// )
// const winSound = new Audio(
//   "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAeAAAUhgANDQ0NDRoaGhoaGigoKCgoKDU1NTU1NUNDQ0NDQ1BQUFBQUGRkZGRkZHFxcXFxcX9/f39/f4yMjIyMjJmZmZmZmaampqamprS0tLS0tMHBwcHBwc7Ozs7OztPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAFFobPxR6JAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
// )
// const wrongSound = new Audio(
//   "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAGhg3tzzMAAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
// )

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
    // The cell itself
    //
    1, // to the right
    2, // 2 cells to the right
    3, // 3 cells to the right
    4, // 4 cells to the right
    gridColumns, // directly below
    gridColumns + 1, // bottom-right diagonal
    gridColumns + 2, // bottom-right diagonal + 1 cell
    gridColumns + 3, // bottom-right diagonal + 2 cells
    gridColumns + 4, // bottom-right diagonal + 3 cells
    gridColumns * 2, // 2 rows below
    gridColumns * 2 + 1, // 2 rows below + 1 cell to the right
    gridColumns * 2 + 2, // 2 rows below + 2 cells to the right
    gridColumns * 2 + 3, // 2 rows below + 3 cells to the right
    gridColumns * 2 + 4,

    // above cell and to the left
    -gridColumns, // directly above
    -gridColumns + 1, // top-right diagonal
    -gridColumns + 2, // top-right diagonal + 1 cell
    -gridColumns + 3, // top-right diagonal + 2 cells
    -gridColumns + 4, // top-right diagonal + 3 cells
    -gridColumns - 1, // top-left diagonal
    -gridColumns - 2, // top-left diagonal - 1 cell
    -gridColumns - 3, // top-left diagonal - 2 cells
    -gridColumns - 4, // top-left diagonal - 3 cells
    -gridColumns * 2, // two rows directly above
    -gridColumns * 2 + 1, // top-right diagonal
    -gridColumns * 2 + 2, // top-right diagonal + 1 cell
    -gridColumns * 2 + 3, // top-right diagonal + 2 cells
    -gridColumns * 2 + 4, // top-right diagonal + 3 cells
    -gridColumns * 2 - 1, // top-left diagonal
    -gridColumns * 2 - 2, // top-left diagonal - 1 cell
    -gridColumns * 2 - 3, // top-left diagonal - 2 cells
    -gridColumns * 2 - 4, // top-left diagonal - 3 cells
    -gridColumns * 3, // two rows directly above
    -gridColumns * 3 + 1, // top-right diagonal
    -gridColumns * 3 + 2, // top-right diagonal + 1 cell
    -gridColumns * 3 + 3, // top-right diagonal + 2 cells
    -gridColumns * 3 + 4, // top-right diagonal + 3 cells
    -gridColumns * 3 - 1, // top-left diagonal
    -gridColumns * 3 - 2, // top-left diagonal - 1 cell
    -gridColumns * 3 - 3, // top-left diagonal - 2 cells
    -gridColumns * 3 - 4, // top-left diagonal - 3 cells

    // to the middle left
    -1, // to the left
    -2, // 2 cells to the left
    -3, // 3 cells to the left
    -4, // 4 cells to the left
    -5, // 5 cells to the left
    gridColumns - 1, // bottom-left diagonal
    gridColumns - 2, // bottom-left diagonal - 1 cell
    gridColumns - 3, // bottom-left diagonal - 2 cells
    gridColumns - 4, // bottom-left diagonal - 3 cells
    // gridColumns - 5, // bottom-left diagonal - 4 cells
    gridColumns * 2 - 1, // 2 rows below - 1 cell
    gridColumns * 2 - 2, // 2 rows below - 2 cells
    gridColumns * 2 - 3, // 2 rows below - 3 cells
    gridColumns * 2 - 4, // 2 rows below - 4 cells
    // gridColumns * 2 - 5, // 2 rows below - 5 cells

    // below the cell
    gridColumns * 3, // 3 rows below
    gridColumns * 3 + 1, // 3 rows below + 1 cell to the right
    gridColumns * 3 - 1, // 3 rows below - 1 cell to the left
    gridColumns * 3 + 2, // 3 rows below + 2 cells to the right

    // to the right
    5, // 5 cells to the right
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
      Math.abs((surroundingCell % gridColumns) - (cell % gridColumns)) <= 5
    ) {
      unavailableCells.add(surroundingCell)

      // Create visual element for used cell for debugging
      if (showUsedCellsCheckbox.checked) {
        const usedCellDiv = document.createElement("div")
        usedCellDiv.className = "unavailable-cell"
        usedCellDiv.style.gridColumn = `${(surroundingCell % gridColumns) + 1}`
        usedCellDiv.style.gridRow = `${
          Math.floor(surroundingCell / gridColumns) + 1
        }`
        gameBoard.appendChild(usedCellDiv)
      }
    }
  })
  // Create visual element for used cell for debugging
  if (showUsedCellsCheckbox.checked) {
    const usedCellDiv = document.createElement("div")
    usedCellDiv.className = "unavailable-cell-main"
    usedCellDiv.style.gridColumn = `${(cell % gridColumns) + 1}`
    usedCellDiv.style.gridRow = `${Math.floor(cell / gridColumns) + 1}`
    gameBoard.appendChild(usedCellDiv)
  }
  unavailableCells.add(cell)
}

// used for debugging - updates the grid columns using the input
function setupGridColumnControl() {
  const gridColumnsInput = document.getElementById("grid-columns")
  const gameBoard = document.getElementById("game-board")

  if (gridColumnsInput && gameBoard) {
    gridColumnsInput.addEventListener("change", () => {
      const newGridColumns = parseInt(gridColumnsInput.value)
      gameBoard.style.setProperty("--grid-columns", newGridColumns)
      initializeGame()
    })
  }
}

// used for debugging - counts the number of cards used in the grid
function updateWordCardCount(count) {
  const wordCardCountElement = document.getElementById("word-card-count")
  if (wordCardCountElement) {
    wordCardCountElement.textContent = `Total Word Cards: ${count}`
  }
}

function initializeGame() {
  const gameBoard = document.getElementById("game-board")
  const restartBtn = document.getElementById("restart-btn")
  if (!gameBoard || !restartBtn) return

  const computedStyle = window.getComputedStyle(gameBoard)

  // Get values from CSS variables
  const gridColumns = parseInt(
    computedStyle.getPropertyValue("--grid-columns"),
    10
  )
  const gridRatio = parseFloat(computedStyle.getPropertyValue("--grid-ratio"))
  const gridRows = Math.round(gridColumns / gridRatio)

  // used for debugging - Update the grid-columns input value
  const gridColumnsInput = document.getElementById("grid-columns")
  if (gridColumnsInput) {
    gridColumnsInput.value = gridColumns
  }

  gameBoard.innerHTML = ""
  restartBtn.classList.add("hidden")
  gameActive = true
  const unavailableCells = new Set()

  // For golden ratio
  // const gridRows = Math.round(gridColumns / 1.618)
  // const gridColumnSpan = Math.round(gridColumns / 10)
  // const gridRowSpan = Math.round(gridColumnSpan / 1.618)

  // Set CSS custom properties
  // gameBoard.style.setProperty("--gridColumns", gridColumns)
  // gameBoard.style.setProperty("--gridRows", gridRows)

  let treasureCell
  do {
    treasureCell = Math.floor(Math.random() * (gridColumns * gridRows)) // Randomly select treasure location
  } while (
    treasureCell % gridColumns >= gridColumns - 4 || // Prevent placement in the last 4 columns
    Math.floor(treasureCell / gridColumns) >= gridRows - 2 // Prevent placement in the last 2 rows
  )
  
  addUnavailableCells(treasureCell, unavailableCells, gridColumns, gridRows)

  // Create treasure div
  const treasureDiv = document.getElementById("treasure-div")
  treasureDiv.style.setProperty("--cell", treasureCell)
  // treasureDiv.style.gridColumn = `${
  //   (treasureCell % gridColumns) + 1
  // } / span ${gridColumnSpan}`

  // treasureDiv.style.gridRow = `${
  //   Math.floor(treasureCell / gridColumns) + 1
  // } / span ${gridRowSpan}`

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
        cell % gridColumns >= gridColumns - 4 || // Prevent placement in the last 4 columns
        Math.floor(cell / gridColumns) >= gridRows - 2 // Prevent placement in the last 2 rows
      )
    }
    
    addUnavailableCells(cell, unavailableCells, gridColumns, gridRows)

    const wordCard = document.createElement("div")
    wordCard.className = "word-card"
    wordCard.textContent = word

    // Position in grid
    wordCard.style.setProperty("--cell", cell)

    // wordCard.style.gridColumn = `${
    //   (cell % gridColumns) + 1
    // } / span ${gridColumnSpan}`
    // wordCard.style.gridRow = `${
    //   Math.floor(cell / gridColumns) + 1
    // } / span ${gridRowSpan}`

    wordCard.addEventListener("click", () =>
      handleWordClick(wordCard, treasureCell, cell)
    )
    gameBoard.appendChild(wordCard)
  })

  // used for debugging - After creating word cards, update the count (for debug)
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

// for debugging - Add an event listener to clear existing used cell divs when unchecked
showUsedCellsCheckbox.addEventListener("change", () => {
  if (!showUsedCellsCheckbox.checked) {
    const gameBoard = document.getElementById("game-board")
    const usedCellDivs = gameBoard.querySelectorAll(
      ".unavailable-cell, .unavailable-cell-main"
    )
    usedCellDivs.forEach((div) => div.remove())
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
  // setupGridColumnControl()
  initializeGame()
})
