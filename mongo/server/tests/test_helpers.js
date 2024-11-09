const getAPI = () => {
  const idToCounter = {}
  return {
    getId: (tag) => {
      if (!idToCounter[tag]) {
        idToCounter[tag] = 0
      }
      return `${tag}${idToCounter[tag] += 1}`
    }
  }
}

module.exports = {
  getAPI,
}
