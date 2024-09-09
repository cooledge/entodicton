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
  const ed = (value) => { return { className: "", data: value, selecting: undefined } }
  const tr = (rn, ...columns) => {
    const tc = (cn, value, className = 'fieldValue') => {
      return {
        className: `column column_${cn}`,
        data: {
          className,
          data: value
        },
      }
    }
    return {
      className: `row_${rn}`,
      data: columns.map((name, index) => tc(index, name)),
    }
  }
  it('NEOS23 simple list', async () => {
    const imageSpec = {
      headers: {
        columns: [{ text: 'name' }, { text: 'age' }, { text: 'favorite colors' }]
      },
      colgroups: ['c1', 'c2', 'c3'],
      table: true,
      field: [],
      rows: ['$name', '$age', '$fav_colors'],
    }

    const expected = {
        "headers": {
          "className": "header header2",
          "selecting": undefined,
          "data": [
            {
              "className": "",
              "selecting": undefined,
              "data": "name"
            },
            {
              "className": "",
              "selecting": undefined,
              "data": "age"
            },
            {
              "className": "",
              "selecting": undefined,
              "data": "favorite colors"
            }
          ]
        },
        "rules": undefined,
        "colgroups": [
          "c1",
          "c2",
          "c3"
        ],
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

  it('NEOS23 nested table', async () => {
    const imageSpec = {
      headers: {
        columns: [{ text: 'name' }, { text: 'age' }, { text: 'favorite colors' }]
      },
      colgroups: ['c1', 'c2', 'c3'],
      table: true,
      field: [],
      rows: [
              '$name', 
              '$age', 
              {
                headers: { columns: [{ text: 'subject' }, { text: 'mark' } ] },
                field: ['marks_in_subjects'],
                colgroups: ['c1', 'c2'],
                table: true,
                rows: ['$subject_id', '$marks']
              },
            ],
    }

    const expected = 
    {
        "headers": {
          "className": "header header2",
          "selecting": undefined,
          "data": [
            {
              "className": "",
              "selecting": undefined,
              "data": "name"
            },
            {
              "className": "",
              "selecting": undefined,
              "data": "age"
            },
            {
              "className": "",
              "selecting": undefined,
              "data": "favorite colors"
            }
          ]
        },
        "rules": undefined,
        "colgroups": [
          "c1",
          "c2",
          "c3"
        ],
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
                          "data": "subject"
                        },
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": "mark"
                        }
                      ]
                    },
                    "rules": undefined,
                    "colgroups": [
                      "c1",
                      "c2"
                    ],
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
                          "data": "subject"
                        },
                        {
                          "className": "",
                          "selecting": undefined,
                          "data": "mark"
                        }
                      ]
                    },
                    "rules": undefined,
                    "colgroups": [
                      "c1",
                      "c2"
                    ],
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
    console.log('answer', JSON.stringify(actual, (k, v) => v === undefined ? null : v, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('NEOS23 nested graph table', async () => {
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
      idCounter: 1,
      id: 'graph1',
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

