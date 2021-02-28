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
  ],
  "priorities": [
    [["fromW", 0], ["wantWhitespot", 0], ["aEnglish", 0]],
    [["aEnglish", 0], ["wantWhitespot", 0], ["i", 0]],
    [["wantWhitespot", 0], ["aEnglish", 0], ["count", 0]],
    [["i", 0], ["wantMcDonalds", 0], ["aEnglish", 0], ["count", 0]],
    [["wantMcDonalds", 0], ["aEnglish", 0], ["fromM", 0]],
  ],
  "associations": {
    "negative": [[["wantMcDonalds", 0], ["number", 0], ["food", 0]], [["wantWhitespot", 0], ["number", 0], ["food", 0]], [["conj", 0], ["aFrench", 0], ["food", 0]]],
    "positive": [[["i", 0], ["wantWhitespot", 0], ["aEnglish", 0]], [["i", 0], ["wantMcDonalds", 0], ["aEnglish", 0]], [["wantMcDonalds", 0], ["count", 0], ["food", 0]], [["wantWhitespot", 0], ["count", 0], ["food", 0]], [["conj", 0], ["aEnglish", 0], ["food", 0]]],
  },
  "words": {
    "cheeseburger": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "cheeseburgers": [{"id": "food", "initial": {"name": "cheeseburger"}}],
    "fries": [{"id": "food", "initial": {"name": "fries"}}],
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
    [({context}) => context.marker == 'wantWhitespot', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'wantMcDonalds', ({g, context}) => `order for ${g(context.items)} from ${g(context.store)}`],
    [({context}) => context.marker == 'food' && context.number > 0, ({g, context}) => `${g(context.number)} ${g(context.name)}`],
    [({context}) => context.marker == 'food' && !('number' in context), ({g, context}) => `${g(context.name)}`],
    [({context}) => context.marker == 'whitespot', ({g, context}) => 'Whitespot'],
    [({context}) => context.marker == 'mcdonalds', ({g, context}) => 'McDonalds'],
  ],
  "semantics": [
  ],
};