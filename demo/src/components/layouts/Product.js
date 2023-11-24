import React, { Component} from 'react';

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
          ChatGPT is a neural net based solution that is trained on the internet. The Programmable Mind is a programmed solution. The use case of the Programmable Mind is as a UI for programs not as a chat based interaction. Such use cases would be controlling a report writer, ordering products by calling a API, logistics (for example "move box 1 to warehouse 5 bay 10"), language based UI for a webpages (knowledge module for webpage is loaded), language based UI for a location with devices (for example asking "where is the blender" in a kitchen), or controlling a robot ("go to the bathroom and clean the sink"). In other words, language based UI for an object or system that has internal state for which no training data exists. The Progammable Mind will do what it is programmed to do nothing more. Knowledge modules allow multiple skills to be loaded at the same time. The Programmable Mind does not require tremendous computational resources or training.
          </p>
          <p>
          ChatGPT and their ilk are created by training with data from the internet. Let's be honest the internet has a lot of low quality thought mixed in with high quality thought. I would say though that there are way more dummies writing stuff then intelligence people because writing idiotic information is faster than writing intelligent information. In constrast, the programmable mind is written by programmers not random idiots. The algorithms in the programmable mind are also explicit and intelligible. The can be debugged and fixed. The weight system used by trainable systems is mostly unintelligable. The Programmable Mind can be used to produce a reliable system worthy of trust that doesn't 'hallucinate' or 'lie'.
          </p>
        </div>
      </div>
    )
  }
}

export default Product;
