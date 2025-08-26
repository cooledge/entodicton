const fs = require('fs').promises;
const DemoWriter = require('./demoWriter')

const filePath = './demoWriter_test.json'

async function readJSON() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

describe('tests for demoWrite', () => {

  test(`NEOS23 DEMOWRITER empty`, async () => {
    const demoWriter = new DemoWriter(filePath)
    demoWriter.write()
    const contents = await readJSON()
    const expected = {
      samples: []
    }
    expect(contents).toStrictEqual(expected)
  });

  test(`NEOS23 DEMOWRITER one`, async () => {
    const demoWriter = new DemoWriter(filePath)
    demoWriter.startTest()
    demoWriter.add("sentence1")
    demoWriter.add("sentence2")
    demoWriter.endTest()

    demoWriter.write()
    const contents = await readJSON()
    const expected = {
      samples: ["sentence1\nsentence2"]
    }
    expect(contents).toStrictEqual(expected)
  }
  );
  test(`NEOS23 DEMOWRITER ignore`, async () => {
    const demoWriter = new DemoWriter(filePath)
    demoWriter.startTest()
    demoWriter.add("sentence1")
    demoWriter.add("sentence2")
    demoWriter.ignore()
    demoWriter.endTest()

    demoWriter.write()
    const contents = await readJSON()
    const expected = {
      samples: []
    }
    expect(contents).toStrictEqual(expected)
  });

})
