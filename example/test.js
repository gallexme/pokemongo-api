// use script: npm run compile
// you can use compiled dist in your own project

// es6 use
// import PokeAPI from 'pokemongo-api'
//
// es5 use
// var PokeAPI = require('pokemongo-api')

// test dist
import PokeAPI from '../dist'
const Poke = new PokeAPI()
console.log(Poke)
