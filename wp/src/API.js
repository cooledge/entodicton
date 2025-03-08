import { Editor, Transforms, Text } from 'slate';

function makeAllTextColor(editor, color) {
  /*
  Transforms.setNodes(
    editor,
    { color },
    {
      match: n => Text.isText(n),
      split: true,
    }
  );
  */
  Transforms.setNodes(
    editor,
    { italic: true },
    {
      match: n => Text.isText(n),
      split: true,
    }
  );
  Transforms.move(editor, {
    distance: 3,
    unit: 'word',
    reverse: true,
  })
}

const testsToTest = (tests) => (editor, path, word, args) => {
  for (const test of tests) {
    const result = test(editor, path, word, args)
    if (!test(editor, path, word, args)) {
      return false
    }
  }
  return true
}

const selectAllText = (editor) => {
  // Get the range that spans the entire document
  const range = Editor.range(
    editor,
    Editor.start(editor, []),
    Editor.end(editor, [])
  );

  // Apply the selection to the entire document
  Transforms.select(editor, range);
};

function hasTag(editor, path, tagName) {
  let [node] = editor.node(path)
  console.log(`hasTag path: ${path} tagName: ${tagName}`)
  if (Text.isText(node)) {
    // return node.bold === true;
    return node[tagName] === true;
  }
}

function tagParagraphs(editor, { paragraphCondition = () => true, onParagraphCondition = () => true } = {}, styles) {
  const { selection } = editor
  let condition = () => true
  Transforms.deselect(editor) // Clear selection to apply changes to all text

  if (false) {
    console.log('---------------- before')
    console.log('editor.children', editor.children)
    Editor.nodes(editor, {
      at: [],
      match: n => n.type && n.type == 'paragraph',
      mode: 'lowest',
      voids: false,
    }).forEach(([node, path]) => {
      console.log('chunk', node.text, path)
    })
  }

  let telemetry = {
    paragraphOrdinal: -1,
  }
  Editor.nodes(editor, {
    at: [],
    match: n => n.type && n.type == 'paragraph',
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    debugger
    console.log('chunk', node.text)
    telemetry.paragraphOrdinal = path[0]+1
    onParagraphCondition({ telemetry })
    if (!paragraphCondition({ telemetry })) {
      return // continue
    }

    const paragraphPath = path
    const paragraphNode = node
    const range = {
      anchor: { path: paragraphPath.concat(0), offset: 0 }, // Start of the first child
      focus: {
        path: paragraphPath.concat(paragraphNode.children.length - 1),
        offset: paragraphNode.children[paragraphNode.children.length - 1].text.length, // End of the last child
      },
    }
    console.log('        selecting', JSON.stringify(range))
    Transforms.select(editor, range);
    for (const style of styles) {
      Editor.addMark(editor, style, true)
    }
    const setLastElement = (path, last) => {
      let updatedPath = [];
      for (let element of path.slice(0, -1)) {
        updatedPath.push(element)
      }
      updatedPath.push(last)
      return updatedPath
    }
  })

  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log(`${path} - ${node.text}`)
  })

  // Restore previous selection if it existed
  if (selection) {
    Transforms.select(editor, selection)
  }
}

function tagWords(editor, { 
  wordCondition, 
  onWordCondition = () => true, 
  paragraphCondition = () => true, 
  onParagraphCondition = () => true, 
  isTest } = {}, styles) {
  const { selection } = editor
  Transforms.deselect(editor) // Clear selection to apply changes to all text

  console.log('---------------- before')
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log('chunk', node.text)
  })

  const debugUpdate = false

  if (debugUpdate) {
    console.log(JSON.stringify(editor.children, null, 2))
    console.log('---------------- during')
  }
  let telemetry = {
    wordOrdinal: 0,
    wordInParagraphOrdinal: 0,
    lastParagraphOrdinal: -1,
    paragraphOrdinal: -1,
    lastParagraphOrdinal: -1,
  }
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log('chunk', node.text)
    telemetry.paragraphOrdinal = path[0]+1
    if (!paragraphCondition({ telemetry })) {
      return // continue
    }
    if (telemetry.paragraphOrdinal != telemetry.lastParagraphOrdinal) {
      telemetry.wordInParagraphOrdinal = 0
      telemetry.lastParagraphOrdinal = telemetry.paragraphOrdinal
      onParagraphCondition({ telemetry })
      // paragraph({ telemetry })
      // const { skip, } = paragraph({ paragraphOrdinalI/
    }
    // const words = node.text.split(/\s+/)
    const words = node.text.match(/\S+|\s+/g)
    console.log('node', node)
    console.log('path', path)
    let offset = 0
    console.log('words', words)
    words.forEach((word) => {
      if (word.trim() == '') {
        offset += word.length
        return
      }
      if (word.length > 0) {
        telemetry.wordOrdinal += 1
        telemetry.wordInParagraphOrdinal += 1
      }
      console.log(`    checking word: "${word}", path: ${JSON.stringify(path)} wordOrdinal: ${telemetry.wordOrdinal} wordInParagraphOrdinal: ${telemetry.wordInParagraphOrdinal} paragraphOrdinal: ${telemetry.paragraphOrdinal}`)
      if (wordCondition(editor, path, word, telemetry)) {
        onWordCondition({ telemetry })
        if (isTest) {
          return
        }
        if (!styles) {
          return
        }
        const start = offset
        const end = start + word.length
        console.log(`    okay(${start}, ${end}): `, word)
        const range = {
          anchor: { path, offset: start },
          focus: { path, offset: end }
        }
        console.log('        selecting', JSON.stringify(range))
        Transforms.select(editor, range);
        for (const style of styles) {
          Editor.addMark(editor, style, true)
        }
        const setLastElement = (path, last) => {
          let updatedPath = [];
          for (let element of path.slice(0, -1)) {
            updatedPath.push(element)
          }
          updatedPath.push(last)
          return updatedPath
        }
        const increment = offset ? 2 : 1
        path = setLastElement(path, path[path.length-1]+increment)
        offset = 0
      } else {
        offset += word.length
      }
      if (debugUpdate) {
        console.log('after update')
        console.log(JSON.stringify(editor.children, null, 2))
      }
    })
  })

  if (debugUpdate) {
    console.log('---------------- after')
    console.log(JSON.stringify(editor.children, null, 2))
  }
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log(`${path} - ${node.text}`)
  })

  // Restore previous selection if it existed
  if (selection) {
    Transforms.select(editor, selection)
  }
}

function tagLetters(editor, { 
    letterCondition, 
    onLetterCondition = () => true ,
    wordCondition = () => true, 
    onWordCondition = () => true, 
    paragraphCondition = () => true, 
    onParagraphCondition = () => true, 
    isTest, 
  } = {}, styles) {
  const { selection } = editor
  Transforms.deselect(editor) // Clear selection to apply changes to all text

  console.log('---------------- before')
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log('chunk', node.text)
  })

  const debugUpdate = false

  if (debugUpdate) {
    console.log(JSON.stringify(editor.children, null, 2))
    console.log('---------------- during')
  }
  let telemetry = {
    letterOrdinal: 0,
    letterInWordOrdinal: 0,
    letterInParagraphOrdinal: 0,
    wordOrdinal: 0,
    wordInParagraphOrdinal: 0,
    lastParagraphOrdinal: -1,
    paragraphOrdinal: -1,
    lastParagraphOrdinal: -1,
  }

  const nodesIterator = Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  })
  const nodes = []
  for (const node of nodesIterator) {
    nodes.push(node)
  }

  let childOffset = 0
  let lastParagraph = -1
  for (let [node, path] of nodes) {
    if (path[0] !== lastParagraph) {
      lastParagraph = path[0]
      childOffset = 0
    }
    path = [path[0], path[1]+childOffset]
    console.log('chunk', node.text)
    telemetry.paragraphOrdinal = path[0]+1
    if (!paragraphCondition({ telemetry })) {
      continue
    }
    if (telemetry.paragraphOrdinal != telemetry.lastParagraphOrdinal) {
      telemetry.letterInParagraphOrdinal = 0
      telemetry.wordInParagraphOrdinal = 0
      telemetry.lastParagraphOrdinal = telemetry.paragraphOrdinal
      onParagraphCondition({ telemetry })
    }
    const words = node.text.match(/\S+|\s+/g)
    console.log('node', node)
    console.log('path', path)
    let offset = 0
    console.log('words', words)
    debugger
    // bold the first letter of each word
    const startNChildren = editor.children[path[0]].children.length
    const startIChild = path[1]
    words.forEach((word) => {
      debugger
      path = [path[0], startIChild + editor.children[path[0]].children.length-startNChildren]
      if (word.trim() == '') {
        offset += word.length
        return
      }
      if (word.length > 0) {
        telemetry.wordOrdinal += 1
        telemetry.wordInParagraphOrdinal += 1
      }
      console.log(`    checking word: "${word}", path: ${JSON.stringify(path)} wordOrdinal: ${telemetry.wordOrdinal} wordInParagraphOrdinal: ${telemetry.wordInParagraphOrdinal} paragraphOrdinal: ${telemetry.paragraphOrdinal}`)
      if (wordCondition(editor, path, word, telemetry)) {
        telemetry.letterInWordOrdinal = 0
        for (const letter of word) {
          telemetry.letterInWordOrdinal += 1
          telemetry.letterInParagraphOrdinal += 1
          telemetry.letterOrdinal += 1
          if (letterCondition(editor, path, word, telemetry)) {
            onLetterCondition(editor, path, word, telemetry)
            if (isTest) {
              return
            }
            if (!styles) {
              return
            }
            const start = offset
            const end = start + 1
            console.log(`    okay(${start}, ${end}): `, word)
            const range = {
              anchor: { path, offset: start },
              focus: { path, offset: end }
            }
            console.log('        selecting', JSON.stringify(range))
            Transforms.select(editor, range);
            let addMarkWasCalled = false
            for (const style of styles) {
              if (!hasTag(editor, path, style)) {
                Editor.addMark(editor, style, true)
                addMarkWasCalled = true
              }
            }
            const setLastElement = (path, last) => {
              let updatedPath = [];
              for (let element of path.slice(0, -1)) {
                updatedPath.push(element)
              }
              updatedPath.push(last)
              return updatedPath
            }
            // const increment = offset ? 2 : 1
            // path = setLastElement(path, path[path.length-1]+increment)
            // path = setLastElement(path, path[path.length-1]+1)
            if (addMarkWasCalled) {
              if (offset > 0) {
                childOffset += 1
              }
              offset = 0
              childOffset += 1
              path = [path[0], childOffset]
            }
          } else {
            offset += 1
          }
        }
      } else {
        offset += word.length
        telemetry.letterInWordOrdinal = 0
        telemetry.letterInParagraphOrdinal += word.length
        telemetry.letterOrdinal += word.length
      }

      // underline the first letter of the bolded words
      // path = [path[0], path[1]+1]
      // childOffset += 1

      if (debugUpdate) {
        console.log('after update')
        console.log(JSON.stringify(editor.children, null, 2))
      }
    })
  }

  if (debugUpdate) {
    console.log('---------------- after')
    console.log(JSON.stringify(editor.children, null, 2))
  }
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log(`${path} - ${node.text}`)
  })

  // Restore previous selection if it existed
  if (selection) {
    Transforms.select(editor, selection)
  }
}

const styleToTagName = (style) => {
  switch (style) {
    case "bolded_wp":
      return 'bold';
    case "underlined_wp":
      return 'underline';
    case "italicized_wp":
      return 'italic';
    case "uppercased_wp":
    case "capitalized_wp":
      return 'capitalize';
    case "lowercased_wp":
      return 'lowercase';
  }
}

// Usage
// Assuming you have an editor state

class API {
  initialize({ objects, config }) {
    this._objects = objects
  }

  changeState(value) {
    // const { unit, scope, color, styles, conditions } = value
    const { selectors, color, styles} = value

    // use current selection
    if (selectors.length == 0) {
      console.log('changeState', value)
      // makeAllTextColor(this.props.editor, color)
      for (const style of styles || []) {
        Editor.addMark(this.props.editor, style, true)
      }
      return
    }

    // special case where a selection can be made
    if (selectors.length == 1 && selectors[0].unit == 'everything') {
      selectAllText(this.props.editor)
      for (const style of styles || []) {
        Editor.addMark(this.props.editor, style, true)
      }
      return
    }

    const getCondition = (unit, conditions, ordinalScope) => { 
      const tests = conditions.map(({ comparison, letters, hasStyle, ordinals }) => {
        if (comparison == 'prefix') {
          return (editor, path, word) => word.toLowerCase().startsWith(letters)
        }
        if (comparison == 'suffix') {
          return (editor, path, word) => word.toLowerCase().endsWith(letters)
        }
        if (comparison == 'include') {
          return (editor, path, word) => word.toLowerCase().includes(letters)
        }
        if (hasStyle) {
          return (editor, path, word) => hasTag(editor, path, styleToTagName(hasStyle))
        }
        if (ordinals) {
          // return (editor, path, word, { letterOrdinal, wordOrdinal, paragraphOrdinal, wordInParagraphOrdinal }) => {
          return (editor, path, word, telemetry) => {
            switch (unit) {
            case "letter": {
              if (ordinalScope == 'paragraph') {
                return ordinals.includes(telemetry.letterInParagraphOrdinal)
              } if (ordinalScope == 'word') {
                return ordinals.includes(telemetry.letterInWordOrdinal)
              } else {
                return ordinals.includes(telemetry.letterOrdinal)
              }
            }
            case "word": {
              if (ordinalScope == 'paragraph') {
                return ordinals.includes(telemetry.wordInParagraphOrdinal)
              } else {
                return ordinals.includes(telemetry.wordOrdinal)
              }
            }
            case "paragraph": {
              return ordinals.includes(telemetry.paragraphOrdinal)
            }
            }
          }
        }
        return () => true
      })

      return testsToTest(tests)
    }

    let wordCondition = () => true
    let onWordCondition = () => true
    let paragraphCondition = () => true
    let onParagraphCondition = () => true
    let ordinalScope = ''

    const paragraphSelector = selectors.find( (selector) => selector.unit == 'paragraph' )
    const wordSelector = selectors.find( (selector) => selector.unit == 'word' )
    const letterSelector = selectors.find( (selector) => selector.unit == 'letter' )
    // if (selectors[0].unit == 'paragraph') {
    if (paragraphSelector) {
      // const selector = selectors.shift()
      const selector = paragraphSelector
      const { unit, scope, conditions } = selector
      let ordinals = []
      let wordTests = []
      for (const condition of conditions) {
        if (condition.ordinals) {
          ordinals = ordinals.concat(condition.ordinals)
        } else if (condition.words) {
          for (const selector of condition.words.selectors) {
            wordTests.push(getCondition('word', selector.conditions))
          }
        }
      }

      if (wordTests.length > 0) {
        const wordTest = testsToTest(wordTests)
        const onFoundParagraph = ({telemetry}) => ordinals.push(telemetry.paragraphOrdinal)
        tagWords(this.props.editor, { wordCondition: wordTest, isTest: true, onWordCondition: onFoundParagraph })

      }

      if (ordinals.length > 0) {
        paragraphCondition = ({telemetry}) => {
          return ordinals.includes(telemetry.paragraphOrdinal)
        }
      }

      onParagraphCondition = ({telemetry}) => {
        telemetry.wordOrdinal = 0
      }

      if (!wordSelector && !letterSelector) {
        tagParagraphs(this.props.editor, { paragraphCondition, onParagraphCondition }, styles)
      }

      ordinalScope = 'paragraph'
    }

    // if (selectors[0]?.unit == 'word') {
    if (wordSelector) {
      // const { unit, scope, conditions } = selectors.shift()
      const { unit, scope, conditions } = wordSelector
      wordCondition = getCondition(unit, conditions, ordinalScope)
      if (!letterSelector) {
        tagWords(this.props.editor, { wordCondition, onWordCondition, paragraphCondition, onParagraphCondition }, styles)
      }
      ordinalScope = 'word'
    }

    // if (selectors[0]?.unit == 'letter') {
    if (letterSelector) {
      // const { unit, scope, conditions } = selectors[0]
      const { unit, scope, conditions } = letterSelector
      const letterCondition = getCondition(unit, conditions, ordinalScope)
      console.log('letterCondition', letterCondition)
      tagLetters(this.props.editor, { letterCondition, wordCondition, onWordCondition, paragraphCondition, onParagraphCondition }, styles)
    }
  }

  setProps(props) {
    this.props = props
  }

  say(message) {
    console.log('say', message)
    this.props.setMessage(message)
  }

}

export default API;
