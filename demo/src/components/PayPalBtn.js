import { PayPalButton } from "react-paypal-button-v2";
import React from 'react';
export function PayPalBtn(props) {
  const { amount, currency, createSubscription, onApprove, catchError,onError, onCancel} = props;
  const paypalKey = "AUIPCi4-8Oh_L8uIxOBzF7PFxkTVjdRho82zKV9d58Hjq8M-oWijdEHIBeVZCkLMvrdTENLobuiCdnr5"
  return (
  <PayPalButton
  amount={amount}
  currency={currency}
  createSubscription={(data, details) => createSubscription(data, details)}
  onApprove={(data, details) => onApprove(data, details)}
  onError={(err) => onError(err)}
  catchError={(err) => catchError(err)}
  onCancel={(err) => onCancel(err)}
  options={{
    clientId: paypalKey,
    vault:true
  }}
  style={{
    shape: 'rect',
    color: 'blue',
    layout: 'horizontal',
    label: 'subscribe',
  }}
  />
  );
}
export default PayPalBtn;
