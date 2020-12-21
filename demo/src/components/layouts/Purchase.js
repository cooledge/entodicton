import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import PaypalButtons from '../PaypalButtons';
const uuidGen = require('uuid/v1')
const base64 = require('base-64')
const { setCredentials } = require ('../../actions/actions')
const parameters = require('../parameters')
import { useHistory } from "react-router-dom";

import PayPalBtn from '../PayPalBtn'
const paypalSubscribe = (plan_id) => (data, actions) => {
  return actions.subscription.create({
    'plan_id': plan_id,
  });
};
const paypalOnError = (err) => {
  console.log("Error", err)
}

//const URL = 'http://localhost:10000/api'
//const URL = process.env.THINKTELLIGENCE_URL || 'http://ec2-18-217-156-104.us-east-2.compute.amazonaws.com:10000/api'
//const URL = process.env.THINKTELLIGENCE_URL || 'http://localhost:10000/api';
const URL = parameters.thinktelligence.server;

const paypalOnApprove = (dispatch, gotoSubscriptions) => (data, detail) => {
  // call the backend api to store transaction details
  console.log("Paypal approved")
  console.log(data.subscriptionID)
  const password = uuidGen()
  fetch(`${URL}/password`, {
    method: "POST",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type 
      "Authorization": 'Basic ' + base64.encode(data.subscriptionID + ":" + password)
    },
  });
  window.alert(`Save this information. The subscription id is ${data.subscriptionID} . The password is ${password}`);
  window.alert(`Repeating this just in case you missed it. The subscription id is ${data.subscriptionID} . The password is ${password}`);

  dispatch(setCredentials(data.subscriptionID, password))
  //const history = useHistory();
  //history.push("/subscriptions");
  gotoSubscriptions()
};

class Product extends Component {
  render() {
    const product = this.props.product
    const dispatch = this.props.dispatch
    const gotoSubscriptions = this.props.gotoSubscriptions
    return (
      <div className='productListing'>
        <h2>{product.name}</h2>
        <p>
        Entodicton is available as a service in AWS. The price is ${product.price_in_canadian} Canadian dollars per month. You will get one server running version "{product.VERSION}". The server is in AWS region "{product.AWS_REGION_ID}" of size "{product.INSTANCE_TYPE}". 
        { !product.always_on &&
          <span>You get {product.minutes_in_plan/60} hours of uptime. This video demonstrates controlling the uptime of the server.</span>
        }
        After purchase you will have access to the DNS of the deployment and the key for the service and a password for the subsciption. There are currently {product.number_available} subscriptions available for purchase. {product.description}
        </p>
        <PayPalBtn
          amount = "1"
          currency = "CAD"
          createSubscription={paypalSubscribe(product.plan_id)}
          onApprove={paypalOnApprove(dispatch, gotoSubscriptions)}
          catchError={paypalOnError}
          onError={paypalOnError}
          onCancel={paypalOnError}
        />
      </div>
    );
  }
};

export default function Purchase() {
  const [quantity, setQuantity] = useState(1)
  const [products, setProducts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const dispatch = useDispatch();
  const history = useHistory();
  const gotoSubscriptions = () => history.push("/subscriptions");

  if (!loaded) { 
    fetch(`${URL}/products`, {
      method: "GET",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type 
      },
    }).then( async (r) => {
      let product = {}
        try {
          const results = await r.json()
          setLoaded(true)
          console.log('setting products xxxxxxxxxxxxxxxxxxxxxxxxx');
          setProducts(results.Items)
        } catch(e) {
        }
    });
  }

  console.log('products are', products)

  const choices = products.map( (product) => (<Product product={product} dispatch={dispatch} gotoSubscriptions={gotoSubscriptions}/>) )
  return (
    <div className='purchase'>
      <h2>Purchase</h2>
        { products != [] && choices }
        { loaded && products.length == 0 &&
          <div>I am not selling any more subscriptions currently. I want to work with the current customers to iron out any issues.</div>
        }
        { !loaded &&
          <div>Loading...</div>
        }
    </div>
  )
}
