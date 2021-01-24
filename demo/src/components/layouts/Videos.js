import React, { Component} from 'react';
const parameters = require('../parameters');

class Tutorial extends Component {
  render(){
    return (
      <div className='videos'>
        <h1 className='header'>Developer Workflow Videos</h1>
        <a href={"https://www.youtube.com/watch?v=SRwJrvSVW7U"} target="_blank">Submit Bug Workflow</a>
        <br/>
        <h2>Tutorial Follow-up Videos</h2>
        <a href={"https://youtu.be/ES6UoSAIYbY"} target="_blank">Earning Tutorial - Part 1 - What does Joe earn</a>
        <h2>Parping Demo - setup a DnD type app</h2>
        <a href={"https://www.youtube.com/watch?v=fyWndPPj6rg"} target="_blank">Developer Demo - Parping - Part 1</a>
        <a href={"https://www.youtube.com/watch?v=lYVBri14IDQ"} target="_blank">Developer Demo - Parping - Part 2</a>
        <a href={"https://www.youtube.com/watch?v=vfNAD7ZaJVA"} target="_blank">Developer Demo - Parping - Part 3</a>
      </div>
    )
  }
}

export default Tutorial;
