const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

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

app.use(express.json());
app.use(express.static("./public"));

app.get("/nextImages/:id", function(req, res) {
    let imageId = req.params.id;
    db.getNextImages(imageId)
        .then(function(results) {
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

app.get("/selectImage/:id", function(req, res) {
    let id = req.params.id;
    db.selectImage(id)
        .then(function(results) {
            res.json(results);
        })
        .catch(err => {
            console.log("error in selectImage: ", err);
        });
});

app.get("/comment/:id", function(req, res) {
    let imageId = req.params.id;
    db.getComment(imageId)
        .then(function(results) {
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
    db.addComment(userId, username, comment)
        .then(function(results) {
            res.json(results.rows[0]);
        })
        .catch(function(err) {
            console.log("error in addComment POST /comment: ", err);
        });
});

app.post("/commentofcomment", function(req, res) {
    let comment_id = req.body.comment_id;
    let username = req.body.username;
    let comment = req.body.comment;
    db.addCommentOfComment(comment_id, username, comment)
        .then(function(results) {
            res.json(results);
        })
        .catch(function(err) {
            console.log("error from add comment of comment: ", err);
        });
});

app.get("/getCommentsOfComment/:id", function(req, res) {
    let comment_id = req.params.id;
    db.getCommentsOfComment(comment_id)
        .then(function(results) {
            res.json(results);
        })
        .catch(function(err) {
            console.log("error in get comments of comments: ", err);
        });
});

app.get("/delete/:id", function(req, res) {
    Promise.all([
        db.deleteImage(req.params.id),
        db.deleteComments(req.params.id)
    ]).then(data => {
        console.log("results from delete = ", data);
        res.json(data);
    });
});

app.get("/selectedimage/:id", function(req, res) {
    db.getImage(req.params.id)
        .then(function(results) {
            res.json(results.rows[0]);
        })
        .catch(err => {
            console.log("error in getImage GET /selectedimage/:id", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let username = req.body.username;
    let description = req.body.description;
    let title = req.body.title;
    const imageUrl = s3Url + "lol" + req.file.filename;
    if (req.file) {
        db.addImage(imageUrl, username, title, description)
            .then(function(results) {
                res.json(results.rows[0]);
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
