import React, { useState } from 'react';
import Speech from './Speech'
import Order from './Order'
import wendys from './images/wendys.jpg'
import products from './products.json';
import './css/fastfood.css'

let selector;
function App() {
  const setSelector = (value) => selector = value()
  const [lastQuery, setLastQuery] = useState('');
  const [order, setOrderInternal] = useState([])
  const [total, setTotal] = useState(0)

  const setOrder = (items) => {
    const fullItems = items.map((item) => {
        const product = products.items.find( (product) => {
          if (product.id == item.name && product.combo == item.combo) {
            return product
          }
        })
        return product
      })
    setOrderInternal(fullItems)
    let acc = 0
    for (const item of fullItems) {
      acc += item.cost
    }
    setTotal(acc)
  }

  const props = {
    lastQuery, setLastQuery,
    order, setOrder,
    total, setTotal,
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
