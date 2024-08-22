const { MongoClient } = require('mongodb');
const _ = require('lodash')
const data = require('./data')
const image = require('./image')

const query = async (dataSpec, imageSpec) => {
  const dataV = await data.instantiate(dataSpec)
  console.log('dataV', JSON.stringify(dataV, null, 2))
  return image.instantiate(imageSpec, dataV)
}

const initialize = async () => {
  await data.initialize()
  return data.client
}

module.exports = {
  initialize,
  query,
  client: data.client,
}
