const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const coupon = express.Router();
const {addCoupon,editCoupon,CouponList,fetchCoupon,deleteCoupon,CouponActiveList  } = require('../controllers/couponConfig');

coupon.post('/add_coupon',tokenMiddlewareAdmin,authorizeAccess('coupons', 'edit'), postValidation,addCoupon);

coupon.patch('/edit_coupon',tokenMiddlewareAdmin,authorizeAccess('coupons', 'edit'), postValidation,editCoupon);

coupon.post('/coupon_info',tokenMiddlewareAdmin,authorizeAccess('coupons', 'view'), postValidation,fetchCoupon);

coupon.get('/coupon_list',tokenMiddlewareAdmin,authorizeAccess('coupons', 'view'),CouponList);

coupon.get('/active_coupon_list',tokenMiddlewareAdmin,CouponActiveList);

coupon.post('/delete_coupon',tokenMiddlewareAdmin,authorizeAccess('coupons', 'delete'), postValidation,deleteCoupon);


module.exports = coupon;