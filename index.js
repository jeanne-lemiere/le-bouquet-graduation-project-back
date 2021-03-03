const dotenv = require('dotenv');
dotenv.config();
const multer = require('multer');
const upload = multer();
const express = require('express');
const router = require('./app/router');
// Je require le middleware pour dire à express
// d'être plus permissif sur l'origine des requêtes
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
