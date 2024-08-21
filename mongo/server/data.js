const { MongoClient } = require('mongodb');
const _ = require('lodash')

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const instantiate = async (dataSpec) => {
  const { dbName, collectionName, aggregation } = dataSpec
  db = client.db(dbName);
  collection = db.collection(collectionName)
  let data;
  if (_.isEmpty()) {
    data = await collection.find().toArray();
  } else {
    data = await collection.aggregate(aggregation).toArray();
  }
  return data
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

