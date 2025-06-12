const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { convertCurrency } = require('../controllers/currencyController');

router.get('/convert', auth, convertCurrency);

module.exports = router;
