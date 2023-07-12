const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, User, Membership } = require('../../db/models');

const router = express.Router();

// Get all Groups joined or organized by the Current User
router.get('/current', requireAuth, async (req, res) => {
  const organizer = await Group.findAll({ where: { organizerId: req.user.id } });
  const memberships = await Membership.findAll({ include: { model: Group } });
  const member = [];
  for (const memberOf of memberships) { member.push(memberOf.Group) };
  const groups = organizer.concat(member);
  return res.json({ "Groups": groups });
});

// Get details of a Group from an id
router.get('/:groupId', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  }
  return res.json(group);
});

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll();
  return res.json({ "Groups": groups });
});

module.exports = router;
