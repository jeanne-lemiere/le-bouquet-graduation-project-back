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

app.use(cors());
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
