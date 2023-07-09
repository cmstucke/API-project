const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group } = require('../../db/models');

const router = express.Router();

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll();
  return res.json({ "Groups": groups });
});

module.exports = router;
