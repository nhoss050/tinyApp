var express = require("express");
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080


//middleware

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
// the pre-defined url data base objetc which will be updated
var urlDatabase = {

  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
  },
 "user2RandomID": {
    "9sm5xK": "http://www.google.com"
  },
};
// the pre-defined user registeration object

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {

  return Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
}

function cookieFindsUser(cookies) {

    console.log("cookie:" ,cookies)
    let cookiesID = cookies["user_id"];
    return cookiesID;
}

function compareuseremailtoDB(xemail,xpassword) {

    for (eachuser in users) {
        if(users[eachuser].email === xemail) {
          if(users[eachuser].password === xpassword) {
            return users[eachuser].id;
          }
        }
    }
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
// view one
// !!!! handle no cookie situation
app.get("/urls", (req, res) => {

let cookiefound = cookieFindsUser(req.cookies);
let userfound = users[cookiefound];


  let templateVars = {
    urls: urlDatabase,
    link: shortUrl,
    user_id: userfound,

  };


  res.render("urls_index", templateVars);
});
// view two
app.get("/urls/new", (req, res) => {


let cookiefound = cookieFindsUser(req.cookies);
let userfound = users[cookiefound];

  let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase,
      user_id: userfound,
    };
  if(templateVars["user_id"]) {
  res.render("urls_new",templateVars);
  } else {
    res.redirect("/login");
  }
});
// view three
app.get("/urls/:id", (req, res) => {

let cookiefound = cookieFindsUser(req.cookies);
let userfound = users[cookiefound];


  if(urlDatabase[req.params.id]) {
    let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase,
      user_id: userfound,
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
//--------------- DAy 2 -------------------

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

app.get("/login", (req, res) => {

    res.render("user_login");
  });



app.post("/login", (req, res) => {




    console.log("login body is:",req.body.email);
    var loginEmail = req.body.email;
    let  loginPass = req.body.password;
    let theRequiredUSer = compareuseremailtoDB(loginEmail,loginPass)
    console.log("the required user is: ",theRequiredUSer )
      if(!(theRequiredUSer)){
        return res.status(400).send('email not found!')
      } else {
        res.cookie('user_id',theRequiredUSer);
      }
      res.redirect("/urls");






});

app.post("/logout", (req, res) => {
 // console.log(req.params.id);
  //var UName = req.body.userName;
  res.clearCookie('user_id')
  res.redirect("/urls");

});
//--------------- DAy 3 -------------------

app.get("/register", (req, res) => {
// keeping these values for now
  let templateVars = {
    urls: urlDatabase,
    link: shortUrl,
    user_id: req.cookies["user_id"],

  };
  res.render("user_register", templateVars);
});
// user email and password is received and if not empty they are added to the DB
app.post("/register", (req, res) => {
// make sure user does not enter blank!
  if(req.body.email && req.body.password) {
    for (echUser in users) {
      if(users[echUser].email === req.body.email) {
        return res.status(400).send('email already in use')
        //throw err;
      }
    }
    var GeneratedID = generateRandomString()
    let newRegisterObject = {
      id: GeneratedID,
      email: req.body.email,
      password: req.body.password,
    }
// add the new object to DB and set cookie and redirect
    users[GeneratedID]= newRegisterObject
    console.log("new object :", newRegisterObject);
    console.log("updated DB :", users);
    res.cookie('user_id',GeneratedID);
    res.redirect("/urls");
  } else {
      res.status(400).send('Something broke!')
    }
});

app.get("/cookies", (req, res) => {

let cookies = req.cookies;
res.send(cookies)


});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});