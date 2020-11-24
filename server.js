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

// Middleware Guardian para rutas
function ensureAuthenticated(req, res, next) {
  // Si el usuario no ha iniciado sesion, redirigir a login
  if(!req.session.user) {
    res.redirect('/');
  }
  // Si ya ha iniciado sesion, proceder con el request
  next();
}


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
        user: (req.session.user) ? req.session.user.email : false
      }
      res.send(responseData); // send back all products on the bookstore list
    }
  });
});

// Cart Route: Serve page
app.get('/cart', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Carrito.html'));
})

// Cart Route: Access list of products
app.get("/cart/user", async (req, res) => {
  const cart = req.session.user.cart;
  const products = [];
  const promises = [];
  // Para cada producto en el carrito obtener sus detalles y guardarlo en los datos de salida
  cart.forEach(element => {
    const o_id = new mongodb.ObjectID(element.product_id);
    const promise = collection.findOne({ '_id': o_id })
      .then(book => {
        book.quantity = element.quantity; // Agregar propiedad quantity
        book.imgdata = Buffer.from(book.imgdata.buffer).toString('base64'); // Convertir el Binary Buffer a String Base64
        book.imgdata = book.imgdata.replace("dataimage/jpegbase64", ""); // Remover informacion adicional
        products.push(book);
      })
      .catch(err => {
        console.log(err);
      })
    promises.push(promise);
  });

  // Una vez todas las operaciones finalizan, regresar el array de productos
  Promise.all(promises).then(() => {
    res.json({
      user: req.session.user.email,
      products
    });
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
});

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
});

// Cart Route: Remove All
app.post("/cart/remove/all", (req, res) => {
  // Resetear el carrito a un array vacío
  req.session.user.cart = [];

  // Guardar nuevamente el carrito en la DB
  users.updateOne({ email: req.session.user.email },
    { $set: { cart: req.session.user.cart} }, (err, result) => {
      if(err) throw err;
      res.json({ message: 'All products successfully removed' });
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
  console.log("Login Credentials:");
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
          console.log("User found:");
          console.log(user);
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

// Logout route
app.get("/logout", (req, res) => {
  console.log("Logout");
  req.session.destroy((err) => {
    if(err) throw err;
  });
  res.clearCookie('connect.sid').status(200).end();
  console.log("Session terminated");
});


// listen for requests
app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});