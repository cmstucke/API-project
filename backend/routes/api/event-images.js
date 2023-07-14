const express = require('express');
const bcrypt = require('bcryptjs');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Attendance, Event, EventImage, Group, GroupImage, Membership, Venue, User } = require('../../db/models');

const router = express.Router();

// Check if membership has co-host status without throwing type error
const coHost = async (userId, groupId) => {
  const membership = await Membership.findOne({ where: { userId: userId, groupId: groupId } });
  if (membership) {
    if (membership.status === 'co-host') return true
    return false
  }
  return false
};

// Delete an Image for an Event
router.delete('/:imageId', requireAuth, async (req, res) => {
  const img = await EventImage.findByPk(req.params.imageId);

  // No such image
  if (!img) {
    const err = new Error("Couldn't find an Image with the specified id");
    console.error(err);
    res.status(404);
    return res.json({ message: "Group Image couldn't be found" })
  };

  const event = await Event.findByPk(img.eventId)
  const userId = req.user.id;
  const group = await Group.findByPk(event.groupId);
  const isCoHost = await coHost(userId, group.id);

  // Unauthorized user
  if (userId !== group.organizerId && !isCoHost) {
    const err = new Error('Current user must be the organizer or "co-host" of the Group');
    console.error(err);
    res.status(403);
    return res.json({ message: 'User must be the organizer or "co-host" of the Group' });
  }

  await img.destroy();

  return res.json({ message: "Successfully deleted" });
});

module.exports = router;
