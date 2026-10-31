/* eslint no-console:0 */

import React, { useState, useEffect } from 'react';
import './css/reminders.css';

function whoToString(who) {
  if (who.text === 'me') {
    return who.text;
  }
  return `${who.text} - ${who.remindee_id}`;
}

function Reminders({
  // these are currently unused by this component
  triggerSubMenuAction,
  updateChildrenAndOverflowedIndicator,
  selectedKeys,
  setSelectedKeys,
  mode,
  openAnimation,
  defaultOpenKeys,

  reminders = [],
  currentId,
  setCurrentId,
}) {
  const [readyReminders, setReadyReminders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // sequential to match the original for-loop + await
      const processed = [];
      for (const reminder of reminders) {
        await reminder.instantiate();
        processed.push(reminder);
      }

      if (!cancelled) {
        setReadyReminders(processed);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reminders]);

  const onClick = (id) => () => {
    setCurrentId(id);
  };

  const children = readyReminders.map((reminder) => {
    const className = reminder.id === currentId
      ? 'reminder highlighted'
      : 'reminder';

    let who;
    if (Array.isArray(reminder.who)) {
      who = reminder.who.map((element, index) => (
        <div key={index} className="individual column">
          {whoToString(element)}
        </div>
      ));
    } else {
      who = whoToString(reminder.who);
    }

    return (
      <div
        key={reminder.id}
        className={className}
        onClick={onClick(reminder.id)}
        id={`reminder_${reminder.id}`}
      >
        <span className="details column">{reminder.text}</span>
        <span className="who column">{who}</span>
        <span className="time column">{reminder.dateTimeSelectorText}</span>
        <span className="next column">{reminder.nextISODateFormatted}</span>
      </div>
    );
  });

  return (
    <div>
      <h1>Reminders</h1>
      {children.length > 0 && (
        <div className="reminders table">
          <div className="reminders header">
            <span className="details column">Details</span>
            <span className="who column">Who</span>
            <span className="time column">When</span>
            <span className="next column">Next</span>
          </div>
          <div className="reminders details">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;
