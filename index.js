const axios = require('axios')
const Cookies = require('cookies')
const dotenv = require('dotenv')

dotenv.config()

const retrieve_jwt = (req, res) => {
  /*
  Retrieving the token from either cookies or authorization header
  */

  let jwt = undefined

  // See if jwt available from authorization header
  if(!jwt){
    if(('authorization' in req.headers)) {
      jwt = req.headers.authorization.split(" ")[1]
    }
  }

  // Try to get JWT from cookies
  if(!jwt) {
    const cookies = new Cookies(req, res)
    jwt = cookies.get('jwt') || cookies.get('token')
  }

  if(!jwt) {
    jwt = req.query.jwt || req.query.token
  }

  // Could think of throwing an error if no JWT
  return jwt
}

const get_matching_groups = (groups_of_user, group_ids) => {
  const ids_of_groups_of_user = groups_of_user.map(g => g.identity || g._id)
  return ids_of_groups_of_user.filter(id => group_ids.includes(id))
}


module.exports = (opt) => {
  const options = opt || {}

  return (req, res, next) => {

    if(!options.url) {
      const message = 'Group check URL not specified'
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const jwt = retrieve_jwt(req, res)

    // if no JWT available, reject request
    if(!jwt) {
      const message = 'Group based auth: JWT not found in either cookies or authorization header'
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const group_ids = options.groups || options.group_ids || []
    const group_id = options.group_id || options.group

    if(group_id) group_ids.push(group_id)

    if(!group_ids.length) {
      const message = 'No group ID specified'
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }


    const headers = { Authorization: `Bearer ${jwt}` }

    axios.get( options.url , {headers})
    .then(({data: groups_of_user}) => {

      const matching_groups = get_matching_groups(groups_of_user, group_ids)

      if(matching_groups.length) {
        res.locals.groups = matching_groups
        next()
      }
      else {
        const message = `User is not a member of any of those groups: ${group_ids}`
        console.log(`[Auth middleware] ${message}`)
        res.status(403).send(message)
        return
      }

    })
    .catch( error => {
      // In case the request fails, forward error message
      console.log(error)
      res.status(403).send(error)
    })

  }
}
