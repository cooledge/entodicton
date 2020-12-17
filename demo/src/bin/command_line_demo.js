/*
  This is what the output looks like

  Running the input: joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what
This is the global objects from running semantics:
 { employees:
   [ { name: 'joe',
       earnings_per_period: 10,
       period: 'week',
       units: 'dollars' },
     { name: 'sally',
       earnings_per_period: 25,
       period: 'week',
       units: 'dollars' } ],
  workingTime:
   [ { name: 'sally',
       number_of_time_units: 10,
       time_units: 'weekConcept' },
     { name: 'joe',
       number_of_time_units: 15,
       time_units: 'weekConcept' } ] }
Logs
    Context for choosing the operator ('dollarConcept', 0) was [('count', 0), ('dollarConcept', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('dollarConcept', 0) was [('count', 0), ('dollarConcept', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('weekConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('earn', 0), ('every', 0), ('personConcept', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('every', 0) was [('earn', 0), ('every', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('every', 0) was [('earn', 0), ('every', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('query', 0) was [('earn', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('query', 0) was [('earn', 0), ('query', 0), ('worked', 0)]
    Context for choosing the operator ('worked', 0) was [('earn', 0), ('worked', 0)]
    Context for choosing the operator ('worked', 0) was [('earn', 0), ('worked', 0)]
    Context for choosing the operator ('earn', 0) was [('earn', 0)]
    Context for choosing the operator ('earn', 0) was [('earn', 0)]
    Context for choosing the operator ('earn', 0) was [('earn', 0)]
    Context for choosing the operator ('earn', 0) was [('earn', 0)]
    Op choices were: [('dollarConcept', 0), ('dollarConcept', 0), ('count', 0), ('count', 0), ('count', 0), ('count', 0), ('weekConcept', 0), ('weekConcept', 0), ('weekConcept', 0), ('weekConcept', 0), ('personConcept', 0), ('personConcept', 0), ('personConcept', 0), ('personConcept', 0), ('personConcept', 0), ('personConcept', 0), ('every', 0), ('every', 0), ('query', 0), ('query', 0), ('worked', 0), ('worked', 0), ('earn', 0), ('earn', 0), ('earn', 0), ('earn', 0)]
[ [ { marker: 'earn',
      units: 'dollars',
      amount: 10,
      who: 'joe',
      period: 'week' },
    { marker: 'earn',
      units: 'dollars',
      amount: 25,
      who: 'sally',
      period: 'week' },
    { marker: 'worked',
      who: 'sally',
      duration: 10,
      units: 'weekConcept' },
    { marker: 'worked',
      who: 'joe',
      duration: 15,
      units: 'weekConcept' },
    { isQuery: true,
      marker: 'response',
      units: 'dollars',
      who: 'joe',
      earnings: 150 },
    { isQuery: true,
      marker: 'response',
      units: 'dollars',
      who: 'sally',
      earnings: 250 } ] ]
[ [ 'joe earns 10 dollars per week',
    'sally earns 25 dollars per week',
    'sally worked 10 weeks',
    'joe worked 15 weeks',
    'joe earned 150 dollars',
    'sally earned 250 dollars' ] ]
*/

const client = require('entodicton/client')
const Config = require('entodicton/src/config')

const config = {
  operators: [
    '(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([weekConcept])))',
    '(([personConcept]) [earn] ([query|what]))',
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

    { "id": "query", "level": 0, "bridge": "{ marker: 'query', isQuery: true }" },
  ],
  priorities: [
    [['earn', 0], ['worked', 0], ['query', 0], ['count', 0]],
  ],
  "version": '3',
  "floaters": ['isQuery'],
  "utterances": ["joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what"],
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    "week": [{"id": "weekConcept", 'initial': { 'language': 'english' } }],
    "dollars": [{"id": "dollarConcept", 'initial': { 'language': 'english' } }],
    "joe": [{"id": "personConcept", 'initial': { 'id': 'joe' } }],
    "sally": [{"id": "personConcept", 'initial': { 'id': 'sally' } }],
    "per": [{"id": "every"}],
    "what": [{"id": "query", 'initial': { 'isQuery': true } }],
  },

  generators: [
    [ (context) => context.marker == 'earn', (g, context) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ (context) => context.marker == 'weekConcept' && context.duration == 1, (g, context) => `${context.duration} week` ],
    [ (context) => context.marker == 'weekConcept' && context.duration > 1, (g, context) => `${context.duration} weeks` ],
    [ (context) => context.marker == 'worked', (g, context) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ (context) => context.marker == 'response', (g, context) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
     [(global, context) => context.marker == 'earn' && context.isQuery, (global, context) => {
      context.marker = 'response';
      var employee_record = global.employees.find( (er) => er.name == context.who )
      let totalIncome = 0
      global.workingTime.forEach( (wt) => {
        if (wt.name == context.who) {
          totalIncome += employee_record.earnings_per_period * wt.number_of_time_units
        }
      });
      delete context.amount
      delete context.period
      context.earnings = totalIncome
     }],
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

const query = 'joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what'
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
    console.log(responses.results);
    console.log(responses.generated);
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
