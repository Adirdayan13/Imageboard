const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config");

app.use(express.static("./public"));

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

//////// BOILERPLATE mode for image upload //////
/////// DO NOT TOUCH //////
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    // give unique name to each image - random 24 char name
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
/////////// DO NOT TOUCH ///////////

app.use(express.json());

app.get("/nextImages/:id", function(req, res) {
    let imageId = req.params.id;
    db.getNextImages(imageId)
        .then(function(results) {
            console.log("results from GET nextImages: ", results.rows);
            res.json(results.rows);
        })
        .catch(function(err) {
            console.log("error from GET nextImages: ", err);
        });
});

app.get("/images", function(req, res) {
    db.getImages()
        .then(function(results) {
            res.json(results.rows);
        })
        .catch(err => {
            console.log("error in GET /images :", err);
        });
});

app.get("/comment/:id", function(req, res) {
    console.log("GET comment");
    console.log("req.params.id: ", req.params.id);
    let imageId = req.params.id;
    db.getComment(imageId)
        .then(function(results) {
            console.log("results from GET comment: ", results.rows);
            console.log("req from GET comment: ", req.body);
            // res.json(req.body.username, req.body.comment);
            res.json(results.rows);
        })
        .catch(function(err) {
            console.log("error from GET comment: ", err);
        });
});

app.post("/comment", function(req, res) {
    let userId = req.body.id;
    let username = req.body.username;
    let comment = req.body.comment;
    console.log("POST comment");
    console.log("req.body: ", req.body);
    db.addComment(userId, username, comment)
        .then(function(results) {
            console.log(
                "results from addComment POST /comment: ",
                results.rows[0]
            );
            res.json(results.rows[0]);
        })
        .catch(function(err) {
            console.log("error in addComment POST /comment: ", err);
        });
});

app.get("/delete/:id", function(req, res) {
    console.log("will be delete: ", req.params.id);
    Promise.all([
        db.deleteImage(req.params.id),
        db.deleteComments(req.params.id)
    ]).then(data => {
        console.log("results from delete = ", data);
        res.json(data);
    });
});

app.get("/selectedimage/:id", function(req, res) {
    console.log("req.body: ", req.params.id);
    // console.log("GET selectedimage");
    db.getImage(req.params.id)
        .then(function(results) {
            console.log("results from /selectedimage: ", results.rows[0]);
            res.json(results.rows[0]);
        })
        .catch(err => {
            console.log("error in getImage GET /selectedimage/:id", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("file :", req.file);
    console.log("input: ", req.body);
    let username = req.body.username;
    let description = req.body.description;
    let title = req.body.title;
    //insert a new row into the db for the images
    const imageUrl = s3Url + req.file.filename;
    if (req.file) {
        db.addImage(imageUrl, username, title, description)
            .then(function(results) {
                res.json(results.rows[0]);
                console.log("results from POST /upload: ", results.rows[0]);
            })
            .catch(function(err) {
                console.log("error from POST upload :", err);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(500);
        false;
    }
});

app.listen(8080, () => console.log(`808(0) listening.`));
