const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, GroupImage, Membership, Venue } = require('../../db/models');
const { ResultWithContextImpl } = require('express-validator/src/chain');

const router = express.Router();

/*
  VENUES
*/

// Check if member has co-host status without throwing type error
const coHost = async (group, user) => {
  const membership = await Membership.findOne({ where: { groupId: group, userId: user } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

// Create a new Venue for a Group specified by its id
router.post('/:groupId/venues', requireAuth, async (req, res, next) => {
  const groupId = req.params.groupId
  const group = await Group.findByPk(groupId);
  const isCoHost = await coHost(groupId, req.user.id)
  const { address, city, state, lat, lng } = req.body

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Handler
  if (group.organizerId === req.user.id || isCoHost) {
    const venue = await Venue.create({ groupId, address, city, state, lat, lng });

    const safeVenue = {
      id: venue.id,
      groupId: venue.groupId,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      lat: venue.lat,
      lng: venue.lng
    }

    return res.json(safeVenue);

  } else {
    const err = new Error("Unauthenticated user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "User must be organizer or co-host to the current group" });
  }
});

// Get All Venues for a Group specified by its id
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
  const group = await Group.findByPk(req.params.groupId);
  const isCoHost = await coHost(req.params.groupId, req.user.id)

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Handler
  if (group.organizerId === req.user.id || isCoHost) {
    const venues = await Venue.findAll({ where: { groupId: req.params.groupId } });
    return res.json({ "Venues": venues });
  } else {
    const err = new Error("Unauthenticated user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "User must be organizer or co-host to the current group" });
  }
});


/*
  EVENTS
*/

// Get all Events of a Group specified by its id
router.get('/:groupId/events', async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId)

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  const events = await Event.findAll({
    where: { groupId: groupId },
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "startDate",
      "endDate"
    ],
    include: [
      { model: Attendance },
      { model: EventImage },
      {
        model: Group,
        attributes: ['id', 'name', 'city', 'state']
      },
      {
        model: Venue,
        attributes: ['id', 'city', 'state']
      },
    ]
  });

  const eventsList = [];
  events.forEach(event => { eventsList.push(event.toJSON()) });

  eventsList.forEach(event => {
    event.numAttending = event.Attendances.length;
    delete event.Attendances;
    event.EventImages.forEach(img => {
      if (img.preview) event.previewImage = img.url;
    });
    if (!event.previewImage) event.previewImage = 'No preview image found';
    delete event.EventImages;
  });

  return res.json({ Events: eventsList });
});

// Create an Event for a Group specified by its id
router.post('/:groupId/events', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  const isCoHost = await coHost(group.id, req.user.id)

  // Unauthorized user
  if (req.user.id !== group.organizerId && !isCoHost) {
    const err = new Error("Group Event must be created by Organizer or Co-Host");
    console.error(err);
    res.status(403);
    return res.json({ message: "Group Event must be created by Organizer or Co-Host" });
  };

  const groupId = group.id;
  const { venueId, name, description, type, capacity, price, startDate, endDate } = req.body;
  const event = await Event.create({ groupId, venueId, name, description, type, capacity, price, startDate, endDate });

  const eventObj = event.toJSON()
  delete eventObj.updatedAt;
  delete eventObj.createdAt;

  return res.json(eventObj);
});

/*
  GROUPS
*/

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

// Add an Image to a Group based on the Group's id
router.post('/:groupId/images', requireAuth, async (req, res) => {
  const { url, preview } = req.body;
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId)

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    const err = new Error("Group must belong to the current user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "Group must belong to the current user" });
  };

  const img = await GroupImage.create({ groupId, url, preview });

  const safeImg = {
    id: img.id,
    url: img.url,
    preview: img.preview
  };

  return res.json(safeImg);
});

// Edit a Group
router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    const err = new Error("Group must belong to the current user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "Group must belong to the current user" });
  };

  // Handler
  const { name, about, type, private, city, state } = req.body;

  group.name = name;
  group.about = about;
  group.type = type;
  group.private = private;
  group.city = city;
  group.state = state;

  await group.save();

  return res.json(group);
});

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

// Get details of a Group from an id
router.get('/:groupId', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };
  return res.json(group);
});

// Delete a Group
router.delete('/:groupId', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    const err = new Error("Group must belong to the current user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "Group must belong to the current user" });
  };

  await group.destroy();

  return res.json({ "message": "Successfully deleted" })
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

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll({ include: { model: GroupImage } });
  return res.json({ "Groups": groups });
});

module.exports = router;
