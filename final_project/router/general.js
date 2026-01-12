const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 2)); // OK - Task 1-4
});

// ASYNC/AWAIT -- require('axios') => axios.get()
public_users.get('/books',function (req, res) {

  (async () => {
      try {
        const response = await fetch('http://localhost:5000/');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return res.send(JSON.stringify(data, null, 2));
      } 
      catch (error) {
        
        console.error("Fetch Error on GET books:", error.message);

        return res.status(500).json({message: "Error fetching data"});
      }
  })();

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn]; 
  if (book)
    return res.send(JSON.stringify(book, null, 2));
  
  return res.status(404).json({message: "Book not found"});
});

// ASYNC/AWAIT ISBN -- require('axios') => axios.get()
public_users.get('/books/isbn/:isbn',function (req, res) {
 
  const isbn  = req.params.isbn;
  (async () => {
    try {
      const response = await fetch('http://localhost:5000/isbn/'+isbn);

      if (!response.ok) {
          return res.status(response.status).send("Error fetching by isbn");
      }
      const data = await response.json();

      return res.send(JSON.stringify(data, null, 2));
    } 
    catch (error) {
      console.error("Fetch Error on GET books:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  })();

});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const book = Object.values(books).filter((book) => {
    return book.author.toLocaleLowerCase().includes(req.params.author.toLocaleLowerCase());
  });

  if (book.length) return res.send(JSON.stringify(book, null, 2));
  
  return res.status(404).json({message: "Books not found"});
});

// ASYNC/AWAIT AUTHOR -- require('axios') => axios.get()
public_users.get('/books/author/:author',function (req, res) {
 
  const author  = req.params.author;
  (async () => {
    try {
      const response = await fetch('http://localhost:5000/author/'+author);

      if (!response.ok) {
          return res.status(response.status).send("Error fetching book by author");
      }
      const data = await response.json();

      return res.send(JSON.stringify(data, null, 2));
    } 
    catch (error) {
      console.error("Fetch Error on GET books:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  })();

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const book = Object.values(books).filter((book) => {
    return book.title.toLocaleLowerCase().includes(req.params.title.toLocaleLowerCase());
  });
  
  if (book.length) return res.send(JSON.stringify(book, null, 2));
  
  return res.status(404).json({message: "Books not found"});
});


// ASYNC/AWAIT ISBN
public_users.get('/books/title/:title',function (req, res) {
 
  const title  = req.params.title;
  (async () => {
    try {
      const response = await fetch('http://localhost:5000/title/'+title);

      if (!response.ok) {
          return res.status(response.status).send("Error fetching book by title");
      }
      const data = await response.json();

      return res.send(JSON.stringify(data, null, 2));
    } 
    catch (error) {
      console.error("Fetch Error on GET books:", error.message);
      return res.status(500).send("Internal Server Error");
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
