const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, GroupImage, Membership, Venue, User } = require('../../db/models');

const router = express.Router();

// CHECK IF MEMBERSHIP HAS HOST STATUS
const coHost = async (userId, groupId) => {
  const membership = await Membership.findOne({ where: { userId: userId, groupId: groupId } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

/*
VENUES
------
*/

// VENUE VALIDATIONS
const validateVenue = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage("State is required"),
  check('lat')
    .exists({ checkFalsy: true })
    .isDecimal()
    .withMessage("Latitude is not valid"),
  check('lng')
    .exists({ checkFalsy: true })
    .isDecimal()
    .withMessage("Longitude is not valid"),
  handleValidationErrors
];

// GET ALL VENUES FOR A GROUP SPECIFIED BY ITS ID
router.get('/:groupId/venues', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);
  const isCoHost = await coHost(req.params.groupId, req.user.id)

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized
  if (req.user.id !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Unauthenticated user");
    console.error(err);
    return res.json({ message: "User must be organizer or co-host to the current group" });
  }

  // Handler
  const venues = await Venue.findAll({ where: { groupId: req.params.groupId } });
  const venueObjs = [];
  for (const venue of venues) {
    const venueObj = venue.toJSON();
    delete venueObj.createdAt;
    delete venueObj.updatedAt;
    venueObjs.push(venueObj);
  };

  return res.json({ Venues: venueObjs });
});

// CREATE A NEW VENUE FOR A GROUP SPECIFIED BY ITS ID
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res, next) => {
  const groupId = req.params.groupId
  const group = await Group.findByPk(groupId);
  const isCoHost = await coHost(groupId, req.user.id)
  const { address, city, state, lat, lng } = req.body

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized User
  if (req.user.id !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Unauthenticated user");
    console.error(err);
    return res.json({ "message": "User must be organizer or co-host to the current group" });
  }

  // Handler
  const venue = await Venue.create({ groupId, address, city, state, lat, lng });
  const venueObj = venue.toJSON();
  delete venueObj.createdAt;
  delete venueObj.updatedAt;

  return res.json(venueObj);
});

/*
  MEMBERSHIPS
  -----------
*/

router.get('/:groupId/members', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  const memberships = await Membership.findAll({
    where: { groupId: req.params.groupId },
    include: { model: User }
  });

  const membershipObjs = [];
  memberships.forEach(membership => {
    membershipObjs.push(membership.toJSON())
  });
  // console.log(memberObjs);
  const members = [];
  membershipObjs.forEach(memberObj => {
    const user = memberObj.User;
    user.Membership = { status: memberObj.status };
    delete user.username;
    if (req.user.id !== group.organizerId && memberObj.status !== 'pending') {
      members.push(user);
    } else if (req.user.id === group.organizerId) {
      members.push(user);
    }
  });

  return res.json({ Members: members })
});

// Request a Membership for a Group based on the Group's id
router.post('/:groupId/membership', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId)

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  // If membership exists already
  const status = 'pending'
  const membership = await Membership.findOne({
    where: { groupId: groupId, userId: userId }
  });
  if (membership) {
    const membershipObj = membership.toJSON()
    if (membershipObj.status === status) {
      res.status(400);
      const err = new Error("Current User already has a pending membership for the group");
      console.error(err);
      return res.json({ message: "Membership has already been requested" });
    } else {
      res.status(400);
      const err = new Error("Current User is already an accepted member of the group");
      console.error(err);
      return res.json({ message: "User is already a member of the group" });
    }
  }

  const newMembership = await Membership.create({ userId, groupId, status });
  const newMembershipObj = newMembership.toJSON();
  newMembershipObj.memberId = newMembershipObj.userId;
  delete newMembershipObj.id;
  delete newMembershipObj.userId;
  // delete newMembershipObj.groupId;
  delete newMembershipObj.createdAt;
  delete newMembershipObj.updatedAt;

  return res.json(newMembershipObj);
});

// Change the status of a membership for a group specified by id
router.put('/:groupId/membership', requireAuth, async (req, res) => {
  const hostId = req.user.id;
  const groupId = req.params.groupId;
  const { memberId, status } = req.body;
  const isCoHost = await coHost(hostId, groupId);
  const group = await Group.findByPk(groupId);
  const membership = await Membership.findByPk(memberId);

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ message: "Group couldn't be found" });
  };

  // Must be organizer or member
  if (status === 'co-host' && hostId !== group.organizerId) {
    res.status(403);
    const err = new Error("Current User must be group organizer to create co-host");
    console.error(err);
    return res.json({ message: "Current User must be group organizer to create co-host" });
  }

  // Must be organizer or co-host to edit
  if (hostId !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Current User must be organizer co-host to edit membership statuses");
    console.error(err);
    return res.json({ message: "Current User must be organizer co-host to edit membership statuses" });
  }

  // Membership doesn't exist
  if (!membership) {
    res.status(404);
    const err = new Error("Membership between the user and the group does not exist");
    console.error(err);
    return res.json({ message: "Membership between the user and the group does not exist" });
  }

  // Cannot change status to pending
  if (status === 'pending') {
    res.status(400);
    const err = new Error("Cannot set status to 'pending'");
    console.error(err);
    return res.json({ message: "Cannot set status to 'pending'" });
  }

  membership.status = status;
  membership.save();

  const membershipObj = membership.toJSON()
  membershipObj.memberId = membershipObj.userId;
  delete membershipObj.userId;
  delete membershipObj.createdAt;
  delete membershipObj.updatedAt;

  return res.json(membershipObj);
});

// Delete membership to a group specified by id
router.delete('/:groupId/membership', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const { memberId } = req.body;
  const group = await Group.findByPk(groupId);
  const membership = await Membership.findByPk(memberId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Group couldn't be found" });
  };

  // Membership doesn't exist
  if (!membership) {
    res.status(400);
    const err = new Error("Couldn't find a User with the specified memberId");
    console.error(err);
    return res.json({
      "message": "Validation Error",
      "errors": {
        "memberId": "User couldn't be found"
      }
    });
  }

  // Must be organizer or member
  if (userId !== group.organizerId && userId !== membership.userId) {
    res.status(403);
    const err = new Error("Only group organizers and members may delete memberships");
    console.error(err);
    return res.json({ message: "Only group organizers and members may delete memberships" });
  }

  await membership.destroy();

  return res.json({ message: "Successfully deleted membership from group" });
});

/*
  EVENTS
*/

// check('venueId')
//   .exists({ checkFalsy: true })
//   .isLength({ min: 1, max: 60 })
//   .withMessage("Name must be 60 characters or less"),
// check('name')
//   .isLength({ min: 50 })
//   .withMessage("About must be 50 characters or more"),
// check('type')
//   .exists({ checkFalsy: true })
//   .isIn(['Online', 'In person'])
//   .withMessage("Type must be 'Online' or 'In person'"),
// check('capacity')
//   .exists({ checkFalsy: true })
//   .isBoolean()
//   .withMessage("Private must be a boolean"),
// check('price')
//   .exists({ checkFalsy: true })
//   .withMessage("City is required"),
// check('description')
//   .exists({ checkFalsy: true })
//   .withMessage("State is required"),

// EVENT VALIDATIONS
const validateEvent = [
  // check('venueId')
  //   .exists({ checkFalsy: true })
  //   .isInt()
  //   .withMessage("Venue does not exist"),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters"),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('capacity')
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage("Private must be a boolean"),
  check('price')
    .exists({ checkFalsy: true })
    .isDecimal()
    .withMessage("City is required"),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  // check('startDate')
  //   .exists({ checkFalsy: true })
  //   .withMessage("Start date must be in the future"),
  // check('endDate')
  //   .exists({ checkFalsy: true })
  //   .isAfter({ comparisonDate: new Date('startDate').toString() })
  //   .withMessage(`End date is less than start date ${this}`),
  handleValidationErrors
];

// GET ALL EVENTS OF A GROUP SPECIFIED BY ITS ID
router.get('/:groupId/events', async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId)

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ message: "Group couldn't be found" });
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

// CREATE AN EVENT FOR A GROUP SPECIFIED BY ITS ID
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
  const userId = req.user.id;
  const group = await Group.findByPk(req.params.groupId);
  const { venueId, name, description, type, capacity, price, startDate, endDate } = req.body;

  //No such Venue
  const venue = await Venue.findByPk(venueId);
  if (!venue) {
    res.status(400);
    const err = new Error("Venue does not exist")
    console.error(err);
    return res.json({
      message: "Bad Request",
      errors: { venueId: "Venue does not exist" }
    });
  };

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  const isCoHost = await coHost(group.id, userId)

  // Unauthorized user
  if (userId !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Group Event must be created by Organizer or Co-Host");
    console.error(err);
    return res.json({ message: "Group Event must be created by Organizer or Co-Host" });
  };

  // Invalid dates
  const startDateTime = new Date(startDate).getTime();
  const endDateTime = new Date(endDate).getTime();
  const currentTime = new Date().getTime();

  if (startDateTime <= currentTime) {
    res.status(400);
    const err = new Error("Start date must be in the future")
    console.error(err);
    return res.json({
      message: "Bad Request",
      errors: { startDate: "Start date must be in the future" }
    });
  };

  if (endDateTime <= startDateTime) {
    res.status(400);
    const err = new Error("End date is less than start date")
    console.error(err);
    return res.json({
      message: "Bad Request",
      errors: { endDate: "End date is less than start date" }
    });
  };

  // Handler
  const groupId = group.id;
  const event = await Event.create({
    groupId,
    venueId,
    name,
    description,
    type,
    capacity,
    price,
    startDate,
    endDate
  });

  const eventObj = event.toJSON()
  delete eventObj.updatedAt;
  delete eventObj.createdAt;

  const eventId = event.id;
  const status = 'host';
  const host = await Attendance.create({ eventId, userId, status });
  await host.save();

  return res.json(eventObj);
});

/*
  GROUPS
*/

// GROUP VALIDATIONS
const validateGroup = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check('about')
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more"),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
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

// ADD AN IMAGE TO GROUP BASED ON THE GROUP'S ID
router.post('/:groupId/images', requireAuth, async (req, res) => {
  const { url, preview } = req.body;
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId)

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ message: "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    res.status(403);
    const err = new Error("Group must belong to the current user");
    console.error(err);
    return res.json({ message: "Group must belong to the current user" });
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
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    res.status(403);
    const err = new Error("Group must belong to the current user");
    console.error(err);
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
  // Get created groups
  const groups = await Group.findAll({
    where: { organizerId: req.user.id },
    include: [
      { model: Membership },
      { model: GroupImage }
    ]
  });

  // Get memberships
  const memberships = await Membership.findAll({
    where: { userId: req.user.id },
    include: {
      model: Group,
      include: [
        { model: Membership },
        { model: GroupImage }
      ]
    }
  });

  // Combine all organizer and member group records
  const memberOf = [];
  for (const membership of memberships) {
    memberOf.push(membership.Group);
  };
  const allGroups = groups.concat(memberOf);

  // Handler
  const groupObjs = [];
  for (const group of allGroups) {
    groupObjs.push(group.toJSON());
  };

  for (const groupObj of groupObjs) {
    groupObj.numMembers = groupObj.Memberships.length;
    groupObj.previewImage = 'No preview image';
    for (const img of groupObj.GroupImages) {
      if (img.preview) groupObj.previewImage = img.url;
    };
    delete groupObj.Memberships;
    delete groupObj.GroupImages;
  };

  return res.json({ Groups: groupObjs });
});

// Get details of a Group from an id
router.get('/:groupId', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId, {
    include: [
      { model: Membership },
      { model: GroupImage },
      { model: Venue }
    ],
  });

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ message: "Group couldn't be found" });
  };

  // Get organizer user properties
  const organizer = await User.findByPk(group.organizerId);
  const organizerObj = organizer.toJSON();
  delete organizerObj.username;

  // Create numMembers property
  const groupObj = group.toJSON();
  groupObj.numMembers = groupObj.Memberships.length;
  delete groupObj.Memberships;

  // Return necessary GroupImages properties
  for (const img of groupObj.GroupImages) {
    delete img.groupId;
    delete img.createdAt;
    delete img.updatedAt;
  };

  // Add organizer properties to response object
  groupObj.Organizer = organizerObj;

  // Return necessary Venues properties
  for (const img of groupObj.Venues) {
    delete img.createdAt;
    delete img.updatedAt;
  };

  return res.json(groupObj);
});

// Delete a Group
router.delete('/:groupId', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    res.status(404);
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    return res.json({ "message": "Group couldn't be found" });
  };

  // Unauthorized user
  if (req.user.id !== group.organizerId) {
    res.status(403);
    const err = new Error("Group must belong to the current user");
    console.error(err);
    return res.json({ message: "Group must belong to the current user" });
  };

  await group.destroy();

  return res.json({ message: "Successfully deleted" })
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

  res.status(201);
  return res.json(safeGroup);
});

// Get all Groups
router.get('/', async (req, res) => {
  const groups = await Group.findAll({
    include: [
      { model: Membership },
      { model: GroupImage }
    ]
  });

  const groupObjs = [];
  for (const group of groups) {
    groupObjs.push(group.toJSON());
  };

  for (const groupObj of groupObjs) {
    groupObj.numMembers = groupObj.Memberships.length;
    groupObj.previewImage = 'No preview image';
    for (const img of groupObj.GroupImages) {
      if (img.preview) groupObj.previewImage = img.url;
    };
    delete groupObj.Memberships;
    delete groupObj.GroupImages;
  };

  return res.json({ Groups: groupObjs });
});

module.exports = router;
