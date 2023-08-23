// This file contains all the config for the natural language interface

module.exports = 
{
  "floaters": [
    "language",
    "gender",
    "isQuery",
    "isQuery",
    "isQuery",
  ],
  "associations": {
    "negative": [],
    "positive": [],
  },
  "words": {
    " tank([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'english' }"}],
    "per": [{"id": "every"}],
    "tanks": [{"id": "tankConcept", "initial": {"language": "english"}}],
    "cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "week": [{"id": "week", "initial": {"language": "english"}}],
    "position": [{"id": "propertyConcept", "initial": {"language": "english", "name": "position"}}],
    "plus": [{"id": "plus"}],
    "vitesse": [{"id": "propertyConcept", "initial": {"language": "french", "name": "velocity"}}],
    " char([0-9]+)": [{"id": "tankConcept", "initial": "{ id: concat('tank', group[0]), language: 'french' }"}],
    "et": [{"id": "conj", "initial": {"language": "english"}}],
    "sally": [{"id": "personConcept", "initial": {"id": "sally"}}],
    "fries": [{"id": "food", "initial": {"name": "fries", "number": "many"}}],
    " batiment([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'french' }"}],
    "it": [{"id": "anyConcept", "initial": {"language": "english", "pullFromContext": true}}],
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }"}, {"id": "count", "initial": "{ value: int(group[0]) }"}],
    "+": [{"id": "plus"}],
    "buildings": [{"id": "buildingConcept"}],
    "dollars": [{"id": "dollarConcept", "initial": {"language": "english"}}],
    " building([0-9]+)": [{"id": "buildingConcept", "initial": "{ id: concat('building', group[0]), language: 'english' }"}],
    "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "a": [{"id": "aEnglish", "initial": {"language": "english"}}],
    "joe": [{"id": "personConcept", "initial": {"id": "joe"}}],
    "speed": [{"id": "propertyConcept", "initial": {"language": "english", "name": "velocity"}}],
  },
  "priorities": [
    [["equal", 0], ["the", 0], ["propertyConcept", 0], ["query", 0], ["property", 0], ["tankConcept", 0]],
    [["equal", 0], ["the", 0], ["property", 0], ["query", 0], ["propertyConcept", 0]],
    [["equal", 0], ["property", 0], ["query", 0]],
    [["equal", 0], ["property", 1]],
    [["earn", 0], ["worked", 0], ["every", 0], ["query", 0]],
    [["earn", 0], ["worked", 0], ["query", 0], ["count", 0]],
    [["earn", 0], ["every", 0], ["worked", 0]],
    [["conj", 0], ["plus", 0]],
  ],
  "hierarchy": [
    ["tankConcept", "nameableConcept"],
    ["buildingConcept", "nameableConcept"],
    ["tankConcept", "anyConcept"],
    ["buildingConcept", "anyConcept"],
  ],
  "flatten": [
    "conj",
  ],
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
  "bridges": [
    {"id": "english", "bridge": "{ ...after }", "level": 0},
    {"id": "french", "bridge": "{ ...after }", "level": 0},
    {"id": "name", "bridge": "{ ...after }", "level": 0},
    {"id": "nameableConcept", "bridge": "{ ...after }", "level": 0},
    {"id": "all", "bridge": "{ ...after[0], number: 'all' }", "level": 0},
    {"id": "the", "bridge": "{ ...after[0], concept: true }", "level": 0},
    {"id": "la", "bridge": "{ ...after[0], gender: 'f', concept: true }", "level": 0},
    {"id": "query", "bridge": "{ marker: 'query', isQuery: true }", "level": 0},
    {"id": "property", "bridge": "{ object: after[0], ...next(operator) }", "level": 0},
    {"id": "property", "bridge": "{ value: objects.tanks[operator.object['id']][before[0].name], marker: operator(objects.types[before[0].name].id, objects.types[before[0].name].level), propertyName: before[0].name, object:operator.object.id, isProperty: true }", "level": 1},
    {"id": "equal", "bridge": "{ objects: after[0], ...next(operator) }", "level": 0},
    {"id": "equal", "bridge": "{ ...next(operator), objects: append(before, [operator.objects]) }", "level": 1},
    {"selector": {"passthrough": true, "right": [{"marker": "number"}], "match": "same", "left": [{"marker": "number"}]}, "id": "plus", "bridge": "{ ...next(operator), value: add(before, after), marker: before[0].marker }", "level": 0},
    {"selector": {"passthrough": true, "right": [{"sentinals": ["number"], "variable": "v"}], "match": "same", "left": [{"no_match": ["nameableConcept", "anyConcept"], "sentinals": ["number"], "variable": "v"}]}, "id": "conj", "bridge": "{ ...next(operator), value: append(before, after) }", "level": 0},
    {"selector": {"passthrough": true, "match": "same", "left": [{"sentinals": ["number"], "variable": "v"}]}, "id": "conj", "bridge": "{ ...operator, value: append(before, operator.value) }", "level": 1},
    {"id": "propertyConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "tankConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "buildingConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "to", "bridge": "{ ...next(operator), destination: after[0] }", "level": 0},
    {"id": "to", "bridge": "{ ...next(operator), thing: before[0] }", "level": 1},
    {"id": "move", "bridge": "{ ...after[0], ...next(operator) }", "level": 0},
    {"id": "move", "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.destination }", "level": 1},
    {"id": "stop", "bridge": "{ thing: after[0], ...next(operator) }", "level": 0},
    {"id": "stop", "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }", "level": 1},
    {"id": "position", "bridge": "{ ...next(operator), ...after }", "level": 0},
    {"id": "number", "bridge": "{ ...next(operator), ...after }", "level": 0},
    {"id": "count", "bridge": "{ ...operator, ...after[0], number: operator.value }", "level": 0},
    {"selector": {"type": "prefix"}, "id": "aEnglish", "bridge": "{ ...after[0], number: 1 }", "level": 0},
    {"selector": {"type": "prefix"}, "id": "create", "bridge": "{ klass: after[0], ...next(operator) }", "level": 0},
    {"id": "create", "bridge": "{ action: 'create', marker: 'create', klass: operator.klass }", "level": 1},
    {"id": "destroy", "bridge": "{ name: after[0], ...next(operator) }", "level": 0},
    {"id": "destroy", "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }", "level": 1},
    {"id": "call", "bridge": "{ ...next(operator), thing: after[0], name: after[1] }", "level": 0},
    {"id": "call", "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }", "level": 1},
    {"id": "vers", "bridge": "{ ...next(operator), after: after[0], language: 'french' }", "level": 0},
    {"id": "aFrench", "bridge": "{ ...next(operator), destination: after[0] }", "level": 0},
    {"id": "aFrench", "bridge": "{ ...next(operator), thing: before[0] }", "level": 1},
    {"id": "deplacez", "bridge": "{ ...squish(after), thing: after[0], ...next(operator), language: 'french' }", "level": 0},
    {"id": "deplacez", "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.vers }", "level": 1},
    {"id": "bougez", "bridge": "{ place: after[0].destination, thing: after[0].thing, ...next(operator) }", "level": 0},
    {"id": "bougez", "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.place }", "level": 1},
    {"id": "appellez", "bridge": "{ ...next(operator), thing: after[0], name: after[1] }", "level": 0},
    {"id": "appellez", "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }", "level": 1},
    {"id": "arreter", "bridge": "{ thing: after[0], ...next(operator) }", "level": 0},
    {"id": "arreter", "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }", "level": 1},
    {"id": "detruire", "bridge": "{ name: after[0], ...next(operator) }", "level": 0},
    {"id": "detruire", "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }", "level": 1},
    {"id": "anyConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "week", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "dollarConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "personConcept", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "every", "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }", "level": 0},
    {"id": "earn", "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }", "level": 0},
    {"id": "worked", "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }", "level": 0},
    {"id": "food", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "mcdonalds", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "whitespot", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "i", "bridge": "{ ...next(operator) }", "level": 0},
    {"id": "wantMcDonalds", "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "level": 0},
    {"id": "wantWhitespot", "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "level": 0},
    {"id": "fromM", "bridge": "{ ...next(operator), from: after[0] }", "level": 0},
    {"id": "fromW", "bridge": "{ ...next(operator), from: after[0] }", "level": 0},
  ],
  "implicits": [
    "language",
    "language",
    "language",
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