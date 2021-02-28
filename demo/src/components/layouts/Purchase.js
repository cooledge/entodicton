import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import PaypalButtons from '../PaypalButtons';
const uuidGen = require('uuid/v1')
const base64 = require('base-64')
import { Button } from 'react-bootstrap'
const { setCredentials, showTrainingTimeWarning } = require ('../../actions/actions')
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

const URL = parameters.thinktelligence.url;

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

  dispatch(showTrainingTimeWarning(true))
  dispatch(setCredentials(data.subscriptionID, password))
  gotoSubscriptions()
};

function Product({product, dispatch, gotoSubscriptions, productBeingPurchased, setProductBeingPurchased}) {
  return (
    <div>
      {!product.deploying &&
        <div className='productListing'>
          <h2>{product.name}</h2>
          <p>
          Entodicton is available as a service in AWS. The price is ${product.price_in_canadian} Canadian dollars per month. You will get one server running version "{product.VERSION}". The server is in AWS region "{product.AWS_REGION_ID}" of size "{product.INSTANCE_TYPE}". 
          { !product.always_on &&
            <span>You get {product.minutes_in_plan/60} hours of uptime. This <a href={"https://youtu.be/bn6QpBYyElM"} target="_blank">video</a> demonstrates controlling the uptime of the server. </span>
          }
          After purchase you will have access to the DNS of the deployment and the key for the service and a password for the subsciption. {product.description}
          </p>
          {productBeingPurchased == product.plan_id &&
            <PayPalBtn
              amount = "1"
              currency = "CAD"
              createSubscription={paypalSubscribe(product.plan_id)}
              onApprove={paypalOnApprove(dispatch, gotoSubscriptions)}
              catchError={paypalOnError}
              onError={paypalOnError}
              onCancel={paypalOnError}
            />
          }
          {productBeingPurchased != product.plan_id &&
            <Button onClick={ () => setProductBeingPurchased(product.plan_id) }> Purchase Subscription </Button>          
          }
        </div>
      }
    </div>
  );
};

export default function Purchase() {
  const [quantity, setQuantity] = useState(1)
  const [products, setProducts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const dispatch = useDispatch();
  const history = useHistory();
  const gotoSubscriptions = () => history.push("/subscriptions");
  const [productBeingPurchased, setProductBeingPurchased] = useState("")

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

  const deploying = products.some( (product) => product.deploying );
  const choices = products.map( (product) => (<Product key={product.plan_id} product={product} productBeingPurchased={productBeingPurchased} setProductBeingPurchased={setProductBeingPurchased} dispatch={dispatch} gotoSubscriptions={gotoSubscriptions}/>) )
  return (
    <div className='purchase'>
      <h2>Purchase</h2>
        <p className="purchaseVideo">
          <a href={"https://youtu.be/IjVs5MDCHM8"} target="_blank">This</a>
          video shows the purchase workflow
        </p>
        {deploying &&
          <div className='deploymentPaused'>
          Purchases are paused for a deployment that takes about five minutes.
          </div>
        }
        { !deploying && products != [] && choices }
        { loaded && products.length == 0 &&
          <div>I am not selling any more subscriptions currently. I want to work with the current customers to iron out any issues.</div>
        }
        { !loaded &&
          <div>Loading...</div>
        }
    </div>
  )
}
