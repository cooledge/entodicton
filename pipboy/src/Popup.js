import React, { useState } from 'react';
import messageHead from './images/messageHead.png'
import './css/pipboy.css'

function Popup({ children }) {
  const [fade, setFade] = useState('fadeIn')
  setTimeout(() => setFade('fadeOut'), 5000)
  return (
    <>
      <div className={`popup ${fade}`}>
        <img width="100" height="100" src={messageHead} alt=""/>
        <span class='message'>
          {children}
        </span>
      </div>
    </>
  );
}

export default Popup;
