const image = require('../image')

const bson = [
  {
    "id": "123",
    "name": "john",
    "age": 25,
    "fav_colors": [ "red", "black" ],
    "marks_in_subjects": [
      { "marks": 90, "subject_id": "abc" },
      { "marks": 92, "subject_id": "def" }
    ]
  },
  {
    "id": "123",
    "name": "greg",
    "age": 55,
    "fav_colors": [ "blue", "green" ],
    "marks_in_subjects": [
      { "marks": 70, "subject_id": "abc" },
      { "marks": 82, "subject_id": "def" }
    ]
  }
]

const bsonSales = [
  { "id": "123", "year": "1990", "sales": "100", },
  { "id": "123", "year": "1991", "sales": "110", },
  { "id": "123", "year": "1992", "sales": "120", },
  { "id": "123", "year": "1993", "sales": "130",
  },
]

const imageSpecs = {
  'no data': {
    rules: [],
  },
  'simple list': {
    headers: { columns: ['name', 'age', 'favorite colors' ] },
    table: true,
    field: [],
    rows: ['$name', '$age', '$fav_colors'],
  },
  'nested table': {
    headers: { columns: ['name', 'age', 'favorite colors' ] },
    table: true,
    field: [],
    rows: [
            '$name', 
            '$age', 
            {
              headers: { columns: ['subject', 'mark'] },
              field: ['marks_in_subjects'],
              table: true,
              rows: ['$subject_id', '$marks']
            },
          ],
  },
  'graph table': {
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
              },
  'array data selected by field': {
        headers: { columns: [], },
        "table": true,
        "field": [],
        "explicit": true,
        "rows": [
          [
            {
              headers: { columns: [ "users" ] },
              "table": true,
              "field": [ 0 ],
              "rows": [ "$name" ]
            },
            {
              headers: { columns: [ "movies" ] },
              "table": true,
              "field": [ 1 ],
              "rows": [ "$title" ]
            }
          ]
        ]
      }
}

describe('Reports Tests', () => {
  it('no data', async () => {
    const imageSpec = imageSpecs['no data']
    const actual = image.instantiate(imageSpec, bson)
    console.log('answer', JSON.stringify(actual, (k, v) => v === undefined ? null : v, 2))
    expected = {}
    expect(actual).toStrictEqual(expected)
  })

  it('simple list', async () => {
    const imageSpec = imageSpecs['simple list']

    const expected = 
   {
        "headers": {
          "className": "header header2",
          "selecting": undefined,
          "data": [
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            },
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            },
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            }
          ]
        },
        "rules": undefined,
        "colgroups": undefined,
        "table": true,
        "selecting": undefined,
        "rows": {
          "className": "rows",
          "data": [
            {
              "className": "row_0",
              "data": [
                {
                  "className": "column column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "john"
                  }
                },
                {
                  "className": "column column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 25
                  }
                },
                {
                  "className": "column column_2",
                  "data": {
                    "className": "fieldValue",
                    "data": [
                      "red",
                      "black"
                    ]
                  }
                }
              ]
            },
            {
              "className": "row_1",
              "data": [
                {
                  "className": "column column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "greg"
                  }
                },
                {
                  "className": "column column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 55
                  }
                },
                {
                  "className": "column column_2",
                  "data": {
                    "className": "fieldValue",
                    "data": [
                      "blue",
                      "green"
                    ]
                  }
                }
              ]
            }
          ]
        }
      }

    const actual = image.instantiate(imageSpec, bson)
    console.log('answer', JSON.stringify(actual, (k, v) => v === undefined ? null : v, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('nested table', async () => {
    const imageSpec = imageSpecs['nested table']

    const expected = 
    {
        "headers": {
          "className": "header header2",
          "selecting": undefined,
          "data": [
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            },
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            },
            {
              "className": "",
              "selecting": undefined,
              "data": undefined
            }
          ]
        },
        "rules": undefined,
        "colgroups": undefined,
        "table": true,
        "selecting": undefined,
        "rows": {
          "className": "rows",
          "data": [
            {
              "className": "row_0",
              "data": [
                {
                  "className": "column column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "john"
                  }
                },
                {
                  "className": "column column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 25
                  }
                },
                {
                  "className": "column column_2",
                  "data": {
                    "headers": {
                      "className": "header header4",
                      "selecting": undefined,
                      "data": [
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": undefined
                        },
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": undefined
                        }
                      ]
                    },
                    "rules": undefined,
                    "colgroups": undefined,
                    "table": true,
                    "selecting": undefined,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "abc"
                              }
                            },
                            {
                              "className": "column column_1",
                              "data": {
                                "className": "fieldValue",
                                "data": 90
                              }
                            }
                          ]
                        },
                        {
                          "className": "row_1",
                          "data": [
                            {
                              "className": "column column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "def"
                              }
                            },
                            {
                              "className": "column column_1",
                              "data": {
                                "className": "fieldValue",
                                "data": 92
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ]
            },
            {
              "className": "row_1",
              "data": [
                {
                  "className": "column column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "greg"
                  }
                },
                {
                  "className": "column column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 55
                  }
                },
                {
                  "className": "column column_2",
                  "data": {
                    "headers": {
                      "className": "header header4",
                      "selecting": undefined,
                      "data": [
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": undefined
                        },
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": undefined
                        }
                      ]
                    },
                    "rules": undefined,
                    "colgroups": undefined,
                    "table": true,
                    "selecting": undefined,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "abc"
                              }
                            },
                            {
                              "className": "column column_1",
                              "data": {
                                "className": "fieldValue",
                                "data": 70
                              }
                            }
                          ]
                        },
                        {
                          "className": "row_1",
                          "data": [
                            {
                              "className": "column column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "def"
                              }
                            },
                            {
                              "className": "column column_1",
                              "data": {
                                "className": "fieldValue",
                                "data": 82
                              }
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      }

    const actual = image.instantiate(imageSpec, bson)
    // console.log('answer', JSON.stringify(actual, (k, v) => v === undefined ? null : v, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('graph table', async () => {
    const imageSpec = imageSpecs['graph table']

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
      ],
      id: 'graph1',
      idCounter: 1,
    }

    const actual = image.instantiate(imageSpec, bsonSales)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('array data selected by field', async () => {
    const imageSpec = imageSpecs['array data selected by field']

    const data = [
      [
        { "name": "Robert Baratheon", "email": "mark_addy@gameofthron.es", },
        { "name": "Sandor Clegane", "email": "rory_mccann@gameofthron.es", },
      ],
      [
        { "title": "A Corner in Wheat", },
        { "title": "Rocky", },
      ],
    ]


    const expected = {
        "headers": {
          "className": "header",
          "selecting": undefined,
          "data": []
        },
        "rules": undefined,
        "colgroups": undefined,
        "table": true,
        "rows": {
          "className": "rows",
          "data": [
            [
              {
                "className": "column column_0",
                "data": {
                  "headers": {
                    "className": "header header3",
                    "selecting": undefined,
                    "data": [
                      {
                        "className": "",
                        "selecting": undefined,
                        "data": undefined
                      }
                    ]
                  },
                  "rules": undefined,
                  "colgroups": undefined,
                  "table": true,
                  "selecting": undefined,
                  "rows": {
                    "className": "rows",
                    "data": [
                      {
                        "className": "row_0",
                        "data": [
                          {
                            "className": "column column_0",
                            "data": {
                              "className": "fieldValue",
                              "data": "Robert Baratheon"
                            }
                          }
                        ]
                      },
                      {
                        "className": "row_1",
                        "data": [
                          {
                            "className": "column column_0",
                            "data": {
                              "className": "fieldValue",
                              "data": "Sandor Clegane"
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                "className": "column column_1",
                "data": {
                  "headers": {
                    "className": "header header5",
                    "selecting": undefined,
                    "data": [
                      {
                        "className": "",
                        "selecting": undefined,
                        "data": undefined
                      }
                    ]
                  },
                  "rules": undefined,
                  "colgroups": undefined,
                  "table": true,
                  "selecting": undefined,
                  "rows": {
                    "className": "rows",
                    "data": [
                      {
                        "className": "row_0",
                        "data": [
                          {
                            "className": "column column_0",
                            "data": {
                              "className": "fieldValue",
                              "data": "A Corner in Wheat"
                            }
                          }
                        ]
                      },
                      {
                        "className": "row_1",
                        "data": [
                          {
                            "className": "column column_0",
                            "data": {
                              "className": "fieldValue",
                              "data": "Rocky"
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          ]
        }
      }


    const actual = image.instantiate(imageSpec, data)
    // console.log('answer', JSON.stringify(actual, (k, v) => v === undefined ? null : v, 2))
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  describe('Traversing', () => {
    describe('Counting', () => {
      it('no data', async () => {
        const imageSpec = imageSpecs['no data']
        const actual = image.count(imageSpec)
        expect(actual).toStrictEqual({ header: 0, table: 0, graph: 0 })
      })

      it('simple list', async () => {
        const imageSpec = imageSpecs['simple list']
        const actual = image.count(imageSpec)
        expect(actual).toStrictEqual({ header: 1, table: 1, graph: 0 })
      })

      it('nested table', async () => {
        const imageSpec = imageSpecs['nested table']
        const actual = image.count(imageSpec)
        expect(actual).toStrictEqual({ header: 2, table: 2, graph: 0 })
      })

      it('graph table', async () => {
        const imageSpec = imageSpecs['graph table']
        const actual = image.count(imageSpec)
        expect(actual).toStrictEqual({ header: 0, table: 0, graph: 1 })
      })

      it('array data selected by field', async () => {
        const imageSpec = imageSpecs['array data selected by field']
        const actual = image.count(imageSpec)
        expect(actual).toStrictEqual({ header: 2, table: 3, graph: 0 })
      })
    })

    describe('countSelectedSelected', () => {
      it('no data', async () => {
        const imageSpec = imageSpecs['no data']
        const reportElements = [{ marker: 'header' }, { marker: 'background' }]
        const actual = image.countSelected(imageSpec, reportElements)
        expect(actual).toStrictEqual(0)
      })

      it('simple list', async () => {
        const imageSpec = imageSpecs['simple list']
        const reportElements = [{ marker: 'header' }, { marker: 'background' }]
        const actual = image.countSelected(imageSpec, reportElements)
        expect(actual).toStrictEqual(1)
      })

      it('nested table', async () => {
        const imageSpec = imageSpecs['nested table']
        const reportElements = [{ marker: 'header' }, { marker: 'background' }]
        const actual = image.countSelected(imageSpec, reportElements)
        expect(actual).toStrictEqual(2)
      })

      it('graph table', async () => {
        const imageSpec = imageSpecs['graph table']
        const reportElements = [{ marker: 'header' }, { marker: 'background' }]
        const actual = image.countSelected(imageSpec, reportElements)
        expect(actual).toStrictEqual(0)
      })

      it('array data selected by field', async () => {
        const imageSpec = imageSpecs['array data selected by field']
        const reportElements = [{ marker: 'header' }, { marker: 'background' }]
        const actual = image.countSelected(imageSpec, reportElements)
        expect(actual).toStrictEqual(2)
      })
    })

    describe('setId', () => {
      it('no data', async () => {
        const imageSpec = imageSpecs['no data']
        image.setId(imageSpec)
        image.setId(imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.idCounter).toStrictEqual(0)
      })

      it('simple list', async () => {
        const imageSpec = imageSpecs['simple list']
        image.setId(imageSpec)
        image.setId(imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.id).toStrictEqual('table1')
        expect(imageSpec.headers.id).toStrictEqual('header2')
        expect(imageSpec.idCounter).toStrictEqual(2)
      })

      it('nested table', async () => {
        const imageSpec = imageSpecs['nested table']
        image.setId(imageSpec)
        image.setId(imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.id).toStrictEqual('table1')
        expect(imageSpec.headers.id).toStrictEqual('header2')
        expect(imageSpec.idCounter).toStrictEqual(4)
        expect(imageSpec.rows[2].id).toStrictEqual('table3')
        expect(imageSpec.rows[2].headers.id).toStrictEqual('header4')
      })

      it('graph table', async () => {
        const imageSpec = imageSpecs['graph table']
        image.setId(imageSpec)
        image.setId(imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.id).toStrictEqual('graph1')
        expect(imageSpec.idCounter).toStrictEqual(1)
      })

      it('array data selected by field', async () => {
        const imageSpec = imageSpecs['array data selected by field']
        image.setId(imageSpec)
        image.setId(imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.id).toStrictEqual('table1')
        expect(imageSpec.rows[0][0].id).toStrictEqual('table2')
        expect(imageSpec.rows[0][0].headers.id).toStrictEqual('header3')
        expect(imageSpec.rows[0][1].id).toStrictEqual('table4')
        expect(imageSpec.rows[0][1].headers.id).toStrictEqual('header5')
        expect(imageSpec.idCounter).toStrictEqual(5)
      })
    })

/*
  "headers": {
    "columns": [
      {
        "text": "users",
        "selecting": [
          {
            "id": "column_0",
            "name": "X",
            "className": "column_0"
          }
        ]
      }
    ],
    "selecting": [
      {
        "id": "header",
        "name": "X",
        "className": "header"
      }
    ]
  },
*/

    describe('selecting header', () => {
      it('no data', async () => {
        const imageSpec = imageSpecs['no data']
        image.selecting('header', imageSpec)
        image.selecting('header', imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        image.selecting(null, imageSpec) // removes selecting
      })

      it('simple list', async () => {
        const imageSpec = imageSpecs['simple list']
        image.selecting('header', imageSpec)
        image.selecting('header', imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.headers.selecting).toStrictEqual([
          {
            "id": "header",
            "name": "X",
            "className": "header"
          }
        ])
        image.selecting(null, imageSpec) // removes selecting
        expect(imageSpec.headers.selecting).toBe()
      })

      it('nested table', async () => {
        const imageSpec = imageSpecs['nested table']
        image.selecting('header', imageSpec)
        image.selecting('header', imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.headers.selecting).toStrictEqual([
          {
            "id": "header",
            "name": "X",
            "className": "header"
          },
          {
            "id": "header2",
            "name": "X",
            "className": 'header2',
          }
        ])
        expect(imageSpec.rows[2].headers.selecting).toStrictEqual([
          {
            "id": "header",
            "name": "X",
            "className": "header"
          },
          {
            "id": "header4",
            "name": "X",
            "className": 'header4',
          }
        ])
        image.selecting(null, imageSpec) // removes selecting
        expect(imageSpec.headers.selecting).toBe()
        expect(imageSpec.rows[2].headers.selecting).toBe()
      })

      it('graph table', async () => {
        const imageSpec = imageSpecs['graph table']
        image.selecting('header', imageSpec)
        image.selecting('header', imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        // TODO
      })

      it('array data selected by field', async () => {
        const imageSpec = imageSpecs['array data selected by field']
        image.selecting('header', imageSpec)
        image.selecting('header', imageSpec) // idempotent
        console.log(JSON.stringify(imageSpec, null, 2))
        expect(imageSpec.headers.selecting).toBe()
        expect(imageSpec.rows[0][0].headers.selecting).toStrictEqual([
          {
            "id": "header",
            "name": "X",
            "className": "header"
          },
          {
            "id": "header3",
            "name": "X",
            "className": 'header3',
          }
        ])
        expect(imageSpec.rows[0][1].headers.selecting).toStrictEqual([
          {
            "id": "header",
            "name": "X",
            "className": "header"
          },
          {
            "id": "header5",
            "name": "X",
            "className": 'header5',
          }
        ])
        image.selecting(null, imageSpec) // removes selecting
        expect(imageSpec.rows[0][0].headers.selecting).toBe()
        expect(imageSpec.rows[0][1].headers.selecting).toBe()
      })
    })
  })
})
