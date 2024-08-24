const express = require('express');
const cart = express.Router();
const { tokenMiddlewareUser } = require("../common/encDec")
const { AddCourseToCart, removeCourseInCart, listOfCoursesInCart, billingSummary } = require('../controllers/cartConfig');
const { postValidation } = require('../common/validation')
//======================================== Cart APIs Routes =====================================================


cart.post('/add', tokenMiddlewareUser, postValidation, AddCourseToCart);

cart.patch('/remove', tokenMiddlewareUser, postValidation, removeCourseInCart);

cart.get('/cartItemList', tokenMiddlewareUser, listOfCoursesInCart);

cart.post('/billingSummary', tokenMiddlewareUser, billingSummary);



module.exports = cart;