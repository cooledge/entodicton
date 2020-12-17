/*
This is what the output looks like

This is the global objects from running semantics:
 { employees:
   [ { name: 'joe',
       earnings_per_period: 10,
       period: 'week',
       units: 'dollars' } ],
  workingTime:
   [ { name: 'joe',
       number_of_time_units: 2,
       time_units: 'weekConcept' } ] }
Logs
    Context for choosing the operator ('dollarConcept', 0) was [('count', 0), ('dollarConcept', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('every', 0) was [('earn', 0), ('every', 0), ('worked', 0)]
    Context for choosing the operator ('worked', 0) was [('earn', 0), ('worked', 0)]
    Context for choosing the operator ('earn', 0) was [('earn', 0)]
    Op choices were: [('dollarConcept', 0), ('weekConcept', 0), ('weekConcept', 0), ('count', 0), ('count', 0), ('personConcept', 0), ('personConcept', 0), ('every', 0), ('worked', 0), ('earn', 0)]
[ [ 'joe earns 10 dollars per week', 'joe worked 2 weeks' ] ]

*/

const client = require('entodicton/client')
const Config = require('entodicton/src/config')

const config = {
  operators: [
    '(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([weekConcept])))',
    '(([personConcept]) [worked] (<count> ([weekConcept|weeks])))'
  ],
  bridges: [
    { "id": "count", "level": 0, "bridge": "{ ...operator, ...after, number: operator.value }" },

    { "id": "weekConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "dollarConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "every", "level": 0, "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }" },

    { "id": "earn", "level": 0, "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }" },
    { "id": "worked", "level": 0, "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }" },
  ],
  priorities: [
  ],
  "version": '3',
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    "week": [{"id": "weekConcept", 'initial': { 'language': 'english' } }],
    "dollars": [{"id": "dollarConcept", 'initial': { 'language': 'english' } }],
    "joe": [{"id": "personConcept", 'initial': { 'id': 'joe' } }],
    "sally": [{"id": "personConcept", 'initial': { 'id': 'sally' } }],
    "per": [{"id": "every"}],
  },

  generators: [
    [ (context) => context.marker == 'earn', (g, context) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ (context) => context.marker == 'weekConcept' && context.duration == 1, (g, context) => `${context.duration} week` ],
    [ (context) => context.marker == 'weekConcept' && context.duration > 1, (g, context) => `${context.duration} weeks` ],
    [ (context) => context.marker == 'worked', (g, context) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ (context) => context.marker == 'response', (g, context) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
    [(global, context) => context.marker == 'earn', (global, context) => {
      if (! global.employees ) {
        global.employees = []
      }
      global.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [(global, context) => context.marker == 'worked', (global, context) => {
      if (! global.workingTime ) {
        global.workingTime = []
      }
      global.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
  ],
};

server = process.argv[2] || "184.67.27.82"
key = process.argv[3] || "6804954f-e56d-471f-bbb8-08e3c54d9321"
port = process.argv[4] || '80'

const query = 'joe earns 10 dollars every week joe worked 2 weeks'
console.log(`Running the input: ${query}`);
config.utterances = [query]
client.process(new Config(config), key, server, port)
  .then( (responses) => {
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log('This is the global objects from running semantics:\n', config.objects)
    if (responses.logs) {
      console.log('Logs')
      responses.logs.forEach( (log) => console.log(`    ${log}`) )
    }
    console.log(responses.generated);
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
