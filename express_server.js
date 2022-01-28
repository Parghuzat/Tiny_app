const helper = require('./helper');
const {generateRandomString, isEmailExsist, getUserUrl} = helper;

const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const { redirect } = require('express/lib/response');

const users = { };

app.set("view engine", "ejs");

const urlDatabase = {
};


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['ppz01'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.get("/urls", (req, res) => {
  if(req.session["user_id"] === undefined){
    res.status(400).send('Plese login first!');
  }
  const templateVars = {
    user: users[req.session["user_id"]],    
    urls: getUserUrl(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],    
    urls: getUserUrl(req.session["user_id"], urlDatabase)
  };
  //user is logged in => to urls
  //user is not logged in => to login
  if(templateVars.user){
    res.render("urls_index", templateVars);
  }else{
    res.render("login", {user: users[req.session["user_id"]]});
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"] === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", {user: users[req.session["user_id"]]});
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"] === undefined) {
    return res.status(400).send("Plese log in first!");
  } 
  //when other than the short url's owner try to access the shorturl
  if(req.session["user_id"] != urlDatabase[req.params.shortURL].userID){
    return res.status(400).send('Sorry! You don\'t have access to this url!');
  }
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(400).send('The Url does not exist!');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]] };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  //fixing security risk => user cannot post without login
  if (req.session["user_id"] === undefined) {
    res.status(400).send("Sorry, You don't have access!");
  } 
  // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  if(longURL.substring(0,4) !== "http"){
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, 
    userID: req.session["user_id"]
  }
  const url = "/urls/" + shortURL;
  res.redirect(url);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send('Page not Found');
  }
    //fixing security risk => user cannot access other url that they do not own
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  if(longURL.substring(0,4) !== "http"){
    longURL = "http://" + longURL;
  }
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect("/urls");
})

// POST to remove URL
app.post("/urls/:shortURL/delete", (req, res) => {
  //fixing security risk => user cannot delete without login
  if (req.session["user_id"] === undefined) {
    return res.status(400).send('Sorry! You don\'t have access to delete this url!');
  } 
  //when other than the short url's owner try to access the shorturl
  if(req.session["user_id"] != urlDatabase[req.params.shortURL].userID){
    return res.status(400).send('Sorry! You don\'t have access to delete this url!');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//User login
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Invalied email or password!');
  }
  const userId = isEmailExsist(req.body.email, users);
  if(userId == false) {
    return res.status(403).send('Email doesn\'t exsist!');
  }
  if (bcrypt.compareSync(req.body.password, users[userId]["password"]) === true) {
    req.session.user_id = userId;
    res.redirect('/urls');
  }
  else {
    return res.status(403).send('Invalied email or password!');
  }  
});

app.get("/login", (req, res) => {
  res.render("login", {user: users[req.session["user_id"]]});
})

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session = null;
  res.redirect('/');
});

//store new user to the database
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Invalied email or password!');
  }
  if(isEmailExsist(req.body.email, users) != false) {
    return res.status(400).send('Email already exsist!');
  }
  const randomId = generateRandomString();
  //const hashedPassword;
  users[randomId] = { 
    "id": randomId,
    "email": req.body.email,
    "password": bcrypt.hashSync(req.body.password,10),
  };
  req.session.user_id = randomId;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("registration", {user: users[req.session["user_id"]]})
});

