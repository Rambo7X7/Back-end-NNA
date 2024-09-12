const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs/promises");
const { getTopics } = require("./db/controllers/topics.controller");
const { getEndpoints } = require("./db/controllers/endpoints.controllers");
const { getArticleById } = require("./db/controllers/articles.controller");
const { getAllArticles } = require("./db/controllers/articles.controller");
const { getArticleComments } = require("./db/controllers/articles.controller");

//----------------------------------------------------

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

//----------------------------------------------------

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
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
