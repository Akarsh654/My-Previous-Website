//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const request = require("request");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const multer = require('multer');
const path = require('path');
const formidable = require('formidable');
const favicon = require('serve-favicon');
const GeoJSON = require('mongoose-geojson-schema');
require('mongoose-type-url');

const upload = multer({ dest: 'compose/' });
const type = upload.single('postFile');

const homeStartingContent = "Hey there! ";
const aboutContent = "I am currently pursuing BSc in Computing Science at University of Alberta. I find joy in Web Design and I have a deep interest in Machine Learning, Data Science and Artificial Intelligence. Most of my work is open source and I enjoy working on projects and hackathons. ";
const contactContent = 'As Bill Gates once said "The best way to prepare [to be a programmer] is to write programs, and to study great programs that other people have written". So if you are interested to learn more about my projects, collaborate with me or to discuss your own projects feel free to leave your email and I will get in touch.'
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(favicon(__dirname + '/public/images/favicon.ico'));

mongoose.connect("mongodb+srv://akrash:mypassword@blog.ng7co.mongodb.net/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

const postSchema = {
    title: String,
    content: String,
    url: String,
    simpleurl: String,
    giturl: String
};

const Post = mongoose.model("Post", postSchema);


app.get("/", function(req, res) {
    Post.find({}, function(err, posts) {
        res.render("home", {
            startingContent: homeStartingContent,
            posts: posts
        });
    });
});

app.get("/about", function(req, res) {
    res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function(req, res) {
    res.render("contact", { contactContent: contactContent });
});

app.get("/compose", function(req, res) {
    res.render("compose");
});

app.post("/compose", type, function(req, res) {

    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody,
        url: req.body.postURL,
        giturl: req.body.gitURL,
        simpleurl: req.body.simpleURL
    });

    post.save(function(err) {

        if (!err) {
            res.redirect("/");
        }

    });

});

app.get("/posts/:postId", function(req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({ _id: requestedPostId }, function(err, post) {
        res.render("post", {
            title: post.title,
            content: post.content,
            url: post.url,
            giturl: post.giturl,
            simpleurl: post.simpleurl,

        });

    });

});


app.post("/", function(req, res) {
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
            }
        }]
    }
    const jsonData = JSON.stringify(data);
    const myurl = 'https://us10.api.mailchimp.com/3.0/lists/6446b8dfdd';
    const options = {
        method: "POST",
        auth: "Akrash:9afa0c87811090a361da82f91e7ce644-us10"
    };
    const request = https.request(myurl, options, function(response) {

        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        response.on("data", function(data) {
            console.log(JSON.parse(data));
        })
    })

    request.write(jsonData);

    request.end();
});

app.post("/failure", function(req, res) {
    res.redirect("/");
});
app.post("/success", function(req, res) {
    res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}



app.listen(port, function() {
    console.log("Server started");
});