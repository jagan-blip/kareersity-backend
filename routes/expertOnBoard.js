const express = require("express");
const router = express.Router();
const {
  StartPayment,
  PaymentCallback,
} = require("../controllers/expertOnBoardConfig");
router.post("/start-payment", StartPayment);
router.post("/payment-callback", PaymentCallback);

module.exports = router;
