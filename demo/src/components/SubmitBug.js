import React, {Component, useState} from 'react';
import { Form, Button } from 'react-bootstrap'

export default function SubmitBug() {
  const [description, setDescription] = useState('')
  const [expectedResults, setExpectedResults] = useState('')
  const [expectedGenerated, setExpectedGenerated] = useState('')
  const [config, setConfig] = useState('')
  //const dispatch = useDispatch();

  const handleClick = () => {
    /*
    console.log(subscriptionId);
    console.log(password);
    dispatch( new setCredentials(subscriptionId, password) )
    */
  };

  return (
        <Form>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" placeholder="description" onChange = { (e) => setDescription(e.target.value) }/>
          </Form.Group>

          <Form.Group controlId="formExpectedResults">
            <Form.Label>Expected Results (in JSON)</Form.Label>
            <Form.Control type="expectedResults" placeholder="expected results" onChange = { (e) => setExpectedResults(e.target.value) } />
          </Form.Group>

          <Form.Group controlId="formExpectedGenerated">
            <Form.Label>Expected Generated (in JSON)</Form.Label>
            <Form.Control type="expectedGenerated" placeholder="expected results" onChange = { (e) => setExpectedGenerated(e.target.value) } />
          </Form.Group>

          <Form.Group controlId="formConfig">
            <Form.Label>Expected Config (in JSON)</Form.Label>
            <Form.Control type="Config" placeholder="config file" onChange = { (e) => setConfig(e.target.value) } />
          </Form.Group>

          <Button onClick={ () => handleClick() }>
            Submit
          </Button>
        </Form>
  );
}


