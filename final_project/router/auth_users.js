const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = "your_secret_key"; // Use a strong, secure key in a real application

const isValid = (username) => {
  // Check if the username is already registered
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if username and password match the one we have in records
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    req.session.username = username;
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully." });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "Review not found for this user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
