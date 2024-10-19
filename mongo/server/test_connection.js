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

(async () => {
  const client = await initialize()
  client.close()
  console.log("OKAY")
})()

