const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, Venue } = require('../../db/models');

const router = express.Router();

// Check if member with co-host status without throwing type error
const coHost = async (group, user) => {
  const membership = await Membership.findOne({ where: { groupId: group, userId: user } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

// Edit a Venue specified by its id
router.put('/:venueId', requireAuth, async (req, res, next) => {
  const venueId = req.params.venueId;
  const venue = await Venue.findByPk(venueId);

  // No such group
  if (!venue) {
    const err = new Error("Couldn't find a Venue with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ "message": "Venue couldn't be found" });
  };

  const groupId = venue.groupId
  const group = await Group.findByPk(groupId)
  const isCoHost = await coHost(groupId, req.user.id)
  const { address, city, state, lat, lng } = req.body

  // Handler
  if (group.organizerId !== req.user.id && !isCoHost) {
    const err = new Error("Unauthenticated user");
    console.error(err);
    res.status(403);
    return res.json({ "message": "User must be organizer or co-host to the current group" });
  }

  venue.address = address;
  venue.city = city;
  venue.state = state;
  venue.lat = lat;
  venue.lng = lng;

  await venue.save();

  return res.json(venue);
});

module.exports = router;
