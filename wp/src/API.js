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
  debugger
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

function tagWords(editor, condition, styles) {
  const { selection } = editor
  Transforms.deselect(editor) // Clear selection to apply changes to all text

  Editor.nodes(editor, {
    at: [],
    match: n => n.text && n.text.length > 0,
    mode: 'lowest',
    voids: false,
  }).forEach(([node, path]) => {
    const words = node.text.split(/\s+/)
    let offset = 0

    words.forEach((word) => {
      if (condition(word)) {
        const start = offset
        const end = start + word.length
        const range = {
          anchor: { path, offset: start },
          focus: { path, offset: end }
        }
        Transforms.select(editor, range);
        for (const style of styles) {
          Editor.addMark(editor, style, true)
        }
      }
      offset += word.length + 1 // +1 for the space or any delimiter
    })
  })

  // Restore previous selection if it existed
  if (selection) {
    Transforms.select(editor, selection)
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

    if (unit == 'word' && conditions.length > 0) {
      const tests = conditions.map(({ comparison, letters }) => {
        if (comparison == 'prefix') {
          return (word) => word.toLowerCase().startsWith(letters)
        }
        if (comparison == 'suffix') {
          return (word) => word.toLowerCase().endsWith(letters)
        }
        if (comparison == 'includes') {
          return (word) => word.toLowerCase().includes(letters)
        }
        return () => true
      })
      const condition = (word) => {
        for (const test of tests) {
          if (!test(word)) {
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
