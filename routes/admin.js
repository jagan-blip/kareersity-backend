const express = require("express");
const route = express.Router();
const {
  register,
  login,
  addAdminUsers,
  createPermissions,
  assignPermissions,
  authorizeAccess,
  changePasswordEducator,
  list_Of_admin_users,
  deleteAdminUsers,
  changeAdminUserStatus,
  admin_roles_and_permissions,
  List_Of_admin_roles,
  addAdminRole,
  deleteAdminRole,
  profile_info,
  addEmailTemplate,
  findEmailTemplate,
  editEmailTemplate,
  uploadCSVBulk,
  createCorporate,
  editCorporate,
  deleteCorporate,
  getAllCorporates,
  getAllEmailTemplates,
} = require("../controllers/adminConfig");
const { postValidation } = require("../common/validation");
const { tokenMiddlewareAdmin } = require("../common/encDec");
const {
  listOfNotificationsForAdminUsers,
} = require("../common/adminNotification");
const { adminDashboardInfo } = require("../controllers/mainCourse");
const multer = require("multer");
const upload = multer();

route.post("/signUp", postValidation, register);

route.post("/signIn", postValidation, login);

route.get(
  "/notifications",
  tokenMiddlewareAdmin,
  listOfNotificationsForAdminUsers
);

route.post(
  "/add_email_template",
  upload.none(),
  postValidation,
  addEmailTemplate
);

route.patch("/edit_email_template", postValidation, editEmailTemplate);

route.post("/fetch_email_template", findEmailTemplate);
route.post("/get_all_email_template", getAllEmailTemplates);
route.get(
  "/profile_info",
  tokenMiddlewareAdmin,
  authorizeAccess("dashboard", "view"),
  profile_info
);

route.get(
  "/dashboard_info",
  tokenMiddlewareAdmin,
  authorizeAccess("dashboard", "view"),
  adminDashboardInfo
);

route.patch(
  "/changePassword",
  tokenMiddlewareAdmin,
  postValidation,
  changePasswordEducator
);

route.post(
  "/add_admin_role",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  postValidation,
  addAdminRole
);
route.get(
  "/list_of_admin_roles",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "view"),
  List_Of_admin_roles
);
route.post(
  "/delete_admin_role",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "delete"),
  postValidation,
  deleteAdminRole
);

route.post(
  "/add_admin_users",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  postValidation,
  addAdminUsers
);
route.patch(
  "/change_admin_user_status",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  postValidation,
  changeAdminUserStatus
);
route.post(
  "/delete_admin_user",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "delete"),
  postValidation,
  deleteAdminUsers
);
route.post(
  "/list_Of_admin_users",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "view"),
  list_Of_admin_users
);
route.post(
  "/create_permissions",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  postValidation,
  createPermissions
);
route.post(
  "/admin_roles_and_permissions",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "view"),
  admin_roles_and_permissions
);

route.patch(
  "/assign_permissions",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  postValidation,
  assignPermissions
);

route.post(
  "/uploadCorporateUsers",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  upload.single("file"),
  uploadCSVBulk
);

route.post(
  "/createCorporate",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  createCorporate
);

route.post(
  "/editCorporate",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  editCorporate
);

route.post(
  "/deleteCorporate",
  tokenMiddlewareAdmin,
  authorizeAccess("user_management", "edit"),
  deleteCorporate
);

route.post("/getCorporates", getAllCorporates);
module.exports = route;
