import React, { useEffect, useState } from 'react';
import './css/wp.css'
import Text from './Text'
import API from './API'
import { Editor, EditorState, ContentState } from 'draft-js'
const tpmkms = require('tpmkms_4wp')

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const initialContentState = ContentState.createFromText('Damn the torpedos. full speep dahead.');
  const [editorState, setEditorState] = React.useState(
    // EditorState.createEmpty()
    EditorState.createWithContent(initialContentState)
  );
  const editor = React.useRef(null);
  function focusEditor() {
    editor.current.focus();
  }
 
  React.useEffect(() => {
    focusEditor()
  }, []);

  const [query, doQuery] = useState({ text: '', counter: 0 })
  const [queryResponses, setQueryResponses] = useState([])
  const [message, setMessage] = useState()
  const [lastQuery, setLastQuery] = useState('');
  const [km, setKM] = useState()

  useEffect( () => {
    const init = async () => {
      const km = await tpmkms.wp()
      km.stop_auto_rebuild()
        await km.setApi(() => new API())
        km.config.debug = true
        const url = `${new URL(window.location.href).origin}/entodicton`
        km.config.url = url
        km.server(url)
      await km.restart_auto_rebuild()
      setKM(km)
    }

    if (!km) {
      init()
    }
  }, [km])

  const props = {
    lastQuery, setLastQuery,
    message, setMessage,
    km,
    editor,
  }

  const doit = () => {
  }

  return (
    // Add the editable component inside the context.
    <>
      <Text {...props}/>
      <a onClick={doit}>CLICK ME</a>
      <div onClick={focusEditor}>
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={editorState => setEditorState(editorState)}
        />
      </div>
    </>
  )
}

export default App;
