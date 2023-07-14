const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, Membership, Venue, User } = require('../../db/models');

const router = express.Router();

// Check if member has co-host status without throwing type error
const isAttending = async (userId, eventId) => {
  const attendance = await Attendance.findOne({ where: { userId: userId, eventId: eventId } });
  if (attendance) {
    if (
      attendance.status === 'host' ||
      attendance.status === 'co-host' ||
      attendance.status === 'attending'
    ) {
      return true;
    };
    return false;
  };
  return false;
};

// Check if membership has co-host status without throwing type error
const coHost = async (userId, groupId) => {
  const membership = await Membership.findOne({ where: { userId: userId, groupId: groupId } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

/*
  ATTENDEES
*/

// Get all Attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId);

  // No such Event
  if (!event) {
    res.status(404)
    return res.json({ message: "Event couldn't be found" })
  }

  const group = await Group.findByPk(event.groupId)

  const attendees = await Attendance.findAll({
    where: { eventId: eventId },
    include: { model: User }
  });

  const attendeeObjs = [];
  attendees.forEach(attendee => {
    attendeeObjs.push(attendee.toJSON());
  });

  const attendeeReturn = [];
  attendeeObjs.forEach(attendee => {
    attendee.User.Attendance = { status: attendee.status };
    attendee.User.id = attendee.id;
    delete attendee.User.username;
    attendeeReturn.push(attendee.User);
  });

  // Return unfiltered list for group organizers and co-hosts
  if (req.user) {
    const isCoHost = await coHost(req.user.id, group.id);
    if (req.user.id === group.organizerId || isCoHost) {
      return res.json({ Attendees: attendeeReturn });
    };
  };

  // Return unfiltered list for group organizers and co-hosts
  const attendeeFilter = [];
  for (const attendee of attendeeReturn) {
    if (attendee.Attendance.status !== 'pending') {
      attendeeFilter.push(attendee);
    };
  };

  return res.json({ Attendees: attendeeFilter });
});

// Request to Attend an Event based on the Event's id
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId);
  const attendance = await Attendance.findOne({ where: { userId: userId, eventId: eventId } });

  // No such Event
  if (!event) {
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const membership = await Membership.findOne({
    where: { userId: userId, groupId: event.groupId }
  });

  // Not a group member
  if (!membership) {
    const err = new Error('Current User must be a member of the group');
    console.error(err);
    res.status(403);
    return res.json({ message: 'Current User must be a member of the group' });
  }

  // Already have attending status
  if (attendance) {
    res.status(400);
    if (attendance.status === 'pending' || attendance.status === 'waitlist') {
      return res.json({ message: "Attendance has already been requested" })
    } else {
      return res.json({ message: "User is already an attendee of the event" })
    };
  };

  // Handler
  const status = 'pending';
  const newAttendance = await Attendance.create({ eventId, userId, status });
  newAttendance.save()

  const newAttendanceObj = newAttendance.toJSON();
  const resObj = { eventId: eventId, userId: newAttendanceObj.userId, status: status };

  return res.json(resObj);
});

// Change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
  const sessionUserId = req.user.id;
  const eventId = req.params.eventId;
  const { userId, status } = req.body;
  const event = await Event.findByPk(eventId);
  const attendance = await Attendance.findOne({
    where: { userId: userId, eventId: eventId }
  });

  // No such Event
  if (!event) {
    const err = new Error("Event couldn't be found");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const group = await Group.findByPk(event.groupId);
  const isCoHost = await coHost(sessionUserId, group.id);
  // Unauthorized
  if (sessionUserId !== group.organizerId && !isCoHost) {
    const err = new Error("User must already be the organizer or co-host");
    console.error(err);
    res.status(403);
    return res.json({ message: "User must already be the organizer or co-host" });
  };

  // No such Attendance
  if (!attendance) {
    const err = new Error("Attendance between the user and the event does not exist");
    console.error(err);
    res.status(404);
    return res.json({ message: "Attendance between the user and the event does not exist" });
  };

  // Attempting to change attendance status to 'pending'
  if (status === 'pending') {
    const err = new Error("Cannot change an attendance status to pending");
    console.error(err);
    res.status(400);
    return res.json({ message: "Cannot change an attendance status to pending" });
  };

  attendance.status = status;
  await attendance.save();

  const resObj = attendance.toJSON()
  delete resObj.createdAt;
  delete resObj.updatedAt;

  return res.json(resObj);
});

// Delete attendance to an event specified by id
router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
  const sessionUserId = req.user.id;
  const eventId = req.params.eventId;
  const { userId } = req.body;
  const event = await Event.findByPk(eventId);
  const attendance = await Attendance.findOne({
    where: { userId: userId, eventId: eventId }
  });

  // No such Event
  if (!event) {
    const err = new Error("Event couldn't be found");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const group = await Group.findByPk(event.groupId);
  // Unauthorized
  if (sessionUserId !== group.organizerId && sessionUserId !== userId) {
    const err = new Error("Only the User or organizer may delete an Attendance");
    console.error(err);
    res.status(403);
    return res.json({ message: "Only the User or organizer may delete an Attendance" });
  };

  // No such Attendance
  if (!attendance) {
    const err = new Error("Attendance between the user and the event does not exist");
    console.error(err);
    res.status(404);
    return res.json({ message: "Attendance between the user and the event does not exist" });
  };

  await attendance.destroy();
  return res.json({ message: "Successfully deleted attendance from event" });
});

/*
  EVENTS
*/

// Add an Image to a Event based on the Event's id
router.post('/:eventId/images', requireAuth, async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);

  // No such Event
  if (!event) {
    const err = new Error("Couldn't find an Event with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  }

  const attending = await isAttending(req.user.id, event.id)

  // Unauthorized user
  if (!attending) {
    const err = new Error("Current User must be an attendee, host, or co-host of the event");
    console.error(err);
    res.status(403);
    return res.json({ message: "User must be an attendee, host, or co-host of the event" });
  }

  const eventId = event.id;
  const { url, preview } = req.body;
  const img = await EventImage.create({ eventId, url, preview });
  // img.save();
  const imgObj = img.toJSON();

  delete imgObj.eventId;
  delete imgObj.createdAt;
  delete imgObj.updatedAt;

  return res.json(imgObj);
});

// Get details of an Event specified by its id
router.get('/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  const event = await Event.findByPk(eventId, {
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "description",
      "type",
      "capacity",
      "price",
      "startDate",
      "endDate"
    ],
    include: [
      { model: Attendance },
      {
        model: EventImage,
        attributes: ['id', 'url', 'preview']
      },
      {
        model: Group,
        attributes: ['id', 'name', 'private', 'city', 'state']
      },
      {
        model: Venue,
        attributes: ['id', 'city', 'state', 'lat', 'lng']
      },
    ]
  });

  // No such Event
  if (!event) {
    const err = new Error("Couldn't find a Event with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const eventObj = event.toJSON()
  eventObj.numAttending = event.Attendances.length;
  delete eventObj.Attendances;

  return res.json(eventObj);
});

// Edit an Event specified by its id
router.put('/:eventId', requireAuth, async (req, res) => {
  const event = await Event.findByPk(req.params.eventId)

  // No such Event
  if (!event) {
    const err = new Error("Couldn't find a Event with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const group = await Group.findByPk(event.groupId);
  const isCoHost = await coHost(group.id, req.user.id);

  // Unauthorized user
  if (req.user.id !== group.organizerId && !isCoHost) {
    const err = new Error("Group Event must be created by Organizer or Co-Host");
    console.error(err);
    res.status(403);
    return res.json({ message: "Group Event must be created by Organizer or Co-Host" });
  };

  const {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate
  } = req.body;

  event.venueId = venueId;
  event.name = name;
  event.type = type;
  event.capacity = capacity;
  event.price = price;
  event.description = description;
  event.startDate = startDate;
  event.endDate = endDate;

  await event.save()
  const eventObj = event.toJSON()

  delete eventObj.createdAt;
  delete eventObj.updatedAt;

  return res.json(eventObj)
});

// Delete an Event specified by its id
router.delete('/:eventId', requireAuth, async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);

  // No such Event
  if (!event) {
    const err = new Error("Couldn't find a Event with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Event couldn't be found" });
  };

  const group = await Group.findByPk(event.groupId);
  const isCoHost = await coHost(group.id, req.user.id);

  // Unauthorized user
  if (req.user.id !== group.organizerId && !isCoHost) {
    const err = new Error('Current User must be the organizer of the group or a member of the group with a status of "co-host"');
    console.error(err);
    res.status(403);
    return res.json({ message: "Current User must be the organizer or a co-host of the group" });
  };

  await event.destroy();

  return res.json({ message: "Successfully deleted" })
});

// Get all Events
router.get('/', async (req, res) => {
  const events = await Event.findAll({
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

module.exports = router;
