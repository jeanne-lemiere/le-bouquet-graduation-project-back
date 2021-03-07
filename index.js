const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer'); // pour pouvoir recevoir des données dans le serveur API à partir d'un utilisateur extérieur
const upload = multer();
const express = require('express');
const router = require('./app/router');

const cors = require('cors');

const PORT = process.env.PORT || 5050;
const app = express();

// J'utilise le middleware
app.use(express.static('public'));


//app.use(cors());

// cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');

  // response to preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
});

app.use(upload.array());
app.use((req, res, next) => {
  console.log('Server received ', req.body);
  next();
});
app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT} ...`);
});
