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

function tagWords(editor, condition, styles) {
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
  let wordOrdinal = 0
  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    console.log('chunk', node.text)
    const paragraphOrdinal = path[0]+1
    // const words = node.text.split(/\s+/)
    const words = node.text.match(/\S+|\s+/g)
    console.log('node', node)
    console.log('path', path)
    let offset = 0
    console.log('words', words)
    words.forEach((word) => {
      if (word.length > 0) {
        wordOrdinal += 1
      }
      if (word.trim() == '') {
        offset += word.length
        return
      }
      console.log(`    checking word: "${word}", path: ${JSON.stringify(path)} wordOrdinal: ${wordOrdinal} paragraphOrdinal: ${paragraphOrdinal}`)
      // if (path[0] == 1 && path[1] == 22) {
      if (word == 'TEXT,') {
        debugger
      }
      if (condition(editor, path, word, { wordOrdinal, paragraphOrdinal })) {
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
        // Since it's rich text, you can do things like turn a selection of text
        // Since it's rich text, you can do things of text
        // Since it's rich text, you can do things text
        // it's rich text, you can do things text
        // it's text, you can do things text
        // it's text, you can things text
        // it's text, you things text
        // it's text you things text
        // it text you things text
        // +1 since text
        // nonConstPath[nonConstPath.length-1] = nonConstPath[nonConstPath.length-1] + 1
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
    const { unit, scope, color, styles, conditions } = value

    if (['word', 'paragraph'].includes(unit) && conditions.length > 0) {
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
          return (editor, path, word, { wordOrdinal, paragraphOrdinal }) => {
            switch (unit) {
            case "word":
              return ordinals.includes(wordOrdinal)
            case "paragraph":
              return ordinals.includes(paragraphOrdinal)
            }
          }
        }
        return () => true
      })
      const condition = (editor, path, word, args) => {
        for (const test of tests) {
          if (!test(editor, path, word, args)) {
            return false
          }
        }
        return true
      }
      tagWords(this.props.editor, condition, styles)
      return
    }

    if (unit == 'everything') {
      selectAllText(this.props.editor)
    }
    console.log('changeState', value)
    // makeAllTextColor(this.props.editor, color)
    for (const style of styles || []) {
      Editor.addMark(this.props.editor, style, true)
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
