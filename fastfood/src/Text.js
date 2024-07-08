import { useMemo, useEffect, useState } from 'react';
import { Button } from 'react-native';
console.time('load')
const tpmkms = require('tpmkms_4wp')
console.timeEnd('load')

class FastFoodAPI {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
    this._objects.notAvailable = []
  }

  setProps(props) {
    this.props = props
  }

  show() {
    this._objects.show = this._objects.items
  }

  // add({ name, combo, modifications }) {
  add(item) {
    item.item_id = this._objects.items.length
    if (!item.modifications) {
      item.modifications = []
    }
    // this._objects.items.push({ name, combo, modifications })
    this._objects.items.push(item)
    for (let i = 0; i < this._objects.items.length; ++i) {
      this._objects.items[i].index = i+1
    }
    this.props.setOrder([...this._objects.items])
    return item.item_id
  }

  get(item_id) {
    return this._objects.items[item_id]
  }

  items() {
    return this._objects.items
  }

  addDrink(item_id, drink) {
    this._objects.items[item_id].modifications.push(drink)
    this._objects.items[item_id].needsDrink = false
    console.log(this._objects)
    this.props.setOrder([...this._objects.items])
  }

  say(message) {
    console.log('say', message)
    this.props.setMessage(message)
  }

  // return true if you want the NLI layer to handle this
  hasAskedForButNotAvailable(item) {
    return this._objects.notAvailable.length > 0
  }

  getAskedForButNotAvailable(item) {
    const na = this._objects.notAvailable
    this._objects.notAvailable = []
    return na
  }

  addAskedForButNotAvailable(item) {
    this._objects.notAvailable.push(item)
  }

  isAvailable(item) {
    if (item.id === 'chicken_nugget') {
      if (![4,5,6,10].includes(item.pieces)) {
        return false
      }
      if ([4,6].includes(item.pieces)) {
        item.combo = true
      }
      item.id = `${item.pieces}_piece_chicken_nugget`
    }

    if (['hamburger', 'cheeseburger', 'crispy_chicken', 'junior_bacon_cheeseburger', 'junior_crispy_chicken_club', 'chicken_go_wrap'].includes(item.id)) {
      item.combo = true
    }

    if (item.combo) {
      item.needsDrink = true
    }

    if (item.id === 'coke') {
      item.id = 'coca_cola'
    }

    // return !!products.items.find( (i) => i.id === item.id )
    return this.props.findProduct(item)
  }

  getCombo(number) {
    const map = {
      1: 'single',
      2: 'double',
      3: 'triple',
      4: 'baconator',
      5: 'bacon_deluxe',
      6: 'spicy',
      7: 'homestyle',
      8: 'asiago_range_chicken_club',
      9: 'ultimate_chicken_grill',
      10: '10_piece_nuggets',
      11: 'premium_cod',
    }
    return map[number]
  }
}


class UIAPI {
  initialize({ objects }) {
  }

  setProps(props) {
    this.props = props
  }

  move(direction, steps = 1) {
    // this.props.move(direction, steps)
  }

  unselect() {
    // this.props.select(true)
  }

  select() {
    // this.props.select()
  }

  strip() {
    // this.props.strip()
  }

  disarm() {
    // this.props.disarm()
  }

  setName(item, name) {
    // this.props.setOutfitName(name)
  }

  cancel() {
    // this.props.cancel()
  }

}

function Text(props) {
  const { setMessage } = props
  const [ query, setQuery ] = useState('')
  const [ selectedOption, setSelectedOption ] = useState()

  const msg = useMemo( () => new SpeechSynthesisUtterance(), [] )
  const fastfood = useMemo( () => {
    console.time('create fastfood km')
    const ui = tpmkms.ui()
    ui.api = new UIAPI()
    const fastfoodI = tpmkms.fastfood()
    fastfoodI.api = new FastFoodAPI()
    fastfoodI.config.debug = true
    fastfoodI.add(ui)
    const url = `${new URL(window.location.href).origin}/entodicton`
    fastfoodI.config.url = url
    fastfoodI.server(url)
    console.timeEnd('create fastfood km')
    return fastfoodI
  }, [])

  fastfood.api.setProps(props)
  fastfood.getConfigs().ui.api.setProps(props)
  useEffect( () => {
    if (query === '') {
      return
    }
    const doQuery = async () => {
      return fastfood.process(query.toLowerCase()).then( async (result) => {
        let message = ''
        let hasError = false
        setQuery('')
        if (result.error) {
          console.log(result.error)
        } else {
          for (let i = 0; i < result.contexts.length; ++i) {
            if (result.contexts[i].marker === 'error') {
              console.log('error', result.contexts[i])
              hasError = true
              continue
            }
            if (result.contexts[i].isResponse) {
              message += result.responses[i] + ' '
            }
          }
          if (hasError) {
            message += '. There are errors shown in the console'
          }
          if (message) {
            fastfood.api.say(message)
            msg.text = message
            window.speechSynthesis.speak(msg)
          }
        }
      }).catch( (e) => {
      }
      );
    }
    doQuery()
  }, [query, msg])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    document.getElementById('query').value = ''
    setQuery(query)
  }

  const keyPressed = (event) => {
    if (event.key === 'Enter') {
      onClick()
    }
  }

  const info = fastfood.getInfo()
  const options = []
  for (let example of info.examples) {
    options.push({ value: example, label: example })
  }
  const handleChange = (query) => {
    setSelectedOption(null)
    setQuery(query.value)
  };

  return (
    <div className="Speech">
      <div>
        Request <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
        <a style={{"margin-left": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
      </div>
      <div>
        <span class='paraphrase'>{ query }</span>
      </div>
    </div>
  );
}

export default Text;
