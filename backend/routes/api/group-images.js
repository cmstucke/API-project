const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, Membership, Venue, User } = require('../../db/models');

const router = express.Router();

router.delete('/:imageId', requireAuth, (req, res) => {

});

module.exports = router;
