const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("./public"));

app.use(express.json());

app.get("/candy", (req, res) => {
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
