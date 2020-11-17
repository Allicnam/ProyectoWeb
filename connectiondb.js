// init project
const express = require("express"); // the library we will use to handle requests
const mongodb = require("mongodb"); // load mongodb

const port = 4567; // port to listen on
//el port deberia estar libre

const app = express(); // instantiate express
app.use(require("cors")()); // allow Cross-domain requests
app.use(require("body-parser").json()); // automatically parses request data to JSON

// make sure in the free tier of MongoDB atlas when connecting, to
// select version 2.2.* as the node.js driver instead of the default 3.0
// put your URI HERE ⬇
const uri = "mongodb://m001-student:webdatabase@proyectodesarrolloweb-shard-00-00.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-01.d30vh.mongodb.net:27017,proyectodesarrolloweb-shard-00-02.d30vh.mongodb.net:27017/ProyectoWebDB?ssl=true&replicaSet=atlas-ybvymb-shard-0&authSource=admin&retryWrites=true&w=majority"; // put your URI HERE
//                                   ^contraseña^ de la conexion a atlas                                                                                                                                                                               ^base de datos default^                                                                      
// connect to your MongoDB database through your URI. 
// The connect() function takes a uri and callback function as arguments.
mongodb.MongoClient.connect(uri, (err, db) => {
  // connect to your specific collection (a.k.a database) that you specified at the end of your URI (/database)
  const collection = db.collection("Libros"); //La coleccion se llama libros
  console.log("Llego aqui debug 11");

  // Responds to GET requests with the route parameter being the username.
  // Returns with the JSON data about the user (if there is a user with that username)
  // Example request: https://mynodeserver.com/myusername

  
/*

  app.get("/Frankenstein", (req, res) => {
    // search the database (collection) for all users with the `user` field being the `user` route paramter
    console.log("Llego aqui 1");
    collection.find({title: "Frankenstein"}).toArray((err, docs) => {
      if (err) {
        // if an error happens
        res.send("Error in GET req.");
      } else {
        // if all works
        console.log("Llego aqui 2");
        res.send(docs); // send back all users found with the matching username
      }
    });
  });


  app.get("/1823", (req, res) => {
    // search the database (collection) for all users with the `user` field being the `user` route paramter
    console.log("Llego aqui 3");
    collection.find({Year: "1823"}).toArray((err, docs) => {
      if (err) {
        // if an error happens
        res.send("Error in GET req.");
      } else {
        // if all works
        console.log("Llego aqui 4");
        res.send(docs); // send back all users found with the matching username
      }
    });
    
  });

*/

 
 //app gets



 
/*

  app.get("/findone", (req, res) => {
    collection.findOne({}, function(err, result) {
        if (err) throw err;
        console.log(result.name);
      });
    collection.find({Year: "1823"}).toArray((err, docs) => {
      if (err) {
        // if an error happens
        res.send("Error in GET req.");
      } else {
        // if all works
        res.send(docs); // send back all users found with the matching username
      }
    });
  });


  // Responds to POST requests with the route parameter being the username.
  // Creates a new user in the collection with the `user` parameter and the JSON sent with the req in the `body` property
  // Example request: https://mynodeserver.com/myNEWusername
  app.post("/:user", (req, res) => {
    // inserts a new document in the database (collection)
    collection.insertOne(
      { ...req.body, user: req.params.user }, // this is one object to insert. `requst.params` gets the url req parameters
      (err, r) => {
        if (err) {
          res.send("Error in POST req.");
        } else {
          res.send("Information inserted");
        }
      }
    );
  });

  // this doesn't create a new user but rather updates an existing one by the user name
  // a request looks like this: `https://nodeserver.com/username23` plus the associated JSON data sent in
  // the `body` property of the PUT request
  app.put("/:user", (req, res) => {
    collection.find({ user: req.params.user }).toArray((err, docs) => {
      if (err) {
        // if and error occurs in finding a user to update
        res.send("Error in PUT req.");
      } else {
        collection.updateOne(
          { user: req.params.user }, // if the username is the same, update the user
          { $set: { ...req.body, user: req.params.user } }, // update user data
          (err, r) => {
            if (err) {
              // if error occurs in actually updating the data in the database
              console.log("Error in updating database information");
            } else {
              // everything works! (hopefully)
              res.send("Updated successfully");
            }
          }
        );
      }
    });



    

    // if someone goes to base route, send back they are home.
    app.get("/", (req, res) => {
      res.send("You are home 🏚.");
    });




  });

    */

  // listen for requests
  var listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });


});