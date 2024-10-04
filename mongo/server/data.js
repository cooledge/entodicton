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
      data = await collection.find().sort(dataSpec.sort || []).limit(limit).toArray();
    } else {
      data = await collection.aggregate(aggregation).sort(dataSpec.sort || []).limit(limit).toArray();
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

const getFields = async (dbName, collectionName) => {
  await initialize()
  const db = await client.db(dbName);
  const collection = await db.collection(collectionName)
  const data = await collection.findOne()
  return Object.keys(data)
}

const terminate = () => {
  if (client) {
    client.close()
    client = null
  }
}

module.exports = {
  initialize,
  terminate,
  instantiate,
  client,
  getFields,
}

