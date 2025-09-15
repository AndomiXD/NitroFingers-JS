//-----------------------------------------------------
console.log("script is on")
//variables
const wordsLength = words.length
const gameDuration = 60 * 1000 //60 milliseconds * 1000 = 60 seconds
window.gameStart = null
window.timer = null
window.pauseTime = 0

//generate random words and their random index, -1 because the location/index always starts at 0
const randomWord = () => {
  const randomIndex = Math.ceil(Math.random() * wordsLength)
  return words[randomIndex - 1]
}

//inject the randomly generated word to the html and slice them into individual letters with no spaces between them
const displayWord = (word) => {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`
}

//new class creating function
const createClass = (element, name) => {
  element.className = element.className + " " + name
}

//delete class creating function
const deleteClass = (element, name) => {
  element.className = element.className.replace(name, "")
}

//end game when timer runs our
const gameOver = () => {
  createClass(document.getElementById("game"), "over")
}

//initialise a new game by adding the randomly generated words to the HTML
const newGame = () => {
  document.getElementById("words").innerHTML = "" //clear all words
  for (let i = 0; i < 100; i++) {
    // number of words to be displayed is controlled by i < n
    document.getElementById("words").innerHTML += displayWord(randomWord())
  }
  createClass(document.querySelector(".word"), "latest")
  createClass(document.querySelector(".letter"), "latest")
  document.getElementById("duration").innerHTML =
    "Timer: " + gameDuration / 1000 + "s"
}

document.getElementById("game").addEventListener("keydown", (event) => {
  const press = event.key
  const latestLetter = document.querySelector(".letter.latest")
  const expectedLetter = latestLetter.innerHTML

  console.log({ press, expectedLetter })
})

document.getElementById("newGameButton").addEventListener("click", () => {
  newGame()
})

newGame()
