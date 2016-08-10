module.exports = {
  API_URL:'https://pgorelease.nianticlabs.com/plfe/rpc',
  LOGIN_URL:'https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize',
  
  // App info
  ANDROID_ID:'9774d56d682e549c',
  OAUTH_SERVICE:'audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com',
  APP_NAME:'com.nianticlabs.pokemongo',
  CLIENT_SIG:'321187995bc7cdc2b5fc91b11a96e2baa8602c62',
  

  // Pokemon Go oauth
  LOGIN_OAUTH:'https://sso.pokemon.com/sso/oauth2.0/accessToken',
  LOGIN_OAUTH_CLIENT_ID:'mobile-app_pokemon-go',
  LOGIN_OAUTH_REDIRECT_URI:'https://www.nianticlabs.com/pokemongo/error',
  LOGIN_OAUTH_CLIENT_SECRET:'w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR',

  BANNED_POKEMONS: [10, 11, 13, 14, 16, 17, 19, 20, 21, 41, 43, 46, 69, 98, 118],

  // (in ms.)
  PAUSE_BETWEEN_REQUESTS: 1000,
}
