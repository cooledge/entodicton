import React, { useEffect, useState } from 'react';
import Speech from './Speech'
import Text from './Text'
import Order from './Order'
import Popup from './Popup'
import wendys from './images/wendys.jpg'
import products from './products.json';
import FastFoodAPI from './FastFoodAPI'
import './css/fastfood.css'
console.time('load')
const tpmkms = require('tpmkms_4wp')
console.timeEnd('load')

let selector;
function App() {
  const setSelector = (value) => selector = value()

  const [counter, setCounter] = useState(0)
  const incrementCounter = () => {
    setCounter(counter+1)
  }

  const [lastQuery, setLastQuery] = useState('');
  const [order, setOrderInternal] = useState([])
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState()
  const [fastfood, setFastFood] = useState()
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


  useEffect( () => {
    const init = async () => {
      const fastfoodI = await tpmkms.fastfood()
      fastfoodI.stop_auto_rebuild()
        await fastfoodI.setApi(() => new FastFoodAPI())
        fastfoodI.config.debug = true
        // fastfoodI.add(ui)
        const url = `${new URL(window.location.href).origin}/entodicton`
        fastfoodI.config.url = url
        fastfoodI.server(url)
      await fastfoodI.restart_auto_rebuild()
      setFastFood(fastfoodI)
    }

    if (!fastfood) {
      init()
    }
  }, [fastfood])

  /*
  if (fastfood) {
    fastfood.api.setProps(props)
  }
  */

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
    fastfood,
    incrementCounter,
  }

  return (
    <div className="App">
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      { fastfood && 
        <div class="Header">
          <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://www.youtube.com/watch?v=kPqxB3Y2F-k'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page</a>
          <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://github.com/thinktelligence/theprogrammablemind/blob/8.9.0/kms/common/fastfood.js'} target="_blank" rel="noreferrer">Source Code of Language Config</a>
          <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://github.com/cooledge/entodicton/blob/master/website_test/tests/fastfood.test.js'} target="_blank" rel="noreferrer">Integration Tests</a>
          <Text {...props} />
        </div>
      }
      { !fastfood &&
        <span>
          Loading is slow because I am loading the middleware part in the browser so I dont have to run a server for it. A real system would not load this way.
        </span>
      }
      { message &&
        <Popup {...props }>
          {message}
        </Popup>
      }
      { fastfood &&
        <div class="Body">
          <Order {...props} />
          <img className='Menu' src={wendys} />
        </div>
      }
    </div>
  );
}

export default App;
