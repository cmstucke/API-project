const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership } = require('../../db/models');

const router = express.Router();

// Get details of a Group from an id
router.get('/current', requireAuth, async (req, res) => {
  // console.log(req.user.id)
  const organizer = await Group.findAll({ where: { organizerId: req.user.id } });
  const members = await Membership.findAll({ include: { model: Group } });
  const memberships = [];
  for (const member of members) {
    memberships.push(member.Group)
  }
  const groups = [...organizer, ...memberships]
  return res.json(groups);
});

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll();
  return res.json({ "Groups": groups });
});

module.exports = router;
