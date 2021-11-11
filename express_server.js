const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const users = { };

app.set("view engine", "ejs");

const urlDatabase = {
};


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],    
    urls: getUserUrl(req.cookies["user_id"])
  };
  
  res.render("urls_index", templateVars);
});


app.get("/", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],    
    urls: getUserUrl(req.cookies["user_id"])
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
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", {user: users[req.cookies["user_id"]]});
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  }
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send('Page not Found');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: "http://" + req.body.longURL, 
    userID: req.cookies["user_id"]
  }
  res.render( "urls_show", {shortURL: shortURL, longURL: req.body.longURL, user: users[req.cookies["user_id"]] });         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.status(404).send('Page not Found');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
})

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
    return res.status(403).send('Email doesn\'t exsist!');
  }
  if (users[userId]["password"] === req.body.password) {
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
  else {
    return res.status(403).send('Invalied email or password!');
  }  
});

app.get("/login", (req, res) => {
  res.render("login", {user: users[req.cookies["user_id"]]});
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
  res.render("registration", {user: users[req.cookies["user_id"]]})
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

function getUserUrl (userid) {
  const result = { };
  for (let ele in urlDatabase) {
    if (userid === urlDatabase[ele]["userID"]) {
      result[ele] = urlDatabase[ele].longURL;
    }
  }
  return result;
}