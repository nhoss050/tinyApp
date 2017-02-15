var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080




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
  let templateVars = { urls: urlDatabase, link: shortUrl};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log('im here');
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, database: urlDatabase};
  res.render("urls_show", templateVars);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  //let newLongURL = {};
  urlDatabase[random] = req.body.longURL;
  //urlDatabase = newLongURL
  console.log(urlDatabase);
   // debug statement to see POST parameters

  res.send("OK!");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});