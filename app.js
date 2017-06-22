const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const path = require('path');
const session = require('express-session');

//Initialized Express App
const app = express();

//Serve static files to server
app.use(express.static(path.join(__dirname,'public')));

//Setting up View Engine
app.engine('mustache', mustacheExpress());
app.set('views',path.join(__dirname,"views"));
app.set('view engine','mustache');

//Body parser and validator implementation
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());

//Initialize Express Session
//Object is required. All three things are needed
app.use(session({
  secret: 'cornbread',          //secret is passed through, parsed, hashed, and placed in the cookie.
  resave: false,                //forces a save even if things haven't been modified
  saveUninitialized: false      //Asks the user if they want to save the session
}));

//Fake user database
let users = [{username: "cornbread", password: "password"}];

let messages = [];

app.get("/", function(req, res){
  //Check to see if we are already logged in
  if(req.session.username) {
    res.redirect("/user");
  }
  else{
    res.render("index");
  }

});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
  let loggedUser;
  messages = [];

  users.forEach(function(user){
    if( user.username === req.body.username){
      loggedUser = user;
    }
  });

  req.checkBody("username", "Please enter a valid username.").notEmpty().isLength({min: 6, max: 20});
  req.checkBody("password", "Please Enter a Password.").notEmpty();
  req.checkBody("password", "Invalid password and username combination").equals(loggedUser.password);

  let errors = req.validationErrors();

  if(errors) {
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    res.render("login", {errors: messages});
  }
  else{
    req.session.username = req.body.username;
    res.redirect("/user");
  }
});

app.get("/user", function(req, res){

  res.render("user", {username: req.session.username});
});

app.listen(3000, function(){
  console.log("App running on localhost:3000")
});
