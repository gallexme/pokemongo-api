import GeoCoder from 'geocoder'
import moment from 'moment'
import Auth from '~/Auth'
import geolib from 'geolib'
import path from 'path'

const LOGIN_CACHE_LOCATION = './.loginCache';
const MILLIS_PER_MINUTE = 60 * 1000;
let fs = require('fs');

// Gives a random meters in any direction
function getRandomDirection(){
  let latMorP = Math.random() < 0.5 ? -1 : 1
  let longMorP = Math.random() < 0.5 ? -1 : 1

  let latitude = ((Math.floor((Math.random() * 13) + 1))/100000)*latMorP
  let longitude = ((Math.floor((Math.random() * 13) + 1))/100000)*longMorP

  return {latitude, longitude}
}

class Player {
  constructor(parent) {
    this.parent = parent
    this.playerInfo = {
      accessToken: '',
      username: '',
      password: '',
      debug: true,
      latitude: 0,
      longitude: 0,
      altitude: 0,
      provider: '',
      sessionData: {},
      lastCheckpointSearch: {},
    }
    this.Auth = new Auth(parent)
  }

  set provider(provider) {
    this.playerInfo.provider = provider
  }

  set profileDetails(data) {
    this.playerInfo.sessionData = data
  }

  get location() {
    let { latitude, longitude } = this.playerInfo
    return { latitude, longitude }
  }

  set location(coords) {
    Object.assign(this.playerInfo, coords)
    return coords
  }

  get profile() {
    return this.playerInfo
  }

  /**
   * Get Player level
   * @return {int} player level
   */
  get Level(){
    return this.level
  }

  get createdDate() {
    var date = new moment((this.playerInfo.sessionData.creation_timestamp_ms.toString() / 100)).format("dddd, MMMM Do YYYY, h:mm:ss a")
    this.parent.log.info(`[+] You are playing Pokemon Go since: {${date}}`)
    return this.playerInfo.sessionData.creation_timestamp_ms
  }

  /**
   * Pokemon max storage
   * @return {int} the max allowed pokemons in storage
   */
  get pokeMaxStorage() {
    var storage = this.playerInfo.sessionData.max_pokemon_storage
    this.parent.log.info(`[+] Poke Storage: {${storage}}`)
    return storage
  }

  /**
   * Items max storage
   * @return {int} the max allowed items in storage
   */
  get itemsMaxStorage() {
    var storage = this.playerInfo.sessionData.max_item_storage
    this.parent.log.info(`[+] Item Storage: {${storage}}`)
    return storage
  }


  /**
   * Get player currencies
   * @return {array} array with type and storage(amount)
   */
  get currency() {
    var curr = this.playerInfo.sessionData.currencies
    curr.map(obj => {
      this.parent.log.info(`[+] Currency (${obj.type}): {${storage}}`)
    })
    return curr
  }

  async Login(user, pass, forceRefreshLogin) {

    if (this.parent.loginCache){

      let cacheFile = null,
          loginCache = null,
          file = {}

      if (!forceRefreshLogin) {
        this.parent.log.info('[i] Checking for login cache.')
        try {
          cacheFile = require('fs').readFileSync(LOGIN_CACHE_LOCATION, 'utf8')
          try {
            loginCache = JSON.parse(cacheFile)[user]
          } catch (err) {
            this.parent.log.info('[i] Cache: file not found')
            cacheFile={}
            loginCache = false
          }
        } catch (err) {
          this.parent.log.info('[i] Cache: file not found')
          cacheFile={}
          loginCache = false
        }
      }


      if (loginCache &&
          ((Date.now() - loginCache.timestamp) < 10 * MILLIS_PER_MINUTE)) {
        this.parent.log.info('[i] Logging in with cache.')
        var res = loginCache.accessToken
      } else {
        this.parent.log.info('[i] Logging in with regular auth.')
        var res = await this.Auth.login(user, pass, this.playerInfo.provider)
      }


      //update to file
      cacheFile[user] = {
        accessToken: res,
        timestamp: Date.now(),
      }

      let prettyJson = JSON.stringify(cacheObj, null, 2)
      try {
        fs.writeFileSync(LOGIN_CACHE_LOCATION, prettyJson)
        this.parent.log.info('[i] Login cache saved to file!')
      } catch (err) {
        this.parent.log.error('[!] Error saving cache to file: ' + err)
      }

    }else{
      this.parent.log.info('[i] Logging in with regular auth.')
      var res = await this.Auth.login(user, pass, this.playerInfo.provider)
    }

    this.playerInfo.username = user
    this.playerInfo.password = pass
    this.playerInfo.accessToken = res

    return this.playerInfo
  }

  /**
   * Walk around like a human
   * @return {bool} returns true when done
   */
  walkAround(){
    let random = getRandomDirection()

    let destination = {
      latitude: this.location.latitude + random.latitude,
      longitude: this.location.longitude + random.longitude
    }

    let distance = geolib.getDistance(this.location, destination)
    this.location = destination
    this.parent.log.info(`[i] We just walked ${distance} meters`)
    return true
  }


  /**
   * Walk towards a point in human manner 
   * @param  {float} lat  latidude of the point to move against
   * @param  {float} long longitude of the point to move against
   * @return {bool} returns true when move complete
   */
  async walkToPoint(lat, long){

    let latRand = ((Math.floor((Math.random() * 13) + 1))/100000)
    let longRand = ((Math.floor((Math.random() * 13) + 1))/100000)

    if (this.playerInfo.latitude > lat)
      this.playerInfo.latitude = this.playerInfo.latitude-latRand
    else
      this.playerInfo.latitude = this.playerInfo.latitude+latRand

    if (this.playerInfo.longitude > long)
      this.playerInfo.longitude = this.playerInfo.longitude-longRand
    else
      this.playerInfo.longitude = this.playerInfo.longitude+longRand

    var distance = geolib.getDistance(
        {latitude: this.playerInfo.latitude, longitude: this.playerInfo.longitude},
        {latitude: lat, longitude: long}
    )

    //distance less than 10 meters?
    if (distance <= 10){
      this.parent.log.info(`[i] Walked to specified distance`)
      return true
    } else {
      this.parent.log.info(`[i] Walked closer to [`+lat+`,`+long+`] - distance is now: ${distance} meters`)
    }
  }


  hatchedEggs() {
    return this.parent.Call([{
      request: 'GET_HATCHED_EGGS',
    }])
  }


  /**
   * Player settings
   * @return {DownloadSettingsResponse} retrieves the player settings
   */
  settings() {
    return this.parent.Call([{
      request: 'DOWNLOAD_SETTINGS',
      message: {
        hash: "05daf51635c82611d1aac95c0b051d3ec088a930",
      }
    }])
  }

  /**
   * Downloads item templates
   * @return {DownloadItemTemplatesResponse}
   */
  itemTemplates() {
    return this.parent.Call([{
      request: 'DOWNLOAD_ITEM_TEMPLATES',
    }])
  }


  /**
   * Download configuration with app version, and so on
   * @return {DownloadRemoteConfigVersionResponse}
   */
  remoteConfigVersion() {
    return this.parent.Call([{
      request: 'DOWNLOAD_REMOTE_CONFIG_VERSION',
      message: {
        platform: 2, //android
        device_manufacturer: "Samsung",
        device_model: "SM-G920F",
        locale: "en-GB",
        app_version: 293,
      }
    }])
  }

}

export default Player
