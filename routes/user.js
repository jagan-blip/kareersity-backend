const express = require("express");
const customerRoute = express.Router();
const customerConfigCntrl = require("../controllers/userConfig");
const common = require("../common/encDec");
const { postValidation } = require("../common/validation");
const multer = require("multer");
const {
  add_course_to_my_courses,
  listOfMyCourses,
  update_watched_history_of_my_course,
  my_course_Info,
  dashboardInfo,
} = require("../controllers/mainCourse");
const upload = multer({ dest: "uploads/" });
const storage = multer.memoryStorage();
const s3upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

customerRoute.post(
  "/contact_us",
  postValidation,
  customerConfigCntrl.contactUs
);

customerRoute.post("/register", postValidation, customerConfigCntrl.register);

customerRoute.get(
  "/activate_account/:token",
  customerConfigCntrl.verifyAccount
);

customerRoute.post("/login", postValidation, customerConfigCntrl.userLogin);

customerRoute.post(
  "/forgotPassword",
  postValidation,
  customerConfigCntrl.forgotPassword
);

customerRoute.post(
  "/confirmPassword",
  postValidation,
  customerConfigCntrl.confirmPasswordUser
);

customerRoute.get(
  "/resetPassword/:token",
  customerConfigCntrl.resetPasswordButton
);

//=========================================== Reason for Sign Up ==================================================

customerRoute.post(
  "/createReason",
  common.tokenMiddlewareAdmin,
  postValidation,
  customerConfigCntrl.creatReason
);
customerRoute.patch(
  "/editReason",
  common.tokenMiddlewareAdmin,
  postValidation,
  customerConfigCntrl.editReason
);
customerRoute.get("/reasons", customerConfigCntrl.reasons);

customerRoute.patch(
  "/personnelInfo",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.editUserPersonelProfile
);
customerRoute.patch(
  "/uploadPicture",
  common.tokenMiddlewareUser,
  s3upload.fields([{ name: "profilePic", maxCount: 1 }]),
  customerConfigCntrl.updateUserProfilePhoto
);
customerRoute.get(
  "/personnelInfo",
  common.tokenMiddlewareUser,
  customerConfigCntrl.fetchUserPersonelProfileAndPasswordInfo
);
customerRoute.patch(
  "/passwordInfo",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.editUserPassword
);

customerRoute.patch(
  "/addressInfo",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.editOrAddUserAddress
);

customerRoute.get(
  "/addressInfo",
  common.tokenMiddlewareUser,
  customerConfigCntrl.fetchUserAddress
);

customerRoute.patch(
  "/academicInfo",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.editOrAddUserAcademicInfo
);
customerRoute.get(
  "/academicInfo",
  common.tokenMiddlewareUser,
  customerConfigCntrl.fetchUserAcademicInfo
);

customerRoute.patch(
  "/professionalInfo",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.editOrAddUserProfessionalInfo
);
customerRoute.get(
  "/professionalInfo",
  common.tokenMiddlewareUser,
  customerConfigCntrl.fetchUserProfessionalInfo
);

customerRoute.get(
  "/dashboardProfileStatus",
  common.tokenMiddlewareUser,
  customerConfigCntrl.userProfileStatus
);

customerRoute.get("/dashboardInfo", common.tokenMiddlewareUser, dashboardInfo);

customerRoute.patch(
  "/wishlist_actions",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.AddToOrRemoveFromFavorite
);
customerRoute.get(
  "/wishlist",
  common.tokenMiddlewareUser,
  customerConfigCntrl.FavoriteList
);

customerRoute.get(
  "/cartNWishlistInfo",
  common.tokenMiddlewareUser,
  customerConfigCntrl.fetchUserCartAndFavoriteItems
);

customerRoute.get(
  "/notifications",
  common.tokenMiddlewareUser,
  customerConfigCntrl.ListOfUserNotifications
);

customerRoute.post(
  "/notification_is_read",
  common.tokenMiddlewareUser,
  customerConfigCntrl.userNotificationsIsRead
);

customerRoute.post(
  "/give_rating_and_reviews",
  common.tokenMiddlewareUser,
  postValidation,
  customerConfigCntrl.CreateRatingAndReviewsForCourse
);
customerRoute.post(
  "/existing_rating_and_reviews",
  common.tokenMiddlewareUser,
  customerConfigCntrl.ExistingRatingAndReviewsForCourse
);

customerRoute.post(
  "/add_course_to_my_courses",
  common.tokenMiddlewareUser,
  add_course_to_my_courses
);

customerRoute.get(
  "/my_course_Info/:purchasedCourseId",
  common.tokenMiddlewareUser,
  my_course_Info
);
customerRoute.post(
  "/update_watched_history_of_my_course",
  common.tokenMiddlewareUser,
  update_watched_history_of_my_course
);

customerRoute.get(
  "/list_of_my_courses",
  common.tokenMiddlewareUser,
  listOfMyCourses
);

customerRoute.post(
  "/exam/take_assessment",
  common.tokenMiddlewareUser,
  customerConfigCntrl.takeAssessment
);

customerRoute.get(
  "/exam/your_score/:sessionId",
  common.tokenMiddlewareUser,
  customerConfigCntrl.assessmentScore
);

customerRoute.post(
  "/exam/download_certificate",
  common.tokenMiddlewareUser,
  customerConfigCntrl.downloadCertificate
);

customerRoute.post(
  "/subscribe_our_newsletter",
  customerConfigCntrl.subscribeNL
);

customerRoute.get(
  "/newsletter_subscribers_list",
  common.tokenMiddlewareAdmin,
  customerConfigCntrl.subscribersListOfNewsLetter
);

module.exports = customerRoute;
