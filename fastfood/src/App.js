import React, { useState } from 'react';
import Footer from './Footer'
import Header from './Header'
import Speech from './Speech'
import Message from './Message'
import Popup from './Popup'
import Order from './Order'
import wendys from './images/wendys.jpg'

let selector;
function App() {
  const setSelector = (value) => selector = value()
  const [order, setOrder] = useState([{ name: 'Whopper', cost: 4.95 }])

  return (
    <div className="App">
      <div class="Header">
        <Speech />
      </div>
      <div class="Body">
        <Order order={order} />
        <img className='Menu' src={wendys} />
      </div>
    </div>
  );
}

export default App;
