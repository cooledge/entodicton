const { MongoClient } = require('mongodb');
const _ = require('lodash')
const data = require('./data')
const image = require('./image')

const query = async (dataSpec, imageSpec) => {
  return image.instantiate(imageSpec, await data.instantiate(dataSpec))
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
