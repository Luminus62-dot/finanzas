// backend/routes/subscription.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/subscriptionController");

router.get("/", auth, controller.getSubscriptions);
router.post("/", auth, controller.createSubscription);
router.put("/:id", auth, controller.updateSubscription);
router.delete("/:id", auth, controller.deleteSubscription);

module.exports = router;
