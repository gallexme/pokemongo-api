# pokemongo-api  
[![npm version](https://badge.fury.io/js/pokemongo-api.svg)](https://badge.fury.io/js/pokemongo-api)
[![Join the chat at https://gitter.im/gallexme/pokemongo-api](https://badges.gitter.im/gallexme/pokemongo-api.svg)](https://gitter.im/gallexme/pokemongo-api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Pokemon Go API for nodejs

Query the Pokemon database for what you want..
This library covers all functions available in the api through `Call()`
We are also working on porting all calls into functions,


## Install
```
npm i -S pokemongo-api
```

## Example
See /example folder for more complex examples

```js
const Poke = new PokeAPI()

Poke.player.location = {
  latitude: parseFloat(lat),
  longitude: parseFloat(lng)
}

const api = await Poke.login(username, password, provider)

let player = await Poke.GetPlayer()
let inventory = await Poke.GetInventory()
let {items} = inventory

while( true ) {
  let objects = await Poke.GetMapObjects()

  // catchable pokemons from here?
  for (let pokemon of objects.catchable_pokemons) {
    await pokemon.encounter()
    await pokemon.catch()
  }

  // Gym's (are sorted by distance)
  for (let gym of objects.forts.gyms) {
    // We have a gym
    if (gym.withinRange) {
      // Do something with the gym
    }
  }

  // Checkpoint's (aka: pokestop) (are sorted by distance)
  for (let checkpoint of objects.forts.checkpoints) {
    if (!checkpoint.cooldown && checkpoint.withinRange) {
      // Collect pokestop rewards
      let res = await checkpoint.search()
    }
  }

  //just walk a little (1 - 15 meters..)
  await Poke.player.walkAround()
  await new Promise(resolve => setTimeout(resolve, 3000))
}

```


## Player Object
```
{
  accessToken
  username
  password
  debug
  latitude
  longitude
  altitude
  provider
  experience
  prev_level_xp
  next_level_xp
  km_walked
  pokemons_encountered
  unique_pokedex_entries
  pokemons_captured
  evolutions
  poke_stop_visits
  pokeballs_thrown
  eggs_hatched
  big_magikarp_caught
  battle_attack_won
  battle_attack_total
  battle_defended_won
  battle_training_won
  battle_training_total
  prestige_raised_total
  prestige_dropped_total
  pokemon_deployed
  small_rattata_caught
}
```
#### Available functions
```
player.provider()
player.profileDetails()
player.location()
player.location()
player.profile()
player.createdDate()
player.pokeStorage()
player.itemsStorage()
player.currency()
player.Login()
player.walkAround()
player.walkToPoint()
player.hatchedEggs()
player.levelUpRewards()
player.checkAwardBadges()
player.collectDailyBonus()
player.collectDailyBonus()
player.settings()
player.itemTemplates()
player.remoteConfigVersion()
```

## Available functions (more to come)

## Pokemon object
```
{
  id
  pokemon_id
  cp
  stamina
  stamina_max
  move_1
  move_2
  deployed_fort_id
  owner_name
  is_egg
  egg_km_walked_target
  egg_km_walked_start
  origin
  height_m
  weight_kg
  individual_attack
  individual_defense
  individual_stamina
  cp_multiplier
  pokeball
  captured_cell_id
  battles_attacked
  battles_defended
  egg_incubator_id
  creation_time_ms
  num_upgrades
  additional_cp_multiplier
  favorite
  nickname
  from_fort
}
```
#### Available functions
```
pokemon.encounter()
pokemon.catch()
pokemon.encounterAndCatch()
pokemon.release()
pokemon.envolve()
pokemon.upgrade()
pokemon.setFavorite()
pokemon.nickname()
```

## Fort object (Checkpoint and Gym)
```
{
  fort_id
  team_color
  pokemon_data
  name
  image_urls
  fp
  stamina
  max_stamina
  type
  latitude
  longitude
  description
  modifiers
}
```
#### Available functions
```
fort.isCheckpoint
fort.isGym
gym.isSameTeam()
gym.isNeutral()
gym.points()
gym.isInBattle()
gym.guardPokemon()
gym.details()
gym.recallPokemon()
gym.deployPokemon()
gym.startBattle()
gym.attack()
gym.instaWinBattle()
checkpoint.details()
checkpoint.search()
```
