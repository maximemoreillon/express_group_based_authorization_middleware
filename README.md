# Express Group-based authorization middleware

## Usage

```
// Crerate an express app
const app = require('express')()

// Import the middleware
const group_auth = require('@moreillon/express_group_based_authorization_middleware')

const options = {
  url: 'https://api.groups.example.com/v2/members/self/groups',
  group: 'GROUP_ID'
}

// Register the middleware
app.use(group_auth(options))
```
