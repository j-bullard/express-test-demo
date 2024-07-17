const request = require("supertest");
const app = require("../app");
const fs = require("node:fs");

describe("GET /users", () => {
  test("should return a JSON object with a username", (done) => {
    request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(200, { username: "Jason" })
      .end((err) => {
        if (err) throw err;
        done();
      });
  });
});

describe("GET /cars", () => {
  beforeEach(() => {
    jest.resetModules();
    fs.readFileSync = jest
      .fn()
      .mockReturnValue(
        "id,make,model,year\n1,Ford,Fusion,2019\n2,Honda,Accord,2018",
      );
  });

  test("should return a JSON object with an array of cars", (done) => {
    request(app)
      .get("/cars")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.cars.length).toBe(2);

        res.body.cars.forEach((car) => {
          expect(car).toHaveProperty("id");
          expect(car).toHaveProperty("make");
          expect(car).toHaveProperty("model");
          expect(car).toHaveProperty("year");
        });
      })
      .end((err) => {
        if (err) throw err;
        done();
      });
  });
});

describe("POST /cars", () => {
  beforeEach(() => {
    jest.resetModules();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest
      .fn()
      .mockReturnValue(
        "id,make,model,year\n1,Ford,Fusion,2019\n2,Honda,Accord,2018",
      );
  });

  test("should return a message with the car that was added", (done) => {
    request(app)
      .post("/cars")
      .send({ make: "Toyota", model: "Corolla", year: "2005" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, { message: "Car added: Toyota Corolla 2005" })
      .expect(() => {
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      })
      .end((err) => {
        if (err) throw err;
        done();
      });
  });
});

describe("PUT /cars/:id", (done) => {
  beforeEach(() => {
    jest.resetModules();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest
      .fn()
      .mockReturnValue(
        "id,make,model,year\n1,Ford,Fusion,2019\n2,Honda,Accord,2018",
      );
  });

  test("should return the newly update car", (done) => {
    request(app)
      .put("/cars/1")
      .send({ make: "Toyota", model: "Corolla" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, {
        car: { id: "1", make: "Toyota", model: "Corolla", year: "2019" },
      })
      .expect(() => {
        expect(fs.readFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      })
      .end((err) => {
        if (err) throw err;
        done();
      });
  });
});
