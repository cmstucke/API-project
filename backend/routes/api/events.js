const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Event, Group, Venue } = require('../../db/models');

const router = express.Router();

router.get('/', async (req, res) => {
  const events = await Event.findAll({ include: { model: Group } });
  return res.json(events);
});

module.exports = router;
