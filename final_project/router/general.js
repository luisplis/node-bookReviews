const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const user = req.body.username;
  const pass = req.body.password;
  
  if (!user || !pass) {
      return res.status(404).json({ message: "Error: username or password inexistent" });
  }
  
  let exists = users.filter((user) => {
    return (user.username === user && user.password === pass);
  });
  
  if (exists.length)
    return res.status(404).json({message: "User already exists!"});

  users.push({"username": user, "password": pass});

  return res.json({message: `User '${user}' registered successfully`});
});

// Get the book list available in the shop (SYNCHRONOUS)
public_users.get('/books',function (req, res) {
  return res.send(JSON.stringify(books, null, 2)); // OK - Task 1-4
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    (async () => {
        try {
            const response = await axios.get('http://localhost:5000/books');
            
            return res.status(200).send(JSON.stringify(response.data, null, 2));
        } 
        catch (error) {
            console.error("Axios Error on GET books:", error.message);
            
            return res.status(500).json({
                message: "Error fetching book list",
                error: error.message
            });
        }
    })();
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbnParam = req.params.isbn;

    (async () => {
        try {
            const response = await axios.get('http://localhost:5000/books');
            const books = response.data;

            const filteredBooks = books[isbnParam];

            if (filteredBooks) {
                return res.status(200).json(filteredBooks);
            } else {
                return res.status(404).json({ message: "No books found for the specified ISBN" });
            }

        } catch (error) {
            console.error("Axios Error:", error.message);
            return res.status(500).json({ message: "Error connecting to the book database" });
        }
    })();
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const authorParam = req.params.author;

    (async () => {
        try {
            const response = await axios.get('http://localhost:5000/books');
            const books = response.data;
          
            const filteredBooks = Object.values(books).filter(
                (b) => b.author.includes(authorParam)
            );

            if (filteredBooks) {
                return res.status(200).json(filteredBooks);
            } else {
                return res.status(404).json({ message: "No books found for the specified author" });
            }

        } catch (error) {
            console.error("Axios Error:", error.message);
            return res.status(500).json({ message: "Error connecting to the book database" });
        }
    })();
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title;

  (async () => {
    try {
      const response = await axios.get('http://localhost:5000/');
      const books = response.data;

      const filteredBooks = Object.values(books).filter(
        (b) => b.title.includes(titleParam)
      );

      if (filteredBooks) {
        return res.status(200).send(filteredBooks);
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }

    } catch (error) {
      console.error("Axios Error on GET books by title:", error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  })();
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const reviews = books[req.params.isbn].reviews;
  
  if (reviews) return res.send(JSON.stringify(reviews, null, 2));
  
  return res.status(404).json({message: "Empty reviews for this book"});
});

module.exports.general = public_users;
