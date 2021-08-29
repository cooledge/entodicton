import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
//import { time } from 'ekms'

const SRDemo = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

             //<button onClick={SpeechRecognition.stopListening}>Stop</button>
             //<button onClick={resetTranscript}>Reset</button>
  
  if (!listening && transcript.length > 0) {
    console.log('do it =>', transcript)
  }

  return (
           <div>
             <p>Microphone: {listening ? 'on' : 'off'}</p>
             <button onClick={SpeechRecognition.startListening}>Start</button>
             <p>{transcript}</p>
           </div>
         );
};

export default SRDemo
