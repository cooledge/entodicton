import React, { useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

var doingIt = false;
const SRDemo = ({km, callback}) => {
  const listenButtonRef = useRef();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const [responses, setResponses] = useState([
// "╔════════╗\n║ name   ║\n╟────────╢\n║ pants1 ║\n╟────────╢\n║ shirt1 ║\n╚════════╝\n"
//    "try saying 'help'"
  ]);
  const [lastQuery, setLastQuery] = useState()
  const [doRestart, setDoRestart] = useState()
  const addResponse = (response) => {
    setResponses([response].concat(responses))
  }
  callback(km, addResponse)
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition. Try Chrome.</span>;
  }

  //<button onClick={SpeechRecognition.stopListening}>Stop</button>
  //<button onClick={resetTranscript}>Reset</button>

console.log('11111111111111111111111')
console.log('doingIt', doingIt)
console.log('listening', listening)
console.log('transcript', transcript)
  const restartListening = () => {
    setTimeout(() => listenButtonRef.current.click(), 250);
  }

  //if (!doingIt && !listening && transcript.length > 0 && lastQuery !== transcript) {
  if (!doingIt && !listening && transcript.length > 0) {
    //setLastQuery(transcript)
    doingIt = true; // seem to get called twice
    km.process(transcript).then((results) => {
      resetTranscript()
      console.log('doing response');
      for (let i = 0; i < results.responses.length; ++i) {
         const r = results.responses[i]
         const p = results.paraphrases[i]
         if (r.length > 0) {
           addResponse(r);
         } else {
           addResponse(`paraphrase: ${p}`);
         }
       }
       doingIt = false;
       setDoRestart(true)
       // restartListening()
    }).catch( e => {
      doingIt = false; // seem to get called twice
      console.log('Error processing request', e)
      restartListening()
    });
  }
  
  if (doRestart) {
    setDoRestart(false)
    restartListening()
  }
  console.log('addEventListener', SpeechRecognition.addEventListener)
  const list = []
  for (const response of responses) {
    list.push(<li><pre>{response}</pre></li>)
  }
  return (
           <div>
             <h3>{km.name} knowledge module</h3>
             <p>{km.description}</p>
             <p>Microphone: {listening ? 'on' : 'off'}</p>
             <button ref={listenButtonRef} class='listenButton' onClick={ () => {
               console.log('in click handler')
               setLastQuery()
               SpeechRecognition.startListening()
             } }>Start</button>
             <p>{transcript}</p>
             <h2>Responses</h2>
             <ul className='Responses'>{list}</ul>
           </div>
         );
};

export default SRDemo
