/* eslint no-console:0 */

import React from 'react';
import './css/reminders.css';

function handleClick(info) {
  console.log(`clicked ${info.key}`);
  console.log(info);
}

function onOpenChange(value) {
  console.log('onOpenChange', value);
}

function Reminders({
  triggerSubMenuAction,
  updateChildrenAndOverflowedIndicator,
  selectedKeys,
  setSelectedKeys,
  mode,
  openAnimation,
  defaultOpenKeys,
  reminders,
}) {
  const children = []
  for (let reminder of reminders) {
    children.push(
        <div className='reminder'>
          <span className="details column">{ reminder.text }</span>
          <span className="time column">{ reminder.when }</span>
        </div>
    );
  }
  return (
    <div>
      <h1>Reminders</h1>
      <div className='reminders table'>
        <div className='reminders header'>
          <span className="details column">Details</span>
          <span className="time column">When</span>
        </div>
        <div className='reminders details'>
          { children }
        </div>
      </div>
    </div>
  );
}

export default Reminders;
