const express = require('express')
const tpmkms = require('tpmkms')
const app = express()
const port = 5001

const fastfood = tpmkms.fastfood()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
