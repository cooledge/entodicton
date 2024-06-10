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
        const addDetails = (item) => {
          const product = products.items.find( (product) => {
            const id = item.id + (item.combo ? "_combo" : "");
            console.log(`id=${id} product.id: ${product.id}`)
            if (product.id == id) {
              return product
            }
          })
          if (!product) {
            debugger
          }
          item.cost = product.cost[item.size || 'small']
          if (item.size && item.size !== 'small') {
            item.name = `${item.size == 'large' ? 'Large': 'Medium' } ${product.name}`
          } else {
            item.name = product.name
          }
          return item
        }
        addDetails(item)
        if (item.modifications && item.modifications.length > 0) {
          item.name += ' -'
          for (let modification of item.modifications) {
            addDetails(modification)
            item.name += ' ' + modification.name
            if (modification.id == 'waffle_fry') {
              item.cost += products.waffle_fry_extra_cost
            }
          }
        }
        return item
      }).filter( (item) => item )

    setOrderInternal(fullItems)
    let acc = 0
    for (const item of fullItems) {
      acc += item.cost
    }
    setTotal(Math.round(acc*100)/100)
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
