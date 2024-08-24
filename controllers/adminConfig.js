const admin = require("../models/admin");
const {
  encrypt,
  createPayloadAdmin,
  createPayloadSuperAdmin,
  createPayloadEducator,
  decrypt,
  createPayloadforAll,
} = require("../common/encDec");
const roleNPermissions = require("../models/roleNPermissions");
const { GeneratePassword } = require("../common/nommoc");
const nommoc = require("../common/nommoc");
const mongoose = require("mongoose");
const AdminRole = require("../models/role");
const EmailTempModel = require("../models/emailTemplates");
const role = require("../models/role");
const { SendSMail } = require("../common/aws");
const config = require("../nodedetails/config");
const { validateCSVData } = require("../common/validation");
const User = require("../models/user");
const fs = require("fs");
const csv = require("csv-parser");
const { Readable } = require("stream");
const CorporateModel = require("../models/corporates");
let jwtTokenSuperAdmin = config.jwtTokenSuperAdmin;
let jwtTokenAdmin = config.jwtTokenAdmin;
let jwtTokenEducator = config.jwtTokenEducator;
let jwtTokenNewRole = config.jwtTokenNewRole;
exports.register = (req, res) => {
  try {
    let data = req.body;
    // console.log(data,"data")
    let email = data.email.toLowerCase();

    let password = encrypt(GeneratePassword(12));

    admin.findOne({ email: email }, (err, check) => {
      if (!check) {
        role.findOne({ _id: data.roleId }, (err, exRole) => {
          if (exRole) {
            let regdata = {
              type: exRole.role.toLowerCase(),
              roleId: exRole._id,
              name: data.name,
              status: data.status,
              email: email,
              password: password,
            };
            admin.create(regdata, async (err1, resp) => {
              if (resp && resp.status == 0) {
                const exTemp = await EmailTempModel.findOne({
                  templateName:
                    "To send Login credentials from Kareersity for admin (Accessed by Admin)",
                });

                if (!exTemp) {
                  return res.json({
                    status: false,
                    message: "Template does not exist.!!!",
                  });
                }
                let dataToReplace = {
                  user: resp.name,
                  username: resp.email,
                  password: decrypt(resp.password),
                };
                let newTemp = nommoc.UpdateTemplate(exTemp, dataToReplace);
                const template = newTemp.body,
                  subject = newTemp.subject,
                  mail = [email];

                SendSMail(
                  subject,
                  template,
                  [resp.email],
                  config.krsAWSOptions.senderOrReplyTo,
                  config.krsAWSOptions.senderOrReplyTo
                )
                  .then((resp22) => {
                    return res.json({
                      status: true,
                      message:
                        "User successfully added! Credentials have been sent to the user's email address.",
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    return res.json({
                      status: false,
                      message: "Unable to send login Credentials.!!!",
                    });
                  });
              } else if (resp && resp.status == 1) {
                return res.json({
                  status: true,
                  message: "User added Successfully",
                });
              } else {
                console.log(err1);
                res.json({
                  status: false,
                  message: "Error Occur While adding new user",
                });
              }
            });
          } else {
            res.json({
              status: false,
              message: "Please select valid roleId!!!",
            });
          }
        });
      } else {
        res.json({ status: false, message: "Email Already Registered" });
      }
    });
  } catch (e) {
    console.log("Error catched in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.profile_info = (req, res) => {
  try {
    let userId = req.userId;
    // console.log(data,"data")

    admin.findOne({ _id: userId }, (err, exUser) => {
      if (exUser) {
        res.json({ status: true, data: exUser });
      } else {
        res.json({ status: false, message: "User does not exists" });
      }
    });
  } catch (e) {
    console.log("Error catched in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.login = (req, res) => {
  try {
    let data = req.body;
    let email = data.email.toLowerCase();
    let password = encrypt(data.password);

    admin.findOne({ email: email, password: password }, (err, getadmin) => {
      if (getadmin) {
        if (getadmin.status == 0) {
          AdminRole.findOne({ _id: getadmin.roleId }, (err1, exRole) => {
            if (exRole) {
              roleNPermissions.find({ roleId: exRole._id }, (err2, exPers) => {
                if (exPers) {
                  ///console.log(exRole,exPers,getadmin,"getadmin")
                  if (getadmin.type == "super_admin") {
                    let payload = createPayloadSuperAdmin(
                      encrypt(
                        getadmin._id.toString() + getadmin.roleId.toString()
                      ),
                      jwtTokenSuperAdmin,
                      "7d"
                    );

                    res.json({
                      status: true,
                      message: "Logged in successfully",
                      type: getadmin.type,
                      name: getadmin.name,
                      permissions: exPers,
                      origin: payload,
                    });
                  } else if (getadmin.type == "admin") {
                    let payload = createPayloadAdmin(
                      encrypt(
                        getadmin._id.toString() + getadmin.roleId.toString()
                      ),
                      jwtTokenAdmin,
                      "7d"
                    );

                    res.json({
                      status: true,
                      message: "Logged in successfully",
                      type: getadmin.type,
                      name: getadmin.name,
                      permissions: exPers,
                      origin: payload,
                    });
                  } else if (getadmin.type == "educator") {
                    let payload = createPayloadEducator(
                      encrypt(
                        getadmin._id.toString() + getadmin.roleId.toString()
                      ),
                      jwtTokenEducator,
                      "7d"
                    );

                    res.json({
                      status: true,
                      message: "Logged in successfully",
                      type: getadmin.type,
                      name: getadmin.name,
                      permissions: exPers,
                      isNewEducator: getadmin.isNewLogin,
                      origin: payload,
                    });
                  } else if (
                    exPers &&
                    getadmin.type.toLowerCase() == exRole.role.toLowerCase()
                  ) {
                    let payload = createPayloadforAll(
                      encrypt(
                        getadmin._id.toString() + getadmin.roleId.toString()
                      ),
                      jwtTokenNewRole,
                      "7d"
                    );

                    res.json({
                      status: true,
                      message: "Logged in successfully",
                      type: getadmin.type,
                      name: getadmin.name,
                      permissions: exPers,
                      origin: payload,
                    });
                  }
                } else {
                  res.json({
                    status: false,
                    message: "User has not permissions...!",
                  });
                }
              });
            } else {
              res.json({ status: false, message: "Invalid admin role...!!!" });
            }
          });
        } else {
          res.json({
            status: false,
            message: "Your account has been de-activated by admin",
          });
        }
      } else {
        res.json({ status: false, message: "Invalid login credentials" });
      }
    });
  } catch (e) {
    console.log("Error catched in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.login = (req, res) => {
//     try {
//         let data = req.body;
//         let email = data.email.toLowerCase();
//         let password = encrypt(data.password);

//         admin.findOne({ "email": email, "password": password }, (err, getadmin) => {

//             if (getadmin) {
//                 if (getadmin.status == 0) {
//                     AdminRole.findOne({ "_id": getadmin.roleId }, (err1, exRole) => {
//                         if (exRole) {
//                             roleNPermissions.find({ "roleId": exRole._id }, (err2, exPers) => {
//                                 if (exPers) {

//                                     if (exPers && (getadmin.type).toLowerCase() == (exRole.role).toLowerCase()) {

//                                         let dbSecret = nommoc.decrypt(exRole.secret)

//                                         console.log(dbSecret)

//                                         let payload = createPayloadforAll(encrypt(getadmin._id.toString() + getadmin.roleId.toString()), dbSecret, "60m");

//                                         res.json({ "status": true, "message": "Logged in successfully", "type": getadmin.type, "name": getadmin.name, "permissions": exPers, "origin": payload })
//                                     }
//                                 } else {
//                                     res.json({ "status": false, "message": "User has not permissions...!" })
//                                 }
//                             })
//                         } else {
//                             res.json({ "status": false, "message": "Invalid admin role...!!!" })
//                         }
//                     })

//                 } else {
//                     res.json({ "status": false, "message": "Your account has been de-activated by admin" })
//                 }
//             } else {

//                 res.json({ "status": false, "message": "Invalid login credentials" })
//             }
//         })
//     } catch (e) {
//         console.log("Error catched in login", e);
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
//     }
// }

exports.changePasswordEducator = (req, res) => {
  try {
    let data = req.body;
    let id = req.userId;

    if (data && data.newPassword != data.confirmPassword) {
      return res.json({ status: false, message: "Password does not match" });
    }
    let password = encrypt(data.confirmPassword);
    admin.findById(id, (err, exEdu) => {
      if (exEdu) {
        admin.findByIdAndUpdate(
          id,
          { password: password, isNewLogin: false },
          { new: true },
          (err, updEdu) => {
            if (updEdu) {
              res.json({
                status: true,
                message: "Password updated successfully",
                type: updEdu,
              });
            } else {
              res.json({
                status: false,
                message: "Failed to update password.",
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: "Account does not exists" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//====================================== User Managementand Roles and Permissions ======================
exports.addAdminRole = async (req, res) => {
  try {
    const data = req.body;

    const existingRole = await AdminRole.findOne({
      role: data.role.toLowerCase().replace(/\s/g, "_"),
    });

    if (existingRole) {
      return res.json({
        status: false,
        message: "This role already exists!!!",
      });
    }
    let jwtTokenSecret = GeneratePassword(15);
    data.secret = nommoc.encrypt(
      "KaReErSiTy" +
        data.role.substring(0, 5).replace(/\s/g, "_") +
        jwtTokenSecret
    );
    data.role = data.role.toLowerCase().replace(/\s/g, "_");
    const newRole = await AdminRole.create(data);
    let prsData = [
      {
        roleId: newRole._id,
        section: "category",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "courses",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "subscription_plan",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "listen_to_experts",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "learners",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "educators",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "blog",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "jobs",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "testimonial",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "video_testimonial",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "faq",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "ratings_and_reviews",
        permissions: [],
      },
      {
        roleId: newRole._id,
        section: "coupons",
        permissions: [],
      },
    ];

    if (data && data.role == "super_admin") {
      prsData.push(
        {
          roleId: newRole._id,
          section: "dashboard",
          permissions: [],
        },
        {
          roleId: newRole._id,
          section: "purchase_history",
          permissions: [],
        },
        {
          roleId: newRole._id,
          section: "user_management",
          permissions: [],
        }
      );
    }
    let newPermissions = await roleNPermissions.insertMany(prsData);
    if (!newPermissions) {
      return res.json({
        status: false,
        message: "Error occurred while creating",
      });
    }

    if (newRole) {
      return res.json({
        status: true,
        message: "Added successfully",
        data: newRole,
      });
    } else {
      return res.json({
        status: false,
        message: "Error occurred while creating",
      });
    }
  } catch (e) {
    console.error("Error caught in addAdminRole", e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.deleteAdminRole = (req, res) => {
  try {
    let { roleId } = req.body;

    AdminRole.findByIdAndRemove(roleId, { new: true }, (err1, deletedRole) => {
      if (deletedRole) {
        roleNPermissions.deleteMany(
          { roleId },
          { new: true },
          (err1, deletedPrs) => {
            if (deletedPrs) {
              res.json({ status: true, message: "Deleted successfully" });
            } else {
              res.json({ status: false, message: "Role does not exist!!" });
            }
          }
        );
      } else {
        res.json({ status: false, message: "Role does not exist!!" });
      }
    });
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.List_Of_admin_roles = (req, res) => {
  try {
    AdminRole.find({}, { _id: 1, role: 1, isActive: 1 }, (err, exRoles) => {
      if (err) {
        res.json({ status: false, message: "Unable to find Roles  !!!" });
      } else {
        res.json({ status: true, data: exRoles });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.addAdminUsers = (req, res) => {
  try {
    let data = req.body;
    AdminRole.findOne({ _id: data.roleId }, (err, exRoles) => {
      if (err) {
        res.json({ status: false, message: "Invalid roleId  !!!" });
      } else {
        admin.findOne({ email: data.email }, (err, user) => {
          if (user) {
            return res.json({ status: false, message: "User already exists" });
          } else {
            admin.create(
              {
                name: data.username,
                email: data.email,
                status: data.status,
                type: exRoles.role.toLowerCase(),
                roleId: data.roleId,
              },
              (err1, newUser) => {
                if (newUser) {
                  res.json({
                    status: true,
                    message: "User added successfully",
                    data: newUser,
                  });
                } else {
                  res.json({
                    status: false,
                    message: "Error occurred while adding the user",
                    error:
                      err1 &&
                      err1.errors &&
                      err1.errors.type &&
                      err1.errors.type.properties,
                  });
                }
              }
            );
          }
        });
      }
    });
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.deleteAdminUsers = (req, res) => {
  try {
    let { adminId } = req.body;

    admin.findByIdAndRemove(adminId, { new: true }, (err1, updatedUser) => {
      if (updatedUser) {
        res.json({ status: true, message: "User removed successfully" });
      } else {
        res.json({ status: false, message: "User does not exist!!" });
      }
    });
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.changeAdminUserStatus = (req, res) => {
  try {
    let { adminId } = req.body;

    admin.findByIdAndUpdate(
      adminId,
      { new: true },
      async (err1, updatedUser) => {
        if (updatedUser && updatedUser.status == 1) {
          let password = encrypt(GeneratePassword(12));
          updatedUser.password = password;
          updatedUser.status = 0;
          updatedUser.save();

          const message = `${
            updatedUser.name
          }, use the following credentials to login your account\n
                    User Name : ${updatedUser.email}\n,
                    Password : ${decrypt(updatedUser.password)}\n`;

          const exTemp = await EmailTempModel.findOne({
            templateName:
              "To send Login credentials from Kareersity for admin (Accessed by Admin)",
          });

          if (!exTemp) {
            return res.json({
              status: false,
              message: "Template does not exist.!!!",
            });
          }
          let dataToReplace = {
            user: updatedUser.name,
            username: updatedUser.email,
            password: decrypt(updatedUser.password),
          };
          let newTemp = nommoc.UpdateTemplate(exTemp, dataToReplace);
          const template = newTemp.body,
            subject = newTemp.subject;

          SendSMail(
            subject,
            template,
            [updatedUser.email],
            config.krsAWSOptions.senderOrReplyTo,
            config.krsAWSOptions.senderOrReplyTo
          )
            .then((resp) => {
              return res.json({
                status: true,
                message: "User account activated successfully",
              });
            })
            .catch((err) => {
              console.error(err);
              return res.json({
                status: false,
                message: "Unable to activate user account.!!!",
              });
            });
        } else if (updatedUser && updatedUser.status == 0) {
          updatedUser.status = 1;
          updatedUser.save();
          res.json({
            status: true,
            message: "User account de-activated successfully",
          });
        } else {
          res.json({
            status: false,
            message: "Unable to update account status !!!",
          });
        }
      }
    );
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.list_Of_admin_users = (req, res) => {
  try {
    let data = req.body;

    admin.find(
      {
        name: new RegExp(data.username, "i"),
        type: new RegExp(data.type, "i"),
      },
      (err, users) => {
        if (users) {
          // const decryptedUsers = users.map(user => {
          //     user.email = decrypt(user.email);
          //     return user;
          // });

          res.json({ status: true, data: users });
        } else {
          res.json({ status: false, message: "User not found" });
        }
      }
    );
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.createPermissions = (req, res) => {
  try {
    let data = req.body;
    let section = data.section.toLowerCase();
    //"dashboard","category","courses","listen_to_experts","learners","educators","blog","testimonial","faq","user_management"
    roleNPermissions.findOne(
      { roleId: data.roleId, section: section },
      (err, exPermission) => {
        if (!exPermission) {
          roleNPermissions.create(data, (err1, newPermissions) => {
            if (newPermissions) {
              res.json({
                status: true,
                message: "Permissions created successfully",
                data: newPermissions,
              });
            } else {
              res.json({
                status: false,
                message: "Error occurred while creating the permission",
                error: err1,
              });
            }
          });
        } else {
          res.json({
            status: false,
            message: `${exPermission.section} permissions already added`,
          });
        }
      }
    );
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.assignPermissions = (req, res) => {
  try {
    let data = req.body;

    roleNPermissions.findById(data._id, (err, exPermissions) => {
      if (exPermissions) {
        let newPers = [];
        if (exPermissions && data.permissions.includes("view")) {
          newPers = data.permissions;
        } else if (exPermissions && data.permissions.includes("edit")) {
          newPers = ["view", "edit"];
        } else if (exPermissions && data.permissions.includes("delete")) {
          newPers = ["view", "delete"];
        }
        roleNPermissions.findByIdAndUpdate(
          exPermissions._id,
          { permissions: newPers },
          { new: true },
          (err1, newPermissions) => {
            if (newPermissions) {
              res.json({
                status: true,
                message: "Permissions changed successfully",
                data: newPermissions,
              });
            } else {
              res.json({
                status: false,
                message: "Error occurred while updating the Permissions",
              });
            }
          }
        );
      } else {
        res.json({
          status: false,
          message: "Error occurred while updating the Permissions",
        });
      }
    });
  } catch (e) {
    console.log("Error caught in login", e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.admin_roles_and_permissions = (req, res) => {
  try {
    let roleId = req.body.roleId;

    roleNPermissions.find({ roleId }, (err, exPermission) => {
      if (exPermission) {
        res.json({ status: true, data: exPermission });
      } else {
        res.json({
          status: false,
          message: "Unable to find Roles and permissions !!!",
        });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.authorizeAccess = (section, permission) => {
  return (req, res, next) => {
    roleNPermissions.findOne(
      { roleId: req.roleId, section: section },
      (err, exPermission) => {
        if (exPermission) {
          const uniquePermissions = [...new Set(exPermission.permissions)];

          if (uniquePermissions && uniquePermissions.includes(permission)) {
            next();
          } else {
            res.json({ status: false, message: "Access denied" });
          }
        } else {
          res.json({ status: false, message: "Access denied" });
        }
      }
    );
  };
};

//====================================== Email templates ======================================================

exports.addEmailTemplate = async (req, res) => {
  try {
    const { templateName, subject, body } = req.body;

    // console.log('Received data:', templateName, subject, body,req);

    const exTemp = await EmailTempModel.findOne({ templateName: templateName });

    if (exTemp) {
      return res.json({
        status: false,
        message: "Template already exists with this name.!!!",
      });
    }

    const newTemplate = new EmailTempModel({ templateName, subject, body });

    const savedTemplate = await newTemplate.save();

    if (!savedTemplate) {
      return res.json({ status: false, message: "Something went wrong.!!!" });
    }

    return res.json({ status: true, message: "Added successfully." });
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.json({ status: false, message: error.message });
  }
};
exports.editEmailTemplate = async (req, res) => {
  try {
    const { tempId, tempName, subject, body } = req.body;

    const exTemp = await EmailTempModel.findOne({
      $or: [{ _id: tempId }, { templateName: tempName }],
    });

    if (!exTemp) {
      return res.json({
        status: false,
        message: "Template does not exist.!!!",
      });
    }
    const updateTemp = await EmailTempModel.findByIdAndUpdate(
      exTemp._id,
      { templateName: tempName, subject: subject, body: body },
      { new: true }
    );
    if (!updateTemp) {
      return res.json({ status: false, message: "Unable to update.!!!" });
    }
    return res.json({
      status: true,
      message: "Updated successfully.",
      data: updateTemp,
    });
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.json({ status: false, message: error.message });
  }
};
exports.findEmailTemplate = async (req, res) => {
  try {
    const data = req.body;

    const savedTemplate = await EmailTempModel.find(data);

    if (!savedTemplate) {
      return res.json({
        status: false,
        message: "The record does not exist.!!!",
      });
    }

    return res.json({ status: true, data: savedTemplate });
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.json({ message: "Internal server error" });
  }
};

exports.getAllEmailTemplates = async (req, res) => {
  try {
    const data = req.body;

    const savedTemplate = await EmailTempModel.find({});

    return res.json({ status: true, data: savedTemplate });
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.json({ message: "Internal server error" });
  }
};
const UpdateTemplate = (template, data) => {
  const templateCopy = JSON.parse(JSON.stringify(template));
  const textToReplace = templateCopy.body;

  const ReplacePlaceholders = (text, data) => {
    const placeholderRegex = /\\?\${([\w\d]+)}/g;

    const replacedText = text.replace(placeholderRegex, (match, key) => {
      return data[key] || match;
    });

    return replacedText;
  };
  const replacedText = ReplacePlaceholders(textToReplace, data);

  templateCopy.body = replacedText;

  return templateCopy;
};
exports.uploadCSVBulk = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { corporateId } = req.query;
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: "No file uploaded" });
    }

    if (!corporateId) {
      return res.status(400).send({
        status: false,
        message: "CorporateId is required",
      });
    }

    // Parse CSV file from buffer
    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        // Validate CSV data
        const validationErrors = validateCSVData(results);

        if (validationErrors.length > 0) {
          return res.status(400).json({
            status: false,
            message: "CSV validation failed",
            errors: validationErrors,
          });
        }
        let emails = results.map((userData) => userData?.email);
        let users_already_exists = await User.find({
          email: { $in: emails },
          isAccountVerified: true,
        });

        if (users_already_exists?.length > 0) {
          return res.status(400).json({
            status: false,
            message: "Some or All users already exists",
          });
        }
        await User.deleteMany({ email: { $in: emails } });
        // Register users in bulk
        let user_email_data = [];
        const usersToRegister = results.map((userData) => {
          let password = GeneratePassword(12);
          let encrypted_password = nommoc.encrypt(password);
          let dataToReplace = {
            user: userData?.fullName,
            email: userData?.email,
            password: password,
            phoneNumber: userData?.phoneNumber,
            encrypted_password: encrypted_password,
            fullName: userData?.fullName,
          };
          user_email_data.push(dataToReplace);
          return new User({
            email: userData?.email,
            fullName: userData?.fullName,
            phoneNumber: userData?.phoneNumber,
            userType: "corporate",
            corporate: corporateId,
            isAccountVerified: true,
            password: encrypted_password,
          });
        });

        // Use insertMany to save all users in one operation
        await session.startTransaction();

        const exTemp = await EmailTempModel.findOne({
          templateName: "Credentials mail for corporate users",
        });

        if (!exTemp) {
          await session.abortTransaction();
          return res.json({
            status: false,
            message: "Template does not exist.!!!",
          });
        }

        await User.insertMany(usersToRegister);
        // await User.insertMany(usersToRegister);
        const EmailPromises = [];
        for (let i = 0; i < user_email_data?.length; i++) {
          let userData = user_email_data[i];

          let newTemp = UpdateTemplate(exTemp, userData);
          const template = newTemp.body;
          const subject = newTemp.subject;

          // Send email

          EmailPromises.push(
            SendSMail(
              subject,
              template,
              [userData.email],
              config.krsAWSOptions.senderOrReplyTo,
              config.krsAWSOptions.senderOrReplyTo
            )
          );
        }

        // Wait for all update and email promises to resolve
        await Promise.all(EmailPromises);
        await session.commitTransaction();
        // Send response
        return res.json({
          status: true,
          message: `${usersToRegister.length} users registered successfully`,
        });
      });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error uploading CSV", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.createCorporate = async (req, res) => {
  try {
    const { corporateName, corporateCode } = req.body;
    if (!corporateCode || !corporateName) {
      return res.status(400).send({
        message: "corporate name and corporate code is required",
      });
    }

    if (corporateCode?.length !== 5) {
      return res.status(400).send({
        error: "corporate code must be 5 letters",
      });
    }
    let new_corporate = new CorporateModel({
      corporateName: corporateName,
      corporateCode: corporateCode,
    });

    await new_corporate.save();
    return res.status(200).send({
      status: true,
      message: `Corporate added`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

exports.editCorporate = async (req, res) => {
  try {
    const { corporateCode, corporateName, corporateId } = req.body;
    if (!corporateId) {
      return res.status(400).send({
        status: false,
        message: "corporateId is required",
      });
    }
    let obj = Object.assign(
      {},
      corporateCode && { corporateCode: corporateCode },
      corporateName && { corporateName: corporateName }
    );

    let updated_corporate = await CorporateModel.findOneAndUpdate(
      { _id: corporateId },
      obj,
      { new: true, upsert: false }
    );

    if (!updated_corporate) {
      return res.status(404).send({
        status: false,
        message: "corporate not found",
      });
    }
    return res.status(200).send({
      status: true,
      message: "updated corporate information",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

exports.deleteCorporate = async (req, res) => {
  try {
    const { corporateId } = req.body;
    if (!corporateId) {
      return res.status(400).send({
        status: false,
        message: "corporateId is required",
      });
    }

    let updated_corporate = await CorporateModel.findOneAndUpdate(
      { _id: corporateId },
      { isDeleted: true },
      { new: true, upsert: false }
    );

    if (!updated_corporate) {
      return res.status(404).send({
        status: false,
        message: "corporate not found",
      });
    }
    return res.status(200).send({
      status: true,
      message: "deleted corporate",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

exports.getAllCorporates = async (req, res) => {
  try {
    const { name } = req.query;
    let all_corporates = await CorporateModel.find({
      isDeleted: false,
      corporateName: new RegExp(name, "i"),
    });

    return res.status(200).send({
      status: true,
      corporates: all_corporates,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
