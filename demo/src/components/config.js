module.exports = {
  "bridges": [
    {
      "bridge": "{ ...next(operator), value: append(before, after) }",
      "id": "conj",
      "level": 0,
      "selector": {
        "match": "same",
        "passthrough": true,
        "type": "infix"
      }
    },
    {
      "bridge": "{ ...operator, value: append(before, operator.value) }",
      "id": "conj",
      "level": 1,
      "selector": {
        "match": "same",
        "passthrough": true,
        "type": "postfix"
      }
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
      "level": 0,
      "selector": {
        "type": "prefix"
      }
    },
    {
      "bridge": "{ klass: after[0], ...next(operator) }",
      "id": "create",
      "level": 0,
      "selector": {
        "type": "prefix"
      }
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
  "flatten": [
    "conj"
  ],
  "operators": [
    "([move] ([tankConcept|tank]) ([to] ([buildingConcept|building])))",
    "(([tankConcept]) [(([tankConcept]) [conj|and] ([tankConcept]))])",
    "([stop] ([tankConcept|tank]))",
    "([create] (<aEnglish|a> ([tankConcept|tank])))",
    "([create] (<aEnglish|a> ([buildingConcept])))",
    "([destroy] ([tankConcept|tank]))",
    "([call] ([tankConcept|tank]) (joe))",
    "([appeller] ([tankConcept|char]) francois)",
    "([deplacez] ([tankConcept|char]) ([vers] batiment))",
    "([bougez] ([tankConcept]) ([aFrench|a] batiment))",
    "(([tankConcept|char]) [conj|et] ([tankConcept]))",
    "([arreter] ([tankConcept|char]))",
    "([detruire] ([tankConcept|char]))"
  ],
  "queries": [
    "deplacez char1 et char2 vers batiment1",
    "move tank1 and tank2 to building2",
    "create a tank",
    "create a building",
    "bougez char1 a batiment1",
    "destroy tank1",
    "move tank1 to tank2",
    "move tank1 and tank2 to building1",
    "deplacez char1 vers char2",
    "deplacez char1 et char2 vers bataille1",
    "bougez char1 a batiment1",
    "move tank1 to building1",
    "deplacez char1 vers batiment1",
    "move tank1 to building1 deplacez char1 vers char2",
    "deplacez char1 vers batiment1 move tank1 to tank2",
    "call tank1 commander",
    "appeller char1 commandeur",
    "call building1 cia",
    "appeller batiment1 cia",
    "move commander to cia",
    "deplacez commandeur vers cia",
    "stop tank1",
    "arreter char1"
  ],
  "words": {
    "et": [
      {
        "id": "conj"
      }
    ]
  }
};