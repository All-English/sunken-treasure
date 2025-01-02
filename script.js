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

// Define treasure types with their properties
const TREASURE_TYPES = {
  CHEST: {
    id: "chest",
    points: 50,
    images: ["pics/treasure-chest.svg"],
    placementRatio: 0.1, // Proportion of treasures of this type
  },
  GOLD_BAG: {
    id: "goldBag",
    points: 30,
    images: [
      "pics/gold-bag.png",
      "pics/gold-sack-ripped.png",
      "pics/gold-sack-open.svg",
    ],
    placementRatio: 0.3,
  },
  GEM: {
    id: "gem",
    points: 10,
    images: [
      "pics/gem-blue.png",
      "pics/gem-blue-2.png",
      "pics/gem-green.png",
      "pics/gem-green-2.png",
      "pics/gem-multicolored.png",
      "pics/gem-orange-2.png",
      "pics/gem-orange.png",
      "pics/gem-pink.png",
      "pics/gem-purple.png",
      "pics/gem-purple-2.png",
      "pics/gem-red.png",
      "pics/gem-red-2.png",
      "pics/gem-silver.png",
      "pics/gem-turquise.png",
      "pics/gem-yellow.png",
    ],
    placementRatio: 0.5,
  },
}
const usedTreasureImages = {
  chest: [],
  gem: [],
  goldBag: [],
}

// Calculate player level using a quadratic formula
// Provides quick initial leveling with gradually increasing point requirements
function calculatePlayerLevel(totalPointsAllTime) {
  // New formula: Points = 5n^2 + 35n - 40
  const a = 5 // Coefficient of n^2
  const b = 35 // Coefficient of n
  const c = -40 // Constant term

  const discriminant = Math.sqrt(b * b - 4 * a * (c - totalPointsAllTime))
  const level = Math.floor((-b + discriminant) / (2 * a))
  return level

  // Minimum Points Required for Each Level:
  // Level | Minimum Points | Verification
  // -------------------------------------
  //     1 |             0 | Level 0 → 1
  //     2 |            50 | Level 1 → 2
  //     3 |           110 | Level 2 → 3
  //     4 |           180 | Level 3 → 4
  //     5 |           260 | Level 4 → 5
  //     6 |           350 | Level 5 → 6
  //     7 |           450 | Level 6 → 7
  //     8 |           560 | Level 7 → 8
  //     9 |           680 | Level 8 → 9
  //    10 |           810 | Level 9 → 10
}

function showLevelUpNotification(player, newLevel) {
  // Create notification element
  const notification = document.createElement("div")
  notification.classList.add("level-up-notification")
  notification.innerHTML = `
    <h3>Level Up!</h3>
    <p>${player} is now Level ${newLevel}</p>
  `

  // Add to game container or create a specific notification area
  const gameContainer = document.querySelector(".game-container")
  gameContainer.appendChild(notification)

  // Play a sound effect?

  // Automatically remove notification after a few seconds
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Initialize statistics for a new player
function initializePlayerStats(playerName) {
  return {
    // Track overall points and game performance
    currentGamePoints: 0,
    totalPointsAllTime: 0,
    playerLevel: 1,
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    winPercentage: 0,

    // Track treasures found by type
    treasuresFound: {
      chest: 0,
      goldBag: 0,
      gem: 0,
      total: 0,
    },
    // Track points earned from each treasure type
    pointsPerTreasureType: {
      chest: 0,
      goldBag: 0,
      gem: 0,
    },

    // Track performance against other players
    versusStats: {},

    // Track current game session statistics
    currentSessionStats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalSessionPoints: 0,
      winPercentage: 0,

      treasuresFound: {
        chest: 0,
        goldBag: 0,
        gem: 0,
        total: 0,
      },

      pointsPerTreasureType: {
        chest: 0,
        goldBag: 0,
        gem: 0,
      },
    },
  }
}

// Update player stats when a treasure is found
function updateTreasureStats(player, treasureType, points) {
  if (players.length === 0) {
    return
  }

  const stats = playerStats[player]

  // Increment treasure-specific counters
  stats.treasuresFound[treasureType]++
  stats.treasuresFound.total++
  stats.pointsPerTreasureType[treasureType] += points

  stats.currentSessionStats.treasuresFound[treasureType]++
  stats.currentSessionStats.treasuresFound.total++
  stats.currentSessionStats.pointsPerTreasureType[treasureType] += points

  // Update point totals
  stats.currentGamePoints += points // Current game's points
  stats.totalPointsAllTime += points // All-time accumulated points
  stats.currentSessionStats.totalSessionPoints += points // Points earned in current game session

  const previousLevel = stats.playerLevel

  // Recalculate player level based on total points
  stats.playerLevel = calculatePlayerLevel(stats.totalPointsAllTime)

  // Check if level has increased
  if (stats.playerLevel > previousLevel) {
    // Create and show level up notification
    showLevelUpNotification(player, stats.playerLevel)
    console.log(
      player,
      "leveled up to",
      stats.playerLevel,
      "with",
      stats.totalPointsAllTime,
      "points"
    )
  }
}

// Update player stats at the end of a game
function updatePlayerStats(winningPlayer) {
  if (players.length === 0) {
    return
  }

  players.forEach((player) => {
    const stats = playerStats[player]

    // Increment game play counters
    stats.totalGamesPlayed++
    stats.currentSessionStats.gamesPlayed++

    // Update win statistics if player won
    if (player === winningPlayer) {
      stats.totalGamesWon++
      stats.winPercentage = Math.round(
        (stats.totalGamesWon / stats.totalGamesPlayed) * 100
      )

      stats.currentSessionStats.gamesWon++
      stats.currentSessionStats.winPercentage = Math.round(
        (stats.currentSessionStats.gamesWon /
          stats.currentSessionStats.gamesPlayed) *
          100
      )
    }

    // Track performance against other players
    players.forEach((opponent) => {
      if (opponent !== player) {
        // Initialize versus stats if not exists
        if (!stats.versusStats[opponent]) {
          stats.versusStats[opponent] = {
            gamesPlayed: 0,
            gamesWon: 0,
            winPercentage: 0,
          }
        }

        // Update games played
        stats.versusStats[opponent].gamesPlayed++

        // Update wins if player won
        if (player === winningPlayer) {
          stats.versusStats[opponent].gamesWon++
          stats.versusStats[opponent].winPercentage = Math.round(
            (stats.versusStats[opponent].gamesWon /
              stats.versusStats[opponent].gamesPlayed) *
              100
          )
        }
      }
    })
  })

  // Save updated stats to persistent storage
  savePlayerStats()
}

// Calculate number of treasures based on max words
function calculateTreasureCount(maxWords) {
  const CHEST = 1 // Always 1 chest

  switch (maxWords) {
    case 5: // 3 total
      return {
        CHEST,
        GOLD_BAG: 1,
        GEM: 1,
      }
    case 10: // 4 total
      return {
        CHEST,
        GOLD_BAG: 1,
        GEM: 2,
      }
    case 15: // 5 total
      return {
        CHEST,
        GOLD_BAG: 1,
        GEM: 3,
      }
    case 20: // 6 total
      return {
        CHEST,
        GOLD_BAG: 2,
        GEM: 3,
      }
    case 25: // 7 total
      return {
        CHEST,
        GOLD_BAG: 2,
        GEM: 4,
      }
    case 30: // 8 total
      return {
        CHEST,
        GOLD_BAG: 2,
        GEM: 5,
      }
    case 35: // 9 total
      return {
        CHEST,
        GOLD_BAG: 3,
        GEM: 5,
      }
    case 40: // 10 total
      return {
        CHEST,
        GOLD_BAG: 3,
        GEM: 6,
      }
  }
}

// Create a treasure div
function createTreasureDiv(treasureType, availableCells) {
  // Randomly select a cell for the treasure
  const treasureCellIndex = Math.floor(Math.random() * availableCells.length)
  const treasureCell = availableCells.splice(treasureCellIndex, 1)[0]

  // Create treasure div element
  const treasureDiv = document.createElement("div")
  treasureDiv.id = `treasure-${treasureType.id}-${Math.random()
    .toString(36)
    .substr(2, 9)}`
  treasureDiv.className = "treasure-div"
  treasureDiv.dataset.points = treasureType.points
  treasureDiv.dataset.type = treasureType.id

  // Create and set treasure image
  const treasureImage = document.createElement("img")
  treasureImage.className = "treasure-image"

  // Get unused images
  let unusedImages = treasureType.images.filter(
    (img) => !usedTreasureImages[treasureType.id].includes(img)
  )

  // If all images have been used, reset the tracking array
  if (unusedImages.length === 0) {
    usedTreasureImages[treasureType.id] = []
    unusedImages = treasureType.images
  }

  // Select random image from unused images
  const randomIndex = Math.floor(Math.random() * unusedImages.length)
  const selectedImage = unusedImages[randomIndex]

  // Track the used image
  usedTreasureImages[treasureType.id].push(selectedImage)

  treasureImage.src = selectedImage

  // Set width based on treasure type
  if (treasureImage.src.endsWith("gem-green.png")) {
    treasureImage.style.width = "45%"
  } else if (treasureImage.src.endsWith("gem-green-2.png")) {
    treasureImage.style.width = "40%"
  } else if (treasureImage.src.endsWith("gem-blue.png")) {
    treasureImage.style.width = "40%"
  } else if (treasureImage.src.endsWith("gem-purple.png")) {
    treasureImage.style.width = "45%"
  } else if (treasureImage.src.endsWith("gem-mulitcolored.png")) {
    treasureImage.style.width = "60%"
  } else if (treasureType.id === "gem") {
    treasureImage.style.width = "50%"
  }

  if (treasureImage.src.endsWith("gold-sack-ripped.png")) {
    treasureImage.style.width = "50%"
  } else if (treasureImage.src.endsWith("gold-sack-open.svg")) {
    treasureImage.style.width = "75%"
  } else if (treasureType.id === "goldBag") {
    treasureImage.style.width = "90%"
  }

  if (treasureType.id === "chest") {
    treasureImage.style.width = "90%"
  }

  treasureDiv.appendChild(treasureImage)
  treasureDiv.style.setProperty("--cell", treasureCell)

  // Add treasure to game board
  const gameBoard = document.getElementById("game-board")
  gameBoard.appendChild(treasureDiv)

  return treasureCell
}

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

// Reset session stats when starting a new game with players
function resetSessionStats() {
  players.forEach((player) => {
    if (playerStats[player]) {
      playerStats[player].currentSessionStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        totalSessionPoints: 0,
        winPercentage: 0,

        treasuresFound: {
          chest: 0,
          goldBag: 0,
          gem: 0,
          total: 0,
        },

        pointsPerTreasureType: {
          chest: 0,
          goldBag: 0,
          gem: 0,
        },
      }
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
  for (let i = 5; i <= 40; i += 5) {
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

function handleWordClick(wordCard, currentCell) {
  if (!gameActive || wordCard.classList.contains("clicked")) return
  gameActive = false

  // Keep track of how many cards are left
  cardsRemaining--
  document.getElementById("cards-remaining").textContent =
    cardsRemaining.toString()

  createBubbles(8)

  wordCard.classList.add("clicked")

  // Find the treasure div for this specific cell
  const treasureDiv = document.querySelector(
    `.treasure-div[style*="--cell: ${currentCell}"]`
  )

  // Check if current cell is a treasure cell
  if (treasureDiv) {
    const treasureType = treasureDiv.dataset.type
    const points = parseInt(treasureDiv.dataset.points)

    const currentPlayer = players[currentPlayerIndex] || "You"

    console.log(
      currentPlayer,
      "found a",
      treasureType,
      "worth",
      points,
      "points!"
    )

    // Play sound effect after a delay
    setTimeout(() => {
      playNextSoundInQueue(winSounds)
    }, 700)

    // Reveal treasure
    setTimeout(() => {
      treasureDiv.style.display = "flex"

      // Delay popup creation to sync with treasure appearance
      setTimeout(() => {
        // Create and show points popup
        const popup = document.createElement("div")
        popup.className = "points-popup"
        popup.textContent = `+${points}`

        // Position popup above the treasure
        const treasureRect = treasureDiv.getBoundingClientRect()
        popup.style.left = `${
          treasureRect.left + treasureRect.width / 2 - 50
        }px`
        popup.style.top = `${treasureRect.top - 70}px`

        // Add popup to document
        document.body.appendChild(popup)

        // Remove popup after animation
        setTimeout(() => {
          popup.remove()
        }, 4000)
      }, 500) // Wait for half of treasureAppear animation

      updateTreasureStats(currentPlayer, treasureType, points)

      // Check if all treasures are found
      const remainingTreasures = document.querySelectorAll(
        '.treasure-div:not([style*="display: flex"])'
      )

      if (remainingTreasures.length === 0) {
        console.log("All treasures found!")
        updatePlayerDisplay()
        endGame(currentPlayer)
        gameActive = true
      } else {
        updatePlayerDisplay()
        setTimeout(() => {
          switchToNextPlayer()
          updatePlayerDisplay()
          gameActive = true
        }, 2000)
      }
    }, 300)
  } else {
    // Wrong guess made

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
    updatePlayerDisplay()

    gameActive = true
  }
}

// Determine the winner and end the game
function endGame(currentPlayer) {
  let winner
  if (players.length > 0) {
    // Find player with most points
    winner = players.reduce((maxPointPlayer, currentPlayer) => {
      return playerStats[currentPlayer].currentGamePoints >
        playerStats[maxPointPlayer].currentGamePoints
        ? currentPlayer
        : maxPointPlayer
    })
  }

  // Play a finished sound effect

  // Update all players' stats
  updatePlayerStats(winner)

  // Show completion modal
  setTimeout(() => {
    showCompletionModal(winner)
  }, 2000)
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
  // console.clear()

  const gameBoard = document.getElementById("game-board")

  // Reset player turn to first player
  if (players.length > 0) {
    currentPlayerIndex = 0
    console.log(`First Player is ${players[currentPlayerIndex]}`)

    players.forEach((player) => {
      playerStats[player].currentGamePoints = 0
    })

    updatePlayerDisplay()
  }

  // Reset used images tracking
  Object.keys(usedTreasureImages).forEach((treasureType) => {
    usedTreasureImages[treasureType] = []
  })

  const wordSetDropdown = document.getElementById("word-set-dropdown")
  const [selectedLevel, selectedUnit] = wordSetDropdown.value.split(":")

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

  const treasureCounts = calculateTreasureCount(maxWords)

  // Treasure to Place in the treasureDiv cells
  const treasuresToPlace = [
    { type: TREASURE_TYPES.CHEST, count: treasureCounts.CHEST },
    { type: TREASURE_TYPES.GOLD_BAG, count: treasureCounts.GOLD_BAG },
    { type: TREASURE_TYPES.GEM, count: treasureCounts.GEM },
  ]

  // Track total treasures placed
  let totalTreasuresPlaced = 0

  // Create the treasure Divs
  treasuresToPlace.forEach((treasureConfig) => {
    for (let i = 0; i < treasureConfig.count; i++) {
      // Stop if we've reached max treasures or no available cells
      if (availableCells.length === 0) break

      const treasureCell = createTreasureDiv(
        treasureConfig.type,
        availableCells
      )

      addUnavailableCells(
        treasureCell,
        unavailableCells,
        availableCells,
        gridColumns,
        gridRows
      )

      totalTreasuresPlaced++
    }
  })

  // First, assign a word to each treasure cell
  const treasureCells = document.querySelectorAll(".treasure-div")

  treasureCells.forEach((treasureDiv) => {
    const treasureCell = parseInt(treasureDiv.style.getPropertyValue("--cell"))

    // Find a word to place on this treasure cell
    const wordIndex = Math.floor(Math.random() * selectedWordSet.length)
    const word = selectedWordSet.splice(wordIndex, 1)[0]

    const wordCard = document.createElement("div")
    wordCard.className = "word-card"
    wordCard.textContent = word

    // Position in grid
    wordCard.style.setProperty("--cell", treasureCell)

    wordCard.addEventListener("click", () =>
      handleWordClick(wordCard, treasureCell)
    )
    gameBoard.appendChild(wordCard)
  })

  // Next, place remaining words in available cells
  selectedWordSet.forEach((word, index) => {
    // If no available cells, log and skip
    if (availableCells.length === 0) {
      // console.log(`No more available cells. Skipping word: ${word}`)
      return
    }

    // Randomly select from remaining available cells
    const cellIndex = Math.floor(Math.random() * availableCells.length)
    const cell = availableCells.splice(cellIndex, 1)[0]

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

    wordCard.addEventListener("click", () => handleWordClick(wordCard, cell))
    gameBoard.appendChild(wordCard)
  })

  // used for debugging - After creating word cards, update the count (for debug)
  const wordCards = document.querySelectorAll(".word-card")

  updateWordCardCount(wordCards.length)
  console.log("Word Cards Created:", wordCards.length)

  cardsRemaining = wordCards.length
  document.getElementById("cards-remaining").textContent = cardsRemaining

  // Create bubbles
  createBubbles(25)
}

function createPlayerStatsTables(playersList) {
  const container = document.createElement("div")

  // Create main stats table
  const mainTable = document.createElement("table")
  mainTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Level</th>
        <th>Total Points</th>
        <th>Games Won</th>
        <th>Games Played</th>
        <th>Win %</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, index) => {
          const stat = playerStats[player]
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.playerLevel || 1}</td>
            <td>${stat.totalPointsAllTime || 0}</td>
            <td>${stat.totalGamesWon || 0}</td>
            <td>${stat.totalGamesPlayed || 0}</td>
            <td>${stat.winPercentage || 0}%</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `

  // Create treasure stats section
  const treasureSection = document.createElement("div")
  treasureSection.innerHTML = "<h3>Treasure Stats</h3>"

  const treasureTable = document.createElement("table")
  treasureTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Chests Found</th>
        <th>Gold Bags Found</th>
        <th>Gems Found</th>
        <th>Total Treasures</th>
        <th>Points from Chests</th>
        <th>Points from Gold</th>
        <th>Points from Gems</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, index) => {
          const stat = playerStats[player]
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.treasuresFound.chest || 0}</td>
            <td>${stat.treasuresFound.goldBag || 0}</td>
            <td>${stat.treasuresFound.gem || 0}</td>
            <td>${stat.treasuresFound.total || 0}</td>
            <td>${stat.pointsPerTreasureType.chest || 0}</td>
            <td>${stat.pointsPerTreasureType.goldBag || 0}</td>
            <td>${stat.pointsPerTreasureType.gem || 0}</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `

  container.appendChild(mainTable)
  treasureSection.appendChild(treasureTable)
  container.appendChild(treasureSection)

  return container
}

function createSessionStatsTables(playersList) {
  const container = document.createElement("div")

  // Create session stats table
  const sessionMainTable = document.createElement("table")
  sessionMainTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Game Points</th>
        <th>Session Points</th>
        <th>Games Won</th>
        <th>Games Played</th>
        <th>Win %</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, index) => {
          const stat = playerStats[player]
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.currentGamePoints || 0}</td>
            <td>${stat.currentSessionStats.totalSessionPoints || 0}</td>
            <td>${stat.currentSessionStats.gamesWon || 0}</td>
            <td>${stat.currentSessionStats.gamesPlayed || 0}</td>
            <td>${stat.currentSessionStats.winPercentage || 0}%</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `
  // Create treasure stats section
  const treasureSection = document.createElement("div")
  treasureSection.innerHTML = "<h3>Treasure Stats</h3>"

  const treasureTable = document.createElement("table")
  treasureTable.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Chests Found</th>
        <th>Gold Bags Found</th>
        <th>Gems Found</th>
        <th>Total Treasures</th>
        <th>Points from Chests</th>
        <th>Points from Gold</th>
        <th>Points from Gems</th>
      </tr>
    </thead>
    <tbody>
      ${playersList
        .map((player, index) => {
          const stat = playerStats[player].currentSessionStats
          return `
          <tr class="player-group-${index % 2 === 0 ? "even" : "odd"}">
            <td>${player}</td>
            <td>${stat.treasuresFound.chest || 0}</td>
            <td>${stat.treasuresFound.goldBag || 0}</td>
            <td>${stat.treasuresFound.gem || 0}</td>
            <td>${stat.treasuresFound.total || 0}</td>
            <td>${stat.pointsPerTreasureType.chest || 0}</td>
            <td>${stat.pointsPerTreasureType.goldBag || 0}</td>
            <td>${stat.pointsPerTreasureType.gem || 0}</td>
          </tr>
        `
        })
        .join("")}
    </tbody>
  `

  container.appendChild(sessionMainTable)
  treasureSection.appendChild(treasureTable)
  container.appendChild(treasureSection)

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
    winnerNameSpan.textContent = `${winner} is the winner!`

    // Clear existing stats
    completionModalStats.innerHTML = ""

    // Get all players from playerStats and sort by total points
    const sortedPlayers = [...players].sort(
      (a, b) =>
        (playerStats[b].currentSessionStats.totalSessionPoints || 0) -
        (playerStats[a].currentSessionStats.totalSessionPoints || 0)
    )

    // Show session stats for current players
    const statsTables = createSessionStatsTables(sortedPlayers)
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

  // Get all players from playerStats and sort by total points
  const allPlayers = Object.keys(playerStats).sort(
    (a, b) =>
      (playerStats[b].totalPointsAllTime || 0) -
      (playerStats[a].totalPointsAllTime || 0)
  )

  const statsTables = createPlayerStatsTables(allPlayers)
  statsContainer.appendChild(statsTables)

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
    const playerData = {
      players: players,
      timestamp: Date.now(),
    }
    localStorage.setItem("treasureHuntPlayerData", JSON.stringify(playerData))

    // localStorage.setItem("treasureHuntPlayers", JSON.stringify(players))
    console.log("Players successfully saved to localStorage")
    console.log("---")
  } catch (error) {
    console.error("Error saving players to localStorage:", error)
    alert("Unable to save players. Local storage might be full or disabled.")
    console.log("---")
  }

  // Ensure stats are initialized for each player
  players.forEach((player) => {
    if (!playerStats[player]) {
      console.log("Initializing player stats for", player)
      playerStats[player] = initializePlayerStats(player)
    }
  })

  resetSessionStats()
  hidePlayersModal()
  createGameboard()
  updatePlayerDisplay()

  // const showStatsBtn = document.getElementById("leaderboard-btn")
  // showStatsBtn.classList.add("visible")
}

// Function to load players from localStorage
function loadSavedPlayers() {
  // Get stored data
  const storedData = localStorage.getItem("treasureHuntPlayerData")
  if (!storedData) return null

  const playerData = JSON.parse(storedData)
  const currentTime = Date.now()

  // 30 minutes in milliseconds = 30 * 60 * 1000
  const CLASS_DURATION = 30 * 60 * 1000

  // Check if data is still valid (within time window)
  if (currentTime - playerData.timestamp < CLASS_DURATION) {
    players = playerData.players

    // Initialize any missing stats
    players.forEach((player) => {
      if (!playerStats[player]) {
        console.log("Initializing player stats for", player)
        playerStats[player] = initializePlayerStats(player)
      }
    })
    console.log("Loaded saved players within 30 minutes")
    updatePlayerDisplay()
  } else {
    console.log("Saved player data has expired")
  }

  if (playerData.players) {
    // Pre-fill textarea with saved players
    const textarea = document.getElementById("players-textarea")
    if (textarea) {
      textarea.value = playerData.players.join(", ")

      // log that saved players loaded
      console.log("Saved players:", textarea.value)
    }
  }
}

function updatePlayerDisplay() {
  if (players.length === 0) {
    return
  }
  const playerDisplayElement = document.getElementById("player-display")
  // add flex-basis: 100% so it's on a new line
  playerDisplayElement.style.flexBasis = "100%"

  // Check if players have changed by comparing current elements with players array
  const currentPlayerElements = Array.from(playerDisplayElement.children)
  const playersHaveChanged =
    currentPlayerElements.length !== players.length ||
    currentPlayerElements.some(
      (element) => !players.includes(element.dataset.player)
    )

  // First time creation of player elements if they don't exist or if players have changed
  if (playerDisplayElement.children.length === 0 || playersHaveChanged) {
    // Clear existing elements if players have changed
    playerDisplayElement.innerHTML = ""
    players.forEach((player, index) => {
      const playerElement = document.createElement("div")
      playerElement.classList.add("player-info")
      playerElement.dataset.player = player

      playerElement.innerHTML = `
        <span class="player-name">${player}</span>
        <span class="player-bullet">•</span>
        <span class="player-score"></span>
        <span class="player-bullet">•</span>
        <span class="player-level"></span>
      `

      playerDisplayElement.appendChild(playerElement)
    })
  }

  // Update existing elements
  players.forEach((player, index) => {
    const playerElement = playerDisplayElement.querySelector(
      `[data-player="${player}"]`
    )
    if (playerElement) {
      const playerStat = playerStats[player]
      const currentGamePoints = playerStat.currentGamePoints
      const playerLevel = playerStat.playerLevel

      // Update stats
      playerElement.querySelector(
        ".player-level"
      ).textContent = `Lvl ${playerLevel}`
      playerElement.querySelector(
        ".player-score"
      ).textContent = `${currentGamePoints} pts`

      // Update active state
      if (index === currentPlayerIndex) {
        playerElement.classList.add("active")
      } else {
        playerElement.classList.remove("active")
      }
    }
  })
}

function switchToNextPlayer() {
  if (players.length === 0) {
    return
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length
  console.log(`Switching to next player: ${players[currentPlayerIndex]}`)
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

  // Update URL parameters when word set changes
  const wordSetDropdown = document.getElementById("word-set-dropdown")
  wordSetDropdown.addEventListener("change", (event) => {
    const [level, unit] = event.target.value.split(":")
    updateUrlParameters(level, unit)
    createGameboard()
    updatePlayerDisplay()
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
  const showStatsBtn = document.getElementById("leaderboard-btn")
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
    updatePlayerDisplay()
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
  setupGridColumnControl() // For Debuging
  loadPlayerStats()
  loadSavedPlayers()
  populateMaxWordsDropdown()
  populateWordSetDropdown()
  setupSoundMuteControl()
  createGameboard()
})
