// This file contains all the config for the natural language interface

module.exports = 
{
  "operators": [
    "(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([week])))",
    "(([personConcept]) [earn] ([query|what]))",
    "(([personConcept]) [worked] (<count> ([week|weeks])))",
  ],
  "bridges": [
    {"id": "week", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "dollarConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "every", "level": 0, "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }"},
    {"id": "earn", "level": 0, "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }"},
    {"id": "worked", "level": 0, "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }"},
  ],
  "hierarchy": [
  ],
  "priorities": [
    [["earn", 0], ["worked", 0], ["every", 0], ["query", 0]],
    [["earn", 0], ["worked", 0], ["query", 0], ["count", 0]],
  ],
  "associations": {
    "negative": [],
    "positive": [],
  },
  "words": {
    "week": [{"id": "week", "initial": {"language": "english"}}],
    "dollars": [{"id": "dollarConcept", "initial": {"language": "english"}}],
    "joe": [{"id": "personConcept", "initial": {"id": "joe"}}],
    "sally": [{"id": "personConcept", "initial": {"id": "sally"}}],
    "per": [{"id": "every"}],
  },
  "floaters": [
    "isQuery",
  ],
  "implicits": [
    "language",
  ],
  "flatten": [
    "conj",
  ],
  "utterances": [
    "joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what",
  ],
  "generators": [
    [({context}) => context.marker == 'week' && context.duration == 1, ({g, context}) => `${context.duration} week`],
    [({context}) => context.marker == 'week' && context.duration > 1, ({g, context}) => `${context.duration} weeks`],
    [({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}`],
    [({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }`],
    [({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}`],
  ],
  "semantics": [
    [({global, context}) => context.marker == 'earn' && context.isQuery, ({global, context}) => { 
      context.marker = 'response'; 
      var employee_record = global.employees.find( (er) => er.name == context.who )
      let totalIncome = 0
      global.workingTime.forEach( (wt) => {
        if (wt.name == context.who) {
          totalIncome += employee_record.earnings_per_period * wt.number_of_time_units
        }
      });
      context.earnings = totalIncome
     }],
    [({global, context}) => context.marker == 'earn', ({global, context}) => { 
      if (! global.employees ) {
        global.employees = []
      }
      global.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [({global, context}) => context.marker == 'worked', ({global, context}) => { 
      if (! global.workingTime ) {
        global.workingTime = []
      }
      global.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
    [({global, context}) => context.pullFromContext
, ({global, context}) => { 
    const object = global.mentioned[0]
    global.mentioned.shift()
    Object.assign(context, object)
    delete context.pullFromContext
     }],
  ],
};