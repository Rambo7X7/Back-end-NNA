const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/healthcheck", () => {
  test("it should respond with a 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
});

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
  it("should respond with a JSON object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const endpoints = response.body;
        expect(endpoints).toHaveProperty("GET /api");
        expect(endpoints["GET /api"]).toEqual({
          description:
            "serves up a json representation of all the available endpoints of the api",
        });
        expect(endpoints).toHaveProperty("GET /api/topics");
        expect(endpoints["GET /api/topics"]).toEqual({
          description: "serves an array of all topics",
          queries: [],
          exampleResponse: {
            topics: [
              {
                slug: "football",
                description: "Footie!",
              },
            ],
          },
        });
        expect(endpoints).toHaveProperty("GET /api/articles/:article_id");
        expect(endpoints["GET /api/articles/:article_id"]).toEqual({
          description: "gets an article by its id",
          params: {
            article_id: "the ID of the article to retrieve",
          },
          exampleResponse: {
            article_id: expect.any(Number),
            article_img_url: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            votes: expect.any(Number),
          },
        });
      });
  });
});

// describe("GET /api/articles/:article_id", () => {
//   jest.setTimeout(30000);
//   test("should return a valid article object for a known article ID", () => {
//     return request(app)
//       .get("/api/articles/1")
//       .expect(200)
//       .then(({ body }) => {
//         console.log(body, "Body <<<");
//         expect(body).toEqual(
//           expect.objectContaining({
//             article_id: 1,
//             author: expect.any(String),
//             title: expect.any(String),
//             body: expect.any(String),
//             topic: expect.any(String),
//             created_at: expect.any(String),
//             votes: expect.any(Number),
//             article_img_url: expect.any(String),
//           })
//         );
//       });
//   });
// });
