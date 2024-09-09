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

const instantiate = (imageSpec, ...args) => {
  setId(imageSpec)
  return instantiateImpl(imageSpec, ...args)
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
    const instantiation = { 
      headers: { 
        className: 'header', 
        selecting: imageSpec.headers.selecting, 
        data: imageSpec.headers.columns.map((column) => { 
          return { className: '', selecting: column.selecting, data: column.text } 
        })
      }, 
      rules: imageSpec.rules,
      colgroups: imageSpec.colgroups, 
      table: true 
    }
    if (imageSpec.headers.id) {
      instantiation.headers.className += ' ' + imageSpec.headers.id
    }
    console.log('init instantiation imagespec', JSON.stringify(imageSpec, null, 2))
    console.log('init instantiation instantation', JSON.stringify(instantiation, null, 2))
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
      instantiation.selecting = imageSpec.selecting
      const rows = []
      let field = bson
      for (let name of imageSpec.field) {
        field = bson[name]
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
      values.push({ className: `column column_${index}`, data: instantiateImpl(field, bson, options) })
    }
    return values
  } else {
    if (imageSpec.startsWith("$")) {
      if (options.isGraph) {
        return bson[imageSpec.slice(1)]
      } else {
        return { className: 'fieldValue', data: bson[imageSpec.slice(1)] }
      }
    } else {
      return { className:'fieldConstant', data: imageSpec }
    }
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

const traverseImpl = (imageSpec, options = {}) => {
  if (imageSpec.type) {
    // TODO later alligator
    options.seen('graph', imageSpec)
  } else if (imageSpec.table) {
    options.seen('table', imageSpec)
    // rows is the values to be traverseImpld rather than traverseImpld over the rows of the data
    if (imageSpec.headers.columns.length > 0) {
      options.seen('header', imageSpec.headers)
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
}
