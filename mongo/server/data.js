const { MongoClient } = require('mongodb');
const _ = require('lodash')

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const instantiate = async (dataSpec) => {
  if (!dataSpec) {
    return dataSpec
  }

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

const initialize = async () => {
  await client.connect()
  return client
}

module.exports = {
  initialize,
  instantiate,
  client,
}

