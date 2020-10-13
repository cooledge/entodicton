import React, {Link, Component} from 'react';

class Purchase extends Component {
  render(){
    const image_url = 'https://aws.amazon.com/marketplace/pp/Amazon-Web-Services-AWS-Deep-Learning-AMI-Ubuntu-1/B07Y43P7X5';
    return (
      <div className='purchase'>
        <h1>Price</h1>
        <p>
          Entodicton is available as a service in AWS. The price of the service is whatever AWS charges for the deployment times two. This is a beta company so half the payment is due in advance based on estimated cost. 
        </p>
        <h1>How to purchase</h1>
        <p>
        <ulist>
          <li>
            The available images are from <a href={image_url}>here</a>. Email to to entodicton@protonmail.com with the number and type of machines that you want.
          </li>
          <li>The price will be estimated and emailed back to you.</li>
          <li>Send the payment in US dollars to paypal accounts@thinktelligence.com .</li>
          <li>The deployment will be created after the payment is received.</li>
          <li>An email will be sent with the key and url for your Entodicton server.</li>
        </ulist>
        </p>
        <h1>Subscription</h1>
        <p>
          Once the deployment is setup the payment will be due monthly. If no payment is received by seven days after the first of the month the deployment will be terminated.
        </p>
        <h1>Upgrades</h1>
        <p>
        The deployment maybe upgraded at any time to a different version of Entodicton, a different key or a different server configuration. The available versions are
        <table>
        <tr><td>Version</td><td>Description</td></tr>
        <tr><td>v5.1</td><td>First Available Version</td></tr>
        </table>
        </p>
        <h1>How to cancel the subscription</h1>
        <p>
        Stop paying.
        </p>
      </div>
    )
  }
}

export default Purchase;
