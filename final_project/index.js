const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const SECRET_KEY = "api-books";

app.use(express.json());

app.use("/customer",session({secret: SECRET_KEY,resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  // OK
  const token = req.session.authorization;
  if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({message: "User not authenticated"});
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(403).json({message: "User not authenticated"});
  }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, ()=>console.log("Server is running!"));
