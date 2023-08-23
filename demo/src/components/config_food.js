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
    "cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "fries": [{"id": "food", "initial": {"name": "fries", "number": "many"}}],
  },
  "priorities": [
    [["conj", 0], ["plus", 0]],
  ],
  "hierarchy": [
  ],
  "flatten": [
    "conj",
  ],
  "operators": [
    "(([i]) [wantMcDonalds|want] ([food]) ([fromM|from] ([mcdonalds])))",
    "(([i]) [wantWhitespot|want] ([food]) ([fromW|from] ([whitespot])))",
    "(<count> ([food]))",
    "(<aEnglish> ([food]))",
    "(([food]) [conj] ([food]))",
  ],
  "generators": [
    [({context}) => context.marker == 'wantWhitespot', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'wantMcDonalds', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'food' && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.name)}`],
    [({context}) => context.marker == 'food' && !('number' in context), ({g, context}) => `${g(context.name)}`],
    [({context}) => context.marker == 'whitespot', ({g, context}) => 'Whitespot'],
    [({context}) => context.marker == 'mcdonalds', ({g, context}) => 'McDonalds'],
  ],
  "bridges": [
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
  "semantics": [
  ],
};