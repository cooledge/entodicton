const { LRUCache } = require('lru-cache')

const options = {
  max: 25,
  allowStale: true,
  noDeleteOnStaleGet: true,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
}

class Sessions {
  constructor(create, max = 25, ttl = 1000 * 60 * 5) {
    this.cache = new LRUCache({ ...options, max, ttl })
    this.create = create
  }

  has(sessionId) {
    return this.cache.has(sessionId)
  }

  async reset(sessionId) {
    const mongoKM = await this.create()
    this.cache.set(sessionId, mongoKM)
    return mongoKM
  }

  async get(sessionId) {
    console.log('session.get(sessionId):', sessionId)
    const value = this.cache.get(sessionId)
    if (value) {
      console.log('session.get returning:', value.sessionID)
      return value
    }

    if (this.cache.max == this.cache.size) {
      const key = this.cache.rkeys().next().value
      if (this.cache.getRemainingTTL(key) <= 0) {
        this.cache.delete(key)
      } else {
        return null
      }
    }

    const mongoKM = await this.create()
    console.log('get(sessionId): create', mongoKM.sessionID)
    this.cache.set(sessionId, mongoKM)
    return mongoKM
  }

  max() {
    return this.cache.max
  }

  ttl() {
    return this.cache.ttl
  }

  count() {
    return this.cache.size
  }
}

module.exports = { 
  Sessions,
}
