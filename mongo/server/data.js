const { MongoClient } = require('mongodb');

/*
  // for each item show the stores it sold in and total sales

   {
     collection: 'sample_supplies.sales',
     group: 'items.name'
     -> rows
     list: {
       properties: ['storeLocation']
       total: :wq
     }
   }
*/
