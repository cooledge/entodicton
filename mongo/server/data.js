const { MongoClient } = require('mongodb');
const _ = require('lodash')

let client;

const initialize = async () => {
  if (!!client && !!client.topology && client.topology.isConnected()) {
    return client
  }
  const url = 'mongodb://localhost:27017';
  client = await MongoClient.connect(url);
  return client
}

const instantiate = async (dataSpec) => {
  if (!dataSpec) {
    return dataSpec
  }
  console.log("instantiating dataspec", JSON.stringify(dataSpec, null, 2))
  await initialize()

  if (Array.isArray(dataSpec)) {
    const data = []
    for (const element of dataSpec) {
      data.push( await instantiate(element) )
    }
    return data
  } 

  if (dataSpec.dbName && dataSpec.collectionName) {
    const { dbName, collectionName, aggregation, limit = 0} = dataSpec
    const db = client.db(dbName);
    const collection = db.collection(collectionName)
    let data;
    if (_.isEmpty(aggregation)) {
      // data = await (collection.find().sort(dataSpec.sort || []).limit(limit).toArray())
      data = collection.find()
      if (dataSpec.sort) {
        data = data.sort(dataSpec.sort)
      }
      if (dataSpec.limit) {
        data = data.limit(limit)
      }
      return await data.toArray()
    } else {
      console.log('----------- dataSpec.sort', dataSpec.sort);
      const data1 = await collection.aggregate(aggregation).limit(10).toArray();
      data = collection.aggregate(aggregation)
      if (dataSpec.sort) {
        data = data.sort(dataSpec.sort)
      }
      if (dataSpec.limit) {
        data = data.limit(limit)
      }
      const result = await data.toArray()
      // console.log("data from db", JSON.stringify(result, null, 2))
      return result
    }
    // console.log('returning data', JSON.stringify(data, null, 2))
    return data
  }

  if (typeof dataSpec == 'object') {
    const data = {}
    for (const key in dataSpec) {
      data[key] = await instantiate(dataSpec[key])
    }
    return data
  }

  return dataSpec
}

const getFields = async (dbName, collectionName) => {
  await initialize()
  const db = await client.db(dbName);
  const collection = await db.collection(collectionName)
  const data = await collection.findOne()
  const fields = Object.keys(data)
  fields.sort()
  const result = fields.map( (field) => { 
    return { name: field, isArray: Array.isArray(data[field]) } 
  })
  return result
}

const terminate = () => {
  if (client) {
    client.close()
    client = null
  }
}

// TODO call this getDataSpec
const getValue = (dataSpec, path) => {
  let value = dataSpec
  for (const prop of path) {
    value = dataSpec[prop]
    if (!value) {
      return
    }
  }
  return value
}

module.exports = {
  initialize,
  terminate,
  instantiate,
  client,
  getFields,
  getValue,
}

