const express = require('express');
const router = express.Router();
const { addbanner } = require('../controllers/BannerController');
router.get('/addbanner', addbanner);
router.post('/addbanner', addbanner);

module.exports = router;
