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
  return await data.initialize()
}

const addColumns = (dataSpec, imageSpec, dbName, collectionName, columns) => {
  for (let i = 0; i < dataSpec.length; ++i) {
    if (dataSpec[i].dbName == dbName && dataSpec[i].collectionName == collectionName) {
      image.addColumns(imageSpec, [i], columns)
    }
  }
}

module.exports = {
  initialize,
  query,
  client: data.client,
  addColumns,
}
