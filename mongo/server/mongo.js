const { Config, knowledgeModule, where } = require('theprogrammablemind')
const { helpers, ordinals, defaultContextCheck, colors, negation, hierarchy, nameable, countable, math, ui } = require('tpmkms')
const mongo_tests = require('./mongo.test.json')
const instance = require('./mongo.instance.json')
const _ = require('lodash')
const data = require('./data')
const image = require('./image')
const report = require('./report')
const { getFields, terminate } = require('./data')
const { getReportElements } = require('./mongo_helpers')
// const { countSelected, selecting, selector, count } = require('./image')

const dd22 = {
        "dbName": "sample_mflix",
        "collectionName": "movies",
        "aggregation": [
          {
            "$unwind": "$genres"
          },
          {
            "$group": {
              "_id": "$genres",
              "genres": {
                "$first": "$genres"
              },
              "movies": {
                "$addToSet": {
                  "title": "$title"
                }
              }
            }
          },
          {
            "$addFields": {
              "count": {
                "$size": "$movies"
              }
            }
          },
          {
            "$sort": {
              "genres": 1
            }
          }
        ]
      }

/*

  for the first table ... (set default table)

  default sort is ascending => default class is instance value

  have UI hooked up so voice can manipuate that

  what collections are there / show all the collections

  show the last/previous/other report

  search the descirpton for blach blach blah

  always show all the fields

  in/for the users collection, show the name and ....

  capitalize the header
  make a new report
  always capitalize the header
  capitalize all headers
  capitalize the users header
  capitalize the column 1 header
  capitalize everything
  capitalize the names
  call that 'the cool image'
  for column 1 make the background blue and the text red
  for the header of column 1 make the color green / the color should be green / i want the color green / make it green

  the report called banana / the report with more than three columns...

  make the header's background blue
  make the users table background blue
  make the users green
  make that blue
  make the text blue
  make the text of that blue

  stop making the headers blue
  make the headers not blue

  show all the users table fields
  remove column X through Y

  add the users collection
  also show the users collection

  make the header green\n no the background
  pick the header color
  cancel that (selecting)

  show the previous/last report/show the one before/the report before

  sales is price times quantity show the sales

  call the title column name

  repeat that
  do that again
  again
 */

const stateToCSS = (isA, property, state) => {
  if (isA(state.marker, 'color_colors')) {
    return `{ ${property}: ${ state.value.slice(0, -"_colors".length) }; }`
  }
  if (isA(state.marker, 'case')) {
    return `{ ${property}: ${state.value}; }`
  }
}

class API {
  initialize(args) {
    this.args = args
    this.objects = this.args.objects

    // these are just for testing
    this.objects.show = []
    this.objects.select = []
    this.objects.lastResponse = {}
    this.objects.namedReports = {}
    this.objects.idToCounter = {}
  }
        
  getId(tag) {
    if (!this.objects.idToCounter[tag]) {
      this.objects.idToCounter[tag] = 0
    }
    return `${tag}_${this.objects.idToCounter[tag] += 1}`
  }

  current() {
    return this.args.mentions({ context: { marker: 'report' } }) || this.newReport()
  }

  setCurrent(report) {
    this.args.km('stm').api.mentioned({ context: report })
  }

  addRecordCountsToDataSpec(dataSpec, context) {
    if (!dataSpec.countFields) {
      dataSpec.countFields = []
    }
    if (dataSpec.groupFields?.length > 0) {
      const fieldName = context.path[0]
      console.log("dataSpec", JSON.stringify(dataSpec, null, 2))
      dataSpec.countFields.push(fieldName)
      const setName = `${fieldName}Set`
      dataSpec.aggregation[1].$group[setName] = { "$addToSet": { [setName]: `$${fieldName}` } }
      if (dataSpec.countFields.length == 1) {
        dataSpec.aggregation.splice(2, 0, {
          "$addFields": {
            [`the size of ${setName}`]: {
              "$size": `$${setName}`,
            }
          }
        })
      } else {
        dataSpec.aggregation[2].$addFields[`the size of ${setName}`] = { "$size": `$${setName}`, }
      }
      dataSpec.aggregation[3].$project[`the size of ${setName}`] = 1
      return [{ field: `the size of ${setName}`, context }]
    } else {
      const fieldNames = []
      for (const field of this.args.values(context)) {
        const fieldName = `the number of ${field.text}`
        dataSpec.countFields.push(fieldName)
        const fieldProp = field.path[0]
        const aggregation = { $addFields: { [fieldName]: { '$size': '$' + fieldProp }  } }
        dataSpec.aggregation.push(aggregation)
        fieldNames.push({ field: fieldName, context })
      }
      return fieldNames
    }
  }

  async determineCollection(columns) {
    const found = []
    let max = 0
    for (let column of columns) {
      if (!column.path) {
        continue
      }
      const columnName = column.path[0]
      const dbs = this.objects.columnToCollection[columnName]
      for (const { database, collection } of dbs) {
        let choice = found.find((choice) => choice.database == database && choice.collection == collection)
        if (!choice) {
          choice = { database, collection, columns: [] }
          found.push(choice)
        }
        choice.columns.push(columnName)
        max = Math.max(max, choice.columns.length)
      }
    }
    // TODO Handle multiple table/no table case/column not in current table/columns in multiple tables
    const bestGuess = found.find((choice) => choice.columns.length == max)
    const database = bestGuess.database
    const collection = bestGuess.collection
    const columnNames = bestGuess.columns
    return { database, collection, columnNames }
  }

  async graph(title, columns, type='bar') {
    const api = this
    const values = this.args.values
    columns = values(columns)
    console.log(JSON.stringify(columns, null, 2))
    const isNumber = (column) => {
      if (column.marker == 'recordCount') {
        return true
      }
    }
    const categories = columns.filter( (column) => !isNumber(column) )
    const numbers = columns.filter( (column) => isNumber(column) )

    const { database, collection, columnNames } = await api.determineCollection(columns)
    const subReport = await api.newReportSpec(database, collection)
    report.addGroup(subReport.dataSpec, categories.map((field) => field.path[0]))
    console.log("subReport.dataSpec", JSON.stringify(subReport.dataSpec, null, 2))

    const numberFields = []
    for (const number of numbers) {
      for (const field of values(number.field)) {
        numberFields.push(field)
      }
    }
    const countFields = []
    for (const field of numberFields) {
      const cf = api.addRecordCountsToDataSpec(subReport.dataSpec, field)
      countFields.push(...cf)
    }
    console.log("subReport.dataSpec", JSON.stringify(subReport.dataSpec, null, 2))
    const output = await data.instantiate(subReport.dataSpec)
    console.log("data", JSON.stringify(output, null, 2))
    subReport.imageSpec = {
      type,
      title,
      options: {
        chart: {
          id: 'apexchart-example'
        },
        xaxis: {
          categories: { "$push": `$${categories[0].path[0]}` },
        }
      },
      series: countFields.map((countField) => { return {
                  name: countField.context.text,
                  data: { "$push": `$${countField.field}` },
                }
              })
    }
   
    if (false) {
      api.show(subReport)
    } else {
      const currentReport = api.current()
      report.addReport(api, currentReport, subReport)
      api.show(currentReport)
    }
  }

  async showFieldsResponse(dataSpecPath, database, collection, fields, report = null) { 

    const selected = {}

    if (report) {
      let counter = 1
      const options = {
        seen: (what, value) => {
          if (['table'].includes(what) && _.isEqual(dataSpecPath, value.field)) {
            for (const column of value.headers.columns) {
              selected[column.id] = counter
              counter += 1
            }
          }
        }
      }

      image.traverseImpl(report.imageSpec, options)
    }

    this.addResponse({ chooseFields: {
      title: `Select the fields from the ${collection} collection in the ${database}`,
      choices: fields.map((field) => { return { text: field.name, id: field.name, selected: selected[field.name], counter: selected[field.name] } }),
      dataSpecPath,
      ordered: true,
    }})
  }

  show(report) {
    // this.args.km('stm').api.mentioned({ marker: 'report', ...report })
    this.objects.show.push(report)
    console.log('show -----------', JSON.stringify(report, null, 2))
    this.addResponse({ report })
  }

  clear() {
    this.newReport()
    this.addResponse({ clear: true })
    this.objects.idToCounter = {}
  }

  /*
  // report is a context
  nameReport(report, name) {
    this.objects.namedReports[name] = report
    if (!report.names) {
      report.names = []
    }
    report.names.push(name)
    this.addResponse({ reportNames: this.getReportNames() })
  }
  */

  addResponse(response) {
    Object.assign(this.objects.lastResponse, response)
  }

  /*
  getNamedReport(name) {
    return this.objects.namedReports[name]
  }

  getReportNames() {
    const current = this.current()
    console.log('getReportNames current', JSON.stringify(current, null, 2))
    return Object.keys(this.objects.namedReports).map( (name) => { 
      const selected = (current.names || []).includes(name)
      return { name, selected, id: name } 
    })
  }
  */

  getReportNames() {
    const stm = this.args.kms.stm.api
    const nameable = this.args.kms.nameable.api
    const reports = stm.mentions({ context: { marker: 'report' }, all: true })
    const names = []
    const currentNames = nameable.getNames(this.current())
    for (const report of reports) {
      for (const name of nameable.getNames(report)) {
        const selected = currentNames.includes(name)
        names.push({ name, selected, id: name })
      }
    }
    return names
  }

  selectReport(name) {
    const report = this.args.kms.nameable.api.get({ marker: 'report' }, name)
    this.setCurrent(report)
    this.show(report)
  }

  clearLastResponse() {
    this.objects.lastResponse = {}
  }

  lastResponse() {
    return this.objects.lastResponse
  }

  async setDataSpec(dataSpec, dbName, collectionName, columnNames = []) {
    const fields = await getFields(dbName, collectionName)
    Object.assign(dataSpec, {
        dbName: dbName,
        collectionName: collectionName,
        fields,
        usedFields: columnNames,
        limit: 10,
        aggregation: [] 
    })
  }

  async newReportSpec(dbName, collectionName, columns = [], properties = []) {
    const dataSpec = {}
    await this.setDataSpec(dataSpec, dbName, collectionName, columns.map( ({id}) => id))
    
    const imageSpec = {
      headers: {
        columns,
      },
      colgroups: properties.map( (e, i) => `column_${i}` ),
      table: true,
      id: this.getId('table'),
      field: [],
      // rows: ['$name', '$age', '$fav_colors'],
      rows: properties.map( (property) => property.path.map((p) => '$'+p).join('.') )
    }

    return {
      marker: 'report',
      dataSpec,
      imageSpec,
    }
  }

  newReport() {
    const report = { 
      marker: 'report', 
      dataSpec: {}, 
      imageSpec: {
        rules: [],
      } 
    }
    report.addRule = (rule) => {
      if (!report.imageSpec.rules) {
        report.imageSpec.rules = []
      }
      if (!report.imageSpec.rules.includes(rule)) {
        report.imageSpec.rules.push(rule)
      }
    }
    report.removeRule = (rule) => {
      if (!report.imageSpec.rules) {
        report.imageSpec.rules = []
      }
      if (report.imageSpec.rules.includes(rule)) {
        report.imageSpec.rules = report.imageSpec.rules.filter( (r) => r !== rule )
        return true
      }
    }
    this.args.km('stm').api.mentioned({ context: report })
    return report
  }
}

let configStruct = {
  name: 'mongo',
  operators: [
    "([graphAction|graph] (column/*))",
    "([clear|clear,reset,restart])",
    // "([call] ([nameable]) (name))",
    "([reportable])",

    "([forTable|for] (table/*))",

    "([sortByColumns|sort,order] (table/*)? ([sortBy|by] ([column])))",
    "([groupByColumns|group,grouped] ([groupBy|by] ([column])))",
    "(([recordCount|number,count]) [ofDbProperty|of] (reportable/* || column/*))",
    // "([moveColumn|move] (column/*) (direction/*))",
    "([make] ([report]))",
    "([makeGraph|make] (graph/* || chart/*) ([makeGraphOf|of]) (column/*))",
    // "([changeState|make] ([reportElement]) (color_colors/*))",
    // table 1 header background blue
    "([state])",
    "([changeState|make] ([reportElement]) (table/*)? (state/*))",

    "([collection])",

    "([reportElementProperty])",
    "([reportElementContext])",

    "((reportElement/*) [contextOfReportElement|of] (reportElementContext/*))",

    // report elements
    "((reportElement/* && !@<color_colors && !@<case) [compoundReportElement] (reportElement/* && !@<color_colors && !@<case))",
    "([background])",
    "([header])",
    "([table])",


    "([column])",

    // make the sentence "upper and lower are kinds of cases" work for this
    "([case])",
    "([uppercase])",
    "([lowercase])",

    "([show] (reportable/*))",
    "([showCollection|show] (collection/*))",
    "([showReport|show] (report/*))",
    "([showColumn|show,add,include,change,update,select] (column/*) ([columnAddedTo|to,on] (collection/* || table/*))?)",
    "([capitalize] ([reportElement]))",
    "([sales|])",
    // "([year])",
    // "([email])",
    // "([genre|])",

    // "([movie])",
    // "([this])",
    "([thisReportElement|this] (reportElement/*))",
  ],
  hierarchy: [
    ['color_colors', 'state'],
    ['case', 'state'],
    ['color_colors', 'reportElement'],
    ['case', 'reportElement'],
  ],
  semantics: [
    {
      match: ({context}) => context.frameOfReference && context.evaluate,
      apply: ({context}) => {
        const value = mentions({ context: { marker: 'table' }, frameOfReference: currentReport })
        context.evalue = value
      },
    }
    ,
    {
      match: ({context}) => context.marker == 'move' && !context.evaluate,
      apply: async ({context, api, values, e}) => {
        const table = (await e(context.moveable)).evalue
        if (table) {
          console.log('table', JSON.stringify(table, null, 2))
          const direction = context.direction.value
          let distance = context.direction.steps?.value || 1
          if (direction == 'up') {
            distance *= -1
          }
          for (const moved of values(table.value)) {
            image.moveUpOrDown(table.report.imageSpec, moved, distance)
          }
        }
        api.show(table.report)
      },
    },
    {
      match: ({context}) => context.marker == 'call' && context.nameable.marker == 'table',
      apply: async ({context, mentioned, api, values, e}) => {
        const table = (await e(context.nameable)).evalue
        if (table) {
          table.value.marker = 'table'
          mentioned({ context: table.value, frameOfReference: table.report })
          const name = context.name.map((n) => n.text).join(' ')
          table.value.value[0].title = name
        }
        api.show(table.report)
      }
    },
  ],

  bridges: [
    // "((reportElement/*) [contextOfReportElement|of] ([reportElementContext]))",
    {
      id: 'collection'
    },

    {
      id: 'reportElementContext'
    },

    {
      id: 'contextOfReportElement',
      isA: ['preposition'],
      bridge: "{ ...before[0], root: before[0], of: operator, frameOfReference: after[0], generate: ['root', 'of', 'frameOfReference'] }",
    },

    // "([makeGraph|make] (graph/* || chart/*) ([makeGraphOf|of]) (reportable/*))",
    {
      id: 'makeGraphOf',
      isA: ['preposition'],
      bridge: "{ ...next(operator) }",
    },

    {
      id: 'makeGraph',
      isA: ['verb'],
      bridge: "{ ...next(operator), type: after[0], of: after[1], columns: after[2], operator: operator, generate: ['operator', 'type', 'of', 'columns'] }",
      semantic: async ({context, api}) => {
        await api.graph(context.columns.text, context.columns, context.type.marker.split('_')[0])
      }
    }
    ,
    {
      id: 'forTable',
      isA: ['preposition'],
      bridge: "{ ...next(operator), table: after[0], postModifiers: ['table'] }",
      semantic: async ({context, e, mentioned}) => {
        const destination = (await e(context.table)).evalue
        if (destination) {
          destination.value.marker = 'table'
          mentioned({ context: destination.value, frameOfReference: destination.report })
        }
      },
    },
    { 
      id: 'graphAction',
      isA: ['verb'],
      bridge: "{ ...next(operator), columns: after[0] }",
      generatorp: async ({context, word, g}) => `${context.word} ${await g(context.columns)}`,
      semantic: async ({context, api, values}) => {
        await api.graph(context.columns.text, context.columns)
      }
    },
    {
      id: 'clear',
      isA: ['verb'],
      bridge: "{ ...next(operator) }",
      semantic: ({context, api}) => {
        api.clear()
      }
    },

    { 
      id: 'recordCount',
      isA: ['column', 'theAble'],
      bridge: "{ ...next(operator) }",
    },
    { 
      id: 'ofDbProperty',
      isA: ['preposition'],
      generatorp: ({context, g}) => `number of ${g(field)}`,
      bridge: "{ ...next(before[0]), of: operator, count: true, field: after[0], number: after[0].number, postModifiers: ['of', 'field'] }",
    },
    { 
      id: 'sortBy',
      localHierarchy: [['column', 'unknown']],
      isA: ['preposition'],
      bridge: "{ ...next(operator), field: after[0], postModifiers: ['field'] }",
    },

    { 
      id: 'groupBy',
      localHierarchy: [['column', 'unknown']],
      isA: ['preposition'],
      generatorp: async ({context, g}) => `${context.word} ${await g(context.field)}`,
      bridge: "{ ...next(operator), field: after[0] }",
    },

    { 
      // TODO stop sorting by ... stop sorting
      id: 'sortByColumns',
      // optional: { table: "{ marker: 'table', pullFromContext: true }" },
      optional: { 1: "{ marker: 'table', pullFromContext: true }" },
      isA: ['verb'],
      bridge: "{ ...next(operator), table: after[0], field: after[1], postModifiers: ['field'] }",
      semantic: async ({context, e, api, values}) => {
        const currentReport= api.current()
        const defaultTable = (await e(context.table)).evalue
        const fields = helpers.propertyToArray(context.field.field)
        if (defaultTable) {
          const paths = []
          for (const table of values(defaultTable.value)) {
            if (!paths.find( (path) => _.isEqual(path, table.field))) {
              paths.push(table.field)
            }
          }
          for (const path of paths) {
            const dataSpec = data.getValue(currentReport.dataSpec, path)
            report.addSort(dataSpec, fields)
          }
        } else {
          report.addSort(currentReport.dataSpec, fields)
        }
        api.show(currentReport)
      }
    },

    { 
      // TODO stop sorting by ... stop sorting
      id: 'groupByColumns',
      isA: ['verb'],
      bridge: "{ ...next(operator), field: after[0], postModifiers: ['field'] }",
      semantic: ({context, api}) => {
        const currentReport= api.current()
        const fields = helpers.propertyToArray(context.field.field)
        // account for name errors like saying genre but the field is genres
        const dataSpecPath = [0]
        const dataSpec = data.getValue(currentReport.dataSpec, dataSpecPath)
        report.addGroup(dataSpec, fields.map((field) => field.word))
        for (const imageSpec of image.getImageSpecs(currentReport.imageSpec, dataSpecPath)) {
          image.addGroup(api, dataSpecPath, imageSpec, fields.map((field) => { return { name: field.word, collection: dataSpec.collectionName } }))
        }
        api.show(currentReport)
      }
    },

    { 
      id: 'column',
      isA: ['countable', 'comparable'],
      words: [...helpers.words('column'), ...helpers.words('field'), ...helpers.words('property')],
    },

    {
      id: 'case',
      words: helpers.words('case'),
      isA: ['reportElementProperty'],
    },
    {
      id: 'uppercase',
      words: helpers.words('upper', { value: 'uppercase' }),
      isA: ['case'],
    },
    {
      id: 'lowercase',
      words: helpers.words('lower', { value: 'lowercase' }),
      isA: ['case'],
    },

    { 
      id: 'reportElementProperty', 
    },

    { 
      id: 'compoundReportElement', 
      convolution: true,
      isA: ['reportElement', 'theAble'],
      bridge: "{ ...next(operator), reportElements: append(default(before[0].reportElements, [before[0]]), default(after[0].reportElements, [after[0]])) }",
      generatorp: ({context, gs}) => gs(context.reportElements),
    },
    { 
      id: 'make', 
      bridge: "{ ...next(operator), report: after[0] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => `make ${await g(context.report)}`,
      semantic: ({context, km, api}) => {
        api.newReport()
      },
    },

    { 
      id: 'state', 
      bridge: "{ ...next(operator) }",
    },

    { 
      id: 'thisReportElement', 
      parents: ['articlePOS'],
      bridge: "{ ...next(after[0]), modifiers: append(['this'], after[0].modifiers), this: operator }",
    },

    { 
      id: 'changeState', 
      bridge: "{ ...next(operator), reportElement: after[0], table: after[1], newState: after[2] }",
      optional: { 2: "{ marker: 'table', pullFromContext: true }" },
      parents: ['verb'],
      generatorp: async ({context, g}) => `make ${await g(context.reportElement)} ${await g(context.newState)}`,
      semantic: async ({e, values, context, km, api, isA}) => {
        const getProperty = (reportElements, state) => {
          let property;
          for (const re of reportElements) {
            if (isA(re.marker, 'reportElementProperty')) {
              if (re.marker == 'background') {
                property = 'background-color' 
                break;
              } if (isA(re.marker, 'case')) {
                property = 'text-transform' 
                break;
              } if (re.marker == 'color') {
                property = 'color' 
                break;
              }
            }
          }
          if (!property) {
            if (isA(state.marker, 'color_colors')) {
              return 'color'
            }
            if (isA(state.marker, 'case')) {
              return 'text-transform'
            }
          }
          return property
        }
        const currentReport = api.current()
        const counts = image.count(currentReport.imageSpec)
        console.log('currentReport-----------------', JSON.stringify(currentReport, null, 2))
        console.log('counts-----------------', JSON.stringify(counts, null, 2))
        if (context.selected) {
          image.selecting(null, currentReport.imageSpec)
          const reportElements = getReportElements(currentReport.select.reportElement)
          const property = getProperty(reportElements, context.newState)
          currentReport.addRule(`${context.selected.selected.className} ${stateToCSS(isA, property, context.newState)}`)
        } else {
          const reportElements = getReportElements(context.reportElement)
          const lastContext = reportElements.slice(-1)[0]
          const isPlural = lastContext.number == 'many'
          const state = context.newState
          const property = getProperty(reportElements, state)
          const css = stateToCSS(isA, property, state)

          let tables = []
          if (context.reportElement.frameOfReference) {
            console.log("for", JSON.stringify(await e(context.reportElement.frameOfReference).evalue, null, 2))
            const mentioned = await e(context.reportElement.frameOfReference)
            tables = values(await mentioned.evalue.value || [])
            console.log('tables', JSON.stringify(tables, null, 2))
          }

          if (tables.length > 0) {
            for (const table of tables) {
              const selector = image.selector(table, reportElements)
              if (css) {
                if (state.negated) {
                  currentReport.removeRule(`${selector} ${css}`)
                } else {
                  currentReport.addRule(`${selector} ${css}`)
                }
              }
            }
          } else if (isPlural || image.countSelected(currentReport.imageSpec, reportElements) == 1) {
          // } else if (context.reportElement.modifier_selected) {
            // make sure the state exactely matches correct CSS because the delete "make the header not blue' needs that
            // const table = (await e(context.table)).evalue
            const selector = image.selector(currentReport.imageSpec, reportElements)
            if (css) {
              if (state.negated) {
                currentReport.removeRule(`${selector} ${css}`)
              } else {
                currentReport.addRule(`${selector} ${css}`)
              }
            }
          } else {
            image.selecting('header', currentReport.imageSpec)
            if (!currentReport.imageSpec.rules) {
              currentReport.imageSpec.rules = []
            }
            currentReport.imageSpec.rules.push(`.highlight ${css}`)
            currentReport.select = context
          }
        }
        api.show(currentReport)
      },
    },

    {
      id: 'capitalize',
      parents: ['verb'],
      bridge: "{ ...next(operator), element: after[0] }",
      generatorp: async ({context, gp}) => `${context.word} ${await gp(context.element)}`,
      semantic: ({context, mentions, api}) => {
        const report = api.current()
        if (context.element.marker == 'header') {
          report.imageSpec.capitalizeHeader = true
          if (report.imageSpec.explicit) {
            report.imageSpec.rows.forEach( (row) => {
              row.forEach( (column) => {
                column.capitalizeHeader = true
              })
            })
          }
          api.show(report)
        } else if (context.element.marker == 'this') {
          if (context.selected) {
            console.log('the user selected', context.selected)
            const imageSpec = report.imageSpec
            report.addRule(`.${context.selected.selected} { text-transform: capitalize; }`)
            imageSpec.headers.selecting = null
            imageSpec.headers.columns.forEach( (column) => column.selecting = null )
            api.show(report)
          } else {
            /*
            const headerIds = []
            for (let ctr = 0; ctr < report.imageSpec.headers.length; ++ctr) {
              headerIds.push(['report', 0, 'header', ctr])
            }
            */
            if (report.imageSpec.headers) {
              report.imageSpec.headers.columns.forEach( (column, index) => {
                column.selecting = [{ id: `column_${index}`, name: 'X', className: `column_${index}` }]
              })
              report.imageSpec.headers.selecting = [{ id: 'header', name: 'X', className: 'header' }]
            }
            /*
            report.imageSpec.selecting = {
              headers: {
                each: headerIds,
                all: [0, 'header'],
              },
            }
            */
            report.select = context
            console.log("after capitalize", JSON.stringify(report, null, 2))
            api.show(report)
          }
        }
      },
    },

    { 
      id: 'this',
      parents: ['reportElement']
    },

    { id: 'reportElement' },

    { 
      id: 'header', 
      words: helpers.words('header'),
      parents: ['theAble', 'reportElement'],
    },

    { 
      id: 'background', 
      words: helpers.words('background'),
      parents: ['theAble', 'reportElement', 'reportElementProperty'],
    },

    { 
      id: 'table', 
      words: helpers.words('table'),
      isA: ['orderable', 'reportElementContext', 'moveable'],
      parents: ['theAble', 'reportElement', 'nameable'],
      evaluator: async ({context, toContext, values, api, gp, verbatim}) => {
        const currentReport = api.current()
        if (context.ordinal) {
          const tables = image.getTables(currentReport.imageSpec)
          const ordinals = values(context.ordinal)
          const table = tables[context.ordinal.value-1]
          const selectedTables = ordinals.map( (ordinal) => tables[ordinal.value-1] ).filter( (table) => table )
          console.log('selectedTable', JSON.stringify(selectedTables, null, 2))
          if (!_.isEmpty(selectedTables)) {
            context.evalue = {
              marker: 'table',
              report: currentReport,
              value: toContext(selectedTables)
            }
          } else {
            verbatim(`${await gp(context)} does not exist`)
          }
        }
      }
    },

    { id: 'report',
      parents: ['theAble', 'nameable']
    },

    { id: 'columnAddedTo',
      isA: ['preposition'],
      bridge: "{ ...next(operator), postModifiers: ['destination'], destination: after[0] }",
    },

    { id: 'showColumn',
      optional: { 2: "{ marker: 'undefined' }" },
      bridge: "{ ...next(operator), show: after[0], to: after[1] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => {
        if (context.to && context.to.marker !== 'undefined') {
          return `${context.word} ${await g(context.show)} ${await g(context.to)}`
        } else {
          return `${context.word} ${await g(context.show)}`
        }
      },
      semantic: async ({e, mentions, values, context, kms, api, objects}) => {
        let currentReport = api.current()
        if (context.chosens) {
          const chosens = context.chosens[0]
          // chosens.serverResponse.chooseFields.dataSpecPath
          // report.updateColumns(currentReport, currentReport.dataSpec.dbName, currentReport.dataSpec.collectionName, context.chosens[0])
          report.updateColumnsNew(currentReport, chosens)
          api.show(currentReport)
        } else if (context.show.quantity?.value == 'all') {
          // dataSpec[0] -> select report to update greg98
          const dataSpecPath = [0]
          const dataSpec = data.getValue(currentReport.dataSpec, dataSpecPath)
          const { dbName, collectionName, fields } = dataSpec
          // '{"chosen":"select","choices":[{"text":"_id","id":"_id"},{"text":"name","id":"name","selected":true,"counter":1},{"text":"email","id":"email","selected":true,"counter":2},{"text":"password","id":"password"}]}'
          const choices = []
          let counter = 1
          for (const field of fields) {
            choices.push({ text: field.name, id: field.name, counter, selected: true })
            counter += 1
          }
          // report.updateColumns(currentReport, dataSpec.dbName, dataSpec.collectionName, { 'chosen': 'select', choices })
          report.updateColumnsNew(currentReport, { 'chosen': 'select', choices, serverResponse: { chooseFields: { dataSpecPath } } })
          api.show(currentReport)
        } else if (context.show.more || (context.show.marker == 'column' && !context.show.path)) {
          console.log('currentReport', JSON.stringify(currentReport, null, 2))
          // dataSpec[0] -> select report to update greg98
          const { dbName, collectionName, fields } = currentReport.dataSpec[0]
          await api.showFieldsResponse([0], dbName, collectionName, fields, currentReport)
          context.chosens = [] // for callback
          currentReport.showCollection = context
        } else if (context.show.less) {
        } else if (context.show.marker == 'recordCount') {
          // dataSpec[0] -> select report to update greg98
          const fieldNames = api.addRecordCountsToDataSpec(currentReport.dataSpec[0], context.show.field).map( (f) => f.field )
          report.addColumns(currentReport.dataSpec, currentReport.imageSpec, currentReport.dataSpec.dbName, currentReport.dataSpec.collectionName, fieldNames)
          api.show(currentReport)
        } else {
          let dataSpecPath

          // TODO add a the email column called contact
          let defaultTable
          if (context.to && context.to.marker == 'columnAddedTo') {
            console.log("context.to.destination", JSON.stringify(context.to.destination, null, 2))
            const destination = (await e(context.to.destination)).evalue
            console.log("destination", JSON.stringify(destination, null, 2))
            // TODO handle not found
            defaultTable = destination
            // currentReport = destination.report
            // dataSpecPath = destination.value.field
          } else {
            // const table = mentions({ context: { marker: 'table' }, banana: 23, frameOfReference: currentReport })
            const args = { context: { marker: 'table' }, frameOfReference: currentReport }
            defaultTable = mentions(args)
            if (defaultTable) {
              // dataSpecPath = defaultTable.field
            } else {
              dataSpecPath = Array.isArray(currentReport.dataSpec) ? [0] : []
            }
          }

          const someFunction = async (context, defaultTable, currentReport, dataSpecPath) => {
            let dataSpec = data.getValue(currentReport.dataSpec, dataSpecPath)
            let database = dataSpec.dbName
            let collection = dataSpec.collectionName

            const columns = values(context.show)
            // dataSpec[0] -> select report to update greg98
            // db -> collection -> columns
            let columnNames = []

            let hasArray = false
            if (database) {
              columnNames = [context.show.path[0]]
            } else {
              ({ database, collection, columnNames } = await api.determineCollection(columns))
              currentReport = await api.newReportSpec(database, collection)
              dataSpecPath = []
              dataSpec = currentReport.dataSpec

              hasArray = false
              for (const columnName of columnNames) {
                hasArray = currentReport.dataSpec.fields.find( (field) => field.name == columnName ).isArray
                if (hasArray) {
                  break
                }
              }
            }
            if (hasArray) {
              await api.setDataSpec(dataSpec, database, collection, columnNames)
              console.log(JSON.stringify(dataSpec, null, 2))
              report.addGroup(dataSpec, columnNames)
              console.log(JSON.stringify(dataSpec, null, 2))
              image.addGroup(api, dataSpecPath, currentReport.imageSpec, columnNames.map((columnName) => { return { name: columnName, collection: collection } }))
            } else {
              dataSpec.usedFields.push(...columnNames)
              if (defaultTable) {
                image.addColumns(defaultTable, dataSpecPath, columnNames)
              } else {
                for (const imageSpec of image.getImageSpecs(currentReport.imageSpec, dataSpecPath)) {
                  // report.addColumns(dataSpec, imageSpec, database, collection, columnNames) 
                  image.addColumns(imageSpec, dataSpecPath, columnNames)
                }
              }
            }
            return currentReport
          }

          if (defaultTable) {
            for (const value of values(defaultTable.value)) {
              console.log("value", JSON.stringify(value, null, 2))
              currentReport = await someFunction(context, value, currentReport, value.field)
            }
          } else {
            currentReport = await someFunction(context, defaultTable, currentReport, dataSpecPath)
          }
          api.show(currentReport)
        }
      },
    },

    { id: 'showReport',
      bridge: "{ ...next(operator), show: after[0] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => `show ${await g(context.show)}`,
      semantic: async ({context, kms, api}) => {
        const name = context.show.value
        const report = kms.nameable.api.get({ marker: 'report' }, name)
        api.setCurrent(report)
        api.show(report)
      },
    },

    { id: 'showCollection',
      bridge: "{ ...next(operator), show: after[0] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => `show ${await g(context.show)}`,
      semantic: async ({context, isA, km, mentions, api, flatten}) => {
        console.log("in show collection")
        let currentReport = api.newReport()
        if (context.chosens) {
          console.log('in chosen', JSON.stringify(context.chosens))
          /*
              < in chosen {
              <   chosen: 'select',
              <   choices: [
              <     { text: '_id', id: '_id' },
              <     { text: 'name', id: 'name', selected: true },
              <     { text: 'email', id: 'email', selected: true },
              <     { text: 'password', id: 'password' }
              <   ]
          */
          const reportable = context.reportables[context.chosens.length-1]
          const chosen = context.chosens[context.chosens.length-1]
          const database = reportable.database
          const collection = reportable.collection

          report.updateColumns(api, currentReport, database, collection, chosen)

          api.show(currentReport)
        } else {
          const reportables = []
          for (const modifier of context.show.modifiers) {
            if (isA(context.show[modifier].marker, 'reportable')) {
              reportables.push(context.show[modifier])
            }
          }
          context.reportables = reportables // save for callback
          const reportable = reportables[0]
          const fields = await getFields(reportable.database, reportable.collection)
          await api.showFieldsResponse([0], reportable.database, reportable.collection, fields)
          context.chosens = [] // for callback
          currentReport.showCollection = context
        }
      }
    },

    { id: 'show',
      bridge: "{ ...next(operator), show: after[0] }",
      // localHierarchy: [['unknown', 'reportable']],
      parents: ['verb'],
      generatorp: async ({context, g}) => `show ${await g(context.show)}`,
      semantic: async ({context, km, mentions, api, flatten, gp}) => {
        const toArray = (context) => {
          if (context.isList) {
            return context.value
          } else {
            return [context]
          }
        }

        const properties = toArray(context.show)

        // split by table
        const components = {}
        for (const property of properties) {
          if (!components[property.database]) {
            components[property.database] = {}
          }
          const dbs = components[property.database]
          if (!dbs[property.collection]) {
            dbs[property.collection] = []
          }
          const collection = dbs[property.collection]
          collection.push(property)
        }

        const dataSpecs = []
        const imageSpecs = []
        // const currentReport = api.newReport()
        const currentReport = api.current()
        let oldWay = false
        for (const dbName in components) {
          for (const collectionName in components[dbName]) {
            const properties = components[dbName][collectionName]
            const columns = []
            for (const column of properties) {
              columns.push({ text: await gp(column), id: column.path[0] })
            }

            if (oldWay) {
              const report = await api.newReportSpec(dbName, collectionName, columns, properties)
              dataSpecs.push(report.dataSpec)
              imageSpecs.push(report.imageSpec)
            } else {
              const subReport = await api.newReportSpec(dbName, collectionName, columns, properties)
              // query.addReport(currentReport, { dataSpec: subReport.dataSpec, imageSpec: subReport.imageSpec })
              report.addReport(api, currentReport, subReport)
            }
          }
        }

        if (oldWay) {
          if (dataSpecs.length == 1) {
            currentReport.dataSpec = dataSpecs[0]
            currentReport.imageSpec = imageSpecs[0]
          } else {
            currentReport.dataSpec = dataSpecs
            for (let i = 0; i < imageSpecs.length; ++i) {
              imageSpecs[i].field = [i]
            }
            currentReport.imageSpec = {
              headers: { columns: [] },
              table: true,
              explicit: true,
              id: api.getId('table'),
              field: [],
              rows: [imageSpecs]
            }
          }
        }
        api.show(currentReport)
      }
    },

    { 
      id: 'sales', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'sales', database: 'mongo_test_database', collection: 'sales', path: ['sales'] } 
      ] 
    },

    /*
    { 
      id: 'year', 
      parents: ['reportable', 'theAble', 'column'], 
      words: [ 
        { word: 'year', path: ['year'] } 
      ] 
    },

    { 
      id: 'genre', 
      parents: ['theAble', 'column'], 
      words: [ 
        { word: 'genres', path: ['genres'] } 
      ] 
    },
    */
  ],
  priorities: [
    { context: [['column', 1], ['list', 0], ['recordCount', 0]], choose: [2] },
    { context: [['column', 1], ['list', 0], ['recordCount', 1], ['ofDbProperty', 0]], ordered: true, choose: [3] },
    // { context: [['ofDbProperty', 0], ['column', 1], ['list', 0], ['column', 1]], choose: [2] },
    { context: [['sortOrdering', 0], ['list', 0]], choose: [0] },
    { context: [['show', 0], ['list', 0]], choose: [1] },
    // { context: [['list', 0], ['year',0], ['ascending', 0]], ordered: true, choose: [2] },
    // { context: [['sortBy', 0], ['column',0], ['list', 0], ['column', 0]], ordered: true, choose: [2] },
    { context: [['sortBy', 0], ['column',0], ['list', 0], ['column', 0], ['ascending', 0]], ordered: true, choose: [4] },
  ],
};

// what are the collections / databases
/*
  // charts are a concept. the types of charts are pie bar and line.
  // define mongodb sales concepts
  // sales is an amount in dollars. sales is in db1.collection1.sales
  // year is in db1.collection1.year

  // show the sales by year in a pie chart

  show <something> by <something> [in/with/using] chart
  show <something> by <something> [in/with/using] chart
  show the sales
  show the sales by year
  show the sales by year in a pie chart

  make a reports
    the columns are x y and z
    show/insert/add total sales
    make it descending by sales
*/ 

const template = {
  configs: [
    {
      query: "column23 is a column",
      isFragment: true,
    },
    {
      query: "modifier23 modifies collection",
      isFragment: true,
    },

    "reportable is a concept",
    "be brief",
    "pie, bar and line modify graph",
    "pie, bar and line modify chart",

    configStruct,

    "selected modifies reportElement",

    async ({objects, addWords, config, s, fragments}) => {
      const fragment = fragments("modifier23 modifies collection")
      const id = 'airbnb'
      const word = 'airbnb'
      const database = 'sample_airbnb'
      const collection = 'listingsAndReviews'
      const field = 'name'
      const collections = [
        { id: 'airbnb', word: 'airbnb', database: 'sample_airbnb', collection: 'listingsAndReviews', field: 'name', },

        { id: 'comment', word: 'comment', database: 'sample_mflix', collection: 'comments', field: 'name', },
        { id: 'user', word: 'user', database: 'sample_mflix', collection: 'users', field: 'name', },
        { id: 'movie', word: 'movie', database: 'sample_mflix', collection: 'movies', field: 'title', },
        // { id: 'customers', word: 'customers', database: 'sample_customers', collection: 'listingsAndReviews', field: 'name', },
      ]

      const addCollection = async ({ id, word, database, collection, field }) => {
        config.addOperator(`([${id}])`)
        config.addBridge(
          { 
            id,
            parents: ['theAble', 'reportable'], 
            words: helpers.words(word, { database, collection, path: [field] }),
          },
        )

        const wordDef = {
          collection,
          database,
          marker: id,
          number: "one",
          path: [ field ],
          text: word,
          word,
        }

        const mappings = [{
          where: where(),
          match: ({context}) => context.value == 'modifier23',
          apply: ({context, cleanAssign}) => cleanAssign(context, wordDef),
        }]
        const instantiation = await fragment.instantiate(mappings)
        await s(instantiation)
        for (const { name } of await getFields(database, collection)) {
          const word = name.replace(/_/g, " ")
          if (!objects.columnToCollection[name]) {
            objects.columnToCollection[name] = []
          }
          objects.columnToCollection[name].push({ database, collection })

          addWords('column', word, { id: 'column', path: [name] })
          // config.addWord(word, { id: 'column', path: ['${f}'] })
        }
      }
      objects.columnToCollection = {}
      for (const collection of collections) {
        await addCollection(collection)
      }
    },
  ],
}


knowledgeModule( { 
  config: { name: 'mongo' },
  includes: [hierarchy, ordinals, colors, negation, nameable, ui, countable, math],
  api: () => new API(),
  terminator: () => {
    terminate()
  },

  module,
  description: 'language access for mongo databases',
  template: { template, instance },
  test: {
    name: './mongo.test.json',
    contents: mongo_tests,
    checks: {
      context: defaultContextCheck,
      objects: [
        'show', 
        'select', 
        'lastResponse', 
        'namedReports', 
        { km: 'stm' }
      ],
    },

  },
})

