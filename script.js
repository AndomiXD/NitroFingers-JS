//global variables
const wordsLength = words.length
const gameDuration = 60
window.gameStart = null
window.timer = null
const lettersRegex = /^[A-Za-z]$/

//generate random words and their random index
const randomWord = () => {
  const randomIndex = Math.ceil(Math.random() * wordsLength)
  return words[randomIndex - 1].toLowerCase()
}

//inject the randomly generated word to the html and slice them into individual letters
const displayWord = (word) => {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`
}

//new class function that prevents duplicates
const createClass = (element, name) => {
  if (!element) {
    return
  } // do nothing if the element is null
  const classes = (element.className || "").split(/\s+/) // split the element current className string into an array of class names

  if (!classes.includes(name)) {
    classes.push(name)
  }
  element.className = classes.join(" ")
}

//delete class function that prevents duplicates
const deleteClass = (element, name) => {
  if (!element) {
    return
  }
  const classes = (element.className || "").split(/\s+/) // split the element current className string into an array of class names

  element.className = classes.filter((c) => c !== name).join(" ")
}

//correct letters counter
const correctLetters = () => {
  const lastWord = document.querySelector(".word.latest") //retrieve the last current word
  if (!lastWord) {
    //if it is NOT the last word, don't add it
    return 0
  }

  const letters = [...document.querySelectorAll(".letter.correct")]
  let count = 0
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] !== 0 && letters[i] !== " ") {
      count++
    }
  }
  return count
}

//incorrect letters counter
const incorrectLetters = () => {
  const lastWord = document.querySelector(".word.latest") //retrieve the last current word
  if (!lastWord) {
    //if it is NOT the last word, don't add it
    return 0
  }

  const letters = [...document.querySelectorAll(".letter.incorrect")]
  let count = 0
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] !== 0 && letters[i] !== " ") {
      count++
    }
  }
  return count
}

//words per minute counter
const wordsPerMinute = () => {
  const getwords = [...document.querySelectorAll(".word")]
  const lastWord = document.querySelector(".word.latest")

  if (!lastWord) {
    //if it is NOT the last word, don't add it
    return 0
  }

  const lastWordindex = getwords.indexOf(lastWord + 1)
  const typedWords = getwords.slice(0, lastWordindex)
  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children]
    for (let i = 0; i < letters.length; i++) {
      if (letters[i].classList.contains("correct")) {
        return true
      } else {
        return false
      }
    }
  })

  return (correctWords.length / gameDuration) * 100
}

//end game when timer runs out
const gameOver = () => {
  clearInterval(window.timer)
  createClass(document.getElementById("game"), "over")
  const correctCount = correctLetters()
  const incorrectCount = incorrectLetters()
  const WPM = wordsPerMinute().toFixed(0)
  document.getElementById(
    "duration"
  ).innerHTML = `Game Over. <br \> Correct letters: ${correctCount} <br \> Inorrect letters: ${incorrectCount} <br \> Words per Minute (WPM): ${WPM}`
}

//initialise a new game by adding the randomly generated words to the HTML
const newGame = () => {
  const wordsEl = document.getElementById("words")
  wordsEl.innerHTML = "" //clear all words

  deleteClass(document.getElementById("game"), "over")

  for (let i = 0; i < 75; i++) {
    wordsEl.innerHTML += displayWord(randomWord())
  }
  const firstWord = document.querySelector(".word")
  if (firstWord) {
    createClass(firstWord, "latest")
  }
  const firstLetter = document.querySelector(".letter")
  if (firstLetter) {
    createClass(firstLetter, "latest")
  }

  document.getElementById("duration").innerHTML = "Timer: " + gameDuration + "s"
  window.timer = null
  window.gameStart = null
}

document.getElementById("game").addEventListener("keydown", (event) => {
  const press = event.key
  let latestLetter = document.querySelector(".letter.latest")
  let latestWord = document.querySelector(".word.latest")
  const expectedLetter = latestLetter?.innerHTML || " "
  const letterCheck = press.length === 1 && press !== " "
  const spaceCheck = press === " "
  const backspaceCheck = press === "Backspace"
  const firstLetterCheck = latestLetter === latestWord?.firstChild

  if (document.querySelector("#game.over")) {
    return
  }

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

  // do nothing if it's literally nothing
  if (!latestWord && !spaceCheck && !backspaceCheck) {
    return
  }

  //letter check
  if (letterCheck && lettersRegex.test(press)) {
    if (latestLetter) {
      createClass(
        latestLetter,
        press === expectedLetter ? "correct" : "incorrect" //is the letter correct or not? basically where the magic happens
      )
      deleteClass(latestLetter, "latest")

      if (latestLetter.nextSibling) {
        // move to next letter in the same word
        createClass(latestLetter.nextSibling, "latest")
      }
    }
  }

  // space input
  if (spaceCheck) {
    if (!latestWord) {
      return
    }

    //MAKE SURE THE PLAYER INPUTS A LETTER, NOT A SPACE IN THE MIDDLE OF A WORD!!!
    if (expectedLetter !== " ") {
      return
    }

    let wordToValidate = latestWord
    if (
      latestLetter &&
      latestWord &&
      latestWord.firstChild &&
      latestLetter === latestWord.firstChild &&
      latestWord.previousSibling
    ) {
      wordToValidate = latestWord.previousSibling
    }

    // remove "latest" from the validated word and its latest letter
    deleteClass(wordToValidate, "latest")
    const currentLatestLetter = wordToValidate.querySelector(".letter.latest")
    if (currentLatestLetter) {
      deleteClass(currentLatestLetter, "latest")
    }

    let next = null
    if (wordToValidate === latestWord) {
      next = latestWord.nextSibling
    } else {
      next = latestWord
    }

    // make sure next word exists. if not, append one and display it (that's if the player reaches the end)
    if (!next) {
      const temp = document.createElement("div")
      temp.innerHTML = displayWord(randomWord())
      next = temp.firstChild
      document.getElementById("words").appendChild(next)
    }

    // make next the latest word and set its first letter as latest
    createClass(next, "latest")
    if (next.firstChild) {
      createClass(next.firstChild, "latest")
    }
  }

  // backspace input
  if (backspaceCheck) {
    if (!latestWord) {
      return
    }

    if (latestLetter && firstLetterCheck) {
      if (latestWord.previousSibling) {
        deleteClass(latestWord, "latest")
        createClass(latestWord.previousSibling, "latest")
        deleteClass(latestLetter, "latest")
        const prevLast = latestWord.previousSibling.lastChild
        if (prevLast) {
          createClass(prevLast, "latest")
          deleteClass(prevLast, "incorrect")
          deleteClass(prevLast, "correct")
        }
      }
      // if no previousSibling and we are at the very start, do NOTHING
    } else if (latestLetter && !firstLetterCheck) {
      deleteClass(latestLetter, "latest")
      // move back one letter in same word
      if (latestLetter.previousSibling) {
        createClass(latestLetter.previousSibling, "latest")
        deleteClass(latestLetter.previousSibling, "incorrect")
        deleteClass(latestLetter.previousSibling, "correct")
      }
    } else if (!latestLetter) {
      const last = latestWord.lastChild
      if (last) {
        createClass(last, "latest")
        deleteClass(last, "incorrect")
        deleteClass(last, "correct")
      }
    }
  }
})

document.getElementById("newGameButton").addEventListener("click", () => {
  gameOver()
  newGame()
})

newGame()
