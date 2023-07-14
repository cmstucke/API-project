const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, Membership, Venue } = require('../../db/models');

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
