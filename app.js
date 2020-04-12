const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  Campground = require("./models/campground"),
  Comment = require("./models/comment"),
  User = require('./models/user'),
  seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

//passport configuration
app.use(require('express-session')({
  secret: "o melhor segredo que eu pude pensar",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

  console.log('conectado ao banco');
  //console.log(Campground);

  //preencher o banco
  //seedDB();

  app.get("/", function (req, res) {
    res.render("landing");
  });

  app.get("/campgrounds", function (req, res) {

    Campground.find({}, function (err, Allcampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campgrounds: Allcampgrounds
        });
      }
    });
  });

  app.post("/campgrounds", function (req, res) {

    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;

    const newCampground = {
      name: name,
      image: image,
      description: description
    };

    Campground.create(newCampground, function (err, newlyCreated) {
      if (err) {
        console.log(err)
      } else {
        Comment.create({
          text: "This place is great, but I wish there was internet",
          author: "Israel"
        }, function (err, comment) {
          if (err) {
            console.log(err);
          } else {
            newlyCreated.comments.push(comment);
            newlyCreated.save();
            res.redirect("/campgrounds");
          }
        });
      }
    });
  });

  app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new");
  });

  //SHOW
  app.get("/campgrounds/:id", function (req, res) {

    //encontrar o campground com o ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        //console.log(foundCampground);
        res.render("campgrounds/show", {
          campground: foundCampground
        });
      }

    });

  });


  //=============
  //COMMENTS
  //=============

  app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
      if (err) {
        console.log(err);
      } else {
        res.render("comments/new", {
          campground: campground
        });
      }
    });
  });

  app.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {

    Campground.findById(req.params.id, function (err, campground) {
      if (err) {
        console.log(err);
        res.redirect("/campgrounds");
      } else {
        Comment.create(req.body.comment, function (err, comment) {
          if (err) {
            console.log(err);
          } else {
            campground.comments.push(comment);
            campground.save();
            res.redirect("/campgrounds/" + campground._id);
          }
        })
      }
    })

  });

  // ===============
  // AUTH ROUTES
  // ===============

  // show register form
  app.get('/register', (req, res) => {
    res.render("campgrounds/register");
  });

  // handle sign up logic
  app.post('/register', (req, res) => {
    const newUser = new User({
      username: req.body.username
    });
    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        res.render("campgrounds/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/campgrounds");
        })
      }
    })
  });

  // show login form
  app.get('/login', (req, res) => {
    res.render("campgrounds/login");
  });

  // handle login logic
  app.post('/login', passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }), (req, res) => {
  });

  //logout
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/campgrounds");
  });

  function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
  }

  app.listen(3000, function () {
    console.log("YelpCamp server Online, porta 3000");
  });

});