const express = require('express');
const router = express.Router();
const Campground = require('../models/campground'),
    Comment = require("../models/comment");

//index route - show all campgrounds
router.get("/", function (req, res) {

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

//create route
router.post("/", function (req, res) {

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

//new route
router.get("/new", function (req, res) {
    res.render("campgrounds/new");
});

//show route
router.get("/:id", function (req, res) {

    //encontrar o campground com o ID
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {            
            res.render("campgrounds/show", {
                campground: foundCampground
            });
        }
    });
});

module.exports = router;