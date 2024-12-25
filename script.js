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
let cardsRemaining = 0
let currentPlayerIndex = 0
let gameActive = true
let players = []
let playerStats = {}
let treasureIndex
const winSounds = [
  new Audio("sounds/win/land-ho.mp3"),
  new Audio("sounds/win/shiver-me-timbers.mp3"),
  new Audio("sounds/win/there-she-blows.mp3"),
  new Audio("sounds/win/There's Something-You-Dont-See-Every-Day.mp3"),
  new Audio("sounds/win/well-blow-me-down.mp3"),
]
const wrongSounds = [
  new Audio("sounds/wrong/arrgh.mp3"),
  new Audio("sounds/wrong/arrgh2.mp3"),
  new Audio("sounds/wrong/arrgh3.mp3"),
  new Audio("sounds/wrong/blimey.mp3"),
  new Audio("sounds/wrong/heeve-ho.mp3"),
  new Audio("sounds/wrong/Look-At-Me-I'm-Flying-Oh-Wait-Maybe-Not.mp3"),
  new Audio("sounds/wrong/walk-the-plank.mp3"),
  new Audio("sounds/wrong/walk-the-plank2.mp3"),
  new Audio("sounds/wrong/yo-ho-ho.mp3"),
  new Audio("sounds/wrong/yo-ho-ho2.mp3"),
]
let winSoundsQueue = shuffleArray([...winSounds])
let wrongSoundsQueue = shuffleArray([...wrongSounds])

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

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
// Preload sounds
function preloadSounds(soundsArray) {
  soundsArray.forEach((sound) => {
    sound.load()
  })
}

// Mute sounds
function setupSoundMuteControl() {
  const muteCheckbox = document.getElementById("mute-sounds-checkbox")

  if (muteCheckbox) {
    muteCheckbox.addEventListener("change", () => {
      const isMuted = muteCheckbox.checked

      // You might want to add a global mute flag
      window.isSoundsMuted = isMuted

      // Optionally save to localStorage
      localStorage.setItem("treasureHuntMuted", JSON.stringify(isMuted))
    })

    // Initialize mute state from localStorage
    const savedMuteState = localStorage.getItem("treasureHuntMuted")
    if (savedMuteState !== null) {
      const isMuted = JSON.parse(savedMuteState)
      muteCheckbox.checked = isMuted
      window.isSoundsMuted = isMuted
    } else {
      // Ensure it's unchecked by default if no saved state
      muteCheckbox.checked = false
      window.isSoundsMuted = false
    }
  }
}

// Safe sound play function
function playSoundSafely(sound) {
  if (sound instanceof HTMLAudioElement && !window.isSoundsMuted) {
    sound.play().catch((error) => {
      // Silently handle any playback errors
      console.error("Sound play error:", error)
    })
  }
}

// Play a sound from a queued list
function playNextSoundInQueue(soundsArray) {
  if (soundsArray === winSounds) {
    const sound = getNextSound(winSounds, winSoundsQueue)
    playSoundSafely(sound)
  } else if (soundsArray === wrongSounds) {
    const sound = getNextSound(wrongSounds, wrongSoundsQueue)
    playSoundSafely(sound)
  }
}

// Get next sound from queue, reshuffle if empty
function getNextSound(soundsArray, queueArray) {
  if (queueArray.length === 0) {
    // Queue is empty, reshuffle all sounds
    queueArray.push(...shuffleArray(soundsArray))
  }
  return queueArray.pop()
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

// Initialize or load player stats
function loadPlayerStats() {
  const savedStats = localStorage.getItem("treasureHuntPlayerStats")
  if (savedStats) {
    playerStats = JSON.parse(savedStats)
  }
}

// Save player stats to localStorage
function savePlayerStats() {
  localStorage.setItem("treasureHuntPlayerStats", JSON.stringify(playerStats))
}

// Function to update player stats when a game is completed
function updatePlayerStats(winningPlayer) {
  // Initialize stats for player if not exists
  players.forEach((player) => {
    if (!playerStats[player]) {
      playerStats[player] = {
        totalGamesPlayed: 0,
        totalGamesWon: 0,
        sessionGamesWon: 0,
        winPercentage: 0,
        currentWinStreak: 0,
        longestWinStreak: 0,
        playerWinLossRecord: {},
      }
    }
  })

  // Update stats for all players
  players.forEach((player) => {
    playerStats[player].totalGamesPlayed++

    // Update win/loss record against other players
    players.forEach((otherPlayer) => {
      if (player !== otherPlayer) {
        if (!playerStats[player].playerWinLossRecord[otherPlayer]) {
          playerStats[player].playerWinLossRecord[otherPlayer] = {
            victories: 0,
            defeats: 0,
            gamesPlayedWith: 0,
          }
        }
        playerStats[player].playerWinLossRecord[otherPlayer].gamesPlayedWith++
      }
    })
  })

  // Update winning player's stats
  if (winningPlayer) {
    const playerStat = playerStats[winningPlayer]
    playerStat.totalGamesWon++
    playerStat.sessionGamesWon++
    playerStat.currentWinStreak++

    // Update longest win streak
    playerStat.longestWinStreak = Math.max(
      playerStat.longestWinStreak,
      playerStat.currentWinStreak
    )

    // Update win percentage
    playerStat.winPercentage = Math.round(
      (playerStat.totalGamesWon / playerStat.totalGamesPlayed) * 100
    )

    // Update win/loss record against other players
    players.forEach((otherPlayer) => {
      if (otherPlayer !== winningPlayer) {
        playerStats[winningPlayer].playerWinLossRecord[otherPlayer].victories++
        playerStats[otherPlayer].playerWinLossRecord[winningPlayer].defeats++

        playerStats[otherPlayer].currentWinStreak = 0
      }
    })
  }

  // Save updated stats
  savePlayerStats()
}

// Reset session wins when starting a new game with players
function resetSessionWins() {
  players.forEach((player) => {
    if (playerStats[player]) {
      playerStats[player].sessionGamesWon = 0
    }
  })
}

function populateWordSetDropdown() {
  const unitDropdown = document.getElementById("word-set-dropdown")
  unitDropdown.innerHTML = ""

  const smartPhonicsGroup = document.createElement("optgroup")
  smartPhonicsGroup.label = "Smart Phonics"
  unitDropdown.appendChild(smartPhonicsGroup)

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

      allUnits.push(option.value)
      smartPhonicsGroup.appendChild(option) // Append to optgroup instead of dropdown
    })
  })

  // Handle URL parameters first
  const urlParams = getUrlParameters()
  if (urlParams.level && urlParams.unit) {
    const level = `${urlParams.level}`
    const unit = `${urlParams.unit}`

    if (validateWordSetSelection(level, unit)) {
      const defaultValue = `${level}:${unit}`
      unitDropdown.value = defaultValue
      return // Exit if we successfully set a valid value from URL params
    }
  }

  // Only select random if we didn't set a value from URL params
  if (allUnits.length > 0) {
    const randomIndex = Math.floor(Math.random() * allUnits.length)
    const selectedUnit = allUnits[randomIndex]
    unitDropdown.value = selectedUnit

    // Update URL with the random selection
    const [randomLevel, randomUnit] = selectedUnit.split(":")
    updateUrlParameters(randomLevel, randomUnit)
  }
}

function populateMaxWordsDropdown() {
  const maxWordsDropdown = document.getElementById("max-words")

  // Clear existing options
  maxWordsDropdown.innerHTML = ""

  // Create options from 5 to 40, incrementing by 5
  for (let i = 5; i <= 45; i += 5) {
    const option = document.createElement("option")
    option.value = i
    option.textContent = `${i}`

    // Check if there's a saved value in localStorage
    const savedTotalWords = localStorage.getItem("maxWords")

    // Set the saved value as selected if it exists, otherwise use 25 as default
    if (savedTotalWords && parseInt(savedTotalWords) === i) {
      option.selected = true
    } else if (i === 25 && !savedTotalWords) {
      option.selected = true
    }

    maxWordsDropdown.appendChild(option)
  }

  // Add event listener to save selected value to localStorage
  maxWordsDropdown.addEventListener("change", () => {
    localStorage.setItem("maxWords", maxWordsDropdown.value)
  })
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
  maxWords = 30,
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
    (!maxWords || selectedWords.length < maxWords)
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
        if (selectedWords.length > maxWords) {
          selectedWords = selectedWords.slice(0, maxWords)
        }

        return selectedWords
    }

    // Remove duplicates while maintaining order
    wordsToAdd = wordsToAdd.filter((word) => !selectedWords.includes(word))

    // Add words from this unit
    selectedWords.push(...wordsToAdd)
  }

  // If there are more words than needed, slice the array
  if (selectedWords.length > maxWords) {
    selectedWords = selectedWords.slice(0, maxWords)
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

    // Play wrong sound effect after a delay
    setTimeout(() => {
      playNextSoundInQueue(winSounds)
    }, 700)

    // Reveal treasure
    setTimeout(() => {
      const treasureDiv = document.querySelector(".treasure-div")
      if (treasureDiv) {
        treasureDiv.style.display = "flex"
      }
    }, 300)

    const winningPlayer = players[currentPlayerIndex]
    updatePlayerStats(winningPlayer)

    // Show completion modal
    setTimeout(() => {
      showCompletionModal(winningPlayer)
      updatePlayerDisplay()
    }, 2000)
  } else {
    // Wrong guess

    // Hide the word card after a delay
    setTimeout(() => {
      wordCard.style.visibility = "hidden"
    }, 1200)

    // Play wrong sound effect after a delay
    setTimeout(() => {
      playNextSoundInQueue(wrongSounds)
    }, 700)

    // Switch to next player after each guess
    switchToNextPlayer()
  }
}

function updateUrlParameters(level, unit) {
  // Remove 'level' and 'unit' prefixes for the URL
  const cleanLevel = level.replace("level", "")
  const cleanUnit = unit.replace("unit", "")

  // Create new URL with updated parameters
  const newUrl = new URL(window.location.href)
  newUrl.searchParams.set("level", cleanLevel)
  newUrl.searchParams.set("unit", cleanUnit)

  // Update the URL in the browser's address bar without reloading the page
  window.history.pushState({}, "", newUrl)
}

function getUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search)
  const level = urlParams.get("level")
  const unit = urlParams.get("unit")

  return {
    level: level ? `level${level}` : null,
    unit: unit ? `unit${unit}` : null,
  }
}

function validateWordSetSelection(level, unit) {
  // Check if the specified level and unit exist in the word bank
  if (!smartPhonicsWordBank[level] || !smartPhonicsWordBank[level][unit]) {
    console.warn(`Invalid level or unit: ${level}, ${unit}. Using default.`)
    return false
  }
  return true
}

function createGameboard() {
  const gameBoard = document.getElementById("game-board")

  // Reset player turn to first player
  if (players.length > 0) {
    currentPlayerIndex = 0
    console.log(`Current Player: ${players[currentPlayerIndex]}`)
    updatePlayerDisplay()
  }
  // Check for URL parameters first
  const urlParams = getUrlParameters()

  let selectedLevel, selectedUnit

  if (
    urlParams.level &&
    urlParams.unit &&
    validateWordSetSelection(urlParams.level, urlParams.unit)
  ) {
    // Use URL parameters if valid
    selectedLevel = urlParams.level
    selectedUnit = urlParams.unit

    // Update the dropdown to match URL parameters
    const wordSetDropdown = document.getElementById("word-set-dropdown")
    wordSetDropdown.value = `${selectedLevel}:${selectedUnit}`
  } else {
    // Fallback to dropdown selection
    const wordSetDropdown = document.getElementById("word-set-dropdown")
    // Split the value into level and unit
    const [level, unit] = wordSetDropdown.value.split(":")
    selectedLevel = level
    selectedUnit = unit
  }

  // Get extra words checkbox state
  const includeExtraWordsCheckbox = document.getElementById(
    "include-extra-words"
  )
  const includeExtraWords = includeExtraWordsCheckbox.checked

  // Get total words from dropdown
  const maxWordsSelect = document.getElementById("max-words")
  const maxWords = parseInt(maxWordsSelect.value)

  const selectedWordSet = selectWordsFromWordBank(
    selectedLevel, // level
    selectedUnit, // current unit
    maxWords, // total words desired
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

  const treasureImage = document.createElement("img")
  treasureImage.className = "treasure-image"
  treasureImage.src = "pics/treasure-chest.svg"
  treasureImage.style.width = "100%"
  treasureImage.style.height = "100%"

  treasureDiv.appendChild(treasureImage)
  treasureDiv.style.setProperty("--cell", treasureCell)

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

function createPlayerStatsTables(playersList) {
  const container = document.createElement("div")

  // Create main stats table
  const mainTable = document.createElement("table")
  mainTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Games Played</th>
        <th>Games Won</th>
        <th>Win %</th>
        <th>Current Streak</th>
        <th>Longest Streak</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, index) => {
          const stat = playerStats[player]
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.totalGamesPlayed || 0}</td>
            <td>${stat.totalGamesWon || 0}</td>
            <td>${stat.winPercentage || 0}%</td>
            <td>${stat.currentWinStreak || 0}</td>
            <td>${stat.longestWinStreak || 0}</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `

  // Create win/loss record section
  const winLossSection = document.createElement("div")
  winLossSection.innerHTML = "<h3>Win/Loss Records</h3>"

  const winLossTable = document.createElement("table")
  winLossTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Opponent</th>
        <th>Victories</th>
        <th>Defeats</th>
        <th>Played With</th>
        <th>Win %</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, playerIndex) => {
          const playerRecord = playerStats[player].playerWinLossRecord || {}
          const opponentRows = Object.keys(playerRecord)
            .filter((opponent) => playersList.includes(opponent))
            .map((opponent) => {
              const record = playerRecord[opponent]
              const gamesPlayedWith = record.gamesPlayedWith || 0
              const winPercentage = gamesPlayedWith
                ? Math.round((record.victories / gamesPlayedWith) * 100)
                : 0
              return {
                player,
                opponent,
                victories: record.victories,
                defeats: record.defeats,
                gamesPlayedWith,
                winPercentage,
              }
            })

          opponentRows.sort((a, b) => {
            if (b.victories !== a.victories) return b.victories - a.victories
            if (b.defeats !== a.defeats) return b.defeats - a.defeats
            return b.winPercentage - a.winPercentage
          })

          return opponentRows
            .map((row, index) => {
              const prevRow = index > 0 ? opponentRows[index - 1] : null

              const winsCount = opponentRows.filter(
                (r) => r.victories === row.victories
              ).length
              const lossesCount = opponentRows.filter(
                (r) => r.defeats === row.defeats
              ).length
              const gamesPlayedCount = opponentRows.filter(
                (r) => r.gamesPlayedWith === row.gamesPlayedWith
              ).length
              const winPctCount = opponentRows.filter(
                (r) => r.winPercentage === row.winPercentage
              ).length

              const isFirstInPlayer = index === 0
              const isFirstInWinsGroup =
                !prevRow || prevRow.victories !== row.victories
              const isFirstInLossesGroup =
                !prevRow || prevRow.defeats !== row.defeats
              const isFirstInGamesPlayedGroup =
                !prevRow || prevRow.gamesPlayedWith !== row.gamesPlayedWith
              const isFirstInWinPctGroup =
                !prevRow || prevRow.winPercentage !== row.winPercentage

              return `
                <tr class="player-group-${
                  playerIndex % 2 === 0 ? "even" : "odd"
                }">
                  ${
                    isFirstInPlayer
                      ? `<td rowspan="${opponentRows.length}">${row.player}</td>`
                      : ""
                  }
                  <td>${row.opponent}</td>
                  ${
                    isFirstInWinsGroup
                      ? `<td rowspan="${winsCount}">${row.victories}</td>`
                      : ""
                  }
                  ${
                    isFirstInLossesGroup
                      ? `<td rowspan="${lossesCount}">${row.defeats}</td>`
                      : ""
                  }
                  ${
                    isFirstInGamesPlayedGroup
                      ? `<td rowspan="${gamesPlayedCount}">${row.gamesPlayedWith}</td>`
                      : ""
                  }
                  ${
                    isFirstInWinPctGroup
                      ? `<td rowspan="${winPctCount}">${row.winPercentage}%</td>`
                      : ""
                  }
                </tr>
              `
            })
            .join("")
        })
        .join("")}
    </tbody>
  `

  container.appendChild(mainTable)
  winLossSection.appendChild(winLossTable)
  container.appendChild(winLossSection)

  return container
}

function showCompletionModal(winner) {
  const completionModal = document.getElementById("completion-modal")
  const winnerNameSpan = document.getElementById("winner-name")

  if (winner) {
    const completionModalStats = document.getElementById(
      "completion-stats-container"
    )

    // Set winner's name
    winnerNameSpan.textContent = `${winner} found the treasure!`

    // Clear existing stats
    completionModalStats.innerHTML = ""

    const statsTables = createPlayerStatsTables(players)
    completionModalStats.appendChild(statsTables)
  } else {
    winnerNameSpan.textContent = `Congratulations, You found the treasure!`
  }

  // Show modal
  completionModal.classList.add("visible")
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

// Display detailed player stats
function showPlayerStatsModal() {
  const statsModal = document.getElementById("stats-modal")
  const statsContainer = document.getElementById("player-stats-container")

  // Clear existing stats
  statsContainer.innerHTML = ""

  // Sort players by total wins (descending)
  const sortedPlayers = Object.keys(playerStats).sort(
    (a, b) =>
      (playerStats[b].totalGamesWon || 0) - (playerStats[a].totalGamesWon || 0)
  )

  // Create main stats table
  const mainTable = document.createElement("table")
  mainTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Games Played</th>
        <th>Games Won</th>
        <th>Win %</th>
        <th>Current Streak</th>
        <th>Longest Streak</th>
      </tr>
    </thead>
    <tbody>
      ${sortedPlayers
        .map((player, index) => {
          const stat = playerStats[player]
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.totalGamesPlayed || 0}</td>
            <td>${stat.totalGamesWon || 0}</td>
            <td>${stat.winPercentage || 0}%</td>
            <td>${stat.currentWinStreak || 0}</td>
            <td>${stat.longestWinStreak || 0}</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `
  // Create win/loss record section
  const winLossSection = document.createElement("div")
  winLossSection.innerHTML = "<h3>Win/Loss Records</h3>"

  const winLossTable = document.createElement("table")
  winLossTable.innerHTML = `
  <thead>
    <tr>
      <th>Player</th>
      <th>Opponent</th>
      <th>Victories</th>
      <th>Defeats</th>
      <th>Played With</th>
      <th>Win %</th>
    </tr>
  </thead>
  <tbody>
    ${sortedPlayers
      .map((player, playerIndex) => {
        const playerRecord = playerStats[player].playerWinLossRecord || {}
        const opponentRows = Object.keys(playerRecord).map((opponent) => {
          const record = playerRecord[opponent]
          const gamesPlayedWith = record.gamesPlayedWith || 0
          const winPercentage = gamesPlayedWith
            ? Math.round((record.victories / gamesPlayedWith) * 100)
            : 0
          return {
            player,
            opponent,
            victories: record.victories,
            defeats: record.defeats,
            gamesPlayedWith,
            winPercentage,
          }
        })

        // Sort rows by victories, then defeats, then win percentage for each player independently
        opponentRows.sort((a, b) => {
          if (b.victories !== a.victories) return b.victories - a.victories
          if (b.defeats !== a.defeats) return b.defeats - a.defeats
          return b.winPercentage - a.winPercentage
        })

        // Generate rows for this player only
        return opponentRows
          .map((row, index) => {
            // Only check previous row if it exists and belongs to the same player
            const prevRow = index > 0 ? opponentRows[index - 1] : null

            // Count matching values only within this player's rows
            const winsCount = opponentRows.filter(
              (r) => r.victories === row.victories
            ).length
            const lossesCount = opponentRows.filter(
              (r) => r.defeats === row.defeats
            ).length
            const gamesPlayedCount = opponentRows.filter(
              (r) => r.gamesPlayedWith === row.gamesPlayedWith
            ).length
            const winPctCount = opponentRows.filter(
              (r) => r.winPercentage === row.winPercentage
            ).length

            // Check if this is the first row of each group within this player's rows
            const isFirstInPlayer = index === 0
            const isFirstInWinsGroup =
              !prevRow || prevRow.victories !== row.victories
            const isFirstInLossesGroup =
              !prevRow || prevRow.defeats !== row.defeats
            const isFirstInGamesPlayedGroup =
              !prevRow || prevRow.gamesPlayedWith !== row.gamesPlayedWith
            const isFirstInWinPctGroup =
              !prevRow || prevRow.winPercentage !== row.winPercentage

            return `
              <tr class="player-group-${
                playerIndex % 2 === 0 ? "even" : "odd"
              }">
                ${
                  isFirstInPlayer
                    ? `<td rowspan="${opponentRows.length}">${row.player}</td>`
                    : ""
                }
                <td>${row.opponent}</td>
                ${
                  isFirstInWinsGroup
                    ? `<td rowspan="${winsCount}">${row.victories}</td>`
                    : ""
                }
                ${
                  isFirstInLossesGroup
                    ? `<td rowspan="${lossesCount}">${row.defeats}</td>`
                    : ""
                }
                ${
                  isFirstInGamesPlayedGroup
                    ? `<td rowspan="${gamesPlayedCount}">${row.gamesPlayedWith}</td>`
                    : ""
                }
                ${
                  isFirstInWinPctGroup
                    ? `<td rowspan="${winPctCount}">${row.winPercentage}%</td>`
                    : ""
                }
              </tr>
            `
          })
          .join("")
      })
      .join("")}
  </tbody>
`
  // Append tables to container
  statsContainer.appendChild(mainTable)
  winLossSection.appendChild(winLossTable)
  statsContainer.appendChild(winLossSection)

  // Show modal
  statsModal.classList.add("visible")
}

function hidePlayerStatsModal() {
  const statsModal = document.getElementById("stats-modal")
  statsModal.classList.remove("visible")
}

function savePlayers() {
  console.log("Starting savePlayers function...")

  const textarea = document.getElementById("players-textarea")

  const playerInput = textarea.value.trim()

  // Split by comma or newline
  const splitPlayers = playerInput.split(/[,\n]/)
  // Trim whitespace
  const trimmedPlayers = splitPlayers.map((name) => name.trim())
  // Filter out empty names
  const filteredPlayers = trimmedPlayers.filter((name) => name !== "")
  // Remove duplicates
  players = [...new Set(filteredPlayers)]

  console.log("Player list:", players)
  // Save to localStorage
  try {
    localStorage.setItem("treasureHuntPlayers", JSON.stringify(players))
    console.log("Players successfully saved to localStorage")
    console.log("---")
  } catch (error) {
    console.error("Error saving players to localStorage:", error)
    alert("Unable to save players. Local storage might be full or disabled.")
    console.log("---")
  }

  resetSessionWins()
  updatePlayerDisplay()
  hidePlayersModal()
  createGameboard()

  const showStatsBtn = document.getElementById("show-stats-btn")
  showStatsBtn.classList.add("visible")
}

// Function to load players from localStorage
function loadSavedPlayers() {
  try {
    // Retrieve players from localStorage
    const savedPlayers = localStorage.getItem("treasureHuntPlayers")

    if (savedPlayers) {
      // Optional: Pre-fill textarea with saved players
      const textarea = document.getElementById("players-textarea")
      if (textarea) {
        textarea.value = JSON.parse(savedPlayers).join(", ")
      }
      // log that saved players loaded
      console.log("Saved players:", textarea.value)

      // updatePlayerDisplay()
    }
  } catch (error) {
    console.error("Error loading players from localStorage:", error)
    // Clear potentially corrupted localStorage data
    localStorage.removeItem("treasureHuntPlayers")
  }
}

function updatePlayerDisplay() {
  console.log("Updating player display...")

  const playerDisplayElement = document.getElementById("player-display")

  playerDisplayElement.innerHTML = ""
  // add flex-basis: 100% so it's on a new line
  playerDisplayElement.style.flexBasis = "100%"

  players.forEach((player, index) => {
    const playerElement = document.createElement("div")
    playerElement.classList.add("player-name")

    if (index === currentPlayerIndex) {
      playerElement.classList.add("active")
      console.log(`Marked ${player} as active player`)
    }

    // Add stats to player display
    const playerStat = playerStats[player] || {}
    const sessionGamesWon = playerStat.sessionGamesWon || 0

    playerElement.innerHTML = `
      ${player}: 
      <span class="player-stats">
        ${sessionGamesWon}
      </span>
    `

    playerDisplayElement.appendChild(playerElement)
  })

  console.log("---")
}

function switchToNextPlayer() {
  console.log("Switching to next player")
  if (players.length > 0) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length

    console.log(`New active player: ${players[currentPlayerIndex]}`)
    console.log("---")

    updatePlayerDisplay()
  } else {
    console.log("No players in the game")
  }
}

// Preload when the page loads
window.addEventListener("load", () => {
  preloadSounds(winSounds)
  preloadSounds(wrongSounds)
})

function setupEventListeners() {
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
      } else createGameboard()
    })
  }

  // Check for initial URL parameters
  const urlParams = getUrlParameters()
  if (urlParams.level && urlParams.unit) {
    const wordSetDropdown = document.getElementById("word-set-dropdown")
    const initialValue = `${urlParams.level}:${urlParams.unit}`

    // Check if the value exists in the dropdown
    const optionExists = Array.from(wordSetDropdown.options).some(
      (option) => option.value === initialValue
    )

    if (optionExists) {
      wordSetDropdown.value = initialValue
    }
  }

  // Update URL parameters when word set changes
  const wordSetDropdown = document.getElementById("word-set-dropdown")
  wordSetDropdown.addEventListener("change", (event) => {
    const [level, unit] = event.target.value.split(":")
    updateUrlParameters(level, unit)
    createGameboard()
  })

  // Max Words Select Event Listener
  const maxWordsSelect = document.getElementById("max-words")
  maxWordsSelect.addEventListener("change", createGameboard)

  // Extra Words Checkbox Event Listener
  const includeExtraWordsCheckbox = document.getElementById(
    "include-extra-words"
  )
  includeExtraWordsCheckbox.addEventListener("change", createGameboard)

  // Stats Buttons Event Listenerers
  const showStatsBtn = document.getElementById("show-stats-btn")
  showStatsBtn.addEventListener("click", showPlayerStatsModal)
  const closeStatsBtn = document.getElementById("close-stats-btn")
  closeStatsBtn.addEventListener("click", hidePlayerStatsModal)

  // Add/Save Player Buttons Event Listeners
  const addPlayersBtn = document.getElementById("add-players-btn")
  const savePlayersBtn = document.getElementById("save-players-btn")
  const cancelPlayersBtn = document.getElementById("cancel-players-btn")
  addPlayersBtn.addEventListener("click", showPlayersModal)
  savePlayersBtn.addEventListener("click", () => {
    const addPlayersBtn = document.getElementById("add-players-btn")
    addPlayersBtn.textContent = "Edit Players"

    savePlayers()
  })
  cancelPlayersBtn.addEventListener("click", hidePlayersModal)

  // Play Again button event listener
  const playAgainBtn = document.getElementById("play-again-btn")
  playAgainBtn.addEventListener("click", () => {
    hideCompletionModal()
    // Reset current game
    createGameboard()
  })

  // Allow clicking outside the modals to close them
  const completionModal = document.getElementById("completion-modal")
  const statsModal = document.getElementById("stats-modal")
  const playersModal = document.getElementById("players-modal")
  completionModal.addEventListener("click", (e) => {
    if (e.target.id === "completion-modal") {
      hideCompletionModal()
    }
  })
  statsModal.addEventListener("click", (e) => {
    if (e.target.id === "stats-modal") {
      hidePlayerStatsModal()
    }
  })
  playersModal.addEventListener("click", (e) => {
    if (e.target.id === "players-modal") {
      hidePlayersModal()
    }
  })

  // Add escape key support to modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Close the modal
      hideCompletionModal()
      hidePlayerStatsModal()
      hidePlayersModal()
      // Reset current game
      createGameboard()
    }
  })
}
// Call this when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners()
  loadSavedPlayers()
  loadPlayerStats()
  setupGridColumnControl() // For Debuging
  populateWordSetDropdown()
  populateMaxWordsDropdown()
  setupSoundMuteControl()
  createGameboard()
})
