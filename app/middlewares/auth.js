const jwt = require('express-jwt');

const authorization = jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] });

module.exports = authorization;