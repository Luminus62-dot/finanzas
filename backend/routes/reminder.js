const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/reminderController');

router.get('/', auth, controller.getReminders);
router.get('/upcoming', auth, controller.getUpcoming);
router.post('/', auth, controller.createReminder);
router.put('/:id', auth, controller.updateReminder);
router.delete('/:id', auth, controller.deleteReminder);

module.exports = router;

