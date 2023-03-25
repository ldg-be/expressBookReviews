const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
let reviews = {
    "123": [{"username":"lars", "review":"blablabla"}],
    "456": []
};

const isValid = (username)=>{
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
}

  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
}});

function deleteReview(isbn, username) {
    const index = reviews[isbn].indexOf(username)
    reviews[isbn].splice(index,1)
    console.log("Successfully deleted Review")
}

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.session.authorization.username
    const newreview = {
        "username":username,
        "review":req.body.review
    }
    let bookreview = reviews[isbn]
    console.log(bookreview)
    if(!bookreview){
        console.log("No existing ISBN!")
        //create new object
        reviews[isbn] = newreview;
        console.log("ISBN creater, review added")
    }
    let lastreview = bookreview.filter((review)=>{
        return (review.username == username)
    });
    if (lastreview.length > 0){
        //delete review
        deleteReview(isbn,username)
        console.log("Review changed");
    } else {
        console.log("Review added")
    }
    //add new review
    bookreview.push(newreview);

    return res.json({message: "Review submitted successfully",content:bookreview});
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  deleteReview(req.params.isbn,req.session.authorization.username)
  return res.status(300).json({message: "Successfully deleted the review",isbn:req.params.isbn});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
