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
    [(context) => context.marker.endsWith('Concept') && context.number > 0, (g, context) => `${g(context.number)} ${g(context.word)}`],
    [(context) => context.marker.endsWith('Concept') && !('number' in context), (g, context) => `${g(context.word)}`],
    [(context) => context.marker.endsWith('Concept') && context.number == 'all', (g, context) => `all ${g(context.word)}`],
    [(context) => context.marker == 'article' && context.gender == 'm', (g, context) => 'le'],
    [(context) => context.marker == 'article' && context.gender == 'f', (g, context) => 'la'],
    [(context) => context.isProperty && context.language == 'french', (g, context) => `${g({marker: 'article', gender: context.gender})} ${g(context.propertyName)} de ${g(context.object)} est ${g(context.value)}`],
    [(context) => context.isProperty, (g, context) => `the ${context.propertyName} of ${g(context.object)} is ${g(context.value)}`],
    [(context) => context.marker == 'number', (g, context) => `${g(context.value)}`],
    [(context) => context.marker == 'equal', (g, context) => `${g(context.objects[1])}`],
    [(context) => context.marker == 'conj', (g, context) => `${context.value.map( (c) => g(c) ).join('and')}`],
    [(context) => context.marker == 'move' && context.language == 'french', (g, context) => `deplacez ${g(context.thing)} vers ${g(context.place)}`],
    [(context) => context.marker == 'move', (g, context) => `move ${g(context.thing)} to ${g(context.place)}`],
    [(context) => context.marker == 'create', (g, context) => `create ${g(context.klass)}`],
    [(context) => context.marker == 'destroy', (g, context) => `destroy ${g(context.name)}`],
    [(context) => context.marker == 'alias' && context.language == 'french', (g, context) => `appellez ${g(context.thing)} ${g(context.name)}`],
    [(context) => context.marker == 'alias', (g, context) => `call ${g(context.thing)} ${g(context.name)}`],
    [(context) => context.marker == 'commander', (g, context) => 'commander'],
    [(context) => context.marker == 'commandeur', (g, context) => 'commandeur'],
    [(context) => context.marker == 'cia', (g, context) => 'CIA'],
    [(context) => context.marker == 'stop', (g, context) => `stop ${g(context.thing)}`],
    [(context) => context.marker == 'destroy', (g, context) => `destroy ${g(context.name)}`],
    [(context) => context.marker == 'week' && context.duration == 1, (g, context) => `${context.duration} week`],
    [(context) => context.marker == 'week' && context.duration > 1, (g, context) => `${context.duration} weeks`],
    [(context) => context.marker == 'earn', (g, context) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}`],
    [(context) => context.marker == 'worked', (g, context) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }`],
    [(context) => context.marker == 'response', (g, context) => `${context.who} earned ${context.earnings} ${context.units}`],
    [(context) => context.marker == 'wantWhitespot', (g, context) => `order for ${g(context.items)} from ${g(context.store)}`],
    [(context) => context.marker == 'wantMcDonalds', (g, context) => `order for ${g(context.items)} from ${g(context.store)}`],
    [(context) => context.marker == 'food' && context.number > 0, (g, context) => `${g(context.number)} ${g(context.name)}`],
    [(context) => context.marker == 'food' && !('number' in context), (g, context) => `${g(context.name)}`],
    [(context) => context.marker == 'whitespot', (g, context) => 'Whitespot'],
    [(context) => context.marker == 'mcdonalds', (g, context) => 'McDonalds'],
  ],
  "semantics": [
    [(global, context) => context.marker == 'create'
, (global, context) => { 
    if (context.klass.marker === 'tankConcept') {
      if (!global.newTanks) {
        global.newTanks = []
      }
      const tank = global.newTank(context)
      if (!global.mentioned) {
        global.mentioned = []
      }
      global.mentioned.push({ marker: 'tankConcept', word: tank.name, id: tank.id })
    } else if (context.klass.marker === 'buildingConcept') {
      if (!global.newBuildings) {
        global.newBuildings = []
      }
      const building = global.newBuilding(context)
      if (!global.mentioned) {
        global.mentioned = []
      }
      global.mentioned.push({ marker: 'buildingConcept', word: building.name, id: building.id })
    }
     }],
    [(global, context) => context.marker == 'earn' && context.isQuery, (global, context) => { 
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
    [(global, context) => context.pullFromContext
, (global, context) => { 
    const object = global.mentioned[0]
    global.mentioned.shift()
    Object.assign(context, object)
    delete context.pullFromContext
     }],
  ],
};