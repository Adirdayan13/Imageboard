const express = require("express");
const app = express();
const db = require("./db");

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

app.get("/images", (req, res) => {
    // res.json([
    //     { name: "maltesers" },
    //     { name: "happy cherries" },
    //     { name: "milka" }
    // ]);
    // console.log("res: ", res);
    db.getImages().then(function(results) {
        res.json(results.rows);
    });
});

app.listen(8080, () => console.log(`808(0) listening.`));
