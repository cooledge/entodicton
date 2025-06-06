import React, { Component} from 'react';
import { Link } from 'react-router-dom';

class Product extends Component {
  render(){
    const json = [
      {
        "language": "english",
        "marker": "earn",
        "units": "dollars",
        "amount": 10,
        "who": "joe",
        "period": "week"
      },
      {
        "language": "english",
        "marker": "earn",
        "units": "dollars",
        "amount": 25,
        "who": "sally",
        "period": "week"
      },
      {
        "marker": "worked",
        "who": "sally",
        "duration": 10,
        "units": "weekConcept"
      },
      {
        "marker": "worked",
        "who": "joe",
        "duration": 15,
        "units": "weekConcept"
      },
      {
        'isQuery': true,
        'marker': 'response',
        'units': 'dollars',
        'who': 'joe',
        'earnings': 150
      },
      {
        'isQuery': true,
        'marker': 'response',
        'units': 'dollars',
        'who': 'sally',
        'earnings': 250
      }
    ]
    const lines = json.map( (j) => JSON.stringify(j) )

    return (
      <div className='product'>
        <div className='name'>The Programmable Mind</div>
        <div className='details'>
          <p>
          The Programmable Mind converts natural language input into JSON data structures that can be processed by standard algorithms. <a href={'https://youtu.be/b-fjpM238oQ'} target="_blank">Overview of the design and implementation</a>
          </p>
          <p>
          ChatGPT is a neural net based solution that is trained on the internet. The Programmable Mind is a programmed solution. The use case of the Programmable Mind is as a UI for programs not as a chat based interaction. Such use cases would be controlling a <Link to='/mongo/' target="_blank">report writer</Link>, interaction with computer in games (such as a <Link to='/pipboy/' target="_blank">Pipboy</Link>), language based UI for tradition business tools such as word processor or spreadsheets, <Link to='/fastfood/' target="_blank">ordering products</Link> by calling a API, logistics (for example "move box 1 to warehouse 5 bay 10"), language based UI for a webpages (knowledge module for webpage is loaded), language based UI for a location with devices (for example asking "where is the blender" in a kitchen), or controlling a robot ("go to the bathroom and clean the sink"). In other words, language based UI for an object or system that has internal state for which no training data exists. The Progammable Mind will do what it is programmed to do and nothing more. Knowledge modules allow multiple skills to be loaded at the same time. The Programmable Mind does not require tremendous computational resources or training.
          </p>
          <p>
          Trainable systems based on neural nets store both their programs and data in a matrix of numbers that is effectively inscrutible. If a trainable system does not work as desired, modifying it through the normal development process is very difficult due to the program and data being stored in billions of numbers in a matrix rather than a data and a program written in an intelligible programming language. The Progammable Mind offers a traditional and effective intelligently written programming experience. Due to this the progammable mind uses significantly less resources that the neural net based solutions which require lots of memory and computational power (ie GPU's). The Programmable Mind can be used to produce a reliable systems worthy of trust and does not 'hallucinate' or 'lie'. 
          </p>
        </div>
      </div>
    )
  }
}

export default Product;
