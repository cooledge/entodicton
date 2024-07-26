import React, { useState } from 'react';
import Speech from './Speech'
import Text from './Text'
import Order from './Order'
import Popup from './Popup'
import wendys from './images/wendys.jpg'
import products from './products.json';
import './css/fastfood.css'

let selector;
function App() {
  const setSelector = (value) => selector = value()
  const [lastQuery, setLastQuery] = useState('');
  const [order, setOrderInternal] = useState([])
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState()
  const findProduct = (item) => {
    const product = products.items.find( (product) => {
      let id = item.id
      console.log(`id=${id} product.id: ${product.id}`)
      if (product.id == id && !!item.combo == !!product.combo) {
        return product
      }
    })
    if (!product) {
      debugger
    }
    return product
  }

  const setOrder = (items) => {
    const fullItems = items.map((item) => {
        const addDetails = (item) => {
          const product = findProduct(item)
          if (!item.size) {
            if (product.cost.half) {
              item.size = 'half'
            } else {
              item.size = 'small'
            }
          }
          if (isNaN(product.cost)) {
            item.cost = product.cost[item.size]
          } else {
            item.cost = product.cost
          }
          if (item.size !== 'half' && product.cost.half) {
            item.name = `Full ${product.name}`
          } else if (item.size !== 'small' && product.cost.small) {
            item.name = `${item.size == 'large' ? 'Large': 'Medium' } ${product.name}`
          } else {
            item.name = product.name
          }
          return item
        }
        addDetails(item)
        if (item.modifications && item.modifications.length > 0) {
          item.name += ' -'
          let separator = ' '
          for (let modification of item.modifications) {
            addDetails(modification)
            item.name += separator + modification.name
            separator = ', '
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
    findProduct,
    setMessage,
  }

  return (
    <div className="App">
      <div class="Header">
        <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://www.youtube.com/watch?v=kPqxB3Y2F-k'} target="_blank" rel="noreferrer">YouTube Demo of Using This Page</a>
        <Text {...props} />
      </div>
      { message &&
        <Popup {...props }>
          {message}
        </Popup>
      }
      <div class="Body">
        <Order {...props} />
        <img className='Menu' src={wendys} />
      </div>
    </div>
  );
}

export default App;
