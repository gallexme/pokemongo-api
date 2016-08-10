import pokedex from 'pokemon-go-pokedex'
import rand from 'randgen'

const pokedexMap = new Map();

for(let p of pokedex.pokemon)
  pokedexMap.set(p.id, p)

function getPokedexEntry(pokemon_id) {
  let pokemon = pokedexMap.get(pokemon_id)

  if (pokemon)
    delete pokemon.id

  return pokemon
}

/**
 * [class description]
 */
class Pokemon {
  constructor(props, parent) {
    Object.assign(this, getPokedexEntry(props.pokemon_id), props)
    Object.defineProperty(this, 'parent', {value: parent})
  }



  /**
   * Return the coordinates of the pokemon
   * @return {Object} {latitude, longitude}
   */
  get location() {
    return {
        latitude: this.latitude,
        longitude: this.longitude
    }
  }



  /**
   * [encounter description]
   * @return {[type]} [description]
   */
  async encounter() {
    let {latitude, longitude} = this.parent.player.location

    this.isCatching = true

    let res = await this.parent.Call([{
      request: 'ENCOUNTER',
      message: {
        encounter_id: this.encounter_id,
        spawn_point_id: this.spawn_point_id,
        player_latitude: latitude,
        player_longitude: longitude,
      }
    }])

    return res
  }



  /**
   * [catch description]
   * @param  {[type]} pokeball [description]
   * @return {[type]}          [description]
   */
  async catch(pokeball) {
    let res = await this.parent.Call([{
      request: 'CATCH_POKEMON',
      message: {
        encounter_id: this.encounter_id,
        pokeball: pokeball || 1, // 2 for grate ball
        normalized_reticle_size: Math.min(1.95, rand.rnorm(1.9, 0.05)),
        spawn_point_id: this.spawn_point_id,
        hit_pokemon: true,
        spin_modifier: Math.min(0.95, rand.rnorm(0.85, 0.1)),
        normalized_hit_position: 1.0,
      }
    }])

    // TODO: Try again if it fails?
    // Need to figure out why we get an error first
    /*
    let status = res.CatchPokemonResponse.status
    // ['Unexpected error', 'Successful catch', 'Catch Escape', 'Catch Flee', 'Missed Catch']

    if(status == 2 || status == 4)
      return this.catch(pokeball)
    */

    this.isCatching = false

    return res
  }



  /**
   * [encounterAndCatch description]
   * @param  {[type]} pokeball [description]
   * @return {[type]}          [description]
   */
  async encounterAndCatch(pokeball) {
    this.isCatching = true
    let pok = await this.encounter()
    // TODO: add a little timer here?
    // TODO: use berry?
    let result = await this.catch(pokeball)
    this.isCatching = false

    return result
  }



  /**
   * [release description]
   * @return {[type]} [description]
   */
  release() {
    return this.parent.Call([{
      request: 'RELEASE_POKEMON',
      message: {
        pokemon_id: this.id,
      }
    }])
  }



  /**
   * [envolve description]
   * @return {[type]} [description]
   */
  evolve() {
    return this.parent.Call([{
      request: 'EVOLVE_POKEMON',
      message: {
        pokemon_id: this.id,
      }
    }])
  }



  /**
   * [upgrade description]
   * @return {[type]} [description]
   */
  upgrade() {
    return this.parent.Call([{
      request: 'UPGRADE_POKEMON',
      message: {
        pokemon_id: this.id,
      }
    }])
  }



  /**
   * [setFavorite description]
   */
  setFavorite() {
    return this.parent.Call([{
      request: 'SET_FAVORITE_POKEMON',
      message: {
        pokemon_id: this.id,
        is_favorite: true,
      }
    }])
  }



  /**
   * [nickname description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  nickname(name) {
    return this.parent.Call([{
      request: 'NICKNAME_POKEMON',
      message: {
        pokemon_id: this.id,
        nickname: name,
      }
    }])
  }


}
export default Pokemon
