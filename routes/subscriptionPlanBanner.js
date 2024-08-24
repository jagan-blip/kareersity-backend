const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const subscriptionPlanBanner = express.Router();

const { addSubscriptionPlanBanner, editSubscriptionPlanBanner, changeStatus, fetchSubscriptionPlanBanner, SubscriptionPlanBannerList, deleteSubscriptionPlanBanner ,activeSubscriptionPlanBannerList} = require('../controllers/subscriptionPlanBannerConfig');


subscriptionPlanBanner.post('/add_subscription_plan',tokenMiddlewareAdmin,authorizeAccess('subscription_plan', 'edit'), postValidation,addSubscriptionPlanBanner);

subscriptionPlanBanner.patch('/edit_subscription_plan',tokenMiddlewareAdmin,authorizeAccess('subscription_plan', 'edit'), postValidation,editSubscriptionPlanBanner);

subscriptionPlanBanner.post('/subscription_plan_info', postValidation,fetchSubscriptionPlanBanner);

subscriptionPlanBanner.get('/subscription_plan_list',tokenMiddlewareAdmin,authorizeAccess('subscription_plan', 'view'),SubscriptionPlanBannerList);

subscriptionPlanBanner.get('/active_subscription_plan_list',activeSubscriptionPlanBannerList);

subscriptionPlanBanner.post('/delete_subscription_plan',tokenMiddlewareAdmin,authorizeAccess('subscription_plan', 'delete'),postValidation,deleteSubscriptionPlanBanner);


module.exports = subscriptionPlanBanner;