const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");
const data = require("../db/data/test-data/index");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toBeInstanceOf(Array);
        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });

  test("404: responds with a 404 for an invalid endpoint", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("GET /api", () => {
  test("200: Responds with a list of possible endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with requested article by ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("article_id", 1);
        expect(body.article).toHaveProperty(
          "title",
          "Living in the shadow of a great man"
        );
        expect(body.article).toHaveProperty("votes", 100);
      });
  });

  test("400: Responds with error when given invalid article_id endpoint", () => {
    return request(app)
      .get("/api/articles/ABCD")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an articles array of article objects containing info and comment count in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body));
        response.body.forEach((article) => {
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("comment_count", expect.any(Number));
        });
      });
  });

  test("200: Check there isn't a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        response.body.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the given article ID", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            })
          );
        });
      });
  });

  test("404: Responds with 404 when article_id is valid but article does not exist", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("400: Responds with 400 when article_id is invalid", () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("POST:201 inserts a new comment to the comments table and sends the new comment back to the client", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I like this article",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment.comment_id).toBe(19);
        expect(body.comment).toMatchObject({
          body: "I like this article",
          article_id: 2,
          author: "butter_bridge",
          votes: 0,
        });
      });
  });
  test("POST:404 responds with an appropriate status and error message when provided with non-existent username", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "banana",
        body: "I like this article",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("does not exist");
      });
  });
  test("POST:404 responds with an appropriate status and error message when provided with a bad comment (no user name)", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        body: "I like this article",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("POST:404 responds with an appropriate status and error message when given a valid but non-existent article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I like this article",
    };
    return request(app)
      .post("/api/articles/888/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("does not exist");
      });
  });
  test("POST:400 sends an appropriate status and error message when given an invalid article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "I like this article",
    };
    return request(app)
      .post("/api/articles/myId/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
