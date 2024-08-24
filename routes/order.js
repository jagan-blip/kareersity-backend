const express = require('express');
const order = express.Router();
const { tokenMiddlewareUser, tokenMiddlewareAdmin } = require("../common/encDec")
const {  PlaceAnOrder, listOfOrderPlacedByUser, listOfOrdersForAdmin, BuyNow, subscribeNowForBundleCourse, salesAndRevenueInAdminDashboard, paymentSuccesssResponse, fetchOrderDetailForAdmin } = require('../controllers/orderConfig');
const { postValidation } = require('../common/validation');
const { authorizeAccess } = require('../controllers/adminConfig');
//======================================== order APIs Routes =====================================================


order.post('/subscribe_limited_time_offer', tokenMiddlewareUser, postValidation, subscribeNowForBundleCourse);

order.post('/buy_now', tokenMiddlewareUser, postValidation, BuyNow);

order.post('/place_order', tokenMiddlewareUser, PlaceAnOrder);

order.post('/payment_success', paymentSuccesssResponse);

order.get('/user_order_list', tokenMiddlewareUser, listOfOrderPlacedByUser);

order.post('/list_of_orders', tokenMiddlewareAdmin,authorizeAccess('purchase_history', 'view'), listOfOrdersForAdmin);

order.post('/order_detail', tokenMiddlewareAdmin,authorizeAccess('purchase_history', 'view'), fetchOrderDetailForAdmin);

order.get('/sales_and_revenue', tokenMiddlewareAdmin, salesAndRevenueInAdminDashboard);

module.exports = order;