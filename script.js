console.log("script is on")
//variables
const wordsLength = words.length
console.log(words)
const gameDuration = 60 * 1000 //60 milliseconds * 1000 = 60 seconds

//generate random words and their random index, -1 because the location/index always starts at 0
const randomWord = () => {
  const randIndex = Math.ceil(Math.random() * wordsLength)
  return words[randIndex - 1]
}

//inject the randomly generated word to the html and slice them into individual letters with no spaces between them
const displayWord = (word) => {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`
}
console.log(randomWord())
console.log(displayWord())
