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
    return res.json({ message: "Group couldn't be found" });
  };

  // Unauthorized User
  if (req.user.id !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Unauthenticated user");
    console.error(err);
    return res.json({ message: "User must be organizer or co-host to the current group" });
  }

  // Handler
  const venue = await Venue.create({ groupId, address, city, state, lat, lng });
  const venueObj = venue.toJSON();
  delete venueObj.createdAt;
  delete venueObj.updatedAt;

  res.status(201);
  return res.json(venueObj);
});

/*
  MEMBERSHIPS
  -----------
*/

// GET ALL MEMBERS OF A GROUP SPECIFIED BY ITS ID
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

  const membersReturn = [];
  for (const memberObj of membershipObjs) {
    const user = memberObj.User;
    user.Membership = { status: memberObj.status };
    delete user.username;
    membersReturn.push(user);
  };

  // Handle unfiltered list for group organizers and co-hosts
  if (req.user) {
    const isCoHost = await coHost(req.user.id, group.id);
    if (req.user.id === group.organizerId || isCoHost) {
      return res.json({ Memberships: membersReturn });
    };
  };

  // Handle filtered lists for all other users
  const memberFilter = [];
  for (const member of membersReturn) {
    if (member.Membership.status !== 'pending') {
      memberFilter.push(member);
    };
  };

  return res.json({ Memberships: memberFilter });
});

// REQUEST A MEMBERSHIP FOR A GROUP BASED ON THE GROUP'S ID
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

  res.status(201);
  return res.json(newMembershipObj);
});

const validateMembershipChange = [
  check('memberId')
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage("User couldn't be found"),
  check('status')
    .isIn(['co-host', 'member'])
    .withMessage("Status must be 'co-host' or 'member'"),
  handleValidationErrors
];

// CHANGE A STATUS OF A MEMBERSHIP FOR A GROUP SPECIFIED BY ID
router.put('/:groupId/membership', requireAuth, validateMembershipChange, async (req, res) => {
  const hostId = req.user.id;
  const groupId = req.params.groupId;
  const { memberId, status } = req.body;
  const isCoHost = await coHost(hostId, groupId);
  const group = await Group.findByPk(groupId);
  const user = await User.findByPk(memberId);
  const membership = await Membership.findOne({
    where: {
      userId: memberId,
      groupId: groupId
    }
  });

  // No such group
  if (!user) {
    res.status(400);
    const err = new Error("Couldn't find a User with the specified memberId");
    console.error(err);
    return res.json({
      message: "Validaitons Error",
      errors: { memberId: "User couldn't be found" }
    });
  };

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
    const err = new Error("Validations Error");
    console.error(err);
    return res.json({
      message: "Validaitons Error",
      errors: { status: "Cannot change a membership status to pending" }
    });
  }

  membership.status = status;
  await membership.save();

  const membershipObj = membership.toJSON()
  membershipObj.memberId = membershipObj.userId;
  delete membershipObj.userId;
  delete membershipObj.createdAt;
  delete membershipObj.updatedAt;

  return res.json(membershipObj);
});

// DELETE MEMBERSHIP TO A GROUP SPECIFIED BY ID
router.delete('/:groupId/membership', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const { memberId } = req.body;
  const user = await User.findByPk(memberId)
  const group = await Group.findByPk(groupId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Group couldn't be found" });
  };

  // No such user
  if (!user) {
    const err = new Error("Couldn't find a User with the specified memberId");
    console.error(err);
    res.status(404);
    return res.json({ message: "User couldn't be found" });
  };

  const membership = await Membership.findOne({
    where: {
      userId: memberId,
      groupId: groupId
    }
  });

  // Membership doesn't exist
  if (!membership) {
    res.status(400);
    const err = new Error("Membership between the user and the group does not exist");
    console.error(err);
    return res.json({ message: "Membership between the user and the group does not exist" });
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

// EVENT VALIDATIONS
const validateEvent = [
  check('venueId')
    .optional()
    .custom(async venueId => {
      const venue = await Venue.findByPk(venueId);
      if (venueId !== null && !venue || venueId !== null && typeof venueId !== 'number') throw new Error;
    })
    .withMessage('Venue does not exist'),
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
    .withMessage("Price is required"),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check('startDate')
    .exists({ checkFalsy: true })
    .isAfter()
    .withMessage("Start date must be in the future"),
  check('endDate')
    .exists({ checkFalsy: true })
    .withMessage('End date is less than start date')
    .custom(async (endDate, req) => {
      if (endDate < req.req.body.startDate) throw new Error("End date is less than start date")
    }),
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
      "endDate",
      'description'
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
router.post('/:groupId/events/create', requireAuth, validateEvent, async (req, res) => {
  const userId = req.user.id;
  const group = await Group.findByPk(req.params.groupId);
  const { venueId, name, description, type, capacity, price, startDate, endDate } = req.body;

  //No such Venue
  const venue = await Venue.findByPk(venueId);
  if (venueId && !venue) {
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
    return res.json({ message: "Group couldn't be found" });
  };

  const isCoHost = await coHost(userId, group.id);

  // Unauthorized user
  (isCoHost);
  if (userId !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Group Event must be created by Organizer or Co-Host");
    console.error(err);
    return res.json({ message: "Group Event must be created by Organizer or Co-Host" });
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

  res.status(201);
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
    .isLength({ min: 30 })
    .withMessage("About must be 50 characters or more"),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('isPrivate')
    .exists({ checkFalsy: false })
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

const validateGroupCreate = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be 60 characters or less"),
  check('about')
    .isLength({ min: 30 })
    .withMessage("About must be 50 characters or more"),
  check('type')
    .exists({ checkFalsy: true })
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('isPrivate')
    .exists({ checkFalsy: false })
    .isBoolean()
    .withMessage("Private must be a boolean"),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage("State is required"),
  check('url')
    .exists({ checkFalsy: true })
    .isURL()
    .custom(async url => {
      if (!(
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpg')
      )) throw new Error
    })
    .withMessage("Image URL must end in .png, .jpg, or .jpeg"),
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

  res.status(201);
  return res.json(safeImg);
});

// EDIT A GROUP
router.put('/:groupId/update', requireAuth, validateGroup, async (req, res) => {
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
  const { name, about, type, isPrivate, city, state } = req.body;

  group.name = name;
  group.about = about;
  group.type = type;
  group.private = isPrivate;
  group.city = city;
  group.state = state;

  await group.save();

  return res.json(group);
});

// GET ALL GROUPS ORGANIZED OR JOINED BY THE CURRENT USER
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

// GET DETAILS OF A GROUP FROM AN ID
router.get('/:groupId', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId, {
    include: [
      { model: Membership },
      { model: GroupImage },
      { model: Venue },
      {
        model: Event,
        include: [{ model: EventImage }]
      }
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

  // Return preview img per included Event
  for (const event of groupObj.Events) {
    for (const img of event.EventImages) {
      if (img.preview) {
        event.previewImage = img.url;
      }
    };
    if (!event.previewImage) event.previewImage = null;
    delete event.EventImages;
  };

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

// DELETE A GROUP
router.delete('/:groupId/delete', requireAuth, async (req, res) => {
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

// CREATE A GROUP
router.post('/create', requireAuth, validateGroupCreate, async (req, res) => {
  const { name, about, type, isPrivate, city, state, url } = req.body;
  const private = isPrivate;
  const organizerId = req.user.id
  const group = await Group.create({ organizerId, name, about, type, private, city, state });
  await group.save();
  const groupId = group.id;
  const status = 'host';
  const userId = req.user.id;
  const membership = await Membership.create({ userId, groupId, status });
  await membership.save();
  const preview = true;
  const previewImg = await GroupImage.create({ groupId, url, preview });
  await previewImg.save();
  const user = await User.findByPk(userId);

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
    updatedAt: group.updatedAt,
    user
  };

  res.status(201);
  return res.json(safeGroup);
});

// GET ALL GROUPS
router.get('/', async (req, res) => {
  const groups = await Group.findAll({
    include: [
      { model: Membership },
      { model: GroupImage },
      { model: Event }
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
