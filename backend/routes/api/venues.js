const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Group, Membership, Venue } = require('../../db/models');

const router = express.Router();

// CHECK IF MEMBERSHIP HAS HOST STATUS
const coHost = async (group, user) => {
  const membership = await Membership.findOne({ where: { groupId: group, userId: user } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

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

// EDIT A VENUE SPECIFIED BY ITS ID
router.put('/:venueId', requireAuth, validateVenue, async (req, res, next) => {
  const venue = await Venue.findByPk(req.params.venueId);

  // No such venue
  if (!venue) {
    res.status(404);
    const err = new Error("Couldn't find a Venue with the specified id");
    console.error(err);
    return res.json({ "message": "Venue couldn't be found" });
  };

  const group = await Group.findByPk(venue.groupId);
  const isCoHost = await coHost(venue.groupId, req.user.id);

  // Unauthorized user
  if (req.user.id !== group.organizerId && !isCoHost) {
    res.status(403);
    const err = new Error("Unauthenticated user");
    console.error(err);
    return res.json({ "message": "User must be organizer or co-host to the current group" });
  }

  const { address, city, state, lat, lng } = req.body
  venue.address = address;
  venue.city = city;
  venue.state = state;
  venue.lat = lat;
  venue.lng = lng;

  await venue.save();
  const venueObj = venue.toJSON();
  delete venueObj.updatedAt;

  return res.json(venueObj);
});

module.exports = router;
