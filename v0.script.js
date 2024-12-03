const wordContainer = document.getElementById("word-container")
const restartButton = document.getElementById("restart-button")
const clickSound = document.getElementById("click-sound")
const winSound = document.getElementById("win-sound")

const words = [
  "Seashell",
  "Wave",
  "Coral",
  "Dolphin",
  "Anchor",
  "Lighthouse",
  "Jellyfish",
  "Seagull",
  "Starfish",
  "Octopus",
]
let treasureIndex

function createBubble() {
  const bubble = document.createElement("div")
  bubble.classList.add("bubble")
  bubble.style.left = `${Math.random() * 100}vw`
  bubble.style.width = `${Math.random() * 20 + 10}px`
  bubble.style.height = bubble.style.width
  bubble.style.animationDuration = `${Math.random() * 2 + 2}s`
  document.body.appendChild(bubble)

  bubble.addEventListener("animationend", () => {
    bubble.remove()
  })
}

setInterval(createBubble, 300)

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function startGame() {
  wordContainer.innerHTML = ""
  restartButton.style.display = "none"

  const shuffledWords = shuffleArray([...words])
  treasureIndex = Math.floor(Math.random() * shuffledWords.length)

  shuffledWords.forEach((word, index) => {
    const wordElement = document.createElement("div")
    wordElement.classList.add("word")
    wordElement.textContent = word

    const treasureElement = document.createElement("span")
    treasureElement.classList.add("treasure")
    treasureElement.textContent = "🏴‍☠️"
    wordElement.appendChild(treasureElement)

    wordElement.addEventListener("click", () =>
      handleWordClick(wordElement, index)
    )
    wordContainer.appendChild(wordElement)
  })
}

function handleWordClick(wordElement, index) {
  if (!wordElement.classList.contains("clicked")) {
    clickSound.currentTime = 0
    clickSound.play()
    wordElement.classList.add("clicked")

    if (index === treasureIndex) {
      setTimeout(() => {
        winSound.play()
        alert("Congratulations! You found the treasure!")
        restartButton.style.display = "inline-block"
      }, 1000)
    }
  }
}

restartButton.addEventListener("click", startGame)

startGame()
