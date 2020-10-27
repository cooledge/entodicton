import React, {Link, Component, useState} from 'react';
import PaypalButtons from '../PaypalButtons';

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
const paypalOnApprove = (data, detail) => {
  // call the backend api to store transaction details
  console.log("Payapl approved")
  console.log(data.subscriptionID)
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

  return (
    <div className='purchase'>
      <h2>Purchase</h2>
      <p>
        Entodicton is available as a service in AWS. The price is 25 US dollars per server per week. The servers are in AWS in us-east-2. They are size t2.small. After purchase you will have access to the DNS of the deployment and the key for the service and a password for the subsciption.
      </p>
      qq{ quantity }
      Quantity: <input type='text' pattern="[1-5]" onInput={(e) => setQuantity(parseInt(e.target.value))} /> (1 to 5 servers)
      {[1,2,3,4,5].includes(quantity) &&
        <PayPalBtn
          amount = "1"
          currency = "USD"
          createSubscription={paypalSubscribe}
          onApprove={paypalOnApprove}
          catchError={paypalOnError}
          onError={paypalOnError}
          onCancel={paypalOnError}
        />
      }
    </div>
  )
}
