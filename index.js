const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const admin = require("firebase-admin");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zsf87.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;



var serviceAccount = require("./config/volunteer-network-associations-firebase-adminsdk-d1aib-d168c0652b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-associations.firebaseio.com"
});



const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
client.connect((err) => {
   const eventCollection = client.db("volunteer-network").collection("event");
   const addNewEventCollection = client.db("volunteer-network").collection("newEvent");
   app.post("/event", (req, res) => {
      const event = req.body;
      eventCollection.insertMany(event)
      .then((result) => {
         res.send(result.insertedCount > 0);
      });
   });

   app.get('/events', (req, res) =>{
      eventCollection.find({email: req.body.email})
      .toArray( (err, documents) => {
         res.send(documents);
      })
   });
   app.post("/newEvent", (req, res) => {
      const newEvent = req.body;
      addNewEventCollection.insertOne(newEvent)
      .then((result) => {
         res.send(result.insertedCount > 0);
      });
   });

   app.get('/addEvents', (req, res) =>{
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
         const idToken = bearer.split(" ")[1];
         admin.auth().verifyIdToken(idToken)
         .then(function(decodedToken) {
               let tokenEmail = decodedToken.email;
               if(tokenEmail === req.query.email){
                  addNewEventCollection.find({email: req.query.email})
                     .toArray( (err, documents) => {
                     res.send(documents);
                  })
               }
               // ...
         }).catch(function(error) {
               // Handle error
         });
      }
      else{
         res.status(401).send('un-authorized access')
      }
   });
   app.delete('/deleteEvent/:id', (req, res) => {
      addNewEventCollection.deleteOne({ _id: ObjectId(req.params.id) })
          .then(result => {
              console.log(result.deletedCount)
              if (result.deletedCount > 0) {
                  res.sendStatus(200);
                  console.log('Deleted Successfully')
              }
              else (console.log(result))
          })
   })
   app.get('/allEventList', (req, res) =>{
      addNewEventCollection.find({})
      .toArray( (err, documents) => {
         res.send(documents);
      })
   });
   app.post("/addNewEvent", (req, res) => {
      const newEvent = req.body;
      addNewEventCollection.insertOne(newEvent)
      .then((result) => {
         res.send(result.insertedCount > 0);
      });
   });
   app.get('/newEventByAdmin', (req, res) =>{
      addNewEventCollection.find({id: req.body.id})
      .toArray( (err, documents) => {
         res.send(documents);
      })
   });
});


app.listen(process.env.PORT || port);
