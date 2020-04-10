const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require('mongoose'),
  seedDB = require("./seeds"),
  Campground = require("./models/campground"),
  Comment = require("./models/comment");

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

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

  app.get("/campgrounds/:id/comments/new", function (req, res) {
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

  app.post("/campgrounds/:id/comments", function (req, res) {

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

  app.listen(3000, function () {
    console.log("YelpCamp server Online, porta 3000");
  });

});