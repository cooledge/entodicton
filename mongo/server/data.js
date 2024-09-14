const { MongoClient } = require('mongodb');
const _ = require('lodash')

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const initialize = async () => {
  if (client.isConnected()) {
    return
  }
  await client.connect()
  return client
}

const instantiate = async (dataSpec) => {
  if (!dataSpec) {
    return dataSpec
  }

  await initialize()

  if (Array.isArray(dataSpec)) {
    const data = []
    for (const element of dataSpec) {
      data.push( await instantiate(element ) )
    }
    return data
  } 

  if (dataSpec.dbName && dataSpec.collectionName && dataSpec.aggregation) {
    const { dbName, collectionName, aggregation, limit = 0} = dataSpec
    const db = client.db(dbName);
    const collection = db.collection(collectionName)
    let data;
    if (_.isEmpty()) {
      data = await collection.find().limit(limit).toArray();
    } else {
      data = await collection.aggregate(aggregation).limit(limit).toArray();
    }
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

const fields = async (dbName, collectionName) => {
  await initialize()
  const db = client.db(dbName);
  const collection = db.collection(collectionName)
  debugger
  const data = await collection.findOne()
  return Object.keys(data)
}

module.exports = {
  initialize,
  instantiate,
  client,
  fields,
}

