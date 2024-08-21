const image = require('../image')

const bson = [
  {
    "id": "123",
    "name": "john",
    "age": 25,
    "fav_colors": [
      "red",
      "black"
    ],
    "marks_in_subjects": [
      {
        "marks": 90,
        "subject_id": "abc"
      },
      {
        "marks": 92,
        "subject_id": "def"
      }
    ]
  },
  {
    "id": "123",
    "name": "greg",
    "age": 55,
    "fav_colors": [
      "blue",
      "green"
    ],
    "marks_in_subjects": [
      {
        "marks": 70,
        "subject_id": "abc"
      },
      {
        "marks": 82,
        "subject_id": "def"
      }
    ]
  }
]

const bsonSales = [
  {
    "id": "123",
    "year": "1990",
    "sales": "100",
  },
  {
    "id": "123",
    "year": "1991",
    "sales": "110",
  },
  {
    "id": "123",
    "year": "1992",
    "sales": "120",
  },
  {
    "id": "123",
    "year": "1993",
    "sales": "130",
  },
]

describe('Reports Tests', () => {
  it('simple list', async () => {
    const imageSpec = {
      headers: ['name', 'age', 'favorite colors' ],
      table: true,
      field: [],
      rows: ['$name', '$age', '$fav_colors'],
    }

    const expected = {
      "headers": [ "name", "age", "favorite colors" ],
      "table": true,
      "rows": [
        [
          "john",
          25,
          [ "red", "black" ]
        ],
        [
          "greg",
          55,
          [ "blue", "green" ]
        ]
      ]
    }


    const actual = image.instantiate(imageSpec, bson)
    expect(actual).toStrictEqual(expected)
  })

  it('nested table', async () => {
    const imageSpec = {
      headers: ['name', 'age', 'favorite colors' ],
      table: true,
      field: [],
      rows: [
              '$name', 
              '$age', 
              {
                headers: ['subject', 'mark'],
                field: ['marks_in_subjects'],
                table: true,
                rows: ['$subject_id', '$marks']
              },
            ],
    }

    const expected = {
      "headers": [ "name", "age", "favorite colors" ],
      "table": true,
      "rows": [
        [
          "john",
          25,
          {
            "headers": [ "subject", "mark" ],
            "table": true,
            "rows": [ [ "abc", 90 ], [ "def", 92 ] ]
          }
        ],
        [
          "greg",
          55,
          {
            "headers": [ "subject", "mark" ],
            "table": true,
            "rows": [ [ "abc", 70 ], [ "def", 82 ] ]
          }
        ]
      ]
    }

    const actual = image.instantiate(imageSpec, bson)
    expect(actual).toStrictEqual(expected)
  })

  it('nested graph table', async () => {
    const imageSpec = {
                type: "bar",
                options: {
                  chart: {
                    id: 'apexchart-example'
                  },
                  xaxis: {
                    categories: { "$push": "$year" },
                  }
                },
                series: [{
                  name: 'series-1',
                  data: { "$push": "$sales" },
                }]
              }

    const expected = {
      "type": "bar",
      "options": {
        "chart": {
          "id": "apexchart-example"
        },
        "xaxis": { "categories": [ "1990", "1991", "1992", "1993" ] }
      },
      "series": [
        {
          "name": "series-1",
          "data": [ "100", "110", "120", "130" ]
        }
      ]
    }

    const actual = image.instantiate(imageSpec, bsonSales)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })
})
