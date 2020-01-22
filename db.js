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

exports.getImage = function(id) {
    return db.query(`SELECT * FROM images WHERE id = $1`, [id]);
};

exports.addComment = function(imageId, username, comment) {
    return db.query(
        `INSERT INTO comments (image_id, username, comment)
    VALUES ($1, $2, $3) RETURNING *`,
        [imageId, username, comment]
    );
};

exports.getComment = function(imageId) {
    return db.query(`SELECT * FROM comments WHERE image_id = $1`, [imageId]);
};
