import Pokemon from '~/Pokemon'
import Item from '~/Item'
import _ from 'lodash'
import Protobuf from 'protobufjs'
import path from 'path'
import POGOProtos from 'node-pogo-protos'

class useOnEncounter extends Item {
  constructor(id){ super(id) }

  /**
   * [useOn description]
   * @param  {[type]} pokemon [description]
   * @return {[type]}         [description]
   */
  async useOn(pokemon){
    if(!pokemon.isCatching)
      throw new Error('That pokemon already have max HP')
  }
}

class useOnWounded extends Item {
  constructor(id){ super(id) }

  /**
   * [useOn description]
   * @param  {[type]} pokemon [description]
   * @return {[type]}         [description]
   */
  async useOn(pokemon) {
    // Validate that the pokemon needs HP
    if(!pokemon.isWounded)
      throw new Error('That pokemon already have max HP')

    await this.parent.Call([{
      request: 'USE_ITEM_CAPTURE',
      message: {
        item_id: this.id,
        encounter_id: pokemon.encounter_id,
        spawn_point_id: pokemon.spawn_point_id,
      }
    }])
    this.count--
  }
}

class useOnDead extends Item {
  constructor(id){ super(id) }

  /**
   * [useOn description]
   * @return {[type]} [description]
   */
  async useOn(){
    // Validate that the pokemon needs HP
    if(!pokemon.isDead)
      throw new Error('That pokemon already have max HP')

    this.parent.Call([{
      request: 'USE_ITEM_REVIVE',
      message: {
        item_id: this.id,
        pokemon_id: pokemon.pokemon_id,
      }
    }])
    this.count--
  }
}

var usePotion = item_id => pokemon => {
  return this.parent.Call([{
    request: 'USE_ITEM_POTION',
    message: {
      item_id,
      pokemon_id: pokemon.pokemon_id,
    }
  }])
}



/**
 * This will hold an array with items that you have
 */
class Items {
  constructor(){
    Object.assign(this, {
      pokeBall: new useOnEncounter(1),
      greatBall: new useOnEncounter(2),
      ultraBall: new useOnEncounter(3),
      masterBall: new useOnEncounter(4),
      potion: usePotion(101),
      superPotion: usePotion(102),
      hyperPotion: usePotion(103),
      maxPotion: usePotion(104),
      revive: new useOnDead(201),
      maxRevive: new useOnDead(202),
      luckyEgg: new Item(301),
      incenseOrdinary: new Item(401),
      // incenseSpicy: {id: 0}
      // incenseCool: {id: 0}
      // incenseFloral: {id: 0}
      troyDisk: new Item(501),
      // xAttack: {id: 0}
      // xDefense: {id: 0}
      // xMiracle: {id: 0}
      razzBerry: new useOnEncounter(701),
      blukBerry: new useOnEncounter(702),
      nanabBerry: new useOnEncounter(703),
      weparBerry: new useOnEncounter(704),
      pinapBerry: new useOnEncounter(705),
      incubatorBasicUnlimited: new Item(901),
      incubatorBasic: new Item(902)
    })
  }


  /**
   * Gets the best ball you can use
   * agains a pokemon you are trying to catch
   *
   * @return {Item} the poke ball you can use
   */
  get bestBall() {
    return
      this.masterBall.count && this.masterBall ||
      this.ultraBall.count && this.ultraBall ||
      this.greatBall.count && this.greatBall ||
      this.pokeBall.count && this.pokeBall
  }



  /**
   * Returns whatever or not the bag is full
   *
   * @return {Boolean} true if the bag is full
   */
  get isFull() {
    return false
  }



  /**
   * Returns number of items in the inventory
   *
   * @return {Boolean} true if the bag is full
   */
  get count() {
    return
      pokeBall.count+
      greatBall.count+
      ultraBall.count+
      masterBall.count+
      potion.count+
      superPotion.count+
      hyperPotion.count+
      maxPotion.count+
      revive.count+
      maxRevive.count+
      luckyEgg.count+
      incenseOrdinary.count+
      troyDisk.count+
      razzBerry.count+
      blukBerry.count+
      nanabBerry.count+
      weparBerry.count+
      pinapBerry.count+
      incubatorBasicUnlimited.count+
      incubatorBasic
  }
}



/**
 * This will hold an array with pokemons that you own
 */
class Pokemons extends Array {}

/**
 * This will hold an array with eggs that you own
 */
class Eggs extends Array {}

/**
 * This will hold an array with candies that you have
 */
class Candies extends Array {}

class Inventory {
  constructor(parent){
    this.parent = parent
    this.items = new Items
    this.pokemons = new Pokemons
    this.eggs = new Eggs
    this.candies = new Candies
  }



  /**
   * Updates the inventory from the cloud
   * @return {Promise} Resolves to true/false if success
   */
  async update() {
    let res = await this.parent.Call([{
      request: 'GET_INVENTORY',
      message: {
        last_timestamp_ms: 0
      }
    }])
    // Cleanup Inventory before adding new Content to it
    // TODO: Update only the Changeset (last_timestamp_ms)
    this.items = new Items;
    this.pokemons = new Pokemons;
    this.eggs = new Eggs;
    this.candies = new Candies;

    var itemData = POGOProtos.Inventory.Item.ItemId
    itemData = Object.keys(itemData).reduce((obj, key) => {
      obj[ itemData[key] ] = _.camelCase(key.toLowerCase().replace('item_', ''))
      return obj
    }, {})

    for(let thing of res.GetInventoryResponse.inventory_delta.inventory_items){
      let data = thing.inventory_item_data

      if (data.pokemon_data) {
        let pokemon = new Pokemon(data.pokemon_data, this.parent)
        data.pokemon_data.is_egg
          ? this.eggs.push(pokemon)
          : this.pokemons.push(pokemon)
      }

      //items
      if (data.item)
        this.items[itemData[data.item.item_id]] = data.item

      //candy
      if (data.candy)
        this.candies.push(new Item(data.candy, this))

      //player stats
      if (data.player_stats)
        Object.assign(this.parent.player, data.player_stats)
    }
    return true
  }



  /**
   * Releases all dupe pokemons (keeps the one with highest CP)
   * @return {Inventory} returns updated inventory object
   */
  async cleanupPokemonDupes() {

    let noDupes=[]
    for (let pokemon of this.pokemons) {
      if (noDupes[pokemon.num] !== undefined){

        if (noDupes[pokemon.num].cp < pokemon.cp){
          noDupes[pokemon.num].release()
          noDupes[pokemon.num] = pokemon
        }else
          pokemon.release()

        await new Promise(resolve => setTimeout(resolve, 500))
      }else{
        noDupes[pokemon.num] = pokemon
      }
    }
    await this.update()
    return this
  }


  /**
   * Release all pokemon under a specific CP
   * @return {Inventory} returns updated inventory object
   */
  async cleanupPokemonUnderCP(cp) {
    try {
      for (let pokemon of this.pokemons) {
        if (pokemon.cp < cp) {
          await pokemon.release()
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      await this.update()
      return this

    } catch (exception) {
      throw new Error(exception)
    }
  }


  /**
   * Get the weakest  pokemon
   * @return {Pokemon} The weakest pokemon
   */
  getWeakestPokemon() {
    let weakestPokemon;
    let weakestPokemonCP = 9999999;

    for (let pokemon of this.pokemons) {
      if (pokemon.cp < weakestPokemonCP) {
        weakestPokemonCP = pokemon.cp;
        weakestPokemon = pokemon;
      }
    }

    return weakestPokemon;
  }


  /**
   * All favorized pokemons
   * @return {Array} Array with all favorite pokemons
   */
  getPokemonFavorites() {
    return _.filter(this.pokemons, {favorite: 1})
  }
}


export default Inventory
