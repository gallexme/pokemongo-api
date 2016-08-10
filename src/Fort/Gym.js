import Fort from './Fort'
import Pokemon from '~/Pokemon'

class Gym extends Fort {
  constructor(props, parent) {
    super(props, parent)

    this.modified = new Date(this.last_modified_timestamp_ms.toNumber())
    this.gym_points = this.gym_points.toNumber()
    this.isGym = true

    delete this.type
    delete this.lure_info
    delete this.last_modified_timestamp_ms
  }



  /**
   * @return {Boolean} true if the team is on your team
   */
  get isSameTeam(){
    return this.parent.player.playerInfo.sessionData.team == this.owned_by_team
  }

  /**
   * @return {Boolean} true if no pokemon is assigned to the gym
   */
  get isNeutral(){
    return this.owned_by_team == 0
  }

  /**
   * @return {integer} current gympoints
   */
  get points(){
    return this.gym_points.toString()
  }

  /**
   * @return {bool} true if in battle
   */
  get isInBattle(){
    return this.is_in_battle
  }


  /**
   * @return {pokemon} guard pokemon id
   * TODO: more data is available in the this.memberships.pokemon_data[0]
   */
  get guardPokemon(){
    return new Pokemon(this.guard_pokemon_id)
  }

  /**
   * Gets gym description, suce as members, and gym details
   *
   * @return {GetGymDetailsResponse} [description]
   */
  async details() {
    let {latitude, longitude} = this.parent.player.location

    var details = await this.parent.Call([{
      request: 'GET_GYM_DETAILS',
      message: {
        gym_id: this.id,
        player_latitude: latitude,
        player_longitude: longitude,
        gym_latitude: this.latitude,
        gym_longitude: this.longitude,
      }
    }])

    let gym = details.GetGymDetailsResponse

    Object.assign(
      this, 
      {name: gym.name},
      {urls: gym.urls},
      {description: gym.description},
      {memberships: gym.gym_state.memberships},
      gym.gym_state.fort_data,
    )
    return details
  }


  /**
   * TODO: description
   *
   * [recallPokemon description]
   * @param  {[type]} pokemon [description]
   * @return {[type]}         [description]
   */
  recallPokemon(pokemon) {
    let {latitude, longitude} = this.parent.player.location

    return this.parent.Call([{
      request: 'FORT_RECALL_POKEMON',
      message: {
        fort_id: this.id,
        pokemon_id: pokemon.pokemon_id,
        player_latitude: latitude,
        player_longitude: longitude
      }
    }])
  }



  /**
   * Put a own pokemon from the inventory and put it in a gym
   *
   * @param  {[type]} pokemon The pokemon from your inventory
   * @return {[type]}         [description]
   */
  deployPokemon(pokemon) {
    if(pokemon.stamina_max !== pokemon.stamina)
      throw new Error('Pokémons need to have full HP, before assigning to gym')

    if(!this.isSameTeam && !this.isNeutral)
      throw new Error("Can't set a pokemon on a other team's gym")

    let {latitude, longitude} = this.parent.player.location

    return this.parent.Call([{
      request: 'FORT_DEPLOY_POKEMON',
      message: {
        fort_id: this.id,
        pokemon_id: pokemon.id,
        player_latitude: latitude,
        player_longitude: longitude
      }
    }])
  }


  /**
   * Initiate gym battle
   *
   * @param  {[array]} list of Pokemons that you want to attack the gym with
   * @return {[type]} {StartGymBattle} object
   */
  async startBattle(pokemonIds) {
    let {latitude, longitude} = this.parent.player.location

    if (pokemonIds == undefined || pokemonIds.length == 0){
      this.parent.log.info(`[!] GymBattle: pokemons array missing`)
      return false
    }
    if (this.memberships.length == 0 || this.id == 0)
      await this.details()

    if (this.isInBattle){
      this.parent.log.info(`[!] GymBattle: already in battle`)
      return false
    }


    var battle = await this.parent.Call([{
      request: 'START_GYM_BATTLE',
      message: {
        gym_id: this.id,
        attacking_pokemon_ids: [13580295954861177709,14493702144884454174],
        defending_pokemon_id: this.memberships[0].pokemon_data.id.toString(),
        player_latitude: latitude,
        player_longitude: longitude,
      }
    }])

    this.currentAttack ={} //TODO: add data
    return battle
  }

  /**
   * the attack phase
   *
   * @param  {[integer]} pokemon The pokemon from your inventory
   * @return {[type]} {AttackGymResponse} object
   */
  async attack(attackActions) {
    let {latitude, longitude} = this.parent.player.location

    if (this.currentAttack.length == 0){
      this.parent.log.info(`[!] GymBattle: You need to start battle first: gym.startBattle(pokemon_ids)`)
      return false
    }

    var BattleActions = POGOProtos.Data.Battle.BattleActionType
    var actions = []
    attackActions.map(action => {
      actions.push(BattleActions[action])
    })

    var attack = await this.parent.Call([{
      request: 'ATTACK_GYM',
      message: {
        gym_id: this.id,
        battle_id: this.currentAttack.battle_id,
        attack_actions: actions,
        last_retrieved_actions: this.currentAttack.lastRetrievedAction,
        player_latitude: latitude,
        player_longitude: longitude,
      }
    }])
    this.currentAttack ={} //TODO: add data
    
    return attack
  }


  /**
   * Instawin a battle
   *
   * @return {[type]} {AttackGymResponse} object
   */
  async instaWinBattle() {
    return this.attack(['ACTION_VICTORY'])
  }

}

export default Gym