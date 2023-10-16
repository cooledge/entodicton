import React, { Component} from 'react';
const parameters = require('../parameters');

class Tutorial extends Component {
  render(){
    return (
      <div className='videos'>
        <h1 className='header'>Developer Workflow Videos</h1>
        <p>Previously called Entodicton/EKMS in some videos. The new name is TheProgrammableMind/TPMKMS</p>
        <a href={'https://youtu.be/b-fjpM238oQ'} target="_blank">Overview of the design and implementation</a>
        <a href={"https://youtu.be/4QDPLGjlq3g"} target="_blank">Demo of using knowledge modules from the TPMKMS package</a>
        <a href={"https://www.youtube.com/watch?v=dR93bFJqCYA"} target="_blank">Debugging - Neural Nets Problems</a>
        <a href={"https://youtu.be/WbrMExswiis"} target="_blank">Demo of setting up a knowledge module</a>
        <br/>
        <h2>Tutorial Follow-up Videos</h2>
        <a href={"https://youtu.be/ES6UoSAIYbY"} target="_blank">Earning Tutorial - Part 1 - What does Joe earn</a>
        <h2>Parping Demo - setup a DnD type app</h2>
        <a href={"https://www.youtube.com/watch?v=fyWndPPj6rg"} target="_blank">Developer Demo - Parping - Part 1</a>
        <a href={"https://www.youtube.com/watch?v=lYVBri14IDQ"} target="_blank">Developer Demo - Parping - Part 2</a>
        <a href={"https://www.youtube.com/watch?v=vfNAD7ZaJVA"} target="_blank">Developer Demo - Parping - Part 3</a>
        <h2>Star Trek API Demo- setup a trek like app</h2>
        <a href={"https://youtu.be/eA25GZ0ZAHo"} target="_blank">Developer Demo using KMs - Star Trek API - Part 1</a>
        <a href={"https://youtu.be/gJctzTrNEDs"} target="_blank">Developer Demo using KMs - Star Trek API - Part 2</a>
        <a href={"https://youtu.be/y8hEvn8260o"} target="_blank">Developer Demo using KMs - Star Trek API - Part 3</a>
        <a href={"https://youtu.be/hv9U8x7H_T0"} target="_blank">Developer Demo using KMs - Star Trek API - Part 4</a>
        <h3>Old Demo not using knowledge modules</h3>
        <a href={"https://youtu.be/D8a1dPnwJDA"} target="_blank">Developer Demo - Star Trek API - Part 1</a>
        <a href={"https://youtu.be/sBtvPU9mKnI"} target="_blank">Developer Demo - Star Trek API - Part 2</a>
        <h2>Fallout API Demo- setup a language based UI for fallout 3 merchants</h2>
        <a href={"https://youtu.be/FojATVQWq3Y"} target="_blank">Developer Demo - Fallout Demo - Part 1</a>
        <p/>
        <p/>
      </div>
    )
  }
}

export default Tutorial;
