const fs = require('fs')

class DemoWriter {
  constructor(filePath) {
    this.filePath = filePath
    this.queries = []
  }

  add(query) {
    this.queries.push(query)
  }

  write() {
    fs.writeFileSync(this.filePath, JSON.stringify({ samples: this.queries }, 0, 2))
  }
}

module.exports = DemoWriter;
