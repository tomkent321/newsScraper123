var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio"); // used to grab request to be able to use js commands

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware



// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));



// Connect to the Mongo DB   just change db name after local host
mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });


//Mongoose Settings

const {User} = require('./models');
const mongoose = require('mongoose');

console.log('mongoose initialized');

app.use((req, res, next) => {
  console.log('use for mongoose callback');

  if(mongoose.connection.readyState) {
    console.log('if (mongoose.connewction.readyState)')
    next();
  } else {
    console.log('else (mongoose.connecton.readyState)')
    require('./mongo')().then(() => next());
    console.log('else (mongoose.connecton.readyState)')
  }
    
  });


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios

  var preLink = "https://www.drugs.com"

  axios.get("https://www.drugs.com/fda_alerts.html/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".newsItem h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // result.link = preLink + link;

      result.summary = $(this)
        .siblings("p")
        .text();

        
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    // res.send("Scrape Complete");  //this one got a headers first err
  });
   res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {

  // Find all Articles
  db.Article.find({})
    .then(function(dbArticle) {
      // If all Articles are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
    
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({ _id: req.params.id })
  .populate("note")  //this it the field name from the model "Note"
    //populate the notes
    .then(function(dbArticle) {
      // If all Notes are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
  
});


//the new: true   must be used to display updated true....  3 args:  what, where, update
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  // db.Note.create(req.body)
  db.Note.create(req.body)
  .then(function(dbNote) {
    console.log("in the note create: _id, dbNote.id ",req.params.id," ",dbNote._id);
    
    return db.Article.findOneAndUpdate({ _id: req.params.id}, { note: dbNote._id},{new: true});
    //this is returned to the next .then statement
  })

  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err){
    res.json(err)
  });
  
});

//to delete the note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    // .findOneAndRemove({ _id: req.params.id }, {note: dbNote._id })
    .findOneAndDelete({note: dbNote._id })
    .then(function(dbNote) {
      // If a Note was deleted successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the deleted Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndDelete({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
