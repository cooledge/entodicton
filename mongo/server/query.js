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
  const options = {
    seen: (path, dataSpec) => {
      if (dataSpec.dbName == dbName && dataSpec.collectionName == collectionName) {
        image.addColumns(imageSpec, path, columns)
      }
    }
  }
  traverseImpl(dataSpec, options)
}

const traverseImpl = (dataSpec, options = {}) => {
  if (Array.isArray(dataSpec)) {
    const dataSpecs = dataSpec
    for (let i = 0; i < dataSpecs.length; ++i) {
      options.seen([i], dataSpecs[i])
    }
  } else {
    options.seen([], dataSpec)
  }
}

const addSort = (dataSpec, sortFields) => {
  const options = {
    seen: (path, dataSpec) => {
      for (const sortField of sortFields) {
        if (!dataSpec.sort) {
          dataSpec.sort = {}
        }
        delete dataSpec.sort[sortField.word]
        dataSpec.sort[sortField.word] = sortField.ordering == 'ascending' ? 1 : -1
      }
    }
  }
  traverseImpl(dataSpec, options)
}

module.exports = {
  initialize,
  query,
  client: data.client,
  addColumns,
  addSort,
}
