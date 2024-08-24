const router = require("express").Router();

router.use(
  "/",
  require("./admin"),
  require("./category"),
  require("./course"),
  require("./testimonial"),
  require("./faq")
);
router.use("/user", require("./user"));
router.use("/learners", require("./learner"));
router.use("/listen_to_experts", require("./listenToExperts"));
router.use("/ratings_and_reviews", require("./ratingNReviews"));
router.use("/banner", require("./banner"));
router.use("/subscription_banner", require("./subscriptionBanner"));
router.use("/subscription_plan", require("./subscriptionPlanBanner"));
router.use("/my_subscription_plan", require("./userSubscription"));
router.use("/live_program_banner", require("./Live ProgramBanners"));
router.use("/job", require("./job"));
router.use("/direct_training", require("./direct_training"));
router.use("/blog", require("./blog"));
router.use("/coupon", require("./coupon"));
router.use("/cart", require("./cart"));
router.use("/order", require("./order"));
router.use("/educator", require("./educator"));
router.use("/eob", require("./expertOnBoard"));
module.exports = router;
