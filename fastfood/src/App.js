import React, { useState } from 'react';
import Speech from './Speech'
import Order from './Order'
import wendys from './images/wendys.jpg'
import './css/fastfood.css'

let selector;
function App() {
  const setSelector = (value) => selector = value()
  const [lastQuery, setLastQuery] = useState('');
  const [order, setOrder] = useState([])

  const props = {
    lastQuery, setLastQuery,
    order, setOrder,
  }

  return (
    <div className="App">
      <div class="Header">
        <Speech {...props} />
      </div>
      <div class="Body">
        <Order {...props} />
        <img className='Menu' src={wendys} />
      </div>
    </div>
  );
}

export default App;
