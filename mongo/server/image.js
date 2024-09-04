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
      value.push(instantiate(imageSpecValue['$push'], row, options))
    }
  } else if (imageSpec.options.xaxis.categories['$first']) {
    setValue(instantiation, path, instantiate(bSpecValue['$first'], rows[0], options))
  }
}

const instantiate = (imageSpec, bson, options = {}) => {
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
    console.log('init instantiation imagespec', JSON.stringify(imageSpec, null, 2))
    console.log('init instantiation instantation', JSON.stringify(instantiation, null, 2))
    if (imageSpec.explicit) {
      const rows = []
      let field = bson
      for (let name of imageSpec.field) {
        field = bson[name]
      }
      instantiation.rows = { className: 'rows', data: imageSpec.rows.map((is) => instantiate(is, field, options)) }
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
        rows.push({ className: `row_${index}`, data: instantiate(imageSpec.rows, row, options)})
      }
      instantiation.rows = { className: "rows", data: rows }
      return instantiation
    }
  } else if (Array.isArray(imageSpec)) {
    const values = []
    for (const [index, field] of imageSpec.entries()) {
      values.push({ className: `column column_${index}`, data: instantiate(field, bson, options) })
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

module.exports = {
  instantiate
}
