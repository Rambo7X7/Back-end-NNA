const db = require("../db/connection");

exports.selectArticles = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((data) => {
      return data.rows[0];
    });
};

exports.selectAllArticles = () => {
  return db
    .query(
      "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY created_at DESC"
    )
    .then((data) => {
      return data.rows;
    });
};

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      "SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
      [article_id]
    )
    .then((data) => {
      return data.rows;
    });
};

exports.insertNewCommentOnArticle = (author, body, article_id) => {
  return db
    .query(
      "INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *",
      [body, author, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
exports.updateArticleById = (inc_votes, article_id) => {
  const queryStr = `
    UPDATE articles 
    SET votes = votes + $1 
    WHERE article_id = $2 
    RETURNING *;
  `;

  return db.query(queryStr, [inc_votes, article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "article does not exist" });
    }
    return rows[0];
  });
};
