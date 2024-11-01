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

const getValue = (object, path) => {
  let value = object
  for (const prop of path) {
    value = object[prop]
    if (!value) {
      return value
    }
  }
  return value
}

const updateColumnsNew = (report, chosen) => {

  const columns = []
  const properties = []
  const fields = []
  const compare = (field) => (a, b) => {
    a = a[field]
    b = b[field]
    if (a == b) {
      return 0
    }
    if (a < b) {
      return -1
    }
    return 1
  }
  const selected = chosen.choices.filter(item => item.selected)
  selected.sort(compare('counter'))
  for (const column of selected) {
    columns.push({ text: column.text, id: column.id })
    properties.push(`$${column.id}`)
    fields.push(column.id)
  }
  debugger
  const dataSpecPath = chosen.serverResponse.chooseFields.dataSpecPath
  const dataSpec = data.getValue(report.dataSpec, dataSpecPath)
  dataSpec.usedFields = fields

  const options = {
    seen: (path, imageSpec) => {
      if (_.isEqual(imageSpec.field, dataSpecPath)) {
        imageSpec.headers.columns = columns
        imageSpec.colgroups = properties.map( (e, i) => `column_${i}` ),
        imageSpec.rows = properties
      }
    }
  }
  image.traverseImpl(report.imageSpec, options)

  /*
  report.imageSpec = {
    headers: {
      columns,
    },
    colgroups: properties.map( (e, i) => `column_${i}` ),
    table: true,
    field: [],
    rows: properties
  }
  */
}

const updateColumns = (report, database, collection, chosen) => {
  report.dataSpec = {
    ...report.dataSpec,
    dbName: database,
    collectionName: collection,
    limit: 10,
    aggregation: [],
  }
  const columns = []
  const properties = []
  const compare = (field) => (a, b) => {
    a = a[field]
    b = b[field]
    if (a == b) {
      return 0
    }
    if (a < b) {
      return -1
    }
    return 1
  }
  const selected = chosen.choices.filter(item => item.selected)
  selected.sort(compare('counter'))
  for (const column of selected) {
    columns.push({ text: column.text, id: column.id })
    properties.push(`$${column.id}`)
  }
  report.imageSpec = {
    headers: {
      columns,
    },
    colgroups: properties.map( (e, i) => `column_${i}` ),
    table: true,
    field: [],
    rows: properties
  }
}

const addReport = (toThis, addThis) => {
  // convert addThis to compound report is necessary
  if (!Array.isArray(toThis.dataSpec)) {
    let wasEmpty = true
    if (!toThis.dataSpec.dbName) {
      toThis.dataSpec = []
    } else {
      toThis.dataSpec = [toThis.dataSpec]
      wasEmpty = false
    }
    toThis.imageSpec = {
      "headers": { "columns": [] },
      "table": true,
      "explicit": true,
      "field": [],
    }
    if (wasEmpty) {
      toThis.imageSpec.rows = []
    } else {
      // toThis.imageSpec.rows = toThis.imageSpec.rows.map((row) => row.map((is) => is.field = [0]))
    }
  }
  toThis.dataSpec.push(addThis.dataSpec)
  toThis.imageSpec.rows.push([{ ...addThis.imageSpec, field: [toThis.dataSpec.length-1] }])
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

      if (!dataSpec.groupFields) {
        dataSpec.groupFields = []
      }
      dataSpec.groupFields.push(groupField)

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
  addReport,
  updateColumns,
  updateColumnsNew,
}
