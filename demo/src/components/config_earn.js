// This file contains all the config for the natural language interface

module.exports = 
{
  "floaters": [
    "isQuery",
  ],
  "associations": {
    "negative": [],
    "positive": [],
  },
  "words": {
    "dollars": [{"id": "dollarConcept", "initial": {"language": "english"}}],
    "week": [{"id": "week", "initial": {"language": "english"}}],
    "per": [{"id": "every"}],
    "joe": [{"id": "personConcept", "initial": {"id": "joe"}}],
    "sally": [{"id": "personConcept", "initial": {"id": "sally"}}],
  },
  "priorities": [
    [["earn", 0], ["worked", 0], ["every", 0], ["query", 0]],
    [["earn", 0], ["worked", 0], ["query", 0], ["count", 0]],
    [["earn", 0], ["every", 0], ["worked", 0]],
  ],
  "hierarchy": [
  ],
  "flatten": [
    "conj",
  ],
  "operators": [
    "(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([week])))",
    "(([personConcept]) [earn] ([query|what]))",
    "(([personConcept]) [worked] (<count> ([week|weeks])))",
  ],
  "generators": [
    [({context}) => context.marker == 'week' && context.duration == 1, ({g, context}) => `${context.duration} week`],
    [({context}) => context.marker == 'week' && context.duration > 1, ({g, context}) => `${context.duration} weeks`],
    [({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}`],
    [({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }`],
    [({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}`],
  ],
  "bridges": [
    {"id": "week", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "dollarConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "personConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "every", "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }", "level": 0},
    {"id": "earn", "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }", "level": 0},
    {"id": "worked", "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }", "level": 0},
  ],
  "implicits": [
    "language",
  ],
  "utterances": [
    "joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what",
  ],
  "semantics": [
    [({objects, context}) => context.marker == 'earn' && context.isQuery, ({objects, context}) => { 
      context.marker = 'response'; 
      var employee_record = objects.employees.find( (er) => er.name == context.who )
      let totalIncome = 0
      objects.workingTime.forEach( (wt) => {
        if (wt.name == context.who) {
          totalIncome += employee_record.earnings_per_period * wt.number_of_time_units
        }
      });
      context.earnings = totalIncome
     }],
    [({objects, context}) => context.marker == 'earn', ({objects, context}) => { 
      if (! objects.employees ) {
        objects.employees = []
      }
      objects.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [({objects, context}) => context.marker == 'worked', ({objects, context}) => { 
      if (! objects.workingTime ) {
        objects.workingTime = []
      }
      objects.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
    [({objects, context}) => context.pullFromContext
, ({objects, context}) => { 
    const object = objects.mentioned[0]
    objects.mentioned.shift()
    Object.assign(context, object)
    delete context.pullFromContext
     }],
  ],
};