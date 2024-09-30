import request from "supertest";
import { application } from "..";
import { App } from "../app";

// describe("GET /api/favourites", () => {
//   it("should return favourites filtered by area_name", async () => {
//     const areaName = "some_area_name"; // Mock area_name value
//
//     const response = await request(application.getApp())
//       .get("/api/favourites")
//       // .query({ area_name: areaName }) // Simulates req.query.area_name
//       .expect("Content-Type", /json/)
//       .expect(200);
//
//     // Check if the response body is an array
//     expect(response.body).toBeInstanceOf(Array);
//
//     // Further assertions based on your application's logic
//   });
// });

let app = application.getApp();

beforeAll(async () => {
  const appInstance = new App();
  await appInstance.start(); // Initialize the app
  app = appInstance.getApp(); // Get the app instance
});

afterAll(async () => {
  // Optionally close the server or database connection
});

describe('GET /api/favourites', () => {
  it('should return favourites filtered by area_name', async () => {
    const areaName = 'some_area_name';

    const response = await request(app)
      .get('/api/favourites')
      .query({ area_name: areaName })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });
});
