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

const GROUP_TO_CHECK = 129


const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(group_auth({ group: GROUP_TO_CHECK }))

app.get('/', (req, res) => {
  res.send(`User is member of group ${GROUP_TO_CHECK}`)
})


app.listen(EXPRESS_PORT, () => {
  console.log(`[Express] App listening on ${EXPRESS_PORT}`)
})
