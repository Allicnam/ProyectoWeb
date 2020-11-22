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


// Session Middleware Config
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); // Permite guardar la información de las sesiones dentro de la DB

app.use(session({
  store: new MongoStore({
    url: uri, // Utilizamos la misma conexion a la base de datos
    autoRemove: 'native',
    collection: 'sessions' //Las sesiones se almacenan en esta colección de la DB
  }),
  secret: 'keyboard cat',
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // La sesion dura 2 hrs antes de pedir nuevamente las credenciales
  },
  resave: false,
  saveUninitialized: false
}))


// Ruta para la página Tienda
app.get("/main", (req, res) => {
  // Search the database for the list of books 
  collection.find().toArray((err, docs) => {
    if (err) {
      // if an error happens
      res.status(500).end();
    } else {
      // if all works
      responseData = {
        products: docs,
        user: req.session.user.email
      }
      res.send(responseData); // send back all products on the bookstore list
    }
  });
});


// Cart Route: Add Product
app.post("/cart/add", (req, res) => {
  const product_id = req.body.product_id;
  const cart = req.session.user.cart;

  // Verificar si el elemento ya existe dentro del carrito
  let index = cart.findIndex((product) => { return product.product_id === product_id })
  // Si ya existe, unicamente actualiza la cantidad
  if(index !== -1) { 
    req.session.user.cart[index].quantity++;
    // Guardar nuevamente el carrito a la DB
    users.updateOne({ email: req.session.user.email },
      { $set: { cart: req.session.user.cart} }, (err, result) => {
        if(err) throw err;
        res.json({ message: 'Product successfully added' });
      });
  }
  // Si aun no existe, es necesario agregarlo
  else {
    const product = {
      product_id,
      quantity: 1
    }
    req.session.user.cart.push(product);
    // Guardar nuevamente el carrito a la DB
    users.updateOne({ email: req.session.user.email },
      { $set: { cart: req.session.user.cart} }, (err, result) => {
        if(err) throw err;
        res.json({ message: 'Product successfully added' });
      });
  }
})

// Cart Route: Remove Product
app.post("/cart/remove", (req, res) => {
  const product_id = req.body.product_id;
  const user = req.session.user;

  let index = user.cart.findIndex((product) => { return product.product_id === product_id });
  // Verificar que se encuentre el artículo
  if(index === -1){ 
    res.json({ message: 'Product Not Found' }) 
  }
  // Si se encuentra en el carrito, disminuir su cantidad
  user.cart[index].quantity--;
  // Si ha disminuido a cero la cantidad, eliminar el articulo
  if(user.cart[index].quantity === 0) {
    user.cart.splice(index, 1);
  }

  // Guardar nuevamente el carrito tanto en la sesión como en la DB
  req.session.user = user;
  users.updateOne({ email: req.session.user.email },
    { $set: { cart: req.session.user.cart} }, (err, result) => {
      if(err) throw err;
      res.json({ message: 'Product successfully removed' });
    });
  
})


// Register route
app.post("/register", (req, res) => {
  console.log(req.body);
  // Parse the data from user
  const newUser = {
    email : req.body.email,
    password : req.body.password,
    cart: []
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


// Login route
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
          // Save user information into the session
          req.session.user = user;
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