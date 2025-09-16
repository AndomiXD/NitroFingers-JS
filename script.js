//-----------------------------------------------------
console.log("script is on")
//variables
const wordsLength = words.length
const gameDuration = 5
window.gameStart = null
window.timer = null
window.pauseTime = 0
const lettersRegex = /^[A-Za-z]$/

//generate random words and their random index
const randomWord = () => {
  const randomIndex = Math.ceil(Math.random() * wordsLength)
  return words[randomIndex - 1]
}

//inject the randomly generated word to the html and slice them into individual letters
const displayWord = (word) => {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`
}

//new class creating function (safe)
const createClass = (element, name) => {
  if (!element) return
  const classes = (element.className || "").split(/\s+/).filter(Boolean)
  if (!classes.includes(name)) classes.push(name)
  element.className = classes.join(" ")
}

//delete class creating function (safe)
const deleteClass = (element, name) => {
  if (!element) return
  const classes = (element.className || "").split(/\s+/).filter(Boolean)
  element.className = classes.filter((c) => c !== name).join(" ")
}

//end game when timer runs out
const gameOver = () => {
  clearInterval(window.timer)
  createClass(document.getElementById("game"), "over")
  document.getElementById("duration").innerHTML = "Game Over"
}

//initialise a new game by adding the randomly generated words to the HTML
const newGame = () => {
  const wordsEl = document.getElementById("words")
  wordsEl.style.marginTop = "0px" // reset scrolling
  wordsEl.innerHTML = "" //clear all words

  deleteClass(document.getElementById("game"), "over")

  for (let i = 0; i < 100; i++) {
    wordsEl.innerHTML += displayWord(randomWord())
  }
  const firstWord = document.querySelector(".word")
  if (firstWord) createClass(firstWord, "latest")
  const firstLetter = document.querySelector(".letter")
  if (firstLetter) createClass(firstLetter, "latest")

  document.getElementById("duration").innerHTML = "Timer: " + gameDuration + "s"
  window.timer = null
  window.gameStart = null
}

document.getElementById("game").addEventListener("keyup", (event) => {
  const press = event.key
  let latestLetter = document.querySelector(".letter.latest")
  let latestWord = document.querySelector(".word.latest")
  const expectedLetter = latestLetter?.innerHTML || " "
  const letterCheck = press.length === 1 && press !== " "
  const spaceCheck = press === " "
  const backspaceCheck = press === "Backspace"
  const isFirstLetter = latestLetter === latestWord?.firstChild

  if (document.querySelector("#game.over")) {
    return
  }

  console.log({ press, expectedLetter })

  // start timer on first letter type
  if (!window.timer && letterCheck && lettersRegex.test(press)) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = new Date().getTime()
      }
      const currentTime = new Date().getTime()
      const timePassed = currentTime - window.gameStart
      // gameDuration is seconds, timePassed is in milliseconds which means divide by 1000
      const timeLeft = Math.round(gameDuration - timePassed / 1000)
      if (timeLeft <= 0) {
        gameOver()
        return
      }
      document.getElementById("duration").innerHTML = "Timer: " + timeLeft + "s"
    }, 1000)
  }

  if (!latestWord && !spaceCheck && !backspaceCheck) return

  //letter check
  if (letterCheck) {
    if (latestLetter) {
      createClass(
        latestLetter,
        press === expectedLetter ? "correct" : "incorrect" //is the letter correct or not?
      )
      deleteClass(latestLetter, "latest")

      if (latestLetter.nextSibling) {
        // move to next letter in the same word
        createClass(latestLetter.nextSibling, "latest")
      }
    }
  }
  //----------
})

document.getElementById("newGameButton").addEventListener("click", () => {
  gameOver()
  newGame()
})

newGame()
