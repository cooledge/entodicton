// This file contains all the config for the natural language interface

module.exports = 
{
  "operators": [
    "(([i]) [wantMcDonalds|want] ([food]) ([fromM|from] ([mcdonalds])))",
    "(([i]) [wantWhitespot|want] ([food]) ([fromW|from] ([whitespot])))",
    "(<count> ([food]))",
    "(<aEnglish> ([food]))",
    "(([food]) [conj] ([food]))",
  ],
  "bridges": [
    {"id": "food", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "7"},
    {"id": "mcdonalds", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "7"},
    {"id": "whitespot", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "7"},
    {"id": "i", "level": 0, "bridge": "{ ...next(operator) }", "uuid": "7"},
    {"id": "wantMcDonalds", "level": 0, "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "uuid": "7"},
    {"id": "wantWhitespot", "level": 0, "bridge": "{ ...next(operator), action: 'order', items: after[0], store: after[1].from }", "uuid": "7"},
    {"id": "fromM", "level": 0, "bridge": "{ ...next(operator), from: after[0] }", "uuid": "7"},
    {"id": "fromW", "level": 0, "bridge": "{ ...next(operator), from: after[0] }", "uuid": "7"},
  ],
  "hierarchy": [
  ],
  "priorities": [
    {"context": [["plus", 0], ["conj", 0]], "choose": [0]},
  ],
  "associations": {
    "negative": [],
    "positive": [],
  },
  "words": {
    "literals": {"cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}, "uuid": "7"}], "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}, "uuid": "7"}], "fries": [{"id": "food", "initial": {"name": "fries", "number": "many"}, "uuid": "7"}]},
    "patterns": [],
    "hierarchy": [],
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
    [({context}) => context.marker == 'wantWhitespot', async ({g, gs, context}) => `order for ${await g(context.items)} from ${await g(context.store)}`],
    [({context}) => context.marker == 'wantMcDonalds', async ({g, gs, context}) => `order for ${await g(context.items)} from ${await g(context.store)}`],
    [({context}) => context.marker == 'food' && context.number > 0, async ({g, gs, context}) => `${await g(context.number)} ${await g(context.name)}`],
    [({context}) => context.marker == 'food' && !('number' in context), async ({g, gs, context}) => `${await g(context.name)}`],
    [({context}) => context.marker == 'whitespot', async ({g, gs, context}) => 'Whitespot'],
    [({context}) => context.marker == 'mcdonalds', async ({g, gs, context}) => 'McDonalds'],
  ],
  "semantics": [
  ],
};