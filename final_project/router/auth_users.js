const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = "app-books";

let users = [{username: "admin", password: "1234"}];

const isValid = (username)=>{ // returns boolean
  return users.some((user) => {
    return (username === user.username);
  });
}

const authenticatedUser = (username, password)=>{ // returns boolean
  return users.some((user) => {
    return (user.username === username && user.password === password);
  });
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let token = jwt.sign({ data: username }, SECRET_KEY, { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = token;

      return res.status(200).send("User successfully logged by TOKEN");
  }

  return res.status(208).json({ message: "Invalid username or password for login" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  let user = req.user.data? req.user.data: req.user; // fix user (session/cookie  object)
  
  const isbn = req.params.isbn;
  const review = req.body.review;
  
  if (!user) return res.status(404).json({ message: "Error adding review for user" });
  if (!isbn) return res.status(404).json({ message: "Params Error for isbn" });
  if (!review) return res.status(404).json({ message: "Params Error on review" });

  const msg = (books[isbn].reviews[user]) ? "updated" : "added";

  books[isbn].reviews[user] = review;

  return res.status(200).send("Review "+msg+" successfully by "+user);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.secret = SECRET_KEY;
