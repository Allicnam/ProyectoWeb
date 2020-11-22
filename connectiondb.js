// init project
const express = require("express"); 
const mongodb = require("mongodb"); 

const port = 4567; // port to listen on
//el port deberia estar libre

const app = express(); // instantiate express
app.use(require("cors")()); // allow Cross-domain requests
app.use(require("body-parser").json()); // automatically parses request data to JSON

const uri = "mongodb://m001-student:webdatabase@proyectodesarrolloweb-shard-00-00.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-01.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-02.d30vh.mongodb.net:27017/ProyectoWebBD?ssl=true&replicaSet=atlas-ybvymb-shard-0&authSource=admin&retryWrites=true&w=majority"; // put your URI HERE
//                                   ^contraseña^ de la conexion a atlas                                                                                                                                                                               ^base de datos default^                                                                      

mongodb.MongoClient.connect(uri, (err, db) => {

  const collection = db.collection("libros"); //La coleccion se llama libros
  const users = db.collection("users"); //segunda colleccion  

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
    users.insert({
      email : req.body.email,
      password : req.body.password
    });
    res.send("hola");
  });

  app.get("/login", (req, res) => {
    console.log("backlogin");
    console.log(req.query);
    users.findOne({email: req.query.email, password: req.query.password }, (err, user) => {
      if (err) throw(err); // handle error case
        res.json(user);
    });
    
  });


  // listen for requests
  var listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });


});