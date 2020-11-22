// init project
const path = require('path');
const express = require("express"); 
const app = express(); // instantiate express

const PORT = 4567; // port to listen on

// Password hashing
const bcrypt = require("bcrypt");

// Database connection
const mongodb = require("mongodb"); 
const uri = "mongodb://m001-student:webdatabase@proyectodesarrolloweb-shard-00-00.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-01.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-02.d30vh.mongodb.net:27017/ProyectoWebBD?ssl=true&replicaSet=atlas-ybvymb-shard-0&authSource=admin&retryWrites=true&w=majority"; // put your URI HERE
//                                   ^contraseña^ de la conexion a atlas                                                                                                                                                                               ^base de datos default^                                                                      

// References to store the collections from MongoDB
let collection;
let users;

mongodb.MongoClient.connect(uri, (err, db) => {
  collection = db.collection("libros"); //La coleccion se llama libros
  users = db.collection("users"); //segunda colleccion  
});

// Express Middleware
app.use(require("cors")()); // allow Cross-domain requests
app.use(require("body-parser").json()); // automatically parses request data to JSON
app.use(express.static(path.join(__dirname, 'public'))); // Server static files

app.get("/main", (req, res) => {
  // search the database (collection) for all users with the `user` field being the `user` route paramter
  
  collection.find().toArray((err, docs) => {
    if (err) {
    // if an error happens
    res.send("Error in GET req.");
    } else {
    // if all works
    res.send(docs); // send back all users found with the matching username
    }
  });
});

app.post("/register", (req, res) => {
  console.log(req.body);
  // Parse the data from user
  const newUser = {
    email : req.body.email,
    password : req.body.password
  }

  // Hash the plain text password
  bcrypt.hash(newUser.password, 10, (err, hash) => {
    if(err) throw err;
    newUser.password = hash;
    users.insert(newUser);
  });

  // TODO: Send a message indicating a successful registration 
  res.status(200).end();
});
  
app.get("/login", (req, res) => {
  console.log("backlogin");
  console.log(req.query);

  const userCredentials = { 
    email: req.query.email, 
    password: req.query.password 
  }

  users.findOne({ email: userCredentials.email }, (err, user) => {
    if (err) throw(err); // handle error case

      // Compare the stored password (already hashed) with the submitted one
      bcrypt.compare(userCredentials.password, user.password, (err, result) => {
        if(err) throw err;
        // If passwords match, send user information
        if(result) {
          res.json(user);
        }
        // If not, send HTTP Unauthorized status code 
        else {
          res.status(401).end();
        }
      }) 
  });
});


// listen for requests
app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});