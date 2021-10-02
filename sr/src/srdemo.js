import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

var doingIt = false;
const SRDemo = ({km}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const [responses, setResponses] = useState([
// "╔════════╗\n║ name   ║\n╟────────╢\n║ pants1 ║\n╟────────╢\n║ shirt1 ║\n╚════════╝\n"
    "try saying 'help'"
  ]);
  const [lastQuery, setLastQuery] = useState()
  const addResponse = (response) => {
    setResponses([response].concat(responses))
  }
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition. Try Chrome.</span>;
  }

  //<button onClick={SpeechRecognition.stopListening}>Stop</button>
  //<button onClick={resetTranscript}>Reset</button>

  //if (!doingIt && !listening && transcript.length > 0 && lastQuery !== transcript) {
  if (!doingIt && !listening && transcript.length > 0) {
    //setLastQuery(transcript)
    doingIt = true; // seem to get called twice
    km.process(transcript).then((results) => {
      resetTranscript()
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
     });

  }

  const list = []
  for (const response of responses) {
    list.push(<li><pre>{response}</pre></li>)
  }
  return (
           <div>
             <h1>{km.name} knowledge module</h1>
             <h3>{km.description}</h3>
             <p>Microphone: {listening ? 'on' : 'off'}</p>
             <button class='listenButton' onClick={ () => {
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
