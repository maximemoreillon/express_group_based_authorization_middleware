import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import group_auth from "./index.js"

dotenv.config()

const { EXPRESS_PORT = 80 } = process.env

const options = {
  url: "https://api.groups.maximemoreillon.com/v3/members/self/groups",
  group: 129,
  //groups: [128, 22],
} as any

const app = express()
app.use(express.json())
app.use(cors())
app.use(group_auth(options))

app.get("/", (req, res) => {
  res.send(
    `User is member of one of the following group(s) ${
      options.group || options.groups
    }`
  )
})

app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})
