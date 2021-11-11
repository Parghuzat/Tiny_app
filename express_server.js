const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const users = { };

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],    
    urls: urlDatabase
  };
  
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = "http://" + req.body.longURL; 
  res.render( "urls_show", {shortURL: shortURL, longURL: req.body.longURL});         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

// POST to remove URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Invalied email or password!');
  }
  const userId = isEmailExsist(req.body.email);
  if(userId == false) {
    return res.status(400).send('Email doesn\'t exsist!');
  }
  if (users[userId]["password"] === req.body.password) {
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
  else {
    return res.status(400).send('Invalied email or password!');
  }  
});

app.get("/login", (req, res) => {
  res.render("login");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

//store new user to the database
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Invalied email or password!');
  }
  if(isEmailExsist(req.body.email) == true) {
    return res.status(400).send('Email already exsist!');
  }
  const randomId = generateRandomString();
  users[randomId] = { 
    "id": randomId,
    "email": req.body.email,
    "password": req.body.password
  };
  res.cookie('user_id', randomId);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("registration")
});

function generateRandomString() {
  const chart = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (i = 0; i < 6; i++) {
    result = result + chart[Math.floor(Math.random() * (chart.length - 1))];
  }
  return result;
}

function isEmailExsist (email) {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return user;
    }
  }
  return false;
}

function isPwCorrect (email, password) {
  for (let user in users) {
    if (users[user]["email"] === email && users[user]["password"] === password) {
      return user;
    }
  }
  return false;
}