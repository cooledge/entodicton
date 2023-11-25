import character from './character.json'

class Character {
  constructor () {
    this._properties = character
  }

  get properties () {
    return this._properties
  }

  get weapons () {
    return this._properties.weapons
  }

  get health () {
    return this._properties.health
  }
}

export default Character
