const { Config, knowledgeModule, where } = require('theprogrammablemind')
const { defaultContextCheck, dialogues } = require('tpmkms')
const mongo_tests = require('./mongo.test.json')

class API {
  initialize(args) {
    this.args = args
    this.objects = this.args.objects
    this.objects.show = []
    this.listeners = []
  }

  show(report) {
    this.objects.show.push(report)
    this.listeners.forEach( (l) => l(report) )
  }

  listen(listener) {
    this.listeners.push(listener)
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
    "([reportable])",
    "([show] ([reportable]))",
    "([sales|])",
    "([year])",
    "([user])",
    "([email])",
    "([movie])",
  ],
  bridges: [
    { 
      id: 'make', 
      bridge: "{ ...next(operator), report: after[0] }",
      parents: ['verby'],
      generatorp: ({context, g}) => `make ${g(context.report)}`,
      semantic: ({context, km, api}) => {
        const report = api.newReport()
      },
    },

    { id: 'report',
      parents: ['theAble']
    },

    { id: 'reportable' },

    { id: 'show',
      bridge: "{ ...next(operator), show: after[0] }",
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
        console.log(JSON.stringify(report))
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
  associations: {
  },
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
      objects: ['show', { km: 'stm' }],
    },

  },
})

