const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const subscriptionBanner = express.Router();
const multer = require('multer');
const { addSubscriptionBanner, editSubscriptionBanner, changeStatus, fetchSubscriptionBanner, SubscriptionBannerList, deleteSubscriptionBanner ,activeSubscriptionBannerList} = require('../controllers/subsBannerConfig');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

subscriptionBanner.post('/add_subscription_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('subscription_banner', 'edit'), postValidation,addSubscriptionBanner);

subscriptionBanner.patch('/edit_subscription_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('subscription_banner', 'edit'), postValidation,editSubscriptionBanner);

subscriptionBanner.patch('/change_status_of_subscription_banner',tokenMiddlewareAdmin,authorizeAccess('subscription_banner', 'edit'), postValidation,changeStatus);

subscriptionBanner.post('/subscription_banner_info',tokenMiddlewareAdmin,authorizeAccess('subscription_banner', 'view'), postValidation,fetchSubscriptionBanner);

subscriptionBanner.get('/subscription_banner_list',tokenMiddlewareAdmin,authorizeAccess('subscription_banner', 'view'),SubscriptionBannerList);

subscriptionBanner.get('/active_subscription_banner_list',activeSubscriptionBannerList);

subscriptionBanner.post('/delete_subscription_banner',tokenMiddlewareAdmin, authorizeAccess('subscription_banner', 'delete'),postValidation,deleteSubscriptionBanner);


module.exports = subscriptionBanner;