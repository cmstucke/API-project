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
  const groups = await Group.findAll({
    where: { organizerId: req.user.id }
  });
  const memberships = await Group.findAll({
    include: [{
      model: User,
      where: { id: req.user.id }
    }]
  });
  const allGroups = groups.concat(memberships);
  // const member = [];
  // for (const memberOf of members) {
  //   memberships.push(memberOf.Group)
  // }
  // const groups = [...organizer, ...member]
  return res.json({ 'Groups': allGroups });
});

router.get('/:groupId', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);
  return res.json(group);
});

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll();
  return res.json({ "Groups": groups });
});

module.exports = router;
