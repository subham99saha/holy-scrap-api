const express = require('express');
const router = express.Router();
const services = require('./services');

router.post('/', async (req, res) => {
  const response = await services.scrape(req);
  res.status(200).json(response);
});

module.exports = router