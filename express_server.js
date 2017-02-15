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
  if(urlDatabase[req.params.id]) {
    let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase
    };
    res.render("urls_show", templateVars);
  } else {
      res.status(404).send('Something broke!')
    }

});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  let LongRec = req.body.longURL
  if(!(LongRec.includes('http'))){
    LongRec = "http://"+LongRec
  }
  console.log(LongRec)
  urlDatabase[generateRandomString()] = LongRec;
         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
     console.log("long url is :",longURL);
  res.redirect(longURL);

});

app.post("/urls/:id/delete", (req, res) => {
  //console.log(req.params.id);
  delete urlDatabase[req.params.id];
  //console.log(urlDatabase);
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
 // console.log(req.params.id);
  console.log(req.body.newlongURL);
  var LongRec = req.body.newlongURL


  //res.send("It WORRRKS");
  urlDatabase[req.params.id] = req.body.newlongURL ;
  //console.log(urlDatabase);
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});