const fs = require('fs')

class DemoWriter {
  constructor(filePath, callingStartAndEnd) {
    this.filePath = filePath
    this.queries = []
    this.current = []
    this.callingStartAndEnd = callingStartAndEnd
  }

  startTest() {
    this.current = []
  }

  endTest() {
    this.queries.push(this.current.join('. '))
  }

  add(query) {
    if (this.callingStartAndEnd) {
      if (!this.current.find((q) => q === query)) {
        this.current.push(query)
      }
    } else {
      if (!this.queries.find((q) => q === query)) {
        this.queries.push(query)
      }
    }
  }

  write() {
    fs.writeFileSync(this.filePath, JSON.stringify({ samples: this.queries }, 0, 2))
  }
}

module.exports = DemoWriter;
