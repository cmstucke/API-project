const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Event, Group, Venue, Attendance, EventImage } = require('../../db/models');

const router = express.Router();

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
