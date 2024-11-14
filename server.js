require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Set Mongoose strictQuery option to prepare for Mongoose 7
mongoose.set('strictQuery', false);  // This should suppress the warning

// Connect to MongoDB using environment variable
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Define a schema for the data
const dataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a model
const Data = mongoose.model('Data', dataSchema);

// GET endpoint to test if the server is running
app.get('/', (req, res) => {
  res.send('Server is running and accessible');
});

// Endpoint to receive data from ESP32
app.post('/data', async (req, res) => {
  try {
    const { temperature, humidity, soilMoisture } = req.body;

    if (temperature == null || humidity == null || soilMoisture == null) {
      return res.status(400).send('Invalid data');
    }

    const data = new Data({ temperature, humidity, soilMoisture });
    await data.save();
    res.status(201).send('Data saved successfully');
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// Start the server on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
