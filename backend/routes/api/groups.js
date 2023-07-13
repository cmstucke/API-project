const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage } = require('../../db/models');

const router = express.Router();

const validateGroup = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check('about')
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  // check('type')
  //   .equals(['Online', 'In person'])
  //   .withMessage("Type must be 'Online' or 'In person'"),
  check('private')
    .exists({ checkFalsy: true })
    .isBoolean()
    .withMessage("Private must be a boolean"),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage("State is required"),
  handleValidationErrors
];

const validateImg = async (groupId) => {

};

// Get all Groups joined or organized by the Current User
router.get('/current', requireAuth, async (req, res) => {
  const organizer = await Group.findAll({
    where: { organizerId: req.user.id }
  });
  const memberships = await Membership.findAll({
    where: { userId: req.user.id },
    include: { model: Group }
  });
  const member = [];
  for (const memberOf of memberships) {
    member.push(memberOf.Group)
  };
  const groups = organizer.concat(member);
  return res.json({ "Groups": groups });
});

// Add an Image to a Group based on the Group's id
router.post('/:groupId/images', requireAuth, async (req, res) => {
  const { url, preview } = req.body;
  const groupId = req.params.groupId;

  const group = await Group.findByPk(groupId)
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  const img = await GroupImage.create({ groupId, url, preview });

  const safeImg = {
    id: img.id,
    url: img.url,
    preview: img.preview
  };

  return res.json(safeImg);
});

// Create a Group
router.post('/', requireAuth, validateGroup, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;
  const organizerId = req.user.id
  const group = await Group.create({ organizerId, name, about, type, private, city, state });

  const safeGroup = {
    id: group.id,
    organizerId: group.organizerId,
    name: group.name,
    about: group.about,
    type: group.type,
    private: group.private,
    city: group.city,
    state: group.state,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };

  return res.json(safeGroup);
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
  const groups = await Group.findAll({ include: { model: GroupImage } });
  return res.json({ "Groups": groups });
});

module.exports = router;
