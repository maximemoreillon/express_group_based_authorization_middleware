const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const pjson = require('./package.json')
const group_auth = require('./index.js')

dotenv.config()

// Mongoose connection
const mongoose_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

const EXPRESS_PORT = process.env.EXPRESS_PORT || 80

const options = {
  url: 'https://api.groups.maximemoreillon.com/v2/members/self/groups',
  group: 129,
  //groups: [128, 22],
}

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(group_auth(options))

app.get('/', (req, res) => {
  res.send(`User is member of one of the following group(s) ${options.group || options.groups}`)
})


app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})
