const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, GroupImage, Membership, Venue, User } = require('../../db/models');

const router = express.Router();

/*
  VENUES
*/

// Check if membership has co-host status without throwing type error
const coHost = async (userId, groupId) => {
  const membership = await Membership.findOne({ where: { userId: userId, groupId: groupId } });
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
  MEMBERSHIPS
*/

router.get('/:groupId/members', async (req, res) => {
  const group = await Group.findByPk(req.params.groupId);

  // No such group
  if (!group) {
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
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
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
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
      const err = new Error("Current User already has a pending membership for the group");
      console.error(err);
      res.status(400);
      return res.json({ message: "Membership has already been requested" });
    } else {
      const err = new Error("Current User is already an accepted member of the group");
      console.error(err);
      res.status(400);
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
    const err = new Error("Couldn't find a Group with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Group couldn't be found" });
  };

  // Must be organizer or member
  if (status === 'co-host' && hostId !== group.organizerId) {
    const err = new Error("Current User must be group organizer to create co-host");
    console.error(err);
    res.status(403);
    return res.json({ message: "Current User must be group organizer to create co-host" });
  }

  // Must be organizer or co-host to edit
  if (hostId !== group.organizerId && !isCoHost) {
    const err = new Error("Current User must be organizer co-host to edit membership statuses");
    console.error(err);
    res.status(403);
    return res.json({ message: "Current User must be organizer co-host to edit membership statuses" });
  }

  // Membership doesn't exist
  if (!membership) {
    const err = new Error("Membership between the user and the group does not exist");
    console.error(err);
    res.status(404);
    return res.json({ message: "Membership between the user and the group does not exist" });
  }

  // Cannot change status to pending
  if (status === 'pending') {
    const err = new Error("Cannot set status to 'pending'");
    console.error(err);
    res.status(400);
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
    const err = new Error("Couldn't find a User with the specified memberId");
    console.error(err);
    res.status(400);
    return res.json({
      "message": "Validation Error",
      "errors": {
        "memberId": "User couldn't be found"
      }
    });
  }

  // Must be organizer or member
  if (userId !== group.organizerId && userId !== membership.userId) {
    const err = new Error("Only group organizers and members may delete memberships");
    console.error(err);
    res.status(403);
    return res.json({ message: "Only group organizers and members may delete memberships" });
  }

  await membership.destroy();

  return res.json({ message: "Successfully deleted membership from group" });
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
  // Get created groups
  const groups = await Group.findAll({
    where: { organizerId: req.user.id },
    include: [
      { model: Membership },
      { model: GroupImage }
    ]
  });

  // Get Memberships
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

  // Combine all organizer and member Group records
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
