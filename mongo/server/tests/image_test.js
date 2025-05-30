const image = require('../image')
const _ = require('lodash')
const { getAPI } = require('./test_helpers')

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

const bsonGroupedByGenre = [
  {
    genre: 'horror',
    movies: [
      {
        title: "Aliens"
      },
      {
        title: "Silence of the Lambs"
      },
    ]
  },
  {
    genre: 'science fiction',
    movies: [
      {
        title: "Aliens"
      },
      {
        title: "Star Wars"
      },
    ]
  },
  {
    genre: 'crime',
    movies: [
      {
        title: "Silence of the Lambs"
      },
      {
        title: "LA Confidential"
      },
    ]
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
  it('simple list', async () => {
    const imageSpec = {
      headers: {
        columns: [{ text: 'name' }, { text: 'age' }, { text: 'favorite colors' }]
      },
      id: 'table_1',
      colgroups: ['c1', 'c2', 'c3'],
      table: true,
      dataSpecPath: [],
      rows: ['$name', '$age', '$fav_colors'],
    }

    const expected = {
        "headers": {
          "className": "header",
          "data": [
            {
              "className": "",
              "data": "name"
            },
            {
              "className": "",
              "data": "age"
            },
            {
              "className": "",
              "data": "favorite colors"
            }
          ]
        },
        "colgroups": [
          "c1",
          "c2",
          "c3"
        ],
        className: "Table table_1",
        "table": true,
        "rows": {
          "className": "rows",
          "data": [
            {
              "className": "row_0",
              "data": [
                {
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "john"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 25
                  }
                },
                {
                  "className": "column column_2 table_1_column_2",
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
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "greg"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 55
                  }
                },
                {
                  "className": "column column_2 table_1_column_2",
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
      headers: {
        columns: [{ text: 'name' }, { text: 'age' }, { text: 'favorite colors' }]
      },
      colgroups: ['c1', 'c2', 'c3'],
      table: true,
      id: 'table_1',
      dataSpecPath: [],
      rows: [
              '$name', 
              '$age', 
              {
                headers: { columns: [{ text: 'subject' }, { text: 'mark' } ] },
                dataSpecPath: ['marks_in_subjects'],
                colgroups: ['c1', 'c2'],
                id: 'table_2',
                table: true,
                rows: ['$subject_id', '$marks']
              },
            ],
    }

    const expected = 
    {
        "headers": {
          "className": "header",
          "data": [
            {
              "className": "",
              "data": "name"
            },
            {
              "className": "",
              "data": "age"
            },
            {
              "className": "",
              "data": "favorite colors"
            }
          ]
        },
        "colgroups": [
          "c1",
          "c2",
          "c3"
        ],
        "className": "Table table_1",
        "table": true,
        "rows": {
          "className": "rows",
          "data": [
            {
              "className": "row_0",
              "data": [
                {
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "john"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 25
                  }
                },
                {
                  "className": "column column_2 table_1_column_2",
                  "data": {
                    "headers": {
                      "className": "header",
                      "data": [
                        {
                          "className": "",
                          "data": "subject"
                        },
                        {
                          "className": "",
                          "data": "mark"
                        }
                      ]
                    },
                    "colgroups": [
                      "c1",
                      "c2"
                    ],
                    "className": "Table table_2",
                    "table": true,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "abc"
                              }
                            },
                            {
                              "className": "column column_1 table_2_column_1",
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
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "def"
                              }
                            },
                            {
                              "className": "column column_1 table_2_column_1",
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
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "greg"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "className": "fieldValue",
                    "data": 55
                  }
                },
                {
                  "className": "column column_2 table_1_column_2",
                  "data": {
                    "headers": {
                      "className": "header",
                      "data": [
                        {
                          "className": "",
                          "data": "subject"
                        },
                        {
                          "className": "",
                          "data": "mark"
                        }
                      ]
                    },
                    "colgroups": [
                      "c1",
                      "c2"
                    ],
                    "className": "Table table_2",
                    "table": true,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "abc"
                              }
                            },
                            {
                              "className": "column column_1 table_2_column_1",
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
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "def"
                              }
                            },
                            {
                              "className": "column column_1 table_2_column_1",
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

  it('nested graph table', async () => {
    const imageSpec = {
                type: "bar",
                id: 'graph1', 
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
      id: 'graph1',
      "type": "bar",
      "className": "Graph graph1",
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

  describe('add group', () => {
    it('table with no groupings', async () => {
      const api = getAPI()

      const imageSpec = {
        colgroups: [ "column_0" ],
        dataSpecPath: [],
        id: api.getId('table'),
        headers: {
          columns: [
            { id: "title", text: "title" }
          ]
        },
        rows: [
          '$title'
        ],
        table: true
      }

      const field = {
        database: "sample_mflix",
        collection: "movies",
        word: "genre",
        name: "genre",
        ordering: "ascending",
      }

      image.addGroup(api, [], imageSpec, [field])

      const expected = {
        headers: {
          columns: [{ text: 'genre' }, { text: 'movies' }]
        },
        colgroups: ['c1', 'c2'],
        id: 'table_2',
        table: true,
        dataSpecPath: [],
        rows: [
                '$genre',
                {
                  // DIFF headers: { columns: [{ text: 'title' }] },
                  headers: { columns: [{ id: 'title', text: 'title' }] },
                  dataSpecPath: ['movies'],
                  id: 'table_1',
                  colgroups: ['column_0'],
                  table: true,
                  rows: ['$title']
                },
        ],
      }
      console.log('actual', JSON.stringify(imageSpec, null, 2))
      expect(imageSpec).toStrictEqual(expected)
    })
  })

  describe('getProperties', () => {
    it('one table', async () => {
      const imageSpec = {
        colgroups: [ "column_0" ],
        dataSpecPath: [],
        headers: {
          columns: [
            { id: "title", text: "title" }
          ]
        },
        rows: [
          '$title'
        ],
        table: true
      }

      const expected = [ 'title' ]
      expect(image.getProperties(imageSpec)).toStrictEqual(expected)
    })
  })

  describe('Remove columns by ordinal', () => {
    it('add to table single-imageSpec', async () => {
      const imageSpec = {
         "headers": {
           "columns": [
             { "text": "column1", "id": "one" },
             { "text": "column2", "id": "two" },
             { "text": "column3", "id": "three" },
           ]
         },
         "colgroups": [ "column_0", "column_1", "column_2" ],
         "table": true,
         "id": "table_1",
         "dataSpecPath": [],
         "rows": [ "$one", "$two", "$three" ]
       }

      const field = []
      image.removeColumnsByOrdinal(imageSpec, [1, 3])
      console.log('imageSpec--', JSON.stringify(imageSpec, null, 2))
      const expected = {
         "headers": {
           "columns": [
             { "text": "column2", "id": "two" },
           ]
         },
         "colgroups": [ "column_1", ],
         "table": true,
         "id": "table_1",
         "dataSpecPath": [],
         "rows": [ "$two" ]
       }
      expect(imageSpec).toStrictEqual(expected)
    })
  })

  describe('Add column', () => {
    it('add to table single-imageSpec', async () => {
      const imageSpec = {
         "headers": {
           "columns": [
             { "text": "the users", "id": "name" }
           ]
         },
         "colgroups": [ "column_0" ],
         "table": true,
         "id": "table_1",
         "dataSpecPath": [],
         "rows": [ "$name" ]
       }

      const field = []
      image.addColumns(imageSpec, field, ['email', 'age'])
      console.log('imageSpec--', JSON.stringify(imageSpec, null, 2))
      const expected = {
         "headers": {
           "columns": [
             { "text": "the users", "id": "name" },
             { "text": "email", "id": "email" },
             { "text": "age", "id": "age" },
           ]
         },
         "colgroups": [ "column_0", "column_1", "column_2" ],
         "table": true,
         "id": "table_1",
         "dataSpecPath": [],
         "rows": [ "$name", "$email", "$age" ]
       }
      expect(imageSpec).toStrictEqual(expected)
    })

    it('add to table multi-imageSpecs', async () => {
      const imageSpec = {
        "headers": { "columns": [] },
        "table": true,
        "explicit": true,
        "dataSpecPath": [],
        "rows": [
          [
            {
              "headers": {
                "columns": [ { "text": "users", "id": "name" } ]
              },
              "colgroups": [ "column_0" ],
              "table": true,
              "dataSpecPath": [ 0 ],
              "rows": [ "$name" ]
            },
            {
              "headers": {
                "columns": [ { "text": "movies", "id": "title" } ]
              },
              "colgroups": [ "column_0" ],
              "table": true,
              "dataSpecPath": [ 1 ],
              "rows": [ "$title" ]
            }
          ]
        ]
      }
      const field = [1]
      image.addColumns(imageSpec, field, ['email', 'age'])
      console.log('imageSpec--', JSON.stringify(imageSpec, null, 2))
      const expected = {
        "headers": {
          "columns": []
        },
        "table": true,
        "explicit": true,
        "dataSpecPath": [],
        "rows": [
          [
            {
              "headers": {
                "columns": [
                  {
                    "text": "users",
                    "id": "name"
                  }
                ]
              },
              "colgroups": [
                "column_0"
              ],
              "table": true,
              "dataSpecPath": [
                0
              ],
              "rows": [
                "$name"
              ]
            },
            {
              "headers": {
                "columns": [
                  {
                    "text": "movies",
                    "id": "title"
                  },
                  {
                    "text": "email",
                    "id": "email"
                  },
                  {
                    "text": "age",
                    "id": "age"
                  }
                ]
              },
              "colgroups": [
                "column_0",
                "column_1",
                "column_2"
              ],
              "table": true,
              "dataSpecPath": [
                1
              ],
              "rows": [
                "$title",
                "$email",
                "$age"
              ]
            }
          ]
        ]
      }
      expect(imageSpec).toStrictEqual(expected)
    })
  })

  it('grouped by genre', async () => {
    const imageSpec = {
      headers: {
        columns: [{ text: 'genre' }, { text: 'film' }]
      },
      colgroups: ['c1', 'c2'],
      table: true,
      id: 'table_1',
      dataSpecPath: [],
      rows: [
              '$genre', 
              {
                headers: { columns: [{ text: 'title' }] },
                dataSpecPath: ['movies'],
                colgroups: ['c1'],
                id: 'table_2',
                table: true,
                rows: ['$title']
              },
            ],
    }

    const expected = {
        "headers": {
          "className": "header",
          "data": [
            {
              "className": "",
              "data": "genre"
            },
            {
              "className": "",
              "data": "film"
            }
          ]
        },
        "colgroups": [
          "c1",
          "c2"
        ],
        "className": "Table table_1",
        "table": true,
        "rows": {
          "className": "rows",
          "data": [
            {
              "className": "row_0",
              "data": [
                {
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "horror"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "headers": {
                      "className": "header",
                      "data": [
                        {
                          "className": "",
                          "data": "title"
                        }
                      ]
                    },
                    "colgroups": [
                      "c1"
                    ],
                    "className": "Table table_2",
                    "table": true,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "Aliens"
                              }
                            }
                          ]
                        },
                        {
                          "className": "row_1",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "Silence of the Lambs"
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
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "science fiction"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "headers": {
                      "className": "header",
                      "data": [
                        {
                          "className": "",
                          "data": "title"
                        }
                      ]
                    },
                    "colgroups": [
                      "c1"
                    ],
                    "className": "Table table_2",
                    "table": true,
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "Aliens"
                              }
                            }
                          ]
                        },
                        {
                          "className": "row_1",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "Star Wars"
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
              "className": "row_2",
              "data": [
                {
                  "className": "column column_0 table_1_column_0",
                  "data": {
                    "className": "fieldValue",
                    "data": "crime"
                  }
                },
                {
                  "className": "column column_1 table_1_column_1",
                  "data": {
                    "headers": {
                      "className": "header",
                      "data": [
                        {
                          "className": "",
                          "data": "title"
                        }
                      ]
                    },
                    "colgroups": [
                      "c1"
                    ],
                    "table": true,
                    className: "Table table_2",
                    "rows": {
                      "className": "rows",
                      "data": [
                        {
                          "className": "row_0",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "Silence of the Lambs"
                              }
                            }
                          ]
                        },
                        {
                          "className": "row_1",
                          "data": [
                            {
                              "className": "column column_0 table_2_column_0",
                              "data": {
                                "className": "fieldValue",
                                "data": "LA Confidential"
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

    const actual = image.instantiate(imageSpec, bsonGroupedByGenre)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  describe('Find table', () => {
    it('find table in explicit', async () => {
      const table_1 = {
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 0 ],
                "headers": {
                  "columns": [ { "id": "name", "text": "the users" } ]
                },
                "id": "table_1",
                "rows": [ "$name" ],
                "table": true
              }
       const table_3 = {
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 1 ],
                "headers": {
                  "columns": [ { "id": "title", "text": "the movies" } ]
                },
                "id": "table_3",
                "rows": [ "$title" ],
                "table": true
              }
      const imageSpec = {
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_1 ], [ table_3 ], ],
        "table": true,
      }
      const field = [1]
      const paths = image.find(imageSpec, table_3)
      const expected = [ ['rows', 1, 0 ] ] 
      expect(paths).toStrictEqual(expected)
    })
  })

  describe('Delete table', () => {
    let table_1, table_3, imageSpec

    beforeEach(() => {
      table_1 = _.cloneDeep({
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 0 ],
                "headers": {
                  "columns": [ { "id": "name", "text": "the users" } ]
                },
                "id": "table_1",
                "rows": [ "$name" ],
                "table": true
              })
      table_3 = _.cloneDeep({
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 1 ],
                "headers": {
                  "columns": [ { "id": "title", "text": "the movies" } ]
                },
                "id": "table_3",
                "rows": [ "$title" ],
                "table": true
              })
      imageSpec = _.cloneDeep({
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_1 ], [ table_3 ], ],
        "table": true,
      })
    })
    it('delete the first table', async () => {
      const field = [1]
      image.remove(imageSpec, table_1)
      const expected = {
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_3 ], ],
        "table": true,
      }
      expect(imageSpec).toStrictEqual(expected)
    })

    it('delete the second table', async () => {
      const field = [1]
      image.remove(imageSpec, table_3)
      const expected = {
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_1 ], ],
        "table": true,
      }
      expect(imageSpec).toStrictEqual(expected)
    })
  })
  describe('Move table', () => {
    let table_1, table_3, imageSpec

    beforeEach(() => {
      table_1 = _.cloneDeep({
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 0 ],
                "headers": {
                  "columns": [ { "id": "name", "text": "the users" } ]
                },
                "id": "table_1",
                "rows": [ "$name" ],
                "table": true
              })
      table_3 = _.cloneDeep({
                "colgroups": [ "column_0" ],
                "dataSpecPath": [ 1 ],
                "headers": {
                  "columns": [ { "id": "title", "text": "the movies" } ]
                },
                "id": "table_3",
                "rows": [ "$title" ],
                "table": true
              })
      imageSpec = _.cloneDeep({
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_1 ], [ table_3 ], ],
        "table": true,
      })
    })

    it('move table up one', async () => {
      const field = [1]
      image.moveUpOrDown(imageSpec, table_3, -1)
      const expected = {
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_3 ], [ table_1 ], ],
        "table": true,
      }
      expect(imageSpec).toStrictEqual(expected)
    })

    it('move table down one', async () => {
      const field = [1]
      image.moveUpOrDown(imageSpec, table_1, 1)
      const expected = {
        "explicit": true,
        "dataSpecPath": [],
        "headers": { "columns": [] },
        "id": "table_2",
        "rows": [ [ table_3 ], [ table_1 ], ],
        "table": true,
      }
      expect(imageSpec).toStrictEqual(expected)
    })
  })

})

