import React, {Component} from 'react';

class Subscription extends Component {
  render() {
    const subscription = this.props.subscription
    return (
      <div>
        <span class='label'>Subscription:</span><span class='value'>${subscription.subscription_id}</span>
        <span class='label'>Entodicton version: </span><span class='value'>${subscription.VERSION}</span>
        <span class='label'>Stack name: </span><span class='value'>${subscription.stack_name}</span>
        <span class='label'>Deployed: </span><span class='value'>${subscription.deployed}</span>
        <span class='label'>Number of instances</span><span class='value'>${subscription.NUMBER_OF_INSTANCES}</span>
        <span class='label'>Keys</span><span class='value'>${subscription.keys}</span>
        <span class='label'>AWS AMI:</span><span class='value'>${subscription.ami_id}</span>
        <span class='label'>Paypal Plan Id</span><span class='value'>${subscription.plan_id}</span>
      </div>
    );
  }
};

export default Subscription;
