import GoogleOAuth from 'gpsoauthnode'
import Request from 'request'

import {
  ANDROID_ID,
  APP_NAME,
  CLIENT_SIG,
  OAUTH_SERVICE,
  LOGIN_URL,
  LOGIN_OAUTH,
  LOGIN_OAUTH_CLIENT_ID,
  LOGIN_OAUTH_REDIRECT_URI,
  LOGIN_OAUTH_CLIENT_SECRET
} from './settings'

class Auth {
  constructor(parent) {
    this.parent = parent
    this.google = new GoogleOAuth();
    this.options = {
      url: LOGIN_URL,
      headers: {
        'User-Agent': 'niantic'
      }
    }
    this.cookieJar = Request.jar()
    this.request = Request.defaults({jar: this.cookieJar})
    this.accessToken = ''
  }

  async login(user, pass, provider) {
    let res;

    this.parent.log.info('[i] Logging with user: ' + user)
    if (provider === 'ptc') {
      res = await this.PokemonAccount(user, pass)
      this.parent.log.info('[i] Received PTC access token!')
    } else {
      res = await this.GoogleAccount(user, pass)
      this.parent.log.info('[i] Received Google access token!')
    }

    return res
  }

  GoogleAccount(user, pass) {
    return new Promise( (resolve, reject) => {
      this.google.login(user, pass, ANDROID_ID, (err, data) => {
        if (data) {
          this.google.oauth(user, data.masterToken, data.androidId, OAUTH_SERVICE, APP_NAME, CLIENT_SIG, (err, data) => {
            if (err) reject(err)
            resolve (data.Auth)
          });
        }
        else reject(err)
      })
    })
  }

  PokemonAccount(user, pass) {
    return new Promise( (resolve, reject) => {
      var loginOptions = {
        url: LOGIN_URL,
        headers: {
          'User-Agent': 'niantic'
        }
      }
      this.request.get(loginOptions, (err, res, body) => {
        if (err) return reject(err)

        const data = JSON.parse(body)

        var options = {
          url: LOGIN_URL,
          form: {
              lt: data.lt,
              execution: data.execution,
              _eventId: 'submit',
              username: user,
              password: pass
          },
          headers: loginOptions.headers
        }

        this.request.post(options, (err, response, body) => {
          if (err) return reject(err)

          if (body) {
              const loginData = JSON.parse(body);
              if (loginData.errors && loginData.errors.length !== 0) {
                  return reject(new Error('Error logging in: ' + loginData.errors[0]), null);
              }
          }

          const ticket = response.headers.location.split('ticket=')[1]
          options = {
              url: LOGIN_OAUTH,
              form: {
                  client_id: LOGIN_OAUTH_CLIENT_ID,
                  redirect_uri: LOGIN_OAUTH_REDIRECT_URI,
                  client_secret: LOGIN_OAUTH_CLIENT_SECRET,
                  grant_type: 'refresh_token',
                  code: ticket
              },
              headers: loginOptions.headers
          }

          this.request.post(options, (err, response, body) => {
            if (err) return reject(err)

            var token = body.split('token=')[1]
            token = token.split('&')[0]

            if (!token)
              return reject(new Error('Login failed'))

            this.parent.log.info('[i] Login ok')
            this.parent.log.info('[i] Session token: ' + token)
            resolve(token)
          })
        })
      })
    })
  }
}

export default Auth
