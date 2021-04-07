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
    jwt = cookies.get('jwt')
  }

  // Could think of throwing an error if no JWT
  return jwt
}

const user_is_member_neo4j = (groups_of_user, group_id) => {
  return groups_of_user.find(record => {
    const user_group = record._fields[record._fieldLookup.group]
    const user_group_id = user_group.identity.low || user_group.identity
    return String(user_group_id) === String(group_id)
  })
}

const user_is_member_mongodb = (groups_of_user, group_id) => {
  return groups_of_user.find(user_group => {
    return String(user_group._id) === String(group_id)
  })
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
      const message = 'JWT not found in either cookies or authorization header'
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const group_id = options.group_id || options.group

    if(!group_id) {
      const message = 'Group ID not specified'
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }


    const headers = { Authorization: `Bearer ${jwt}` }

    axios.get( options.url , {headers})
    .then(({data}) => {

      let user_is_member

      if(options.db === 'mongodb') user_is_member = user_is_member_mongodb(data, group_id)
      else user_is_member = user_is_member_neo4j(data, group_id)

      if(user_is_member) next()
      else {
        const message = `User is not a member of group ${group_id}`
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
