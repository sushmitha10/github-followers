const express = require('express')
const secure = require('express-force-https')
const axios = require('axios')

const app = express()
app.use(secure) // Force https instead http

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers'
  )
  next()
})

app.get('/followers/:id', async function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  let a = Promise.all(
    (await getFollowers(req.params.id)).map(async id => {
      return {
        id: id,
        followers: Promise.all(
          (await getFollowers(id)).map(async id => {
            console.log(id)
            return {
              id: id,
              followers: await getFollowers(id)
            }
          })
        )
      }
    })
  )
  res.send({ id: req.param.id, followers: b })
})

const getFollowers = async function(id) {
  const allIds = (await axios.get(
    `https://api.github.com/user/${id}/followers`
  )).data.map(follower => follower.id)
  if (allIds.length > 5) allIds.length = 5
  return allIds
}

const PORT = process.env.PORT || 3000
app.listen(PORT)

console.log('server listening on port : ' + PORT)
