const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zsf87.mongodb.net/${process.env.DB_DBNAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
client.connect((err) => {
   const collection = client.db("volunteer-network").collection("event");
   app.post("/addEvent", (req, res) => {
      const event = req.body;
      collection.insertMany(event)
      .then((result) => {
         res.send(result.insertedCount > 0);
      });
   });

   app.get('/events', (req, res) =>{
      collection.find({})
      .toArray( (err, documents) => {
         res.send(documents);
      })
  })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
