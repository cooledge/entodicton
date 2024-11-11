const getProperty = (object, path) => {
  let value = object
  for (const property of path) {
    if (value[property]) {
      value = value[property]
    } else {
      return null
    }
  }
  return value
}

module.exports = {
  getProperty,
}
