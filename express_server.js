var express = require("express");
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080


//middleware

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {

  return Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
}

var random = generateRandomString()


var shortUrl = "www.linkShortening.com"



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    link: shortUrl,
    username: req.cookies["username"],

  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase,
      username: req.cookies["username"],
    };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id]) {
    let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase,
      username: req.cookies["username"],
    };
    res.render("urls_show", templateVars);
  } else {
      res.status(404).send('Something broke!')
    }

});


app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  let LongRec = req.body.longURL
  if(!(LongRec.substring(0, 7) == 'http://')){
    LongRec = "http://"+LongRec
  }
  console.log(LongRec)
  urlDatabase[generateRandomString()] = LongRec;
  res.redirect("/urls");
         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
     console.log("long url is :",longURL);
  res.redirect(longURL);

});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
 // console.log(req.params.id);
  console.log(req.body.newlongURL);
  var LongRec = req.body.newlongURL
  urlDatabase[req.params.id] = req.body.newlongURL ;
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
 // console.log(req.params.id);
  var UName = req.body.userName;
  res.cookie('username',UName);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
 // console.log(req.params.id);
  //var UName = req.body.userName;
  res.clearCookie('username')
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});