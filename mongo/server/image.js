const _ = require('lodash')

const graph = {
  type: "bar",
  options: {
    chart: {
      id: 'apexchart-example'
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    }
  },
  series: [{
    name: 'series-1',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
  }]
}

const data = {
  headers: ['h1', 'h2', 'h2' ],
  table: true,
  rows: [
    { columns: ['0A', '0B', { table: true, headers: [], rows: [{ columns: ['0Ca1', '0Ca2'] }, '0Cb', '0Cc'] }] },
    { columns: ['1A', '1B', { graph }] },
    { columns: ['2A', '2B', '2C'] },
  ]
}

const getValue = (path, bson) => {
  let value = bson
  for (let name of path) {
    value = value[name]
  }
  return value
}

const setValue = (dest, path, value) => {
  const container = getValue(path.slice(0,-1), dest)
  const field = path.slice(-1)[0]
  container[field] = value
  return value
}

const instantiateValue = (path, imageSpec, rows, instantiation, options) => {
  const imageSpecValue = getValue(path, imageSpec)
  if (imageSpecValue['$push']) {
    const value = setValue(instantiation, path, [])
    for (const row of rows) {
      value.push(instantiateImpl(imageSpecValue['$push'], row, options))
    }
  } else if (imageSpec.options.xaxis.categories['$first']) {
    setValue(instantiation, path, instantiateImpl(bSpecValue['$first'], rows[0], options))
  }
}

const instantiate = (imageSpec, bson, options = {}) => {
  setId(imageSpec)
  const counters = {
    tableNumber: 0
  }
  options.newTableNumber = () => {
    counters.tableNumber += 1
    return counters.tableNumber
  }
  options.tableNumber = ''
  return instantiateImpl(imageSpec, bson, options)
}

const instantiateImpl = (imageSpec, bson, options = {}) => {
  if (imageSpec.type) {
    const instantiation = _.cloneDeep(imageSpec)
    const rows = bson

    instantiateValue(['options', 'xaxis', 'categories'], imageSpec, rows, instantiation, { ...options, isGraph: true })
    for (let i = 0; i < imageSpec.series.length; ++i) {
      instantiateValue(['data'], imageSpec.series[i], rows, instantiation.series[i], { ...options, isGraph: true })
    }
    return instantiation
  } else if (imageSpec.table) {
    // rows is the values to be instantiated rather than instantiated over the rows of the data
    const tableNumber = options.newTableNumber()
    const instantiation = { 
      headers: { 
        className: 'header', 
        data: imageSpec.headers.columns.map((column) => { 
          const value = { className: '', data: column.text } 
          if (column.selecting) {
            value.selecting = column.selecting
          }
          return value
        })
      }, 
      className: `Table table_${tableNumber}`,
      colgroups: imageSpec.colgroups, 
      table: true 
    }
    if (imageSpec.headers.selecting) {
      instantiation.headers.selecting = imageSpec.headers.selecting
    }
    if (imageSpec.rules) {
      instantiation.rules = imageSpec.rules
    }
    if (imageSpec.headers.id) {
      instantiation.headers.className += ' ' + imageSpec.headers.id
    }
    // console.log('init instantiation imagespec', JSON.stringify(imageSpec, null, 2))
    // console.log('init instantiation instantation', JSON.stringify(instantiation, null, 2))
    options = { ...options, tableNumber}
    if (imageSpec.explicit) {
      const rows = []
      let field = bson
      for (let name of imageSpec.field) {
        field = bson[name]
      }
      instantiation.rows = { className: 'rows', data: imageSpec.rows.map((is) => instantiateImpl(is, field, options)) }
      return instantiation
    } else {
      if (imageSpec.capitalizeHeader) {
        instantiation.headers = instantiation.headers.columns.map((column) => column.text.toUpperCase())
      }
      if (imageSpec.selecting) {
        instantiation.selecting = imageSpec.selecting
      }
      const rows = []
      let field = bson
      for (let name of imageSpec.field) {
        field = bson[name]
      }
      if (!field) {
        debugger
        return
      }
      for (const [index, row] of field.entries()) {
        rows.push({ className: `row_${index}`, data: instantiateImpl(imageSpec.rows, row, options)})
      }
      instantiation.rows = { className: "rows", data: rows }
      return instantiation
    }
  } else if (Array.isArray(imageSpec)) {
    const values = []
    for (const [index, field] of imageSpec.entries()) {
      values.push({ className: `column column_${index} table_${options.tableNumber}_column_${index}`, data: instantiateImpl(field, bson, options) })
    }
    return values
  } else if (typeof imageSpec !== 'object' ){
    if (imageSpec.startsWith("$")) {
      if (options.isGraph) {
        return bson[imageSpec.slice(1)]
      } else {
        return { className: 'fieldValue', data: bson[imageSpec.slice(1)] }
      }
    } else {
      return { className:'fieldConstant', data: imageSpec }
    }
  } else {
    return {}
  }
}

const count = (imageSpec) => {
  const options = {
      counters: {
        header: 0,
        table: 0,
        graph: 0,
      },
      seen: (what) => {
        options.counters[what] += 1
      }
    }

  traverseImpl(imageSpec, options)
  return options.counters
}

const selector = (imageSpec, reportElements) => {
  return '.header'
}

const countSelected = (imageSpec, reportElements) => {
  setId(imageSpec)
  const ids = new Set(reportElements.map((re) => re.marker))
  let count = 0
  const options = {
    seen: (what, value) => {
      if (ids.has(what)) {
        count += 1
      }
    }
  }
  traverseImpl(imageSpec, options)
  return count
}

// ids are stable once set
const setId = (imageSpec) => {
  if (!imageSpec.idCounter) {
    imageSpec.idCounter = 0
  }
  const options = {
    seen: (what, value) => {
      if (['header', 'table', 'graph'].includes(what)) {
        if (!value.id) {
          value.id = `${what}${imageSpec.idCounter += 1}`
        }
      }
    }
  }
  traverseImpl(imageSpec, options)
}

const addColumns = (imageSpec, field, columns) => {
  // imageSpec = _.cloneDeep(imageSpec)
  const options = {
    seen: (what, value) => {
      if (['table'].includes(what)) {
        const table = value
        if (_.isEqual(field, (table.field || []))) {
          for (const column of columns) {
            const fieldName = `$${column}`
            if (!table.rows.find( (value) => value == fieldName )) {
              table.rows.push(fieldName)
              table.colgroups.push(`column_${table.headers.columns.length}`)
              table.headers.columns.push({ text: column, id: column })
            }
          }
        }
      }
    }
  }
  traverseImpl(imageSpec, options)
}

const selecting = (selectingWhat, imageSpec) => {
  setId(imageSpec)
  const counts = count(imageSpec)
  console.log('counts', JSON.stringify(counts))
  const options = {
    seen: (what, value) => {
      if (what == selectingWhat) {
        if (!value.selecting) {
          value.selecting = [
            {
              "id": "header",
              "name": "X",
              "className": "header"
            }
          ]
          if (counts.header > 1) {
            value.selecting.push({
              "id": value.id,
              "name": "X",
              "className": value.id
            })

          }
        }
      } else if (!selectingWhat) {
        delete value.selecting
      }
    }
  }
  traverseImpl(imageSpec, options)
}

const addGroup = (imageSpec, fields) => {
  // TODO handle mulitple fields
  const field = fields[0]
  const options = {
    seen: (what, value) => {
      if (['table'].includes(what)) {
        const oldImageSpec = {...imageSpec}
        const newImageSpec = {
          headers: {
            columns: [{ text: field.word }, { text: field.collection }]
          },
          colgroups: ['c1', 'c2'],
          table: true,
          field: [],
          rows: [
                  `$${field.word}`,
                  { ...oldImageSpec, field: [field.collection] },
          ],
        }
        console.log('oldImageSpec', JSON.stringify(oldImageSpec, null, 2))
        Object.assign(imageSpec, newImageSpec)
        return true
      }
    }
  }
  traverseImpl(imageSpec, options)
}

const getProperties = (imageSpec) => {
  const properties = []
  const options = {
    seen: (what, value) => {
      if (['table'].includes(what)) {
        debugger
        for (const field of value.rows) {
          if (typeof field == 'string') {
            properties.push(field.slice(1))
          }
        }
      }
    }
  }
  traverseImpl(imageSpec, options)
  return properties
}

const traverseImpl = (imageSpec, options = {}) => {
  if (imageSpec.type) {
    // TODO later alligator
    options.seen('graph', imageSpec)
  } else if (imageSpec.table) {
    const stop = options.seen('table', imageSpec)
    // rows is the values to be traverseImpld rather than traverseImpld over the rows of the data
    if (imageSpec.headers.columns.length > 0) {
      options.seen('header', imageSpec.headers)
    }
    if (stop) {
      return
    }
    if (imageSpec.explicit) {
      imageSpec.rows.map((is) => traverseImpl(is, options))
    } else {
      traverseImpl(imageSpec.rows, options)
    }
  } else if (Array.isArray(imageSpec)) {
    const values = []
    for (const [index, field] of imageSpec.entries()) {
      values.push({ className: `column column_${index}`, data: traverseImpl(field, options) })
    }
    return values
  } else {
    /*
    if (imageSpec.startsWith("$")) {
    } else {
    }
    */
  }
}

module.exports = {
  instantiate,
  count,
  setId,
  selecting,
  selector,
  countSelected,
  addColumns,
  addGroup,
  getProperties,
}
