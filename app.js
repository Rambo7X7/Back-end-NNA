const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs/promises");
const cors = require("cors");

const { getTopics } = require("./controllers/topics.controller");
const { getEndpoints } = require("./controllers/endpoints.controllers");
const { getArticleById } = require("./controllers/articles.controller");
const { getAllArticles } = require("./controllers/articles.controller");
const { getArticleComments } = require("./controllers/articles.controller");
const { postCommentOnArticle } = require("./controllers/articles.controller");
const { patchArticleById } = require("./controllers/articles.controller");

//----------------------------------------------------

app.use(express.json());

app.use(cors());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postCommentOnArticle);

app.patch("/api/articles/:article_id", patchArticleById);

//----------------------------------------------------

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "does not exist" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.error("Internal Server Error:", err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
