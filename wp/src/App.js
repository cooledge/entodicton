import React, { useEffect, useState } from 'react';
import Text from './Text'
import './css/wp.css'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
const tpmkms = require('tpmkms_4wp')


const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))
  return (
    // Add the editable component inside the context.
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  )
}

export default App;
