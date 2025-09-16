console.log("script is on")
//variables
const wordsLength = words.length
const gameDuration = 60
window.gameStart = null
window.timer = null
window.pauseTime = 0
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

//new class function that preventing duplicates
const createClass = (element, name) => {
  if (!element) {
    return
  } // do nothing if the element is null
  const classes = (element.className || "").split(/\s+/).filter(Boolean) // split the element current className string into an array of class names
  if (!classes.includes(name)) {
    classes.push(name)
  }
  element.className = classes.join(" ")
}

//delete class function that preventing duplicates
const deleteClass = (element, name) => {
  if (!element) {
    return
  } // do nothing if the element is null
  const classes = (element.className || "").split(/\s+/).filter(Boolean) // split the element current className string into an array of class names
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

  for (let i = 0; i < 50; i++) {
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

  console.log(press, expectedLetter)

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
        press === expectedLetter ? "correct" : "incorrect" //is the letter correct or not?
      )
      deleteClass(latestLetter, "latest")

      if (latestLetter.nextSibling) {
        // move to next letter in the same word
        createClass(latestLetter.nextSibling, "latest")
      }
    } else {
      if (!latestWord) {
        return
      }
      const prevLatest = latestWord.querySelector(".letter.latest")
      if (prevLatest) {
        deleteClass(prevLatest, "latest")
      }

      let extraWrap = latestWord.querySelector(".extraLetters")
      if (!extraWrap) {
        extraWrap = document.createElement("span")
        extraWrap.className = "extraLetters"
        latestWord.appendChild(extraWrap)
      }

      const extraLetter = document.createElement("span")
      extraLetter.innerHTML = press
      extraLetter.className = "letter incorrect extra"
      const anyLatest = document.querySelector(".letter.latest")
      if (anyLatest) {
        deleteClass(anyLatest, "latest")
      }
      createClass(extraLetter, "latest")

      extraWrap.appendChild(extraLetter)
    }
  }

  //  space input
  if (spaceCheck) {
    if (!latestWord) {
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

    if (expectedLetter !== " ") {
      // mark only the remaining letters (from latest onward) as incorrect
      const wordToValidate = latestWord
      let mark = false
      wordToValidate.querySelectorAll(".letter") = () => {
        if (letter === latestLetter) mark = true
        if (mark && !letter.classList.contains("correct")) {
          createClass(letter, "incorrect")
        }
      }

      // move to the next word
      deleteClass(latestWord, "latest")
      createClass(latestWord.nextSibling, "latest")
      if (latestLetter) {
        deleteClass(latestLetter, "latest")
      }
      createClass(latestWord.nextSibling.firstChild, "latest")
    }

    // remove "latest" from the validated word and its latest letter
    deleteClass(wordToValidate, "latest")
    const currentLatestLetter = wordToValidate.querySelector(".letter.latest")
    if (currentLatestLetter) {
      deleteClass(currentLatestLetter, "latest")
    }

    // remove any extra letters for the word being left if the player added extra letters which are supposed to be incorrect
    const extras = wordToValidate.querySelector(".extraLetters")
    if (extras) {
      extras.remove()
    }
    let next = null
    if (wordToValidate === latestWord) {
      next = latestWord.nextSibling
    } else {
      next = latestWord
    }

    // make sure next word exists. if not, append one and check and display it as incorrect
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

    const extraWrap = latestWord.querySelector(".extraLetters")
    if (extraWrap && extraWrap.lastChild) {
      const toRemove = extraWrap.lastChild
      const wasLatest = toRemove.className.includes("latest")
      extraWrap.removeChild(toRemove)
      if (!extraWrap.hasChildNodes()) {
        extraWrap.remove()
      }

      if (wasLatest) {
        const newExtraLast = latestWord.querySelector(
          ".extraLetters:last-child .letter:last-child"
        )
        if (newExtraLast) {
          createClass(newExtraLast, "latest")
        } else {
          const lastReal = latestWord.lastChild
          if (lastReal) {
            createClass(lastReal, "latest")
          }
        }
      }
    } else if (latestLetter && firstLetterCheck) {
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
      // move back one letter in same word
      deleteClass(latestLetter, "latest")
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
