const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes (you'll add these as you build)
app.use('/api/species', require('./routes/species'));
app.use('/api/ocean', require('./routes/oceanData'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/auth', require('./routes/auth'));

app.listen(5000, () => console.log('Server running on port 5000'));
