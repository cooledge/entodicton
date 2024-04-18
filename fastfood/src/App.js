import React, { useState } from 'react';
import Speech from './Speech'
import Order from './Order'
import wendys from './images/wendys.jpg'

let selector;
function App() {
  const setSelector = (value) => selector = value()
  const [order, setOrder] = useState([{ name: 'Whopper', cost: 4.95 }])

  return (
    <div className="App">
      <div class="Header">
        <Speech order={order} setOrder={setOrder} />
      </div>
      <div class="Body">
        <Order order={order} />
        <img className='Menu' src={wendys} />
      </div>
    </div>
  );
}

export default App;
