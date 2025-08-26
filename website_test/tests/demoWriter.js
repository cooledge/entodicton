const fs = require('fs')

class DemoWriter {
  constructor(filePath) {
    this.filePath = filePath
    this.queries = []
    this.current = []
  }

  startTest() {
    this.current = []
    this._ignore = false
  }

  endTest() {
    if (this._ignore) {
      return
    }
    const query = this.current.join('\n')
    if (query.length > 0) {
      this.queries.push(query)
    }
  }

  ignore() {
    this._ignore = true
  }

  add(query) {
    this.current.push(query)
  }

  write() {
    fs.writeFileSync(this.filePath, JSON.stringify({ samples: this.queries }, 0, 2))
  }
}

module.exports = DemoWriter;
