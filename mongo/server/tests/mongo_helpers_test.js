const { getReportElements } = require('../mongo_helpers')

describe('Mongo Helpers', () => {
  describe('getReportElements', () => {
    it('NEO23 default', async () => {
      const input = {
        "marker": "header",
        "number": "one",
        "text": "the header",
        "word": "header"
      }

      const actual = getReportElements(input)
      expect(actual).toStrictEqual([input])
    })

    it('NEO23 no nesting', async () => {
      const input = [
        {
          "marker": "header",
          "text": "header",
          "word": "header"
        },
        {
          "marker": "background",
          "text": "background",
          "word": "background"
        }
      ]

      const actual = getReportElements(input)
      expect(actual).toStrictEqual(inputs)
    })
  })
})