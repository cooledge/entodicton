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

describe('Reports Tests', () => {
  it('simple list', async () => {
    const imageSpec = {
      headers: { columns: ['name', 'age', 'favorite colors' ] },
      table: true,
      field: [],
      rows: ['$name', '$age', '$fav_colors'],
    }

    const expected = 
   {
        "headers": {
          "className": "header",
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
    const imageSpec = {
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
    }

    const expected = 
    {
        "headers": {
          "className": "header",
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
                      "className": "header",
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
                      "className": "header",
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

  it('array data selected by field', async () => {
    const imageSpec = {
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
                    "className": "header",
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
                    "className": "header",
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
})
