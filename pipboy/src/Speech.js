import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import pipboy from './Interface'

let processing = false

function Speech(props) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect( () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening()
    }
  }, [browserSupportsSpeechRecognition])

  const { lastQuery, setLastQuery, setMessage } = props
  const [ query, setQuery ] = useState('')

  pipboy.api.initialize(props)
  pipboy.getConfigs().ui.api.initialize(props)

  useEffect( () => {
    if (query === '') {
      return
    }
    const doQuery = async () => {
      pipboy.process(query.toLowerCase()).then( (result) => {
        console.log('result', result)
        let message = ''
        for (let i = 0; i < result.contexts.length; ++i) {
          if (result.contexts[i].isResponse) {
            message += result.responses[i] + ' '
          }
        }
        if (message) {
          setMessage(message)
        }
        processing = false
        SpeechRecognition.startListening()
      }).catch( (e) => {
        console.log('got error--------------------------------------------', e)
        processing = false
        SpeechRecognition.startListening()
      }
      );
    }
    doQuery()
    setQuery('')
  }, [query, setMessage])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    console.log('doing the query', query)
    // doQuery(query)
    setQuery(query)
  }
  const onRestart = () => {
    SpeechRecognition.startListening()
  }
  if (!processing && !listening && transcript) {
    setLastQuery(transcript)
    processing = true
    // doQuery(transcript)
  }

  const keyPressed = (event) => {
        if (event.key === 'Enter') {
          onClick()
        }
      }

  return (
    <div className="Speech">
      <div>
        Request <input id='query' placeholder='press enter to submit.' onKeyDown ={ keyPressed } type='text' className='request' />
        <Button style={{"margin-left": "10px"}} id='submit' className='button' variant='contained' onClick={onClick}>Submit</Button>
        { !browserSupportsSpeechRecognition &&
          <br/>
        }
        <span style={{"margin-left": "10px"}}>Speech recognizer is { listening ? "on" : "off" }</span>
        { !listening && !processing && browserSupportsSpeechRecognition &&
          <Button style={{"margin-left": "10px"}} id='submit' className='button' variant='contained' onClick={onRestart}>Restart</Button>
        }
        { !browserSupportsSpeechRecognition &&
          <span style={{"margin-left": "10px"}} >(Chrome supports speech recognition)</span>
        }
      </div>
      <div>
        <span class='paraphrase'>{ lastQuery }</span>
      </div>
    </div>
  );
}

export default Speech;
