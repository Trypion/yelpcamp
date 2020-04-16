const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require('mongoose'),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  methodOverride = require('method-override'),  
  User = require('./models/user'),
  seedDB = require("./seeds");

const campgroundRoutes = require('./routes/campgrounds'),
  commentRoutes = require('./routes/comments'),
  indexRoutes = require('./routes/index');

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

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

app.use(flash());
app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

  console.log('conectado ao banco');
  
  //preencher o banco
  //seedDB();

  app.use("/campgrounds", campgroundRoutes);
  app.use("/campgrounds/:id/comments", commentRoutes);
  app.use("/", indexRoutes);

  app.listen(3000, function () {
    console.log("YelpCamp server Online, porta 3000");
  });

});