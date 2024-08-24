const express = require('express');
const SubscriptionPlan = express.Router();
const { tokenMiddlewareUser, tokenMiddlewareAdmin } = require("../common/encDec")
const {  buySubscriptionPlan,checkSubscriptionPlanExpiry,cancelRenewal, billingSummary, paymentSuccesssResponse, list_of_SubscriptionPlans_for_admin, fetchSubscriptionPlanForAdmin, subscribed_plans_for_user } = require('../controllers/subscriptionPlanBannerConfig');
const { postValidation } = require('../common/validation');
const { authorizeAccess } = require('../controllers/adminConfig');
//======================================== SubscriptionPlan APIs Routes =====================================================


SubscriptionPlan.post('/subscribe_a_plan', tokenMiddlewareUser, postValidation, buySubscriptionPlan);

SubscriptionPlan.post('/payment_success',  paymentSuccesssResponse);

SubscriptionPlan.get('/subscription_plan_info', tokenMiddlewareUser, checkSubscriptionPlanExpiry);

SubscriptionPlan.post('/cancel_renewal', tokenMiddlewareUser, postValidation, cancelRenewal);

SubscriptionPlan.post('/billing_summary', tokenMiddlewareUser, postValidation, billingSummary);

SubscriptionPlan.post('/list_of_SubscriptionPlans', tokenMiddlewareAdmin,authorizeAccess('purchase_history', 'view'), list_of_SubscriptionPlans_for_admin);

SubscriptionPlan.get('/subscribedPlans', tokenMiddlewareUser, subscribed_plans_for_user);

SubscriptionPlan.post('/subscription_plan_info', tokenMiddlewareAdmin,authorizeAccess('purchase_history', 'view'), fetchSubscriptionPlanForAdmin);

module.exports = SubscriptionPlan;