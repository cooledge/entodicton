const { Config, knowledgeModule, where } = require('theprogrammablemind')
const { defaultContextCheck, dialogues } = require('tpmkms')
const mongo_tests = require('./mongo.test.json')

/*
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

  make the header's background blue
  make that blue
  make the text blue
  make the text of that blue
 */

class API {
  initialize(args) {
    this.args = args
    this.objects = this.args.objects
    this.listeners = []

    // these are just for testing
    this.objects.show = []
    this.objects.select = []
  }

  show(report) {
    this.objects.show.push(report)
    console.log('show -----------', report)
    this.listeners.forEach( (l) => l(report) )
  }

  listen(listener) {
    this.listeners.push(listener)
  }

  current() {
    return this.objects.show.slice(-1)[0]
  }

  newReport() {
    // km('stm').api.mentioned({ marker: "report", text: reportId, types: [ "report" ], value: reportId, word: reportId })
    const report = { marker: 'report', dataSpec: {}, imageSpec: {} }
    this.args.km('stm').api.mentioned(report)
    return report
  }
}

let configStruct = {
  name: 'mongo',
  operators: [
    "([make] ([report]))",
//    "([stateChange|make] ([reportElement]) (color/*))",
    "([reportable])",
    "([show] ([reportable]))",
    "([capitalize] ([reportElement]))",
    "([header])",
    "([sales|])",
    "([year])",
    "([user])",
    "([email])",
    "([movie])",
    "([this])",
  ],
  bridges: [
    { 
      id: 'make', 
      bridge: "{ ...next(operator), report: after[0] }",
      parents: ['verby'],
      generatorp: ({context, g}) => `make ${g(context.report)}`,
      semantic: ({context, km, api}) => {
        api.newReport()
      },
    },

    {
      id: 'capitalize',
      parents: ['verby'],
      bridge: "{ ...next(operator), element: after[0] }",
      generatorp: ({context, gp}) => `${context.word} ${gp(context.element)}`,
      semantic: ({context, mentions, api}) => {
        const report = mentions({ marker: 'report' }) || api.newReport()
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
            if (!imageSpec.rules) {
              imageSpec.rules = []
            }
            const rule = `.${context.selected.selected} { text-transform: capitalize; }`
            if (!imageSpec.rules.includes(rule)) {
              imageSpec.rules.unshift(rule)
            }
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
    { id: 'header', parents: ['theAble', 'reportElement'] },

    { id: 'report',
      parents: ['theAble']
    },

    { 
      id: 'reportable',
    },

    { id: 'show',
      bridge: "{ ...next(operator), show: after[0] }",
      parents: ['verby'],
      generatorp: ({context, g}) => `show ${g(context.show)}`,
      semantic: ({context, km, mentions, api, flatten, gp}) => {
        const report = mentions({ marker: 'report' }) || api.newReport()
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
        for (const dbName in components) {
          for (const collectionName in components[dbName]) {
            dataSpecs.push({
                dbName: dbName,
                collectionName: collectionName,
                limit: 10,
                aggregation: [] 
            })
            const properties = components[dbName][collectionName]
            imageSpecs.push({
              headers: {
                columns: properties.map( (c) => { return { text: gp(c) } })
              },
              colgroups: properties.map( (e, i) => `column_${i}` ),
              table: true,
              field: [],
              // rows: ['$name', '$age', '$fav_colors'],
              rows: properties.map( (property) => property.path.map((p) => '$'+p).join('.') )
            })
          }
        }

        if (dataSpecs.length == 1) {
          report.dataSpec = dataSpecs[0]
          report.imageSpec = imageSpecs[0]
        } else {
          report.dataSpec = dataSpecs
          for (let i = 0; i < imageSpecs.length; ++i) {
            imageSpecs[i].field = [i]
          }
          report.imageSpec = {
            headers: { columns: [] },
            table: true,
            explicit: true,
            field: [],
            rows: [imageSpecs]
          }
        }
        /*
        report.dataSpec = { 
          dbName: properties[0].database, 
          collectionName: properties[0].collection, 
          aggregation: [] 
        }

        report.imageSpec = {
          headers: properties.map( gp ),
          table: true,
          field: [],
          // rows: ['$name', '$age', '$fav_colors'],
          rows: properties.map( (property) => property.path.map((p) => '$'+p).join('.') )
        }
        */

        api.show(report)
      }
    },

    { 
      id: 'sales', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'sales', database: 'mongo_test_database', collection: 'sales', path: ['sales'] } 
      ] 
    },

    { 
      id: 'year', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'year', database: 'mongo_test_database', collection: 'sales', path: ['year'] } 
      ] 
    },

    { 
      id: 'user', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'users', database: 'sample_mflix', collection: 'users', path: ['name'] } 
      ] 
    },

    { 
      id: 'email', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'email', database: 'sample_mflix', collection: 'users', path: ['email'] } 
      ] 
    },

    { 
      id: 'movie', 
      parents: ['reportable', 'theAble'], 
      words: [ 
        { word: 'movies', database: 'sample_mflix', collection: 'movies', path: ['title'] } 
      ] 
    },

  ],
  priorities: [
    { context: [['show', 0], ['list', 0]], choose: [1] },
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

const createConfig = () => {
  const config = new Config(configStruct, module)
  config.add(dialogues())
  config.api = new API()
  return config
}

knowledgeModule( { 
  module,
  createConfig,
  description: 'language access for mongo databases',
  test: {
    name: './mongo.test.json',
    contents: mongo_tests,
    checks: {
      context: defaultContextCheck,
      objects: ['show', 'select', { km: 'stm' }],
    },

  },
})

