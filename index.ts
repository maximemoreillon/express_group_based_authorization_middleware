import axios from "axios"
import Cookies from "cookies"
import dotenv from "dotenv"
import { Request, Response, NextFunction } from "express"

dotenv.config()

const retrieve_jwt = (req: Request, res: Response) => {
  /*
  Retrieving the token from either cookies or authorization header
  */

  let jwt: string | undefined = undefined

  // See if jwt available from authorization header
  if (!jwt) {
    jwt = req.headers?.authorization?.split(" ")[1]
  }

  // Try to get JWT from cookies
  if (!jwt) {
    const cookies = new Cookies(req, res)
    jwt = cookies.get("jwt") || cookies.get("token")
  }

  if (!jwt) {
    jwt = (req.query.jwt as any) || (req.query.token as any)
  }

  // Could think of throwing an error if no JWT
  return jwt
}

const get_matching_groups = (groups_of_user: any[], group_ids: any[]) =>
  groups_of_user
    .map((g) => (g.properties?._id || g.identity || g._id).toString())
    .filter((id) => group_ids.includes(id))

const middleware =
  (options: any = {}) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!options.url) {
      const message = "Group check URL not specified"
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const jwt = retrieve_jwt(req, res)

    // if no JWT available, reject request
    if (!jwt) {
      const message =
        "Group based auth: JWT not found in either cookies or authorization header"
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const group_ids = options.groups || options.group_ids || []
    const group_id = options.group_id || options.group

    if (group_id) group_ids.push(group_id)

    if (!group_ids.length) {
      const message = "No group ID specified"
      console.log(`[Auth middleware] ${message}`)
      res.status(403).send(message)
      return
    }

    const headers = { Authorization: `Bearer ${jwt}` }

    axios
      .get(options.url, { headers })
      .then(({ data }) => {
        // API v3 has groups under 'items'
        let groups_of_user = data.items || data

        const matching_groups = get_matching_groups(groups_of_user, group_ids)

        if (matching_groups.length) {
          res.locals.groups = matching_groups
          next()
        } else {
          const message = `Group based auth: User is not a member of any of those groups: ${group_ids}`
          console.log(`[Auth middleware] ${message}`)
          res.status(403).send(message)
          return
        }
      })
      .catch((error) => {
        // In case the request fails, forward error message
        console.log(error)
        res.status(403).send(error)
      })
  }

export = middleware
