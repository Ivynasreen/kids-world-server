const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()
const port = process.env.PORT || 5200;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9d6zf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("dayCare").collection("services");
    const reviewCollection = client.db("dayCare").collection("review");
    const bookingCollection = client.db("dayCare").collection("order");
    const adminCollection = client.db("dayCare").collection("admin");
    console.log('database connected')

    app.post('/addService' , (req,res)=> {
        const newService = req.body;
        console.log('adding new service:' , newService)
        serviceCollection.insertOne(newService)
        .then(result => {
            // console.log('inserted count' , result.insertedCount)
            res.send(result.insertedCount > 0)
        })
    });
    app.get('/services', (req, res) => {
        serviceCollection.find()
        .toArray((err, service) => {
        //   console.log('from database' , service)
          res.send(service)
        })
    });

    app.post('/addReview' , (req,res)=> {
        const newReview = req.body;
        console.log('adding new review:' , newReview)
        reviewCollection.insertOne(newReview)
        .then(result => {
            // console.log('inserted count' , result.insertedCount)
            res.send(result.insertedCount > 0)
        })
    });
    app.get('/reviews', (req, res) => {
        reviewCollection.find()
        .toArray((err, review) => {
        //   console.log('from database' , review)
          res.send(review)
        })
    });

    app.post('/addBooking', (req, res) => {
        const booking = req.body;
        console.log(booking)
        bookingCollection.insertOne(booking)
            .then(result => {
                // console.log('inserted count' , result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/bookings', (req, res) => {
      bookingCollection.find({})
      .toArray((err, documents) => {
      //   console.log('from database' , booking)
        res.send(documents)
      })
    });

    app.post('/order' , (req , res) => {
      const email = req.body.email;
      adminCollection.find({ email: email })
          .toArray((err, admin) => {
              if (admin.length === 0) {
                bookingCollection.find({email: email})
                .toArray((err , documents) => {
                  // console.log(err, documents)
                  // console.log(email, admin, documents)
                  res.send(documents)
                })
              }
              else {
                bookingCollection.find({})
                .toArray((err , documents) => {
                  // console.log(err, documents)
                  console.log(email, documents)
                  res.send(documents)
                })
              }
            })
    })
    app.post('/makeAdmin', (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      adminCollection.insertOne({ name, email })
          .then(result => {
            console.log('inserted count' , result.insertedCount)
              res.send(result.insertedCount > 0);
          })
    })
    
    app.post('/isAdmin', (req, res) => {
      const email = req.body.email;
      adminCollection.find({ email: email })
          .toArray((err, admin) => {
              res.send(admin.length > 0);
          })
  })

  app.delete('/deleteService/:id', (req, res) =>{
    const id = ObjectID(req.params.id)
    console.log(id)
    serviceCollection.findOneAndDelete({_id: id})
    .then( result => {
      res.send({count: result.ok});
    })
  })
 

});

app.listen(process.env.PORT || port ,  () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })