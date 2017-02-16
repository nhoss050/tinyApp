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
  },
  "Nima": {
    id: "Nima",
    email: "nhoss050@uottawa.ca",
    password: "12",
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
          if(bcrypt.compareSync(xpassword,users[eachuser].password)) {
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
  if(templateVars["user_id"]) {
  //console.log("user id in the moment is : ",templateVars["user_id"]);
  res.render("urls_index", templateVars);
}
else {
res.redirect("/login");
}


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
// post all the  links
app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);
  let LongRec = req.body.longURL
  if(!(LongRec.substring(0, 7) == 'http://')){
    LongRec = "http://"+LongRec
  }
  //console.log(LongRec)
  //before changes
 // console.log("user entered the address:",LongRec);
  //after changes
  urlDatabase[generateRandomString()]= { longUrls: LongRec, userInDB:req.cookies["user_id"],};

  // console.log("updated data base is",urlDatabase);
  res.redirect("/urls");
         // Respond with 'Ok' (we will replace this)
});
//--------------- DAy 2 -------------------

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL].longUrls;
     //console.log("long url is :",longURL);
  res.redirect(longURL);

});

app.post("/urls/:id/delete", (req, res) => {

//console.log("req.cookie",req.cookies.user_id)
//console.log("req.cookie is equal to?",urlDatabase[req.params.id].userInDB)

  if(urlDatabase[req.params.id].userInDB === req.cookies.user_id) {
    console.log("right user is deleting");
    delete urlDatabase[req.params.id];
  } else {
    res.status(403).send('!Access denied!')
  }

  res.redirect("/urls");
         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
 // console.log(req.params.id);
  //console.log(req.body.newlongURL);
  var LongRec = req.body.newlongURL
    if(urlDatabase[req.params.id].userInDB === req.cookies.user_id) {
      urlDatabase[req.params.id].longUrls = req.body.newlongURL ;
      res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
    } else {
    res.status(403).send('!Access denied!')
    }

});

app.get("/login", (req, res) => {

    res.render("user_login");
  });

//----------- Login/logout -------------------------

app.post("/login", (req, res) => {

    //console.log("login body is:",req.body.email);
    var loginEmail = req.body.email;
    let  loginPass = req.body.password;
    let theRequiredUSer = compareuseremailtoDB(loginEmail,loginPass)
    console.log("the user info is: ",users )
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

//----------- Register -------------------------

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

// Define Hashed pass ------

  const passwordToHash = req.body.password; // you will probably this from req.params
  const hashed_password = bcrypt.hashSync(passwordToHash, 10);
  console.log("actual password", passwordToHash);
  console.log("hashed password", hashed_password);

//---------------------------


    let newRegisterObject = {
      id: GeneratedID,
      email: req.body.email,
      password: hashed_password,
      }
// add the new object to DB and set cookie and redirect
    users[GeneratedID]= newRegisterObject
    //console.log("new object :", newRegisterObject);
    //console.log("updated DB :", users);
    res.cookie('user_id',GeneratedID);
    res.redirect("/urls");
  } else {
      res.status(400).send('Something broke!')
    }
});


//########################  end routs and listen ############################


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});