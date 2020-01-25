DROP TABLE IF EXISTS commentsofcomments;

CREATE TABLE commentsofcomments(
    id SERIAL PRIMARY KEY,
    comment_id INT REFERENCES comments(id) NOT NULL,
    username VARCHAR(255),
    comment VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
