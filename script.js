// Sample vocabulary words - can be modified as needed
// const selectedWordSet = [
//   "anchor",
//   "beach",
//   "coral",
//   "dolphin",
//   "eel",
//   "fish",
//   "gull",
//   "harbor",
//   "island",
//   "jellyfish",
//   "kelp",
//   "lighthouse",
//   "mermaid",
//   "narwhal",
//   "ocean",
//   "pearl",
//   "quay",
//   "reef",
//   "shell",
//   "tide",
//   "umbrella",
//   "vessel",
//   "wave",
//   "xiphosura",
//   "yacht",
//   "zebra fish",
//   "seaweed",
//   "turtle",
//   "starfish",
//   "seahorse",
// ]
const showUsedCellsCheckbox = document.getElementById("show-used-cells") // used for debugging
let treasureIndex
let gameActive = true
let cardsRemaining = 0
let players = []
let currentPlayerIndex = 0

// used for debugging - updates the grid columns using the input
function setupGridColumnControl() {
  const gridColumnsInput = document.getElementById("grid-columns")
  const gameBoard = document.getElementById("game-board")

  if (gridColumnsInput && gameBoard) {
    gridColumnsInput.addEventListener("change", () => {
      const newGridColumns = parseInt(gridColumnsInput.value)
      gameBoard.style.setProperty("--grid-columns", newGridColumns)
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

// Create audio elements programmatically
const winSound = new Audio(
  "data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhDgAAAAEA"
)
const wrongSound = new Audio(
  "data:audio/wav;base64,//uQRAAAAWMNmkjly8AAAAcFA3Z//+8Q5H/xh/x//8="
)

// Safe sound play function
function playSoundSafely(sound) {
  if (sound instanceof HTMLAudioElement) {
    sound.play().catch(() => {
      // Silently handle any playback errors
    })
  }
}

function createBubbles(numBubbles = 15) {
  const gameBoard = document.getElementById("game-board")

  if (!gameBoard) return

  for (let i = 0; i < numBubbles; i++) {
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
}

function populateWordSetDropdown() {
  const unitDropdown = document.getElementById("word-set")

  // Clear existing options
  unitDropdown.innerHTML = ""

  // Create and add the optgroup
  const smartPhonicsGroup = document.createElement("optgroup")
  smartPhonicsGroup.label = "Smart Phonics"
  unitDropdown.appendChild(smartPhonicsGroup)

  // Collect all units from all levels
  const allUnits = []

  Object.keys(smartPhonicsWordBank).forEach((level) => {
    const separator = document.createElement("option")
    separator.textContent = `---`
    separator.disabled = true
    smartPhonicsGroup.appendChild(separator) // Append to optgroup instead of dropdown
    const unitsInLevel = Object.keys(smartPhonicsWordBank[level])

    unitsInLevel.forEach((unit) => {
      const targetSound = smartPhonicsWordBank[level][unit].targetSound || ""

      const option = document.createElement("option")
      option.value = `${level}:${unit}`

      option.textContent = `Level ${level.replace(
        "level",
        ""
      )} - Unit ${unit.replace("unit", "")} (${targetSound})`

      // Store all units
      allUnits.push(option.value)

      smartPhonicsGroup.appendChild(option) // Append to optgroup instead of dropdown
    })
  })

  // Select a random unit
  if (allUnits.length > 0) {
    const randomIndex = Math.floor(Math.random() * allUnits.length)
    const selectedUnit = allUnits[randomIndex]
    unitDropdown.value = selectedUnit

    console.log(`Randomly selected unit: ${selectedUnit}`)
  }
}

function populateTotalWordsDropdown() {
  const totalWordsDropdown = document.getElementById("max-words")

  // Clear existing options
  totalWordsDropdown.innerHTML = ""

  // Create options from 5 to 40, incrementing by 5
  for (let i = 5; i <= 45; i += 5) {
    const option = document.createElement("option")
    option.value = i
    option.textContent = `${i}`

    // Set 25 as the default selected option
    if (i === 25) {
      option.selected = true
    }

    totalWordsDropdown.appendChild(option)
  }
}

function addUnavailableCells(
  cell,
  unavailableCells,
  availableCells,
  gridColumns,
  gridRows
) {
  const offsets = [
    // The cell itself
    //
    1, // to the right
    2, // 2 cells to the right
    3, // 3 cells to the right
    4, // 4 cells to the right
    5, // 5 cells to the right
    6, // 6 cells to the right
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
    -6, // 6 cells to the left

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
  ]

  const gameBoard = document.getElementById("game-board")

  offsets.forEach((offset) => {
    const surroundingCell = cell + offset

    // Check if the surrounding cell is within grid bounds
    if (
      surroundingCell >= 0 &&
      surroundingCell < gridColumns * gridRows &&
      !unavailableCells.has(surroundingCell) && // prevent multiple divs being created
      availableCells.includes(surroundingCell) && // check if cell is still available
      // Ensure we don't wrap around rows
      Math.abs((surroundingCell % gridColumns) - (cell % gridColumns)) <= 6
    ) {
      // Add the surrounding cell from unavailableCells
      unavailableCells.add(surroundingCell)
      // Remove the surrounding cell from availableCells
      const index = availableCells.indexOf(surroundingCell)
      if (index > -1) {
        availableCells.splice(index, 1)
      }

      // Create visual element for used cell for debugging
      if (showUsedCellsCheckbox && showUsedCellsCheckbox.checked) {
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
  if (showUsedCellsCheckbox && showUsedCellsCheckbox.checked) {
    const usedCellDiv = document.createElement("div")
    usedCellDiv.className = "unavailable-cell-main"
    usedCellDiv.style.gridColumn = `${(cell % gridColumns) + 1}`
    usedCellDiv.style.gridRow = `${Math.floor(cell / gridColumns) + 1}`
    gameBoard.appendChild(usedCellDiv)
  }
  // Add the surrounding cell from unavailableCells
  unavailableCells.add(cell)
  // Remove the surrounding cell from availableCells
  const index = availableCells.indexOf(cell)
  if (index > -1) {
    availableCells.splice(index, 1)
  }
}

function selectWordsFromWordBank(
  level,
  unit,
  totalWords = 30,
  includeExtraWords = false
) {
  function shuffleArray(array) {
    // Fisher-Yates (Knuth) shuffle algorithm
    const shuffledArray = [...array] // Create a copy to avoid modifying original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ]
    }
    return shuffledArray
  }

  // Check if the specified level and unit exist
  if (!smartPhonicsWordBank[level] || !smartPhonicsWordBank[level][unit]) {
    console.error(`Invalid level or unit: ${level}, ${unit}`)
    return { words: [] }
  }

  // Get all units for the current level
  const unitsInLevel = Object.keys(smartPhonicsWordBank[level])

  // Find the current unit's index
  const currentUnitIndex = unitsInLevel.indexOf(unit)

  let selectedWords = []

  // Start with the current unit
  let processingUnitIndex = currentUnitIndex

  // Flag to track word selection phase
  let wordPass = "regular"

  // First pass: Add regular words (and extra words if specified)
  // If not enough words, switch to 'extra' pass
  // Add extra words from units, working backwards
  while (
    processingUnitIndex >= 0 &&
    (!totalWords || selectedWords.length < totalWords)
  ) {
    const processingUnit = unitsInLevel[processingUnitIndex]
    const unitData = smartPhonicsWordBank[level][processingUnit]

    let wordsToAdd = []

    // Determine which words to add based on the current pass
    switch (wordPass) {
      case "regular":
        // Add regular words
        wordsToAdd = shuffleArray(unitData.words)

        // If includeExtraWords is true, also add extra words
        if (includeExtraWords && unitData.extraWords) {
          wordsToAdd = [...wordsToAdd, ...shuffleArray(unitData.extraWords)]
        }

        // If we've gone through all units and still need words, switch to extra words
        if (processingUnitIndex === 0) {
          wordPass = "extra"
          processingUnitIndex = currentUnitIndex // Reset to current unit index
        } else {
          // Move to previous unit
          processingUnitIndex--
        }
        break

      case "extra":
        // Only add extra words if they exist and we're still short on words
        if (unitData.extraWords) {
          wordsToAdd = shuffleArray(unitData.extraWords)
        }

        // If we've gone through all units, we're done
        if (processingUnitIndex === 0) {
          wordPass = "done"
        } else {
          // Move to previous unit
          processingUnitIndex--
        }
        break

      case "done":
        // There are no more words to add

        // If there are more words than needed, slice the array
        if (selectedWords.length > totalWords) {
          selectedWords = selectedWords.slice(0, totalWords)
        }

        return selectedWords
    }

    // Remove duplicates while maintaining order
    wordsToAdd = wordsToAdd.filter((word) => !selectedWords.includes(word))

    // Add words from this unit
    selectedWords.push(...wordsToAdd)
  }

  // If there are more words than needed, slice the array
  if (selectedWords.length > totalWords) {
    selectedWords = selectedWords.slice(0, totalWords)
  }

  return selectedWords
}

function handleWordClick(wordCard, treasureCell, currentCell) {
  if (!gameActive || wordCard.classList.contains("clicked")) return

  // Keep track of how many cards are left
  cardsRemaining--
  document.getElementById("cards-remaining").textContent =
    cardsRemaining.toString()

  createBubbles(4)

  wordCard.classList.add("clicked")

  // Check if clicked cell is near treasure cell
  if (currentCell === treasureCell) {
    // Found the treasure!
    gameActive = false
    playSoundSafely(winSound)

    // Reveal treasure
    const treasureDiv = document.querySelector(".treasure-div")
    if (treasureDiv) {
      treasureDiv.style.display = "flex"
    }

    // Show completion modal
    showCompletionModal()
  } else {
    // Wrong guess
    playSoundSafely(wrongSound)
    setTimeout(() => {
      wordCard.style.visibility = "hidden"
    }, 1000)
  }

  // Switch to next player after each guess
  switchToNextPlayer()
}

function initializeGame() {
  const gameBoard = document.getElementById("game-board")
  const restartBtn = document.getElementById("play-again-btn")

  const unitSelect = document.getElementById("word-set")

  // Get extra words checkbox state
  const includeExtraWordsCheckbox = document.getElementById(
    "include-extra-words"
  )
  const includeExtraWords = includeExtraWordsCheckbox.checked

  // Get total words from dropdown
  const totalWordsSelect = document.getElementById("max-words")
  const totalWords = parseInt(totalWordsSelect.value)

  // Split the value into level and unit
  const [selectedLevel, selectedUnit] = unitSelect.value.split(":")

  const selectedWordSet = selectWordsFromWordBank(
    selectedLevel, // level
    selectedUnit, // current unit
    totalWords, // total words desired
    includeExtraWords // include extra words
  )

  const computedStyle = window.getComputedStyle(gameBoard)

  // Get gridRatio from CSS variable
  const gridRatio = parseFloat(computedStyle.getPropertyValue("--grid-ratio"))

  // Get gridColumns from inline style or CSS variables
  const gridColumnsInline = gameBoard.style.getPropertyValue("--grid-columns")
  const gridColumns = gridColumnsInline
    ? parseInt(gridColumnsInline, 10)
    : parseInt(computedStyle.getPropertyValue("--grid-columns"), 10)

  const gridRows = Math.round(gridColumns / gridRatio)

  // used for debugging - Update the grid-columns input value
  const gridColumnsInput = document.getElementById("grid-columns")
  if (gridColumnsInput) {
    gridColumnsInput.value = gridColumns
  }

  gameBoard.innerHTML = ""
  gameActive = true
  const unavailableCells = new Set()

  // Create an array of all available cells
  const availableCells = Array.from(
    { length: gridColumns * gridRows },
    (_, i) => i
  ).filter(
    (cell) =>
      cell % gridColumns < gridColumns - 4 && // Prevent placement in the last 4 columns
      Math.floor(cell / gridColumns) < gridRows - 2 // Prevent placement in the last 2 rows
  )

  // For golden ratio
  // const gridRows = Math.round(gridColumns / 1.618)
  // const gridColumnSpan = Math.round(gridColumns / 10)
  // const gridRowSpan = Math.round(gridColumnSpan / 1.618)

  // Set CSS custom properties
  // gameBoard.style.setProperty("--gridColumns", gridColumns)
  // gameBoard.style.setProperty("--gridRows", gridRows)

  // let treasureCell
  // do {
  //   treasureCell = Math.floor(Math.random() * (gridColumns * gridRows)) // Randomly select treasure location
  // } while (
  //   treasureCell % gridColumns >= gridColumns - 4 || // Prevent placement in the last 4 columns
  //   Math.floor(treasureCell / gridColumns) >= gridRows - 2 // Prevent placement in the last 2 rows
  // )

  // Select treasure cell
  const treasureCellIndex = Math.floor(Math.random() * availableCells.length)
  const treasureCell = availableCells.splice(treasureCellIndex, 1)[0]

  addUnavailableCells(
    treasureCell,
    unavailableCells,
    availableCells,
    gridColumns,
    gridRows
  )

  // Create treasure div
  const treasureDiv = document.createElement("div")
  treasureDiv.id = "treasure-div"
  treasureDiv.className = "treasure-div"
  treasureDiv.textContent = "💎"
  treasureDiv.style.setProperty("--cell", treasureCell)
  // treasureDiv.style.gridColumn = `${
  //   (treasureCell % gridColumns) + 1
  // } / span ${gridColumnSpan}`

  // treasureDiv.style.gridRow = `${
  //   Math.floor(treasureCell / gridColumns) + 1
  // } / span ${gridRowSpan}`

  gameBoard.appendChild(treasureDiv)

  // Find a word to place on the treasure cell
  const treasureWordIndex = Math.floor(Math.random() * selectedWordSet.length)

  selectedWordSet.forEach((word, index) => {
    let cell
    // If this is the chosen treasure word, place it on the treasure cell
    if (index === treasureWordIndex) {
      cell = treasureCell
    } else {
      // If no available cells, log and skip
      if (availableCells.length === 0) {
        console.log(`No more available cells. Skipping word: ${word}`)
        return
      }

      // Randomly select from remaining available cells
      const cellIndex = Math.floor(Math.random() * availableCells.length)
      cell = availableCells.splice(cellIndex, 1)[0]
    }

    addUnavailableCells(
      cell,
      unavailableCells,
      availableCells,
      gridColumns,
      gridRows
    )

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
  console.log("Word Cards Created:", wordCards.length)

  cardsRemaining = wordCards.length
  document.getElementById("cards-remaining").textContent = cardsRemaining

  // Create bubbles
  createBubbles(15)
}

function showCompletionModal() {
  const modal = document.getElementById("completion-modal")

  // Show modal with a slight delay
  setTimeout(() => {
    modal.classList.add("visible")
  }, 600)
}

function hideCompletionModal() {
  const modal = document.getElementById("completion-modal")
  modal.classList.remove("visible")
}

function showPlayersModal() {
  const playersModal = document.getElementById("players-modal")
  playersModal.classList.add("visible")
}

function hidePlayersModal() {
  const playersModal = document.getElementById("players-modal")
  playersModal.classList.remove("visible")
}

function savePlayers() {
  const textarea = document.getElementById("players-textarea")
  const playerInput = textarea.value.trim()

  // Split by comma or newline, trim whitespace
  players = [
    ...new Set(
      playerInput
        .split(/[,\n]/)
        .map((name) => name.trim())
        .filter((name) => name !== "")
    ),
  ]

  // Save to localStorage
  try {
    localStorage.setItem("treasureHuntPlayers", JSON.stringify(players))
    updatePlayerDisplay()
    hidePlayersModal()
  } catch (error) {
    console.error("Error saving players to localStorage:", error)
    alert("Unable to save players. Local storage might be full or disabled.")
  }
}

// Function to load players from localStorage
function loadSavedPlayers() {
  try {
    // Retrieve players from localStorage
    const savedPlayers = localStorage.getItem("treasureHuntPlayers")

    if (savedPlayers) {
      // Parse the saved players
      players = JSON.parse(savedPlayers)

      // Optional: Pre-fill textarea with saved players
      const textarea = document.getElementById("players-textarea")
      if (textarea) {
        textarea.value = players.join(", ")
      }
      // log that saved players loaded
      console.log("Saved players loaded:", players)

      // updatePlayerDisplay()
    }
  } catch (error) {
    console.error("Error loading players from localStorage:", error)
    // Clear potentially corrupted localStorage data
    localStorage.removeItem("treasureHuntPlayers")
  }
}

function updatePlayerDisplay() {
  const playerDisplayElement = document.getElementById("player-display")
  playerDisplayElement.innerHTML = ""
  // add flex-basis: 100% so it's on a new line
  playerDisplayElement.style.flexBasis = "100%"

  players.forEach((player, index) => {
    const playerElement = document.createElement("div")
    playerElement.classList.add("player-name")

    if (index === currentPlayerIndex) {
      playerElement.classList.add("active")
    }

    playerElement.textContent = player
    playerDisplayElement.appendChild(playerElement)
  })
}

function switchToNextPlayer() {
  if (players.length > 0) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length
    updatePlayerDisplay()
  }
}

// Add event listener for the Play Again button
document.getElementById("play-again-btn").addEventListener("click", () => {
  hideCompletionModal()
  initializeGame()
})

// Add escape key support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Close the modal
    hideCompletionModal()
    // Reset current game
    initializeGame()
  }
})

// Allow clicking outside the modal to close it
document.getElementById("completion-modal").addEventListener("click", (e) => {
  if (e.target.id === "completion-modal") {
    hideCompletionModal()
  }
})

// Call this when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // for debugging - Add an event listener to clear existing used cell divs when unchecked
  // Only add the event listener if the checkbox exists
  if (showUsedCellsCheckbox) {
    showUsedCellsCheckbox.addEventListener("change", () => {
      if (!showUsedCellsCheckbox.checked) {
        const gameBoard = document.getElementById("game-board")
        const usedCellDivs = gameBoard.querySelectorAll(
          ".unavailable-cell, .unavailable-cell-main"
        )
        usedCellDivs.forEach((div) => div.remove())
      } else initializeGame()
    })
  }

  // Add event listeners to trigger game initialization
  const unitSelect = document.getElementById("word-set")
  const totalWordsSelect = document.getElementById("max-words")
  const includeExtraWordsCheckbox = document.getElementById(
    "include-extra-words"
  )

  unitSelect.addEventListener("change", initializeGame)
  totalWordsSelect.addEventListener("change", initializeGame)
  includeExtraWordsCheckbox.addEventListener("change", initializeGame)

  // Event listeners for adding players
  document
    .getElementById("add-players-btn")
    .addEventListener("click", showPlayersModal)
  document.getElementById("save-players-btn").addEventListener("click", () => {
    const addPlayersBtn = document.getElementById("add-players-btn")

    addPlayersBtn.textContent = "Edit Players"

    savePlayers()
  })
  document
    .getElementById("cancel-players-btn")
    .addEventListener("click", hidePlayersModal)

  document
    .getElementById("save-players-btn")
    .addEventListener("click", savePlayers)
  document
    .getElementById("cancel-players-btn")
    .addEventListener("click", hidePlayersModal)

  // Load saved players when page loads
  loadSavedPlayers()

  setupGridColumnControl() // For Debuging
  populateWordSetDropdown()
  populateTotalWordsDropdown()
  initializeGame()
})
