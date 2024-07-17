const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const app = express();

// middleware
app.use(express.json());

const CAR_DATA_PATH = path.join(__dirname, "data", "cars.csv");

app.get("/users", (_, res) => {
  res.status(200).json({ username: "Jason" });
});

app.get("/cars", (_, res) => {
  const csvData = fs.readFileSync(CAR_DATA_PATH, "utf8");
  const rows = csvData.split("\n");

  const cars = rows.slice(1).map((row) => {
    const [id, make, model, year] = row.split(",");
    return { id, make, model, year };
  });

  res.status(200).json({ cars });
});

app.post("/cars", (req, res) => {
  const { make, model, year } = req.body;

  const csvData = fs.readFileSync(CAR_DATA_PATH, "utf8");
  const rows = csvData.split("\n");

  rows.push(`${rows.length},${make},${model},${year}`);
  const newData = rows.join("\n");

  fs.writeFileSync(CAR_DATA_PATH, newData, "utf8");

  res.status(200).json({ message: `Car added: ${make} ${model} ${year}` });
});

app.put("/cars/:id", (req, res) => {
  const { id } = req.params;
  const { make, model, year } = req.body;

  const csvData = fs.readFileSync(CAR_DATA_PATH, "utf8");
  const rows = csvData.split("\n");

  const carIndex = rows.findIndex((row) => row.startsWith(id));
  if (carIndex === -1) {
    return res.status(404).json({ message: "Car not found" });
  }

  const [carId, carMake, carModel, carYear] = rows[carIndex].split(",");
  const newCarData = {
    id: carId,
    make: make || carMake,
    model: model || carModel,
    year: year || carYear,
  };

  const updatedCar = `${newCarData.id},${newCarData.make},${newCarData.model},${newCarData.year}`;
  rows[carIndex] = updatedCar;

  const newData = rows.join("\n");
  fs.writeFileSync(CAR_DATA_PATH, newData, "utf8");

  res.status(200).json({ car: newCarData });
});

module.exports = app;
