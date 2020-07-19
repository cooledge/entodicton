module.exports = {
  "bridges": [
    {
      "bridge": "{ ...after, concept: true }",
      "id": "the",
      "level": 0
    },
    {
      "bridge": "{ ...after, concept: true }",
      "id": "la",
      "level": 0
    },
    {
      "bridge": "{ marker: 'query', isQuery: true }",
      "id": "query",
      "level": 0
    },
    {
      "bridge": "{ object: after[0], ...next(operator) }",
      "id": "property",
      "level": 0
    },
    {
      "bridge": "{ value: before[0], ...next(operator) }",
      "id": "property",
      "level": 1
    },
    {
      "bridge": "{ objects: after[0], ...next(operator) }",
      "id": "equalProperty",
      "level": 0
    },
    {
      "bridge": "{ ...next(operator), objects: append(before[0], operator.objects) }",
      "id": "equalProperty",
      "level": 1
    },
    {
      "bridge": "{ objects: after[0], ...next(operator) }",
      "id": "equalNumber",
      "level": 0
    },
    {
      "bridge": "{ ...next(operator), objects: append(before[0], operator.objects) }",
      "id": "equalNumber",
      "level": 1
    },
    {
      "bridge": "{ ...next(operator), value: add(before, after) }",
      "id": "plus",
      "level": 0,
      "selector": {
        "type": "infix"
      }
    },
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
      "id": "propertyConcept",
      "level": 0
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
      "bridge": "{ ...next(operator), destination: after[0] }",
      "id": "to",
      "level": 0,
      "selector": {
        "type": "prefix"
      }
    },
    {
      "bridge": "{ ...next(operator), thing: before[0] }",
      "id": "to",
      "level": 1
    },
    {
      "bridge": "{ ...after, ...next(operator) }",
      "id": "move",
      "level": 0
    },
    {
      "bridge": "{ action: 'move', marker: 'move', thing: operator.thing, place: operator.destination }",
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
    "(([query|what]) [([equalProperty|is] ((<the> ([propertyConcept])) [([property|of] ([tankConcept]))]))])",
    "(([query|what]) [([equalNumber|is] (1 [plus] 1))])",
    "(([query|quel]) [([equalNumber|est] (1 [plus] 1))])",
    "(([query|quel]) [([equalProperty|est] ((<la> ([propertyConcept])) [([property|de] ([tankConcept]))]))])",
    "([move] (([tankConcept|tank]) [([to] ([buildingConcept|building]))]))",
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
    "move tank1 and tank2 to building2 and tank3 and tank4 to building3",
    "move tank1 to building2 tank2 to building1 and tank3 to building3",
    "quel est 1 + 1",
    "what is 1 + 1",
    "what is the speed of tank1 and tank2",
    "quel est la position de char1",
    "quel est la vitesse de char1",
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
    "deplacez char1 et char2 vers bataille1",
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
    "arreter char1",
    "bougez char1 a batiment1",
    "bougez char1 a batiment1"
  ],
  "words": {
    "+": [
      {
        "id": "plus"
      }
    ],
    "batiment1": [
      {
        "id": "buildingConcept",
        "initial": {
          "id": "building1"
        }
      }
    ],
    "batiment2": [
      {
        "id": "buildingConcept",
        "initial": {
          "id": "building2"
        }
      }
    ],
    "building1": [
      {
        "id": "buildingConcept",
        "initial": {
          "id": "building1"
        }
      }
    ],
    "building2": [
      {
        "id": "buildingConcept",
        "initial": {
          "id": "building2"
        }
      }
    ],
    "building3": [
      {
        "id": "buildingConcept",
        "initial": {
          "id": "building3"
        }
      }
    ],
    "char1": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank1"
        }
      }
    ],
    "char2": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank2"
        }
      }
    ],
    "et": [
      {
        "id": "conj"
      }
    ],
    "plus": [
      {
        "id": "plus"
      }
    ],
    "position": [
      {
        "id": "propertyConcept",
        "initial": {
          "name": "position"
        }
      }
    ],
    "speed": [
      {
        "id": "propertyConcept",
        "initial": {
          "name": "speed"
        }
      }
    ],
    "tank1": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank1"
        }
      }
    ],
    "tank2": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank2"
        }
      }
    ],
    "tank3": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank3"
        }
      }
    ],
    "tank4": [
      {
        "id": "tankConcept",
        "initial": {
          "id": "tank4"
        }
      }
    ],
    "vitesse": [
      {
        "id": "propertyConcept",
        "initial": {
          "name": "speed"
        }
      }
    ]
  }
};
