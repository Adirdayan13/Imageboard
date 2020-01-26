const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");
const multer = require("multer");

exports.getImages = function() {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 10`);
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

exports.selectImage = function(id) {
    return db
        .query(
            `SELECT *,
        (SELECT min(id) FROM images WHERE id>$1) AS "nextID",
        (SELECT max(id) FROM images WHERE id<$1) AS "previousID"
        FROM images
        WHERE id=$1`,
            [id]
        )
        .then(({ rows }) => rows);
};

exports.getNextImages = function(id) {
    return db.query(
        `SELECT *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1)
        AS "lowestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10;`,
        [id]
    );
};

exports.addComment = function(imageId, username, comment) {
    return db.query(
        `INSERT INTO comments (image_id, username, comment)
    VALUES ($1, $2, $3) RETURNING *`,
        [imageId, username, comment]
    );
};

exports.getComment = function(imageId) {
    return db.query(
        `SELECT * FROM comments WHERE image_id = $1 ORDER BY id DESC`,
        [imageId]
    );
};

exports.addCommentOfComment = function(comment_id, username, comment) {
    return db.query(
        `INSERT INTO commentsofcomments (comment_id, username, comment) VALUES ($1, $2, $3) RETURNING *`,
        [comment_id, username, comment]
    );
};

exports.getCommentsOfComment = function(comment_id) {
    return db
        .query(
            `
        SELECT * FROM commentsofcomments WHERE comment_id = $1`,
            [comment_id]
        )
        .then(({ rows }) => rows);
};

exports.deleteImage = function(id) {
    return db
        .query(`DELETE FROM images WHERE id = $1`, [id])
        .then(({ rows }) => rows);
};

exports.deleteComments = function(imageId) {
    return db
        .query(`DELETE FROM comments WHERE image_id = $1`, [imageId])
        .then(({ rows }) => rows);
};
