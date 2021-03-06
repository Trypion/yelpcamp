const express = require('express');
const router = express.Router();
const Campground = require('../models/campground'),
    Comment = require("../models/comment"),
    middleware = require('../middleware');

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
router.post("/", middleware.isLoggedIn, function (req, res) {

    const name = req.body.name;
    const image = req.body.image;
    const description = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    }

    const newCampground = {
        name: name,
        image: image,
        description: description,
        author: author
    };

    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//new route
router.get("/new", middleware.isLoggedIn, function (req, res) {
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


//edit campground route
router.get("/:id/edit", middleware.checkCrampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {

        res.render("campgrounds/edit", {
            campground: foundCampground
        });

    });
});

//update campground route
router.put("/:id", middleware.checkCrampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updateCampground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//destroy campground route
router.delete("/:id", middleware.checkCrampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;