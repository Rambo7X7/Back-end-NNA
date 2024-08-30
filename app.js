const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs/promises");
const { getTopics } = require("./db/controllers/topics.controller");
const { getArticleById } = require("./db/controllers/articles.controller");

app.use(express.json());

// Route to get topics
app.get("/api/topics", getTopics);

// Route to get an article by ID
// app.get("/api/articles/:article_id", getArticleById);

// Route to get API documentation
app.get("/api", (req, res, next) => {
  const filePath = path.join(__dirname, "endpoints.json");

  fs.readFile(filePath, "utf-8")
    .then((data) => {
      const endpoints = JSON.parse(data);
      res.status(200).json(endpoints);
    })
    .catch((err) => {
      console.error("Error reading endpoints file:", err);
      next(err);
    });
});

// Catch-all for undefined routes
app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.error("Internal Server Error:", err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
