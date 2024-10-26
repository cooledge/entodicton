const { MongoClient } = require('mongodb');
const _ = require('lodash')
const data = require('./data')
const image = require('./image')

const query = async (dataSpec, imageSpec) => {
  const dataV = await data.instantiate(dataSpec)
  // console.log('dataV', JSON.stringify(dataV, null, 2))
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

const addGroup = (dataSpec, groupFields) => {
  const options = {
    seen: (path, dataSpec) => {
      // TODO handle more that 1 field
      const groupField = groupFields[0]
      const addToSet = {}
      if (!dataSpec.usedFields.includes(groupField)) {
        dataSpec.usedFields.push(groupField);
      }
      for (const field of dataSpec.usedFields) {
        addToSet[field] = `$${field}`
      }
      dataSpec.aggregation = [
        // { '$sort': { '_id': 1 } }, // this is so the tests are easier to write and this is just a POC
        { '$unwind': `$${groupField}` },
        { '$group': 
          { 
            _id: `$${groupField}`, 
            [groupField]: { 
              $first: `$${groupField}` 
            }, 
            [dataSpec.collectionName]: { 
              $addToSet: addToSet 
            } 
          } 
        },
        // limit number of records to 10 since this is just a POC
        { 
          $project: { 
            [groupField]: 1, 
            [dataSpec.collectionName]: { $slice: ['$' + dataSpec.collectionName, 10] } 
          } 
        },
        // { '$sort': { [groupField.word]: 1 } }, // this is so the tests are easier to write and this is just a POC
      ]
    }
  }
  traverseImpl(dataSpec, options)
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
  addGroup,
}
