var cookieSession = require('cookie-session')
var express = require("express");
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080


//middleware

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ['nimaisthebest'],

}))
//-----------DATA BASES--------------

// the pre-defined url data base objetc which will be updated
var urlDatabase = {

  "b2xVn2":{
    longUrls: "http://www.lighthouselabs.ca",
    userInDB: "userRandomID",
    },
  "9sm5xK":{
    longUrls: "http://www.google.com",
    userInDB: "userRandomID",
    },
};
// the pre-defined user registeration object

const User1passwordToHash = "nima"; // you will probably this from req.params
const User2passwordToHash = "dishwasher-funk"; // you will probably this from req.params
const User1hashed_password = bcrypt.hashSync(User1passwordToHash, 10);
const User2hashed_password = bcrypt.hashSync(User2passwordToHash, 10);


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: User1hashed_password,
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: User2hashed_password,
  },
}
//----------------------------
function generateRandomString() {
  return Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
}

function cookieFindsUser(cookies) {
  let cookiesID = cookies;
  return cookiesID;
}

function compareuseremailtoDB(xemail,xpassword) {
  for (eachuser in users) {
    if(users[eachuser].email === xemail) {
        if(bcrypt.compareSync(xpassword,users[eachuser].password)) {
          return users[eachuser].id;
        }
      }
  }
}

var random = generateRandomString();
var shortUrl = "www.linkShortening.com";

// Home page
app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// view one
app.get("/urls", (req, res) => {

  let newcookie = req.session.user_id;

  let cookiefound = cookieFindsUser(newcookie);

  let userfound = users[cookiefound];
  let templateVars = {
    urls: urlDatabase,
    link: shortUrl,
    user_id: userfound,
  };
  if(templateVars["user_id"]) {
    res.render("urls_index", templateVars);
  } else {
      res.status(401).send('<a href="/login">You have to Login!</a>' );
    }
});

// view two
app.get("/urls/new", (req, res) => {

  let cookiefound = cookieFindsUser(req.session.user_id);
  let userfound = users[cookiefound];
  let templateVars = {
      shortURL: req.params.id,
      database: urlDatabase,
      user_id: userfound,
    };
  if(templateVars["user_id"]) {
    res.status(200);
    res.render("urls_new",templateVars);
  } else {
      res.status(401).send('<a href="/login">You have to Login!</a>' );
   }
});

// view three
app.get("/urls/:id", (req, res) => {
//---> req.cookies
  let cookiefound = cookieFindsUser(req.session.user_id);
  let userfound = users[cookiefound];
  console.log(urlDatabase[req.params.id])
  if(req.session.user_id) {
    if(urlDatabase[req.params.id]) {
      let templateVars = {
        shortURL: req.params.id,
        user_id: userfound,
      };
      res.render("urls_show", templateVars);
    } else {
        res.status(404).send('Something broke!')
      }
  } else {
    res.status(401).send('<a href="/login">You have to Login!</a>' );
  }
});

// post all the  links
app.post("/urls", (req, res) => {
  if(req.session.user_id) {
    let LongRec = req.body.longURL
    if(!(LongRec.substring(0, 7) == 'http://')) {
      LongRec = "http://"+LongRec
    }
    urlDatabase[generateRandomString()]= { longUrls: LongRec, userInDB:req.session.user_id,};
    res.status(200);
    res.redirect("/urls");
    } else {
      res.status(401).send('<a href="/login">You have to Login!</a>' );
      }
});
//--------------- DAy 2 -------------------

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longUrls;
    res.redirect(longURL);
  } else {
      res.status(404).send('does not exist')
    }
});

app.post("/urls/:id/delete", (req, res) => {
  if(urlDatabase[req.params.id].userInDB === req.session.user_id) {

    delete urlDatabase[req.params.id];
  } else {
      res.status(403).send('!Access denied!')
    }
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  if(req.session.user_id) {
    var LongRec = req.body.newlongURL
    if(urlDatabase[req.params.id].userInDB === req.session.user_id) {
      urlDatabase[req.params.id].longUrls = req.body.newlongURL ;
      res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
    } else {
      res.status(403).send('!Access denied!')
    }
  } else {
    res.status(401).send('<a href="/login">You have to Login!</a>' );
    }
});
//----------- Login/logout -------------------------


app.get("/login", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.status(200);
    res.render("user_login");
  }
});


app.post("/login", (req, res) => {

  var loginEmail = req.body.email;
  let  loginPass = req.body.password;
  let theRequiredUSer = compareuseremailtoDB(loginEmail,loginPass)
    if(!(theRequiredUSer)){
      return res.status(401).send(' Email or password is not found!')
    } else {
       req.session.user_id = theRequiredUSer;

       res.status(200);
      }
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  req.session.user_id = null
  res.redirect("/urls");

});
//--------------- DAy 3 -------------------

//----------- Register -------------------------

app.get("/register", (req, res) => {

  if(req.session.user_id) {
      res.redirect("/urls");
  } else{
      let templateVars = {
      urls: urlDatabase,
      link: shortUrl,
      user_id: req.session.user_id,
    };
    res.render("user_register", templateVars);
  }
});
// user email and password is received and if not empty they are added to the DB
app.post("/register", (req, res) => {
// make sure user does not enter blank!
  if(req.body.email && req.body.password) {
    for (echUser in users) {
      if(users[echUser].email === req.body.email) {
        return res.status(400).send('Email is already in use !')
      }
    }

    var GeneratedID = generateRandomString()

// Define Hashed pass ------

    const passwordToHash = req.body.password; // you will probably this from req.params
    const hashed_password = bcrypt.hashSync(passwordToHash, 10);

//---------------------------
    let newRegisterObject = {
      id: GeneratedID,
      email: req.body.email,
      password: hashed_password,
      };
// add the new object to DB and set cookie and redirect
    users[GeneratedID]= newRegisterObject
    req.session.user_id = GeneratedID
    res.redirect("/urls");
  } else {
      res.status(400).send('Something broke! check if Email or password is entered')
    }
});


//########################  end routs and listen ############################


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});