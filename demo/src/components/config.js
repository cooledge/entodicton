// This file contains all the config for the natural language interface

module.exports = 
{
  "operators": [
    "(([query|what]) [([equal|is] (([number]) <plus> ([number])))])",
    "(([query|what]) [([equal|is] ([position]))])",
    "(([query|what]) [([equal|is] (<the|the> ([propertyConcept])))])",
    "(([query|quelle,quel]) [([equal|est] (<la|la> ([propertyConcept])))])",
    "((<la> ([propertyConcept])) [([property|de] ([tankConcept]))])",
    "((<the> ([propertyConcept])) [([property|of] ([tankConcept]))])",
    "([move] (([tankConcept|tank]) [([to] ([buildingConcept|building]))]))",
    "([move] (([tankConcept|tank]) [([to] ([tankConcept|tank]))]))",
    "([move] ((<all> ([tankConcept|tank])) [([to] ([tankConcept|tank]))]))",
    "([move] ((<all> (<the> ([tankConcept|tank]))) [([to] ([tankConcept|tank]))]))",
    "(([tankConcept]) [(([tankConcept]) [conj|and] ([tankConcept]))])",
    "([stop] ([tankConcept|tank]))",
    "([stop] (<all> (<the> ([tankConcept|tank]))) )",
    "([create] (<aEnglish> ([tankConcept|tank])))",
    "([create] (<aEnglish> ([buildingConcept])))",
    "([create] (<count> ([tankConcept])))",
    "([destroy] ([tankConcept|tank]))",
    "([destroy] (<all> (<the> ([tankConcept]))))",
    "([destroy] (<all> (<the> ([buildingConcept]))))",
    "([call] ([nameableConcept|]) ([name]))",
    "([appellez] ([nameableConcept|]) ([name]))",
    "([deplacez] ([tankConcept|char]) ([vers] batiment))",
    "([bougez] (([tankConcept]) [([aFrench] ([buildingConcept]))]))",
    "(([tankConcept|char]) [conj|et] ([tankConcept]))",
    "([arreter] ([tankConcept|char]))",
    "([detruire] ([tankConcept|char]))",
    "([position])",
    "([english])",
    "([french])",
    "([anyConcept])",
    "(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([week])))",
    "(([personConcept]) [earn] ([query|what]))",
    "(([personConcept]) [worked] (<count> ([week|weeks])))",
    "(([i]) [wantMcDonalds|want] ([food]) ([fromM|from] ([mcdonalds])))",
    "(([i]) [wantWhitespot|want] ([food]) ([fromW|from] ([whitespot])))",
    "(<count> ([food]))",
    "(<aEnglish> ([food]))",
    "(([food]) [conj] ([food]))",
  ],
  "bridges": [
    {"id": "english", "level": 0, "bridge": "{ ...after }"},
    {"id": "french", "level": 0, "bridge": "{ ...after }"},
    {"id": "name", "level": 0, "bridge": "{ ...after }"},
    {"id": "nameableConcept", "level": 0, "bridge": "{ ...after }"},
    {"id": "all", "level": 0, "bridge": "{ ...after, number: 'all' }"},
    {"id": "the", "level": 0, "bridge": "{ ...after, concept: true }"},
    {"id": "la", "level": 0, "bridge": "{ ...after, gender: 'f', concept: true }"},
    {"id": "query", "level": 0, "bridge": "{ marker: 'query', isQuery: true }"},
    {"id": "property", "level": 0, "bridge": "{ object: after[0], ...next(operator) }"},
    {"id": "property", "level": 1, "bridge": "{ value: objects.tanks[operator.object['id']][before[0].name], marker: operator(objects.types[before[0].name].id, objects.types[before[0].name].level), propertyName: before[0].name, object:operator.object.id, isProperty: true }"},
    {"id": "equal", "level": 0, "bridge": "{ objects: after[0], ...next(operator) }"},
    {"id": "equal", "level": 1, "bridge": "{ ...next(operator), objects: append(before[0], operator.objects) }"},
    {"id": "plus", "level": 0, "bridge": "{ ...next(operator), value: add(before, after), marker: before[0].marker }"},
    {"id": "conj", "level": 0, "selector": {"match": "same", "type": "infix", "passthrough": true}, "bridge": "{ ...next(operator), value: append(before, after) }"},
    {"id": "conj", "level": 1, "selector": {"match": "same", "type": "postfix", "passthrough": true}, "bridge": "{ ...operator, value: append(before, operator.value) }"},
    {"id": "propertyConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "tankConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "buildingConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "to", "level": 0, "bridge": "{ ...next(operator), destination: after[0] }"},
    {"id": "to", "level": 1, "bridge": "{ ...next(operator), thing: before[0] }"},
    {"id": "move", "level": 0, "bridge": "{ ...after, ...next(operator) }"},
    {"id": "move", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.destination }"},
    {"id": "stop", "level": 0, "bridge": "{ thing: after[0], ...next(operator) }"},
    {"id": "stop", "level": 1, "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }"},
    {"id": "position", "level": 0, "bridge": "{ ...next(operator), ...after }"},
    {"id": "number", "level": 0, "bridge": "{ ...next(operator), ...after }"},
    {"id": "count", "level": 0, "bridge": "{ ...operator, ...after, number: operator.value }"},
    {"id": "aEnglish", "level": 0, "selector": {"type": "prefix"}, "bridge": "{ ...after, number: 1 }"},
    {"id": "create", "level": 0, "selector": {"type": "prefix"}, "bridge": "{ klass: after[0], ...next(operator) }"},
    {"id": "create", "level": 1, "bridge": "{ action: 'create', marker: 'create', klass: operator.klass }"},
    {"id": "destroy", "level": 0, "bridge": "{ name: after[0], ...next(operator) }"},
    {"id": "destroy", "level": 1, "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }"},
    {"id": "call", "level": 0, "bridge": "{ ...next(operator), thing: after[0], name: after[1] }"},
    {"id": "call", "level": 1, "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }"},
    {"id": "vers", "level": 0, "bridge": "{ ...next(operator), after: after[0], language: 'french' }"},
    {"id": "aFrench", "level": 0, "bridge": "{ ...next(operator), destination: after[0] }"},
    {"id": "aFrench", "level": 1, "bridge": "{ ...next(operator), thing: before[0] }"},
    {"id": "deplacez", "level": 0, "bridge": "{ ...squish(after), thing: after[0], ...next(operator), language: 'french' }"},
    {"id": "deplacez", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.vers }"},
    {"id": "bougez", "level": 0, "bridge": "{ place: after[0].destination, thing: after[0].thing, ...next(operator) }"},
    {"id": "bougez", "level": 1, "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.place }"},
    {"id": "appellez", "level": 0, "bridge": "{ ...next(operator), thing: after[0], name: after[1] }"},
    {"id": "appellez", "level": 1, "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }"},
    {"id": "arreter", "level": 0, "bridge": "{ thing: after[0], ...next(operator) }"},
    {"id": "arreter", "level": 1, "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }"},
    {"id": "detruire", "level": 0, "bridge": "{ name: after[0], ...next(operator) }"},
    {"id": "detruire", "level": 1, "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }"},
    {"id": "anyConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "week", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "dollarConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "every", "level": 0, "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }"},
    {"id": "earn", "level": 0, "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }"},
    {"id": "worked", "level": 0, "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }"},
    {"id": "food", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "mcdonalds", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "whitespot", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "i", "level": 0, "bridge": "{ ...next(operator) }"},
    {"id": "wantMcDonalds", "level": 0, "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }"},
    {"id": "wantWhitespot", "level": 0, "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }"},
    {"id": "fromM", "level": 0, "bridge": "{ ...next(operator), from: after[0] }"},
    {"id": "fromW", "level": 0, "bridge": "{ ...next(operator), from: after[0] }"},
  ],
  "hierarchy": [
    ["tankConcept", "nameableConcept"],
    ["buildingConcept", "nameableConcept"],
    ["tankConcept", "anyConcept"],
    ["buildingConcept", "anyConcept"],
  ],
  "priorities": [
    [["equal", 0], ["property", 0], ["propertyConcept", 0], ["query", 0], ["the", 0], ["tankConcept", 0]],
    [["earn", 0], ["worked", 0], ["every", 0], ["query", 0]],
    [["earn", 0], ["worked", 0], ["query", 0], ["count", 0]],
    [["earn", 0], ["every", 0], ["worked", 0]],
  ],
  "associations": {
    "negative": [[["tankConcept", 0], ["french", 0], ["aEnglish", 0], ["buildingConcept", 0]], [["conj", 0], ["count", 0], ["plus", 0]], [["equal", 0], ["count", 0], ["plus", 0]], [["wantMcDonalds", 0], ["number", 0], ["food", 0]], [["wantWhitespot", 0], ["number", 0], ["food", 0]], [["conj", 0], ["aFrench", 0], ["food", 0]], [["i", 0], ["wantMcDonalds", 0], ["food", 0], ["fromW", 0]], [["i", 0], ["wantWhitespot", 0], ["food", 0], ["fromM", 0]], [["food", 0], ["fromM", 0], ["whitespot", 0]], [["conj", 0], ["aEnglish", 0], ["food", 0], ["fromW", 0], ["mcdonalds", 0]], [["conj", 0], ["food", 0], ["fromW", 0], ["mcdonalds", 0]], [["food", 0], ["fromW", 0], ["mcdonalds", 0]]],
    "positive": [[["tankConcept", 0], ["french", 0], ["aFrench", 0], ["buildingConcept", 0]], [["conj", 0], ["number", 0], ["plus", 0]], [["the", 0], ["propertyConcept", 0], ["property", 0]], [["equal", 0], ["number", 0], ["plus", 0]], [["i", 0], ["wantWhitespot", 0], ["aEnglish", 0]], [["i", 0], ["wantMcDonalds", 0], ["aEnglish", 0]], [["wantMcDonalds", 0], ["count", 0], ["food", 0]], [["wantWhitespot", 0], ["count", 0], ["food", 0]], [["conj", 0], ["aEnglish", 0], ["food", 0]], [["i", 0], ["wantWhitespot", 0], ["food", 0], ["fromW", 0]], [["food", 0], ["fromW", 0], ["whitespot", 0]], [["conj", 0], ["aEnglish", 0], ["food", 0], ["fromM", 0], ["mcdonalds", 0]], [["conj", 0], ["food", 0], ["fromM", 0], ["mcdonalds", 0]], [["food", 0], ["fromM", 0], ["mcdonalds", 0]]],
  },
  "words": {
    "+": [{"id": "plus"}],
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }"}, {"id": "count", "initial": "{ value: int(group[0]) }"}],
    "plus": [{"id": "plus"}],
    "tanks": [{"id": "tankConcept", "initial": {"language": "english"}}],
    "buildings": [{"id": "buildingConcept"}],
    " tank([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'english' }"}],
    " char([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'french' }"}],
    " building([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'english' }"}],
    " batiment([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'french' }"}],
    "a": [{"id": "aEnglish", "initial": {"language": "english"}}],
    "et": [{"id": "conj", "initial": {"language": "english"}}],
    "speed": [{"id": "propertyConcept", "initial": {"language": "english", "name": "velocity"}}],
    "vitesse": [{"id": "propertyConcept", "initial": {"language": "french", "name": "velocity"}}],
    "position": [{"id": "propertyConcept", "initial": {"language": "english", "name": "position"}}],
    "it": [{"id": "anyConcept", "initial": {"language": "english", "pullFromContext": true}}],
    "week": [{"id": "week", "initial": {"language": "english"}}],
    "dollars": [{"id": "dollarConcept", "initial": {"language": "english"}}],
    "joe": [{"id": "personConcept", "initial": {"id": "joe"}}],
    "sally": [{"id": "personConcept", "initial": {"id": "sally"}}],
    "per": [{"id": "every"}],
    "cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "fries": [{"id": "food", "initial": {"name": "fries"}}],
  },
  "floaters": [
    "language",
    "gender",
    "isQuery",
    "isQuery",
    "isQuery",
  ],
  "implicits": [
    "language",
    "language",
    "language",
  ],
  "flatten": [
    "conj",
  ],
  "utterances": [
    "create a tank move it to building1 create a building move tank1 to it",
    "create a tank move it to building1",
    "what is the speed of tank1 and tank2",
    "what is 1 + 1 + 1 and 20 + 30",
    "move tank1 and tank2 to building2 and tank3 and tank4 to building3",
    "move tank1 to building1 deplacez char1 vers char2",
    "move tank1 to building2 tank2 to building1 and tank3 to building3",
    "create 4 tanks",
    "move all the tanks to building3",
    "move all tanks to building3",
    "move tank1 to tank2",
    "quel est 1 + 1",
    "what is 1 + 1",
    "quelle est la position de char1",
    "quelle est la vitesse de char1",
    "what is the position of tank1",
    "what is the speed of tank1",
    "deplacez char1 et char2 vers batiment1",
    "move tank1 and tank2 to building2",
    "create a tank",
    "create a building",
    "destroy tank1",
    "move tank1 to tank2",
    "move tank1 and tank2 to building1",
    "deplacez char1 vers char2",
    "move tank1 to building1",
    "deplacez char1 vers batiment1",
    "deplacez char1 vers batiment1 move tank1 to tank2",
    "call tank1 commander",
    "appellez char1 commandeur",
    "call building1 cia",
    "appellez batiment1 cia",
    "move commander to cia",
    "deplacez commandeur vers cia",
    "stop tank1",
    "arreter char1",
    "bougez char1 a batiment1",
    "destroy all the buildings",
    "stop all the tanks",
    "destroy all the tanks",
    "joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what",
    "i want 2 fries and a cheeseburger from mcdonalds",
    "i want a cheeseburger and fries from whitespot",
    "3 cheeseburgers and 2 fries",
    "2 fries and a cheeseburger",
    "a cheeseburger and fries",
    "a cheeseburger",
    "1 cheeseburger",
    "i want fries and a cheeseburger from mcdonalds",
    "i want fries from mcdonalds",
    "i want cheeseburger and fries from whitespot",
  ],
  "generators": [
    [({context}) => context.marker.endsWith('Concept') && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.word)}`],
    [({context}) => context.marker.endsWith('Concept') && !('number' in context), ({g, context}) => `${g(context.word)}`],
    [({context}) => context.marker.endsWith('Concept') && context.number == 'all', ({g, context}) => `all ${g(context.word)}`],
    [({context}) => context.marker == 'article' && context.gender == 'm', ({g, context}) => 'le'],
    [({context}) => context.marker == 'article' && context.gender == 'f', ({g, context}) => 'la'],
    [({context}) => context.isProperty && context.language == 'french', ({g, context}) => `${g({marker: 'article', gender: context.gender})} ${g(context.propertyName)} de ${g(context.object)} est ${g(context.value)}`],
    [({context}) => context.isProperty, ({g, context}) => `the ${context.propertyName} of ${g(context.object)} is ${g(context.value)}`],
    [({context}) => context.marker == 'number', ({g, context}) => `${g(context.value)}`],
    [({context}) => context.marker == 'equal', ({g, context}) => `${g(context.objects[1])}`],
    [({context}) => context.marker == 'conj', ({g, context}) => `${context.value.map( (c) => g(c) ).join('and')}`],
    [({context}) => context.marker == 'move' && context.language == 'french', ({g, context}) => `deplacez ${g(context.thing)} vers ${g(context.place)}`],
    [({context}) => context.marker == 'move', ({g, context}) => `move ${g(context.thing)} to ${g(context.place)}`],
    [({context}) => context.marker == 'create', ({g, context}) => `create ${g(context.klass)}`],
    [({context}) => context.marker == 'destroy', ({g, context}) => `destroy ${g(context.name)}`],
    [({context}) => context.marker == 'alias' && context.language == 'french', ({g, context}) => `appellez ${g(context.thing)} ${g(context.name)}`],
    [({context}) => context.marker == 'alias', ({g, context}) => `call ${g(context.thing)} ${g(context.name)}`],
    [({context}) => context.marker == 'commander', ({g, context}) => 'commander'],
    [({context}) => context.marker == 'commandeur', ({g, context}) => 'commandeur'],
    [({context}) => context.marker == 'cia', ({g, context}) => 'CIA'],
    [({context}) => context.marker == 'stop', ({g, context}) => `stop ${g(context.thing)}`],
    [({context}) => context.marker == 'destroy', ({g, context}) => `destroy ${g(context.name)}`],
    [({context}) => context.marker == 'week' && context.duration == 1, ({g, context}) => `${context.duration} week`],
    [({context}) => context.marker == 'week' && context.duration > 1, ({g, context}) => `${context.duration} weeks`],
    [({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}`],
    [({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }`],
    [({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}`],
    [({context}) => context.marker == 'wantWhitespot', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'wantMcDonalds', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'food' && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.name)}`],
    [({context}) => context.marker == 'food' && !('number' in context), ({g, context}) => `${g(context.name)}`],
    [({context}) => context.marker == 'whitespot', ({g, context}) => 'Whitespot'],
    [({context}) => context.marker == 'mcdonalds', ({g, context}) => 'McDonalds'],
  ],
  "semantics": [
    [({objects, context}) => context.marker == 'create'
, ({objects, context}) => { 
    if (context.klass.marker === 'tankConcept') {
      if (!objects.newTanks) {
        objects.newTanks = []
      }
      const tank = objects.newTank(context)
      if (!objects.mentioned) {
        objects.mentioned = []
      }
      objects.mentioned.push({ marker: 'tankConcept', word: tank.name, id: tank.id })
    } else if (context.klass.marker === 'buildingConcept') {
      if (!objects.newBuildings) {
        objects.newBuildings = []
      }
      const building = objects.newBuilding(context)
      if (!objects.mentioned) {
        objects.mentioned = []
      }
      objects.mentioned.push({ marker: 'buildingConcept', word: building.name, id: building.id })
    }
     }],
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