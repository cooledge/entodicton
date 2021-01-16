import React, { Component} from 'react';
const parameters = require('../parameters');

class Tutorial extends Component {
  render(){
    return (
      <div className='tutorial'>
        <p>
          This tutorial will demonstrate how to use the api to process this input
        </p>
        <pre>
          joe earns 10 dollars every week sally earns 25 dollars per week sally worked 10 weeks joe worked 15 weeks joe earns what sally earns what
        </pre>
        <p>
        to generate these responses
        </p>
        <pre>
          "joe earns 10 dollars per week"<br/>
          "sally earns 25 dollars per week"<br/>
          "sally worked 10 weeks"<br/>
          "joe worked 15 weeks"<br/>
          "joe earned 150 dollars"<br/>
          "sally earned 250 dollars"
        </pre>
        <h1 className='step1'>Step 1 - <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/tutorial/command_line_demo_1.js`} target="_blank">Code</a></h1>
        <p>
        This starts with setting up the processing of the input <span className='quote'>"sally worked 10 weeks"</span>. The first part is to define the operators. This approach is not based on grammar but instead a generalization of the operator precedence parser. For example, <span className='quote'>1 + 2 * 3</span> is processed by applying the highest priority operator first. That is multiply. Then the next highest priority operator is applied that is addition. Entodicton works the same way but for languages. For our test sentence, <span className='quote'>'10'</span> is a prefix operator and <span className='quote'>'worked'</span> is an infix operator. To define the operators in the operators array we would use
        </p>

        <pre>
          {'((1) [+] ((2) [*] (3)))'}<br/>
          {'(([personConcept]) [worked] (<count> ([weekConcept|weeks])))'}
        </pre>

        <p>
        The notation <span className='quote'>{"[<operatorId>|<word>]"}</span> defines an operator that evaluates to the next level of the operator. That{"'"}s right. In generalized operator precedence operators evaluate to the operators. Each operator is identified by an id and a level. For example the operator <span className='quote'>worked</span> is identified with <span className='quote'>{"id == 'worked' and level == 0"}</span>
        </p>
        <p>
        Next up is setting up what happens when the operators <span className='quote'>worked</span> is applied. The parsing works by modifying contexts. A context is a property bag that always has a <span className='quote'>marker</span> property. That is used to determine what operator corresponds to the context. After the system decides to apply an operator the bridge function is invoked to do context conversion. At that point the system has access to the special values: <span className='quote'>before</span>, <span className='quote'>after</span>, <span className='quote'>operator</span> and <span className='quote'>objects</span>. For this we will setup two bridges. Bridges map from context to context.
        </p>
        <pre>
          {'{ "id": "count", "level": 0, "bridge": "{ ...operator, ...after, number: operator.value }" },'}<br/>
          {'{ "id": "worked", "level": 0, "bridge": "{ marker: "worked", who: before.id, duration: after.number, units: after.marker }" },'}<br/>
        </pre>
        <p>This will result in a context that looks like this</p>
        <pre>
          {'{"marker":"worked","who":"sally","duration":10,"units":"weekConcept"}'}
        </pre>
        <p>
        Next up is setting up the semantics. Ultimately we want to calculate what people earn based on their salary and how much they worked so we need some semantics. The semantics run on the client side so you have the full power of javascript available. The semantics run on each context produced by analyzing the sentence. They have access to the <span className='quote'>objects</span> property passed into the api and the current context. Those are in the variables <span className='quote'>global</span> and <span className='quote'>context</span>. Changes made to global are visible to later applications of the semantics. 
        </p>
        <pre>
        {"["}<br/>
        {"  (global, context) => context.marker == 'worked', "}<br/>
        {"  (global, context) => {,"}<br/>
        {"      if (! global.workingTime ) {,"}<br/>
        {"          global.workingTime = [],"}<br/>
        {"      },"}<br/>
        {"      global.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units }),"}<br/>
        {"  }"}<br/>
        {"]"}
        </pre>
        <p>
        {"Semantics are of the form [<matcher>, <semantic>]. Matcher is a function that takes a context and will return true if the contexts is to be semantic is to be applied to the current context. The application function takes two arguments. 'global' and 'context'.  This semantic definition takes information from the current context and puts it in the global context. That information can be used by later inputs. This is what will be in the global variable after the semantics run"}
        </p>
        <pre>
         {"{ workingTime: [ { name: 'sally', number_of_time_units: 10, time_units: 'weekConcept' } ] }"}
       </pre>
        <p>
        The final step is to setup generators which take contexts and convert them to strings that people can read. Here are the generators that turn the JSON 
        </p>
        <pre>
          {'{"marker":"worked","who":"sally","duration":10,"units":"weekConcept"}'}
        </pre>
        <p>
        into the string <span className='quote'>"Sally worked 10 weeks"</span>
        </p>
        <pre>
          {"[ (context) => context.marker == 'weekConcept' && context.duration == 1, (g, context) => `${context.duration} week` ],"}<br/>
          {"[ (context) => context.marker == 'weekConcept' && context.duration > 1, (g, context) => `${context.duration} weeks` ],"}<br/>
          {"[ (context) => context.marker == 'worked', (g, context) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],"}<br/>
        </pre>
        <p>
        {"Generators are of the form [<matcher>, <generator>]. The matcher should return true if the context argument should use the corresponding generator. The generator takes the current context and and function 'g' which can be called to applied the generated to any value"}
        </p>
        <h1 className='step2'>Step 2- <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/tutorial/command_line_demo_2.js`} target="_blank">Code</a></h1>
        <p>
        This step involves setting up processing of the input <span className='quote'>joe earns 10 dollars per week</span> to produce this in the global context
        </p>
        <pre>
          {"{"}<br/>
          {"  employees: ["}<br/>
          {"    { name: 'joe',"}<br/>
          {"      earnings_per_period: 10,"}<br/>
          {"      period: 'week',"}<br/>
          {"      units: 'dollars'"}<br/>
          {"    } "}<br/>
          {"  ] ..."}
        </pre>
        <p>
        This is similar to Step 1 except using a different phrase.
        </p>
        <h1 className='step3'>Step 3- <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/tutorial/command_line_demo.js`} target="_blank">Code</a></h1>
        <p>
        This step involves setting up processing of the input 
        </p>
        <pre className='quote'>joe worked 10 weeks joe earns 10 dollars per week joe earns what</pre>
        <p>
          to produce this as generated strings
        </p>
        <pre>
        {"  'joe earns 10 dollars per week',"}<br/>
        {"  'joe worked 15 weeks',"}<br/>
        {"  'joe earned 150 dollars',"}<br/>
        </pre>
        <p>
        and this json
        </p>
        <pre>
          {"{ marker: 'earn', units: 'dollars', amount: 10, who: 'joe', period: 'week' },"}<br/>
          {"{ marker: 'worked', who: 'joe', duration: 15, units: 'weekConcept' },"}<br/>
          {"{ isQuery: true, marker: 'response', units: 'dollars', who: 'joe', earnings: 150 }, }"}<br/>
        </pre>
        <p>
        The interesting parts are are the semantics for <span className='quote'>joe earns what</span> is used to access the global context and do a calculation and write that into the current context. Then the semantics are setup to print the response to the question <span className='quote'>joe earns what</span> instead of just paraphrasing the input.
        </p>
        <p>
        After the first two semantics run this will be in the global context
        </p>
        <pre>
          {"{"}<br/>
          {"  employees: [ { name: 'joe', earnings_per_period: 10, period: 'week', units: 'dollars' } ],"}<br/>
          {"  workingTime: [ { name: 'joe', number_of_time_units: 15, time_units: 'weekConcept' } ]"}<br/>
          {"..."}
        </pre>
        <p>
        This is the semantics white reads from the global context and create updates the existing contexts to have the answer
        </p>
        <pre>
          {"[(global, context) => context.marker == 'earn' && context.isQuery, "}<br/>
          {" (global, context) => {"}<br/>
          {"   context.marker = 'response';"}<br/>
          {"   var employee_record = global.employees.find( (er) => er.name == context.who )"}<br/>
          {"   let totalIncome = 0"}<br/>
          {"   global.workingTime.forEach( (wt) => {"}<br/>
          {"     if (wt.name == context.who) {"}<br/>
          {"       totalIncome += employee_record.earnings_per_period * wt.number_of_time_units"}<br/>
          {"     }"}<br/>
          {"   });"}<br/>
          {"   delete context.amount"}<br/>
          {"   delete context.period"}<br/>
          {"   context.earnings = totalIncome"}<br/>
          {"}],"}<br/>
        </pre>
        <p>
        The output of running that semantics against the matching context is
        </p>
        <pre>
            {"{"}<br/>
            {"  isQuery: true,"}<br/>
            {"  marker: 'response',"}<br/>
            {"  units: 'dollars',"}<br/>
            {"  who: 'joe',"}<br/>
            {"  earnings: 150 "}<br/>
            {"}"}<br/>
        </pre>
        <p>
        Then we have set up a generator to process this and turn it into the reponse string <span className='quote'>'joe earned 150 dollars'</span>
        </p>
        <pre>
          {"(context) => context.marker == 'response',"}<br/>
          {"(g, context) => `${context.who} earned ${context.earnings} ${context.units}` ],"}<br/>
        </pre>
        <h1 className='step4'>Step 4 - Try stuff</h1>
        <p>
        Now you can try making this fancier. You could add another language. You could input sentence in mixed languages. You can try adding punctuation. You can make it so the sentence <span className='quote'>What does joe earn</span> works. See the <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/kms/website/config.js`} target="_blank">demo config</a> for more examples.
        </p>
        <h1 className='step4'>Developer Workflow Videos</h1>
        <a href={"https://youtu.be/flYrHNDFTMA"} target="_blank">Submit Bug Workflow</a>
        <br/>
        <a href={"https://www.youtube.com/watch?v=fyWndPPj6rg"} target="_blank">Developer Demo - Parping - Part 1</a>
      </div>
    )
  }
}

export default Tutorial;
