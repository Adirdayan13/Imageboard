const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");
const multer = require("multer");

exports.getImages = function() {
    return db.query(`SELECT * FROM images ORDER BY id DESC`);
};

exports.addImage = function(url, username, title, description) {
    return db.query(
        `INSERT INTO images (url, username, title, description)
    VALUES ($1, $2, $3, $4) RETURNING *`,
        [url, username, title, description]
    );
};
