const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios')
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN


public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let urlreq = axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`)
  urlreq.then(resp=> {
        console.log(resp.data.items[0].volumeInfo)
        return res.send(JSON.stringify(resp.data.items[0].volumeInfo,null,4));
    }).catch(error=> {
        console.log(error)
        return res.send('We could not get the data from the ISBN')}
    )});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let booksfromauthor = []
  for(var key in books) {
        if(books[key].author == author){
            booksfromauthor.push(books[key])
        } else {
            console.log("No matching author found")
        }   
 }
   return res.json(JSON.stringify(booksfromauthor));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    let booksfromtitle = []
    for(var key in books) {
          if(books[key].title == title){
              booksfromtitle.push(books[key])
          }  
   }
     return res.json(JSON.stringify(booksfromtitle));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let reviews = []
    let urlreq = axios.get(`https://api.nytimes.com/svc/books/v3/reviews.json?api-key=yl3IChS80Xzn7Sj27Y7Y698GGhxEUtsV&isbn=${encodeURIComponent(isbn)}`)
    urlreq.then(resp=> {
          resp.data.results.forEach((result)=> reviews.push(result.summary))
          return res.send(JSON.stringify(reviews,null,4));
      }).catch(error=> {
          console.log(error)
          return res.send('We could not get the review from the ISBN')})
        });

module.exports.general = public_users;
