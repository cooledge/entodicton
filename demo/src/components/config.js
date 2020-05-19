module.exports = {
  "bridges": [
    {
      "bridge": "{ ...next(operator), value: append(before, after) }",
      "id": "and",
      "level": 0,
      "selector": "same"
    },
    {
      "bridge": "{ ...operator, value: append(before, operator.value) }",
      "id": "and",
      "level": 1,
      "selector": "same"
    },
    {
      "bridge": "{ ...next(operator) }",
      "id": "tankConcept",
      "level": 0
    },
    {
      "bridge": "{ ...next(operator) }",
      "id": "buildingConcept",
      "level": 0
    },
    {
      "bridge": "{ ...next(operator), after: after[0] }",
      "id": "to",
      "level": 0
    },
    {
      "bridge": "{ ...squish(after), thing: after[0], ...next(operator) }",
      "id": "move",
      "level": 0
    },
    {
      "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.to }",
      "id": "move",
      "level": 1
    },
    {
      "bridge": "{ thing: after[0], ...next(operator) }",
      "id": "stop",
      "level": 0
    },
    {
      "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }",
      "id": "stop",
      "level": 1
    },
    {
      "bridge": "{ ...after, number: 1 }",
      "id": "aEnglish",
      "level": 0
    },
    {
      "bridge": "{ klass: after[0], ...next(operator) }",
      "id": "create",
      "level": 0
    },
    {
      "bridge": "{ action: 'create', marker: 'create', klass: operator.klass }",
      "id": "create",
      "level": 1
    },
    {
      "bridge": "{ name: after[0], ...next(operator) }",
      "id": "destroy",
      "level": 0
    },
    {
      "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }",
      "id": "destroy",
      "level": 1
    },
    {
      "bridge": "{ ...next(operator), thing: after[0], name: after[1] }",
      "id": "call",
      "level": 0
    },
    {
      "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }",
      "id": "call",
      "level": 1
    },
    {
      "bridge": "{ ...next(operator), after: after[0] }",
      "id": "vers",
      "level": 0
    },
    {
      "bridge": "{ ...next(operator), after: after[0] }",
      "id": "aFrench",
      "level": 0
    },
    {
      "bridge": "{ ...squish(after), thing: after[0], ...next(operator) }",
      "id": "deplacez",
      "level": 0
    },
    {
      "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.vers }",
      "id": "deplacez",
      "level": 1
    },
    {
      "bridge": "{ ...squish(after), thing: after[0], ...next(operator) }",
      "id": "bougez",
      "level": 0
    },
    {
      "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.aFrench }",
      "id": "bougez",
      "level": 1
    },
    {
      "bridge": "{ ...next(operator), thing: after[0], name: after[1] }",
      "id": "appeller",
      "level": 0
    },
    {
      "bridge": "{ marker: 'alias', thing: operator.thing, name: operator.name }",
      "id": "appeller",
      "level": 1
    },
    {
      "bridge": "{ thing: after[0], ...next(operator) }",
      "id": "arreter",
      "level": 0
    },
    {
      "bridge": "{ action: 'stop', marker: 'stop', thing: operator.thing }",
      "id": "arreter",
      "level": 1
    },
    {
      "bridge": "{ name: after[0], ...next(operator) }",
      "id": "detruire",
      "level": 0
    },
    {
      "bridge": "{ action: 'destroy', marker: 'destroy', name: operator.name }",
      "id": "detruire",
      "level": 1
    }
  ],
  "operators": [
    "([move] ([tankConcept|tank]) ([to] ([buildingConcept|building])))",
    "(([tankConcept]) [(([tankConcept]) [and] ([tankConcept]))])",
    "([stop] ([tankConcept|tank]))",
    "([create] ({aEnglish|a} ([tankConcept|tank])))",
    "([destroy] ([tankConcept|tank]))",
    "([call] ([tankConcept|tank]) (joe))",
    "([appeller] ([tankConcept|char]) francois)",
    "([deplacez] ([tankConcept|char]) ([vers] immeuble1))",
    "([bougez] char1 ([aFrench|a] immeuble1))",
    "(([tankConcept|char]) [conj|et] ([tankConcept]))",
    "([arreter] ([tankConcept|char1]))",
    "([detruire] ([tankConcept|char1]))"
  ],
  "words": {}
};