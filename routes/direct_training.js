const express = require("express");
const { postValidation } = require("../common/validation.js");
const {
  tokenMiddlewareAdmin,
  tokenMiddlewareUser,
} = require("../common/encDec.js");
const training = express.Router();
const {
  apply_for_direct_training,
  add_direct_training_installment,
  edit_selected_installments,
  make_payment,
  paymentSuccesssResponse,
  billing_summary,
  listOfOrdersForAdmin,
  fetchOrderInfoForAdmin,
  listOfDirectTrainingOrdersForUser,
  pay_now,
  pay_now_paymentSuccesssResponse,
} = require("../controllers/directTrainingConfig.js");
const { authorizeAccess } = require("../controllers/adminConfig.js");

training.post(
  "/add_direct_training_installment",
  postValidation,
  add_direct_training_installment
);

training.post("/proceed_to_pay", postValidation, apply_for_direct_training);

training.post("/billing_summary", billing_summary);

training.patch(
  "/remove_selected_installments",
  postValidation,
  edit_selected_installments
);

training.post("/checkout", postValidation, make_payment);

training.post("/payment_success", paymentSuccesssResponse);

training.post("/pay_now", postValidation, pay_now);

training.post("/pay_now_payment_success", pay_now_paymentSuccesssResponse);

training.post(
  "/list_of_orders",
  tokenMiddlewareAdmin,
  authorizeAccess("purchase_history", "view"),
  listOfOrdersForAdmin
);

training.post(
  "/order_info",
  tokenMiddlewareAdmin,
  authorizeAccess("purchase_history", "view"),
  fetchOrderInfoForAdmin
);

training.get("/orders", tokenMiddlewareUser, listOfDirectTrainingOrdersForUser);

//training.post('/order_detail', tokenMiddlewareAdmin,authorizeAccess('purchase_history', 'view'), fetchOrderDetailForAdmin);

// training.get('/applicant_Information/:applicantId',tokenMiddlewareAdmin,authorizeAccess('training', 'view'), applicant_Information);

// training.get('/applicant_list',tokenMiddlewareAdmin,authorizeAccess('training', 'view'), applicant_list);

module.exports = training;
