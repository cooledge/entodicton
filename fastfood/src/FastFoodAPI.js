class FastFoodAPI {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
    this._objects.notAvailable = []
    this._objects.notAvailableModification = []
  }

  setProps(props) {
    this.props = props
  }

  show() {
    this._objects.show = this._objects.items
  }

  toItem(item_id) {
    if (Array.isArray(item_id)) {
      return this._objects.items[item_id[0]].modifications[item_id[1]]
    } else {
      return this._objects.items[item_id]
    }
  }

  new_item_id() {
    const item_id = this._objects.item_id_counter
    this._objects.item_id_counter += 1
    return item_id
  }

  updated() {
    this.props.setOrder([...this._objects.items])
  }

  reset() {
    this._objects.items = []
    this.updated()
  }

  remove(item) {
    this._objects.items = this._objects.items.filter( (i) => i.item_id !== item.item_id )
    this.updated()
  }

  // add({ name, combo, modifications }) {
  add(item) {
    item.item_id = this.new_item_id()
    if (!item.modifications) {
      item.modifications = []
    }
    // this._objects.items.push({ name, combo, modifications })
    this._objects.items.push(item)
    for (let i = 0; i < this._objects.items.length; ++i) {
      this._objects.items[i].index = i+1
    }
    this.updated()
    return item.item_id
  }

  toDefaults(item) {
    if (item.id === 'coke') {
      item.id = 'coca_cola'
    }
    if (item.id === 'fry') {
      item.id = 'french_fry'
    }
  }

  modify(item, changes) {
    this.toDefaults(item)
    this.toDefaults(changes)
    Object.assign(this.toItem(item.item_id), changes)
    this.updated()
  }

  get(item_id) {
    return this.toItem(item_id)
  }

  items() {
    return this._objects.items
  }

  addDrink(item_id, drink) {
    const item = this.toItem(item_id)
    item.modifications.push(drink)
    item.needsDrink = false
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

  hasAskedForButNotAvailableModification(item) {
    return this._objects.notAvailableModification.length > 0
  }

  getAskedForButNotAvailable(item) {
    const na = this._objects.notAvailable
    this._objects.notAvailable = []
    return na
  }

  getAskedForButNotAvailableModification(item) {
    const na = this._objects.notAvailableModification
    this._objects.notAvailableModification = []
    return na
  }

  addAskedForButNotAvailable(item) {
    this._objects.notAvailable.push(item)
  }

  addAskedForButNotAvailableModification(item, modification) {
    this._objects.notAvailableModification.push({item, modification})
  }

  isAvailableModification(food, modification) {
    // TODO fancy this up using data from the products.json file
    if (this.isAvailable(modification)) {
      if (this.args.isA(modification.id, 'fry') || this.args.isA(modification.id, 'pop')) {
        return true
      }
    }
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

    this.toDefaults(item)

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

export default FastFoodAPI;
