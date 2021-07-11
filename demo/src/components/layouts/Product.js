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
        <div className='name'>Entodicton</div>
        <div className='brief'>natural language to json</div>
        <div className='details'>
          <p>
          Entodicton converts natural language input into JSON data structures. We handle analyzing language structure and ambiguity. You get unambigous JSON that can be processed by standard algorithms. Entodiction employs learning based on neural networks while allowing control over the interpretation. <a href={'https://youtu.be/0C171rvNZGU'} target="_blank">Overview of the design and implementation</a>
          </p>
          <p>
          The tutorial shows how how to use the api to process this input
          <code>
            joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what
          </code>
          to generate these responses
          <code>
            "joe earns 10 dollars per week"<br/>
            "sally earns 25 dollars per week"<br/>
            "sally worked 10 weeks"<br/>
            "joe worked 15 weeks"<br/>
            "joe earned 150 dollars"<br/>
            "sally earned 250 dollars"
          </code>
          and this json
          <code>
            {lines[0]}<br/>
            {lines[1]}<br/>
            {lines[2]}<br/>
            {lines[3]}<br/>
            {lines[4]}<br/>
            {lines[5]}<br/>
          </code>
          </p>
          <p>
          Left as an exercise you can update the code to accept input such as <span className="quote">"what does joe earn"</span> instead of <span className="quote">"joe earns what"</span>. Or you can add another language such as French, for example <span className="quote">"joe gagne 10 dollars par semaine"</span> means <span className="quote">"joe earns 10 dollars per week"</span>. Or you can add punctionation etc...
          </p>
        </div>
      </div>
    )
  }
}

export default Product;
