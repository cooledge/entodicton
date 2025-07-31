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
  currentId,
  setCurrentId,
}) {
  const onClick = (id) => () => {
    setCurrentId(id)
  }
  const children = []
  for (let reminder of reminders) {
    let className
    if (reminder.id == currentId) {
      className = 'reminder highlighted'
    }
    else {
      className = 'reminder'
    }
    children.push(
        <div className={className} onClick={onClick(reminder.id)} id={`reminder_${reminder.id}`}>
          <span className="details column">{ reminder.text }</span>
          <span className="time column">{ reminder.dateTimeSelectorText }</span>
        </div>
    );
  }
  return (
    <div>
      <h1>Reminders</h1>
      { children.length > 0 &&
        <div className='reminders table'>
          <div className='reminders header'>
            <span className="details column">Details</span>
            <span className="time column">When</span>
          </div>
            <div className='reminders details'>
              { children }
            </div>
        </div>
      }
    </div>
  );
}

export default Reminders;
