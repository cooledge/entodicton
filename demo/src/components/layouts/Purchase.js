import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import PaypalButtons from '../PaypalButtons';
const uuidGen = require('uuid/v1')
const base64 = require('base-64')
const { setCredentials } = require ('../../actions/actions')
import { useHistory } from "react-router-dom";

const plan_id_us_east_2_tf_small = 'P-57360534X7468745AL6LDUFQ'
const plan_id_debug_plan = 'P-1043388889887134HL6LOF3Y'

import PayPalBtn from '../PayPalBtn'
const paypalSubscribe = (data, actions) => {
  return actions.subscription.create({
    'plan_id': plan_id_debug_plan,
  });
};
const paypalOnError = (err) => {
  console.log("Error", err)
}

//const URL = 'http://localhost:10000/api'
const URL = 'http://ec2-18-217-156-104.us-east-2.compute.amazonaws.com:10000/api'

const paypalOnApprove = (dispatch, gotoSubscriptions) => (data, detail) => {

  // call the backend api to store transaction details
  debugger;
  console.log("Paypal approved")
  console.log(data.subscriptionID)
  const password = uuidGen()
  console.log('passwordddddddddddddddddddddddddddddd', password)
  fetch(`${URL}/password`, {
    method: "POST",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type 
      "Authorization": 'Basic ' + base64.encode(data.subscriptionID + ":" + password)
    },
  });
  window.alert(`Save these information. The subscription id is ${data.subscriptionID} . The password is ${password}`);
  window.alert(`Repeating this just in case you missed it. The subscription id is ${data.subscriptionID} . The password is ${password}`);

  dispatch(setCredentials(data.subscriptionID, password))
  //const history = useHistory();
  //history.push("/subscriptions");
  gotoSubscriptions()
};

/*
let quantity = 1;
  quantityUpdate(e) {
    debugger;
    console.log(e);
    quantity = e.target.value;
  };
        <div>Quantity: <input onKeyUp={this.quantityUpdate}/></div>
*/
export default function Purchase() {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch();
  const history = useHistory();
  const gotoSubscriptions = () => history.push("/subscriptions");
  
  return (
    <div className='purchase'>
      <h2>Purchase</h2>
      <p>
        Entodicton is available as a service in AWS. The price is 25 US dollars per server per week. The servers are in AWS in us-east-2. They are size t2.small. After purchase you will have access to the DNS of the deployment and the key for the service and a password for the subsciption.
      </p>
      <button onClick={ () => gotoSubscriptions() }>DO IT</button>
      qq{ quantity }
      Quantity: <input type='text' pattern="[1-5]" onInput={(e) => setQuantity(parseInt(e.target.value))} /> (1 to 5 servers)
      {[1,2,3,4,5].includes(quantity) &&
        <PayPalBtn
          amount = "1"
          currency = "USD"
          createSubscription={paypalSubscribe}
          onApprove={paypalOnApprove(dispatch, gotoSubscriptions)}
          catchError={paypalOnError}
          onError={paypalOnError}
          onCancel={paypalOnError}
        />
      }
    </div>
  )
}
