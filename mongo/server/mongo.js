const { Config, knowledgeModule, where } = require('theprogrammablemind')
const { helpers, ordinals, defaultContextCheck, colors, errors, negation, hierarchy, nameable, countable, math, ui } = require('tpmkms')
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

  move the second table up shold change the current table <--------

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
      // console.log("dataSpec", JSON.stringify(dataSpec, null, 2))
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
    // console.log(JSON.stringify(columns, null, 2))
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
    // console.log("subReport.dataSpec", JSON.stringify(subReport.dataSpec, null, 2))

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
    // console.log("subReport.dataSpec", JSON.stringify(subReport.dataSpec, null, 2))
    const output = await data.instantiate(subReport.dataSpec)
    // console.log("data", JSON.stringify(output, null, 2))
    subReport.imageSpec = {
      type,
      title,
      marker: 'graph',
      id: this.getId('graph'),
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
      this.args.mentioned({ context: subReport.imageSpec, frameOfReference: currentReport })
      api.show(currentReport)
    }
  }

  async showFieldsResponse(dataSpecPath, database, collection, fields, report = null) { 

    const selected = {}

    if (report) {
      let counter = 1
      const options = {
        seen: (what, value) => {
          if (['table'].includes(what) && _.isEqual(dataSpecPath, value.dataSpecPath)) {
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
    helpers.pushL(this.objects.show, report, 3)

    // console.log('show -----------', JSON.stringify(report, null, 2))
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
      dataSpecPath: [],
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
    "([delete|delete,remove] ([deletable]))",
    "([graphAction|graph] (column/*))",
    "([clear|clear,reset,restart])",
    // "([call] ([nameable]) (name))",
    "([reportable])",

    "([forTable|for] (table/*))",

    "([sortByColumns|sort,order] (table/*)? ([sortBy|by] ([column])))",
    "([groupByColumns|group,grouped] ([groupBy|by] ([column])))",
    "(([recordCount|number,count]) <ofDbProperty|of> (reportable/* || column/*))",
    // "([moveColumn|move] (column/*) (direction/*))",
    "([make] ([report]))",
    "([makeGraph|make] (graph/* || chart/*) ([makeGraphOf|of]) (column/*))",
    // "([changeState|make] ([reportElement]) (color_colors/*))",
    // table 1 header background blue
    "([state])",
    "([changeState|make] ([reportElement]) (table/*)? (state/*))",

    // change the graph into a pie chart
    "([changeGraph|change] (graph/*) (to/*) (@<graph))",

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

    // "((column/*) [columnNumber] (integer/*))",

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

    ['graph', 'moveable'],
    ['graph', 'orderable'],
    ['graph', 'deletable'],
    ['table', 'deletable'],
  ],
  associations: {
    negative: [
    ],
    positive: [
  //    { context: [['column', 0], ['list', 0], ['column', 0]], choose: 0 },
      // TODO fix the backend so removing article works
      { context: [["make",0],["article",0],["reportElement",0],["ofDbProperty",0],["article",0],["ordinal",0],["table",0],["state",0]], choose: { index: 0, increment: true } },
      { context: [["make",0],["article",0],["reportElement",0],["ofDbProperty",0],["article",0],["ordinal",1],["table",0],["state",0]], choose: { index: 0, increment: true } },

      { context: [["delete",0],["article",0],["ordinal",0],["list",0],["ordinal",0],["column",0],["ofDbProperty",0],["article",0],["ordinal",0],["table",0]], choose: { index: 0, increment: true } },
      { context: [["delete",0],["article",0],["ordinal",1],["list",0],["ordinal",0],["column",0],["ofDbProperty",0],["article",0],["ordinal",0],["table",0]], choose: { index: 0, increment: true } },
      { context: [["delete",0],["article",0],["ordinal",1],["list",0],["ordinal",1],["column",0],["ofDbProperty",0],["article",0],["ordinal",0],["table",0]], choose: { index: 0, increment: true } },
      { context: [["delete",0],["article",0],["ordinal",1],["list",0],["ordinal",1],["column",0],["ofDbProperty",0],["article",0],["ordinal",1],["table",0]], choose: { index: 0, increment: true } },
      { context: [["delete",0],["article",0],["list",1],["column",0],["ofDbProperty",0],["article",0],["ordinal",1],["table",0]], choose: { index: 0, increment: true } },
      { context: [["delete",0],["article",0],["ordinal",1],["column",0],["ofDbProperty",0],["article",0],["ordinal",1],["table",0]], choose: { index: 0, increment: true } },

      { context: [['article', 0], ['recordCount', 0], ['ofDbProperty', 0], ['reportElement', 0]], choose: 1 },
      { context: [['graphAction', 0], ['the', 0], ['column', 0], ['list', 0], ['the', 0], ['recordCount', 0], ['ofDbProperty', 0], ['column', 0], ['list', 0], ['reportable', 0]], choose: { index: 0, increment: true } },
      { context: [['graphAction', 0], ['the', 0], ['column', 0], ['list', 0], ['the', 0], ['recordCount', 0], ['ofDbProperty', 0], ['column', 0], ['list', 0], ['column', 0]], choose: { index: 0, increment: true } },
      { context: [['graphAction', 0], ['the', 0], ['column', 0], ['list', 0], ['the', 0], ['recordCount', 1], ['ofDbProperty', 0], ['column', 0], ['list', 0], ['column', 0]], choose: { index: 0, increment: true } },
      { context: [['graphAction', 0], ['the', 0], ['column', 0], ['list', 0], ['the', 0], ['recordCount', 1], ['ofDbProperty', 0], ['column', 0], ['list', 0], ['reportable', 0]], choose: { index: 0, increment: true } },
      { context: [['graphAction', 0], ['the', 0], ['column', 0], ['list', 0], ['the', 0], ['recordCount', 0], ['ofDbProperty', 0], ['column', 0], ['list', 0], ['collection', 0]], choose: { index: 0, increment: true } },

      { context: [['changeState', 0], ['article', 0], ['reportElement', 0], ['state', 0]], choose: 0 },
      { context: [['article', 0], ['ordinal', 0], ['reportElement', 0], ['state', 0]], choose: 2 },
      { context: [['article', 0], ['ordinal', 0], ['reportElement', 0], ['state', 0]], choose: 2 },

      // TODO fix the backend so I dont need these
      { context: [["delete", 0], ["the", 0], ["ordinal", 0], ["column", 0], ["ofDbProperty", 0], ["the", 0], ["ordinal", 0], ["table", 0]], choose: 0 },
      { context: [["delete", 0], ["the", 0], ["ordinal", 1], ["column", 0], ["ofDbProperty", 0], ["the", 0], ["ordinal", 0], ["table", 0]], choose: 0 },
      { context: [["delete", 0], ["the", 0], ["column", 0], ["ofDbProperty", 0], ["the", 0], ["ordinal", 0], ["table", 0]], choose: 0 },
      { context: [["delete", 0], ["the", 0], ["column", 0], ["ofDbProperty", 0], ["the", 0], ["ordinal", 1], ["table", 0]], choose: 0 },

      { context: [['graphAction', 0], ['column', 0], ['ofDbProperty', 0], ['reportable', 0]], choose: 0 },
      { context: [['graphAction', 0], ['theAble', 0], ['list', 0], ['article', 0], ['theAble', 0]], choose: 0 },
      { context: [['graphAction', 0], ['column', 0], ['list', 0], ['article', 0], ['column', 0]], choose: 0 },
      { context: [['delete', 0], ['the', 0], ['column', 0], ['ofDbProperty', 0], ['the', 0], ['table', 0]], choose: 0 },
      { context: [['delete', 0], ['the', 0], ['column', 1], ['ofDbProperty', 0], ['the', 0], ['table', 0]], choose: 0 },
      { context: [['delete', 0], ['the', 0], ['column', 1], ['ofDbProperty', 0], ['the', 0], ['table', 1]], choose: 0 },
      { context: [['delete', 0], ['column', 0], ['contextOfReportElement', 0], ['table', 0]], choose: 0 },
      { context: [['delete', 0], ['column', 1], ['contextOfReportElement', 0], ['table', 0]], choose: 0 },
      { context: [['delete', 0], ['column', 1], ['contextOfReportElement', 0], ['table', 1]], choose: 0 },
      { context: [['delete', 0], ['ofDbProperty', 0], ['table', 0]], choose: 0 },

      { context: [['article', 0], ['recordCount', 0], ['ofDbProperty', 0], ['reportable', 0]], choose: 1 },
      { context: [['article', 0], ['recordCount', 1], ['ofDbProperty', 0], ['reportable', 0]], choose: 1 },
      { context: [['showColumn', 0], ['column', 2]], choose: 0 },
      //{ context: [['showColumn', 0], ['column', 1]], choose: 0 },

      { context: [['sortByColumns', 0], ['the', 0], ['ordinal', 0], ['table', 1]], choose: 0 },
      { context: [["sortByColumns", 0 ], [ "the", 0 ], [ "ordinal", 0 ], [ "table", 0 ], [ "groupBy", 0 ], [ "column", 0 ]], choose: 0 },


      // TODO fix the error on the server side => { context: [['column', 0], ['ofDbProperty', 0], ['article', 0]], choose: 0 },
    ]
  },

  semantics: [
    {
      match: ({context}) => context.frameOfReference && context.evaluate,
      apply: ({context}) => {
        const value = mentions({ context: { marker: 'table' }, frameOfReference: currentReport })
        context.evalue = value
      },
    },
    // evaluator to pull table/graph/charts from the context
    {
      match: ({context, isA}) => ['table', 'graph', 'chart', 'deletable', 'moveable'].some((type) => isA(context, type, { extended: true })) && context.evaluate,
      apply: async ({context, toContext, values, api, gp, mentions, verbatim}) => {
        debugger
        const currentReport = api.current()
        let selectedTables
        // console.log(JSON.stringify(context, null, 2))
        let items
        // TODO fix this for marker == table / graph or other
        if (context.marker == 'table') {
          items = image.getTables(currentReport.imageSpec)
        } else {
          items = image.getGraphs(currentReport.imageSpec)
        }
        if (context.ordinal) {
          const ordinals = values(context.ordinal)
          const getTable = (ordinal) => {
            let item
            if (ordinal < 0) {
              item = items[items.length + ordinal]
            } else {
              item = items[ordinal-1]
            }
            return item
          }
          selectedTables = ordinals.map( (ordinal) => getTable(ordinal.value) ).filter( (item) => item )
        } else if (context.pullFromContext) {
          // handle graph/chart being the same thing
          const args = { context: { marker: context.marker, types: context.types }, frameOfReference: currentReport }
          // debugger
          const mentioned = mentions(args)
          if (mentioned) {
            if (mentioned.marker == 'graph') {
              selectedTables = mentioned
            } else {
              selectedTables = mentioned.value.imageSpec
            }
          } else {
            selectedTables = items[items.length-1]
          }
        }

        // console.log('selectedTable', JSON.stringify(selectedTables, null, 2))
        if (!_.isEmpty(selectedTables)) {
          context.evalue = {
            marker: context.marker, 
            report: currentReport,
            value: toContext(selectedTables)
          }
        } else {
          if (!context.silent) {
            verbatim(`${await gp(context)} does not exist`)
          }
        }
      }
    },

    {
      // overides move semantics from ui
      match: ({context}) => context.marker == 'move' && !context.evaluate,
      where: where(),
      apply: async ({context, api, values, e, isA}) => {
        debugger
        const table = (await e(context.moveable)).evalue
        if (table) {
          // console.log('table', JSON.stringify(table, null, 2))
          const direction = context.direction.value
          let distance = context.direction.steps?.value || 1
          if (direction == 'up') {
            distance *= -1
          }
          for (const moved of values(table.value)) {
            console.log(JSON.stringify(table.report.imageSpec, null, 2))
            image.moveUpOrDown(table.report.imageSpec, moved, distance)
            console.log(JSON.stringify(table.report.imageSpec, null, 2))
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
    {
      id: 'deletable'
    },
    {
      id: 'delete',
      associations: ['mongo'],
      isA: ['verb'],
      bridge: "{ ...next(operator), element: after[0], generate: ['this', 'element'] }",
      localHierarchy: [['thisitthat', 'deletable']],
      semantics: [
        {
          match: ({context}) => context.element?.marker == 'column',
          apply: async ({context, api, values, e, isA, verbatim, gp}) => {
            if (context.element.ordinal) {
              const ordinals = []
              for (const ordinal of values(context.element.ordinal)) {
                ordinals.push(ordinal.value)
              }
              const tables = (await e(context.element.frameOfReference || { marker: 'table', pullFromContext: true })).evalue
              if (!tables) {
                // verbatim(`${await gp(context.element.frameOfReference)} does not exist.`)
                return
              }
              for (const table of values(tables.value)) {
                image.removeColumnsByOrdinal(table, ordinals)
              }
              api.show(tables.report)
            }
          }
        },

        async ({context, api, values, e, isA}) => {
          const element = (await e(context.element)).evalue
          if (element) {
            // console.log('element', JSON.stringify(element, null, 2))
            for (const remove of values(element.value)) {
              image.remove(element.report.imageSpec, remove)
            }
          }
          api.show(element.report)
        },
      ]
    },

    // "((reportElement/*) [contextOfReportElement|of] ([reportElementContext]))",
    {
      id: 'collection',
      associations: ['mongo'],
    },

    {
      id: 'reportElementContext',
      associations: ['mongo'],
    },

    // "([changeGraph|change] (graph/*) (to/*) (<graph))",
    {
      id: 'changeGraph',
      associations: ['mongo'],
      isA: ['verb'],
      localHierarchy: [['thisitthat', 'graph']],
      bridge: "{ ...next(operator), change: after[0], operator: operator, to: after[1], newType: after[2], generate: ['operator', 'change', 'to', 'newType'] }",
      semantic: async ({context, api, e, isA}) => {
        const graphContext = (await e(context.change)).evalue
        const graphImageSpec = graphContext.value
        const newType = context.newType.marker.split('_')[0]
        graphImageSpec.type = newType
        api.show(graphContext.report)
      },
    },

    {
      id: 'contextOfReportElement',
      associations: ['mongo'],
      isA: ['preposition'],
      bridge: "{ ...before[0], root: before[0], of: operator, frameOfReference: after[0], generate: ['root', 'of', 'frameOfReference'] }",
    },

    // "([makeGraph|make] (graph/* || chart/*) ([makeGraphOf|of]) (reportable/*))",
    {
      id: 'makeGraphOf',
      associations: ['mongo'],
      isA: ['preposition'],
      bridge: "{ ...next(operator) }",
    },

    {
      id: 'makeGraph',
      associations: ['mongo'],
      isA: ['verb'],
      bridge: "{ ...next(operator), type: after[0], of: after[1], columns: after[2], operator: operator, generate: ['operator', 'type', 'of', 'columns'] }",
      semantic: async ({context, api}) => {
        await api.graph(context.columns.text, context.columns, context.type.marker.split('_')[0])
      }
    }
    ,
    {
      id: 'forTable',
      associations: ['mongo'],
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
      associations: ['mongo'],
      isA: ['verb'],
      bridge: "{ ...next(operator), columns: after[0] }",
      generatorp: async ({context, word, g}) => `${context.word} ${await g(context.columns)}`,
      semantic: async ({context, api, values}) => {
        await api.graph(context.columns.text, context.columns)
      }
    },
    {
      id: 'clear',
      associations: ['mongo'],
      isA: ['verb'],
      bridge: "{ ...next(operator) }",
      semantic: ({context, api}) => {
        api.clear()
      }
    },

    { 
      id: 'recordCount',
      associations: ['mongo'],
      isA: ['column', 'theAble'],
      bridge: "{ ...next(operator) }",
    },
    { 
      id: 'ofDbProperty',
      associations: ['mongo'],
      isA: ['preposition'],
      return_type_selector: 'before[0]',
      generatorp: ({context, g}) => `number of ${g(field)}`,
      bridge: "{ ...next(before[0]), of: operator, count: true, field: after[0], number: after[0].number, postModifiers: ['of', 'field'] }",
    },
    { 
      id: 'sortBy',
      associations: ['mongo'],
      localHierarchy: [['column', 'unknown']],
      isA: ['preposition'],
      bridge: "{ ...next(operator), field: after[0], postModifiers: ['field'] }",
    },

    { 
      id: 'groupBy',
      associations: ['mongo'],
      localHierarchy: [['column', 'unknown']],
      isA: ['preposition'],
      generatorp: async ({context, g}) => `${context.word} ${await g(context.field)}`,
      bridge: "{ ...next(operator), field: after[0] }",
    },

    { 
      // TODO stop sorting by ... stop sorting
      id: 'sortByColumns',
      associations: ['mongo'],
      // optional: { table: "{ marker: 'table', pullFromContext: true }" },
      optional: { 1: "{ marker: 'table', pullFromContext: true }" },
      isA: ['verb'],
      bridge: "{ ...next(operator), table: after[0], field: after[1], postModifiers: ['field'] }",
      semantic: async ({context, e, api, values}) => {
        const currentReport= api.current()
        const defaultTable = (await e({...context.table, silent: true})).evalue
        const fields = helpers.propertyToArray(context.field.field)
        if (defaultTable) {
          const paths = []
          for (const table of values(defaultTable.value)) {
            if (!paths.find( (path) => _.isEqual(path, table.dataSpecPath))) {
              paths.push(table.dataSpecPath)
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
      associations: ['mongo'],
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
      associations: ['mongo'],
      isA: ['countable', 'comparable', 'orderable', 'reportElement', 'deletable', 'listable'],
      words: [...helpers.words('column'), ...helpers.words('field'), ...helpers.words('property')],
    },

    {
      id: 'case',
      associations: ['mongo'],
      words: helpers.words('case'),
      isA: ['reportElementProperty'],
    },
    {
      id: 'uppercase',
      associations: ['mongo'],
      words: helpers.words('upper', { value: 'uppercase' }),
      isA: ['case'],
    },
    {
      id: 'lowercase',
      associations: ['mongo'],
      words: helpers.words('lower', { value: 'lowercase' }),
      isA: ['case'],
    },

    { 
      id: 'reportElementProperty', 
      associations: ['mongo'],
    },

    { 
      id: 'compoundReportElement', 
      associations: ['mongo'],
      convolution: true,
      isA: ['reportElement', 'theAble'],
      bridge: "{ ...next(operator), reportElements: append(default(before[0].reportElements, [before[0]]), default(after[0].reportElements, [after[0]])) }",
      generatorp: ({context, gs}) => gs(context.reportElements),
    },
    { 
      id: 'make', 
      associations: ['mongo'],
      bridge: "{ ...next(operator), report: after[0] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => `make ${await g(context.report)}`,
      semantic: ({context, km, api}) => {
        api.newReport()
      },
    },

    { 
      id: 'state', 
      associations: ['mongo'],
      bridge: "{ ...next(operator) }",
    },

    { 
      id: 'thisReportElement', 
      associations: ['mongo'],
      parents: ['article'],
      bridge: "{ ...next(after[0]), modifiers: append(['this'], after[0].modifiers), this: operator }",
    },

    { 
      id: 'changeState', 
      associations: ['mongo'],
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
        // console.log('currentReport-----------------', JSON.stringify(currentReport, null, 2))
        // console.log('counts-----------------', JSON.stringify(counts, null, 2))
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
          debugger
          let tables = []
          if (context.reportElement.frameOfReference) {
            // console.log("for", JSON.stringify(await e(context.reportElement.frameOfReference).evalue, null, 2))
            const mentioned = await e(context.reportElement.frameOfReference)
            tables = values(await mentioned.evalue.value || [])
            // console.log('tables', JSON.stringify(tables, null, 2))
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
      associations: ['mongo'],
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
            // console.log('the user selected', context.selected)
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
            // console.log("after capitalize", JSON.stringify(report, null, 2))
            api.show(report)
          }
        }
      },
    },

    { 
      id: 'this',
      parents: ['reportElement']
    },

    { 
      id: 'reportElement' ,
      associations: ['mongo'],
    },

    { 
      id: 'header', 
      associations: ['mongo'],
      words: helpers.words('header'),
      parents: ['theAble', 'reportElement'],
    },

    { 
      id: 'background', 
      associations: ['mongo'],
      words: helpers.words('background'),
      parents: ['theAble', 'reportElement', 'reportElementProperty'],
    },

    { 
      id: 'table', 
      associations: ['mongo'],
      words: helpers.words('table'),
      isA: ['orderable', 'reportElementContext', 'moveable'],
      parents: ['theAble', 'reportElement', 'nameable'],
      /*
      evaluator: async ({context, toContext, values, api, gp, verbatim}) => {
        const currentReport = api.current()
        if (context.ordinal) {
          const tables = image.getTables(currentReport.imageSpec)
          const ordinals = values(context.ordinal)
          const getTable = (ordinal) => {
            let table
            if (ordinal < 0) {
              table = tables[tables.length + ordinal]
            } else {
              table = tables[ordinal-1]
            }
            return table
          }
          const selectedTables = ordinals.map( (ordinal) => getTable(ordinal.value) ).filter( (table) => table )
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
      */
    },

    { id: 'report',
      associations: ['mongo'],
      parents: ['theAble', 'nameable']
    },

    { id: 'columnAddedTo',
      associations: ['mongo'],
      isA: ['preposition'],
      bridge: "{ ...next(operator), postModifiers: ['destination'], destination: after[0] }",
    },

    { 
      id: 'showColumn',
      associations: ['mongo'],
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
          const oldway = false
          const addAllFields = (dataSpecPath) => {
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
          }
          if (oldway) {
            const dataSpecPath = [0]
            addAllFields(dataSpecPath)
          } else {
            const tables = (await e(context.frameOfReference || { marker: 'table', pullFromContext: true })).evalue
            for (const table of values(tables.value)) {
              addAllFields(table.dataSpecPath)
            }
          }
          api.show(currentReport)
        } else if (context.show.more || (context.show.marker == 'column' && !context.show.path)) {
          // console.log('currentReport', JSON.stringify(currentReport, null, 2))
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
            // console.log("context.to.destination", JSON.stringify(context.to.destination, null, 2))
            const destination = (await e(context.to.destination)).evalue
            // console.log("destination", JSON.stringify(destination, null, 2))
            // TODO handle not found
            defaultTable = destination
            // currentReport = destination.report
            // dataSpecPath = destination.value.field
          } else {
            // const table = mentions({ context: { marker: 'table' }, banana: 23, frameOfReference: currentReport })
            const args = { context: { marker: 'table' }, frameOfReference: currentReport }
            defaultTable = mentions(args)
            if (defaultTable) {
              // console.log(JSON.stringify(defaultTable, null, 2))
              // currentReport = defaultTable.frameOfReference
              // greg55
              // defaultTable = defaultTable.table.imageSpec
            } else {
              dataSpecPath = Array.isArray(currentReport.dataSpec) ? [0] : []
            }
          }

          // TODO pick a better name for this
          const someFunction = async (context, defaultTable, currentReport, dataSpecPath) => {
            let dataSpec
            if (!dataSpecPath) {
              dataSpecPath = defaultTable.imageSpec.dataSpecPath
              dataSpec = defaultTable.dataSpec
            } else {
              dataSpec = data.getValue(currentReport.dataSpec, dataSpecPath)
            }
            let database = dataSpec.dbName
            let collection = dataSpec.collectionName

            const columns = values(context.show)
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
              // console.log(JSON.stringify(dataSpec, null, 2))
              report.addGroup(dataSpec, columnNames)
              // console.log(JSON.stringify(dataSpec, null, 2))
              image.addGroup(api, dataSpecPath, currentReport.imageSpec, columnNames.map((columnName) => { return { name: columnName, collection: collection } }))
            } else {
              dataSpec.usedFields.push(...columnNames)
              if (defaultTable) {
                // console.log(JSON.stringify(defaultTable, null, 2))
                image.addColumns(defaultTable.imageSpec || defaultTable, dataSpecPath, columnNames)
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
            // greg55
            for (const value of values(defaultTable.value)) {
              // console.log("value", JSON.stringify(value, null, 2))
              currentReport = await someFunction(context, value, currentReport, value.dataSpecPath)
            }
          } else {
            currentReport = await someFunction(context, defaultTable, currentReport, dataSpecPath)
          }
          api.show(currentReport)
        }
      },
    },

    { 
      id: 'showReport',
      associations: ['mongo'],
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

    { 
      id: 'showCollection',
      associations: ['mongo'],
      bridge: "{ ...next(operator), show: after[0] }",
      parents: ['verb'],
      generatorp: async ({context, g}) => `show ${await g(context.show)}`,
      semantic: async ({context, isA, km, mentions, api, flatten}) => {
        // console.log("in show collection")
        let currentReport = api.newReport()
        if (context.chosens) {
          // console.log('in chosen', JSON.stringify(context.chosens))
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

    { 
      id: 'show',
      associations: ['mongo'],
      bridge: "{ ...next(operator), show: after[0] }",
      // localHierarchy: [['unknown', 'reportable']],
      parents: ['verb'],
      generatorp: async ({context, g}) => `show ${await g(context.show)}`,
      semantic: async ({context, km, mentions, mentioned, api, flatten, gp}) => {
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
        for (const dbName in components) {
          for (const collectionName in components[dbName]) {
            const properties = components[dbName][collectionName]
            const columns = []
            for (const column of properties) {
              columns.push({ text: await gp(column), id: column.path[0] })
            }

            const subReport = await api.newReportSpec(dbName, collectionName, columns, properties)
            report.addReport(api, currentReport, subReport)
            // greg55
            if (true) {
              mentioned({ 
                context: { marker: 'table', value: subReport },
                frameOfReference: currentReport 
              })
            }
          }
        }

        api.setCurrent(currentReport)
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
    { context: [['propertyOf', 1], ['showColumn', 0]], choose: [0] },
    { context: [['column', 1], ['list', 0], ['recordCount', 0]], choose: [2] },
    { context: [['column', 1], ['list', 0], ['recordCount', 1], ['ofDbProperty', 0]], ordered: true, choose: [3] },
    // { context: [['ofDbProperty', 0], ['column', 1], ['list', 0], ['column', 1]], choose: [2] },
    { context: [['ordinalOnOrdered', 0], ['list', 0]], choose: [1] },
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
    "a chart is a graph",

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
            associations: ['mongo'],
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

console.log('greg77 START')
console.log(JSON.stringify(defaultContextCheck(['object', 'objects', { property: 'reportElement', filter: ['frameOfReference'] } ]), null, 2))
console.log('greg77 END')

knowledgeModule( { 
  config: { name: 'mongo' },
  includes: [hierarchy, errors, ordinals, colors, negation, nameable, ui, countable, math],
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
      // frameOfReference
      // context: [{ defaults: true }, 'object', 'objects', { property: 'reportElement', filter: [{ defaults: true }}],
      context: defaultContextCheck([
        'object', 
        'objects', 
        { 
          property: 'reportElement', 
          filter: ['frameOfReference'],
        } 
      ]),
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

