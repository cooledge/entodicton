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

const instantiateValue = (path, bspec, rows, instantiation) => {
  const bspecValue = getValue(path, bspec)
  if (bspecValue['$push']) {
    const value = setValue(instantiation, path, [])
    for (const row of rows) {
      value.push(instantiate(bspecValue['$push'], row))
    }
  } else if (bspec.options.xaxis.categories['$first']) {
    setValue(instantiation, path, instantiate(bSpecValue['$first'], rows[0]))
  }
}

const instantiate = (bspec, bson) => {
  if (bspec.type) {
    const instantiation = _.cloneDeep(bspec)
    const rows = bson

    instantiateValue(['options', 'xaxis', 'categories'], bspec, rows, instantiation)
    for (let i = 0; i < bspec.series.length; ++i) {
      instantiateValue(['data'], bspec.series[i], rows, instantiation.series[i])
    }

    return instantiation
  } else if (bspec.table) {
    const instantiation = { headers: bspec.headers, table: true }
    const rows = []
    let field = bson
    for (let name of bspec.field) {
      field = bson[name]
    }
    for (const row of field) {
      rows.push(instantiate(bspec.rows, row))
    }
    instantiation.rows = rows
    return instantiation
  } else if (Array.isArray(bspec)) {
    const values = []
    for (const field of bspec) {
      values.push(instantiate(field, bson))
    }
    return values
  } else {
    if (bspec.startsWith("$")) {
      return bson[bspec.slice(1)]
    } else {
      return bspec
    }
  }
}

module.exports = {
  instantiate
}
