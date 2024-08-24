const express = require('express');
const RatingsAndReviews = express.Router();
const { list_of_ratings_and_reviews ,approve_ratings_and_reviews,edit_ratings_and_reviews,delete_ratings_and_reviews,fetch_ratings_and_reviews} = require("../controllers/ratingsAndReviews");
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');

RatingsAndReviews.get('/list_of_ratings_and_reviews',tokenMiddlewareAdmin,authorizeAccess('ratings_and_reviews', 'edit'), list_of_ratings_and_reviews);

RatingsAndReviews.post('/fetch_ratings_and_reviews',tokenMiddlewareAdmin,authorizeAccess('ratings_and_reviews', 'edit'),postValidation, fetch_ratings_and_reviews);

RatingsAndReviews.patch('/approve_ratings_and_reviews',tokenMiddlewareAdmin,authorizeAccess('ratings_and_reviews', 'edit'), postValidation,approve_ratings_and_reviews);

RatingsAndReviews.patch('/edit_ratings_and_reviews',tokenMiddlewareAdmin,authorizeAccess('ratings_and_reviews', 'edit'), postValidation,edit_ratings_and_reviews);

RatingsAndReviews.post('/delete_ratings_and_reviews',tokenMiddlewareAdmin,authorizeAccess('ratings_and_reviews', 'edit'), postValidation,delete_ratings_and_reviews);


module.exports = RatingsAndReviews;