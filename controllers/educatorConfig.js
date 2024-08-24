const educatorModel = require("../models/educator");
const { encrypt, decrypt } = require("../common/encDec");
const { GeneratePassword, UpdateTemplate } = require("../common/nommoc");
const { fileUpload, SendSMail } = require("../common/aws");
const admin = require("../models/admin");
const AdminRole = require("../models/role");
const EmailTempModel = require("../models/emailTemplates");
const config = require("../nodedetails/config");
// ==================================== educator Login/SignUp API ========================================

exports.signUp = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      city,
      expertise,
      designation,
      description,
    } = req.body;
    const cvUrlFile = req.files["cvUrl"] ? req.files["cvUrl"][0] : null;
    const course1UrlFile = req.files["course1Url"]
      ? req.files["course1Url"][0]
      : null;
    const course2UrlFile = req.files["course2Url"]
      ? req.files["course2Url"][0]
      : null;
    const photo2UrlFile = req.files["photoUrl"]
      ? req.files["photoUrl"][0]
      : null;

    let exEduca = await educatorModel.findOne({
      $or: [{ phoneNumber: phoneNumber }, { email: email }],
    });

    if (exEduca && exEduca.phoneNumber == phoneNumber) {
      return res.json({
        status: false,
        message: `Mobile number already exists`,
      });
    } else if (exEduca && exEduca.email == email) {
      return res.json({ status: false, message: `Email Id already exists` });
    }

    if (!cvUrlFile || !course1UrlFile || !course2UrlFile || !photo2UrlFile) {
      res.json({ status: false, message: "Please provide all file inputs" });
      return;
    }

    const uploadPromises = [
      new Promise((resolve) => {
        fileUpload(cvUrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message: "Error occurred while uploading CV, please try again",
            });
            return;
          }
        });
      }),
      new Promise((resolve) => {
        fileUpload(course1UrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading sample course 1, please try again",
            });
            return;
          }
        });
      }),
      new Promise((resolve) => {
        fileUpload(course2UrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading sample course 2, please try again",
            });
            return;
          }
        });
      }),
      new Promise((resolve) => {
        fileUpload(photo2UrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading sample course 2, please try again",
            });
            return;
          }
        });
      }),
    ];

    const [cvUrl, course1Url, course2Url, photoUrl] = await Promise.all(
      uploadPromises
    );

    const newEdu = new educatorModel({
      photoUrl,
      name,
      email,
      phoneNumber,
      city,
      expertise,
      cvUrl,
      course1Url,
      course2Url,
      designation,
      description,
    });

    newEdu.save((err, neweducator) => {
      if (neweducator) {
        res.json({
          status: true,
          message: "You have registered successfully",
          data: neweducator,
        });
      } else {
        res.json({
          status: false,
          message: "Please try after some time",
          error: err,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.editEducatorProfile = async (req, res) => {
  try {
    const eduId = req.params.id;
    const {
      name,
      email,
      phoneNumber,
      city,
      expertise,
      designation,
      description,
    } = req.body;
    const photoUrlFile = req.files["photoUrl"]
      ? req.files["photoUrl"][0]
      : null;
    const cvUrlFile = req.files["cvUrl"] ? req.files["cvUrl"][0] : null;
    const course1UrlFile = req.files["course1Url"]
      ? req.files["course1Url"][0]
      : null;
    const course2UrlFile = req.files["course2Url"]
      ? req.files["course2Url"][0]
      : null;

    let photoUrl, cvUrl, course1Url, course2Url;

    if (photoUrlFile) {
      photoUrl = await new Promise((resolve) => {
        fileUpload(photoUrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading profile photo, please try again",
            });
            return;
          }
        });
      });
    }
    if (cvUrlFile) {
      cvUrl = await new Promise((resolve) => {
        fileUpload(cvUrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message: "Error occurred while uploading CV, please try again",
            });
            return;
          }
        });
      });
    }
    if (course1UrlFile) {
      course1Url = await new Promise((resolve) => {
        fileUpload(course1UrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading sample course 1, please try again",
            });
            return;
          }
        });
      });
    }
    if (course2UrlFile) {
      course2Url = await new Promise((resolve) => {
        fileUpload(course2UrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading sample course 2, please try again",
            });
            return;
          }
        });
      });
    }

    const updatedEducator = await educatorModel.findByIdAndUpdate(
      eduId,
      {
        name,
        email,
        phoneNumber,
        city,
        expertise,
        designation,
        description,
        photoUrl,
        cvUrl,
        course1Url,
        course2Url,
      },
      { new: true }
    );

    if (updatedEducator) {
      res.json({
        status: true,
        message: "Educator profile updated successfully",
        data: updatedEducator,
      });
    } else {
      res.json({ status: false, message: "Please try after some time" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.generate_login_credential = async (req, res) => {
  try {
    let { eduId } = req.body;

    let findeducator = await educatorModel.findById(eduId);

    if (!findeducator) {
      return res.json({ status: false, message: "educator does not exists" });
    }
    let checkExEducator = await admin.findOne({
      email: findeducator.email.toLowerCase(),
    });

    if (checkExEducator) {
      return res.json({
        status: false,
        message: "You have already generated credentials for this user",
        email: checkExEducator.email,
        password: decrypt(checkExEducator.password),
      });
    }

    let fetchRole4Edu = await AdminRole.findOne({ role: "educator" });

    if (!fetchRole4Edu) {
      return res.json({
        status: false,
        message: "Educator role does not exist...!!!",
      });
    }

    let password = encrypt(GeneratePassword(10));
    let email = findeducator.email.toLowerCase();

    let adminEducator = await admin.create({
      name: findeducator.name,
      type: "educator",
      email: email,
      roleId: fetchRole4Edu._id,
      password: password,
      status: 0,
    });

    if (adminEducator) {
      return res.json({
        status: true,
        message: "Educator  credentials generated successfully",
        data: adminEducator,
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to generate educator credentials",
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    let { eduId, status } = req.body;

    let findeducator = await educatorModel.findById(eduId);

    if (!findeducator) {
      return res.json({ status: false, message: "educator does not exists" });
    }

    let checkExEducator = await admin.findOne({ email: findeducator.email });
    // 0->active 1-> inactive

    let updateStatus = status.toLowerCase();
    //console.log(checkExEducator)
    if (checkExEducator && updateStatus == "rejected") {
      await admin.findOneAndDelete({ email: findeducator.email });
      findeducator.isVerified = false;
      await findeducator.save();
    } else if (checkExEducator && updateStatus == "inactive") {
      checkExEducator.status = 1;
      await checkExEducator.save();
    }
    //console.log(checkExEducator)
    let updateeducator = await educatorModel
      .findByIdAndUpdate(eduId, { status: updateStatus }, { new: true })
      .select({ _id: 1, name: 1, status: 1, isVerified: 1 });
    //console.log(updateeducator)
    if (updateeducator) {
      return res.json({
        status: true,
        message: "Educator  status changed successfully",
        data: updateeducator,
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to change educator status",
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.approveEducator = async (req, res) => {
  try {
    let { eduId } = req.body;
    let findeducator = await educatorModel.findById(eduId);

    if (!findeducator) {
      return res.json({ status: false, message: "Educator does not exist" });
    } else if (findeducator.status == "inActive") {
      return res.json({
        status: false,
        message: "Please mark educator's status as active.!!!",
      });
    }

    let checkExEducator = await admin.findOne({
      email: findeducator.email.toLowerCase(),
    });

    if (checkExEducator) {
      findeducator.isVerified = true;
      findeducator.save();
      return res.json({
        status: true,
        message: "You have already generated credentials for this user",
        email: checkExEducator.email,
        password: decrypt(checkExEducator.password),
      });
    }
    if (checkExEducator && findeducator.isVerified) {
      return res.json({ status: false, message: "Educator already approved" });
    }

    let fetchRole4Edu = await AdminRole.findOne({ role: "educator" });

    if (!fetchRole4Edu) {
      return res.json({
        status: false,
        message: "Educator role does not exist...!!!",
      });
    }

    let password = encrypt(GeneratePassword(10));
    let email = findeducator.email.toLowerCase();

    let adminEducator = await admin.create({
      name: findeducator.name,
      type: "educator",
      roleId: fetchRole4Edu._id,
      email: email,
      password: password,
      status: 0,
    });

    if (adminEducator) {
      let updateeducator = await educatorModel
        .findByIdAndUpdate(eduId, { isVerified: true }, { new: true })
        .select({ _id: 1, name: 1, isVerified: 1 });

      if (updateeducator) {
        const exTemp = await EmailTempModel.findOne({
          templateName:
            "To send Login credentials from KareerSity for Educator (Accessed by Educator)",
        });

        if (!exTemp) {
          return res.json({
            status: false,
            message: "Template does not exist.!!!",
          });
        }
        let dataToReplace = {
          user: adminEducator.name,
          username: adminEducator.email,
          password: decrypt(adminEducator.password),
        };
        let newTemp = UpdateTemplate(exTemp, dataToReplace);
        const template = newTemp.body,
          subject = newTemp.subject;

        SendSMail(
          subject,
          template,
          [adminEducator.email],
          config.krsAWSOptions.senderOrReplyTo,
          config.krsAWSOptions.senderOrReplyTo
        )
          .then(() => {
            return res.json({
              status: true,
              message:
                "Educator has been approved and login credentials have been sent successfully to educator!",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.json({
              status: false,
              message: "Unable to send educator credentials",
            });
          });
      } else {
        return res.json({
          status: false,
          message: "Unable to approve educator",
        });
      }
    } else {
      return res.json({
        status: false,
        message: "Unable to generate educator credentials",
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.deleteEducator = async (req, res) => {
  try {
    let { eduId } = req.body;

    let findeducator = await educatorModel.findById(eduId);

    if (!findeducator) {
      return res.json({ status: false, message: "Educator does not exists" });
    }

    let updateeducator = await educatorModel
      .findByIdAndDelete(eduId, { new: true })
      .select({ _id: 1, name: 1 });

    if (updateeducator) {
      return res.json({
        status: true,
        message: "Educator profile has deleted successfully",
        data: updateeducator,
      });
    } else {
      return res.json({
        status: false,
        message: "failed to delete educator profile",
      });
    }
  } catch (e) {
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.educatorInfo = (req, res) => {
  try {
    let eduId = req.params.eduId;

    educatorModel.findById(eduId, (err, eduInfo) => {
      if (eduInfo) {
        return res.json({
          status: true,
          message: "Educator  detail",
          data: eduInfo,
        });
      } else {
        return res.json({
          status: false,
          message: "Unable to find educator detail",
        });
      }
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.educatorInfoByEmail = (req, res) => {
  try {
    let email = req.body.email;

    educatorModel.findOne({ email }, (err, eduInfo) => {
      if (eduInfo) {
        return res.json({
          status: true,
          message: "Educator  detail",
          data: eduInfo,
        });
      } else {
        return res.json({
          status: false,
          message: "Unable to find educator detail",
        });
      }
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.educators = (req, res) => {
  try {
    educatorModel
      .find({})
      .select({
        _id: 1,
        name: 1,
        photoUrl: 1,
        phoneNumber: 1,
        email: 1,
        isVerified: 1,
        status: 1,
        cvUrl: 1,
      })
      .sort({ createdAt: -1 })
      .exec((err, educators) => {
        if (educators) {
          res.send({
            status: true,
            message: `${educators.length} educator(s) found`,
            data: educators,
          });
        } else {
          res.json({ status: false, message: "No educators found" });
        }
      });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.verifiedEducators = (req, res) => {
  try {
    educatorModel
      .find({ isVerified: true })
      .select({
        _id: 1,
        name: 1,
        phoneNumber: 1,
        email: 1,
        isVerified: 1,
        status: 1,
        cvUrl: 1,
      })
      .exec((err, educators) => {
        if (educators) {
          res.send({
            status: true,
            message: `${educators.length} educator(s) found`,
            data: educators,
          });
        } else {
          res.json({ status: false, message: "No educators found" });
        }
      });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.ActiveEducators = (req, res) => {
  try {
    educatorModel
      .find({ status: /\bActive\b/i, isVerified: true })
      .select({
        _id: 1,
        name: 1,
        phoneNumber: 1,
        email: 1,
        isVerified: 1,
        status: 1,
        cvUrl: 1,
      })
      .sort({ createdAt: -1 })
      .exec((err, educators) => {
        if (educators) {
          res.send({
            status: true,
            message: `${educators.length} educator(s) found`,
            data: educators,
          });
        } else {
          res.json({ status: false, message: "No educators found" });
        }
      });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.searchEducators = (req, res) => {
  let { search, page } = req.query;
  let paginate = 5;
  let query = [
    { name: new RegExp(search, "i") },
    { email: new RegExp(search, "i") },
  ];

  educatorModel
    .countDocuments({ $or: query })
    .then((resp) => {
      educatorModel
        .find({ $or: query })
        .select({ _id: 1, name: 1, email: 1 })
        .sort({ createdAt: -1 })
        .skip(parseInt((page - 1) * paginate))
        .limit(paginate)
        .then((resp1) => {
          let noOfPage = Math.ceil(resp / paginate);
          res.json({
            status: true,
            message: `${resp} educator(s) found`,
            noOfPages: noOfPage,
            data: resp1,
          });
        })
        .catch((err) => {
          res.json({
            status: false,
            message: "Error occurred while finding educators",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: false,
        message: "Error occurred while finding educators",
      });
    });
};

exports.sendEmailToEducators = async (req, res) => {
  const { selectedEducatorIds, subject, message } = req.body;

  if (!selectedEducatorIds || selectedEducatorIds.length === 0) {
    return res.json({
      status: false,
      message: "Please select at least one educator",
    });
  }

  try {
    const educators = await educatorModel
      .find({ _id: { $in: selectedEducatorIds } })
      .select({ name: 1, email: 1 });

    if (educators && educators.length > 0) {
      for (const educator of educators) {
        try {
          if (subject && message) {
            const exTempwithMessage = await EmailTempModel.findOne({
              templateName: "To send mails to learners (Accessed by User)",
            });

            if (!exTempwithMessage) {
              return res.json({
                status: false,
                message: "Template does not exist.!!!",
              });
            }
            //console.log(user)
            let dataToReplace = {
              user: educator.name,
              message: message,
            };
            // console.log(dataToReplace)
            let newTempwithMesage = UpdateTemplate(
              exTempwithMessage,
              dataToReplace
            );
            await SendSMail(
              subject,
              newTempwithMesage.body,
              [educator.email],
              config.krsAWSOptions.senderOrReplyTo,
              config.krsAWSOptions.senderOrReplyTo
            );
          } else {
            const exTemp = await EmailTempModel.findOne({
              templateName:
                "To send mail muliple educators  (Accessed by Educator)",
            });

            if (!exTemp) {
              return res.json({
                status: false,
                message: "Template does not exist.!!!",
              });
            }

            let dataToReplace = {
              user: educator.name,
            };

            let newTemp = UpdateTemplate(exTemp, dataToReplace);
            let newSub = subject ? subject : newTemp.subject;
            await SendSMail(
              newSub,
              newTemp.body,
              [educator.email],
              config.krsAWSOptions.senderOrReplyTo,
              config.krsAWSOptions.senderOrReplyTo
            );
          }
        } catch (err) {
          console.error(err);
        }
      }
      return res.json({ status: true, message: "Emails sent successfully" });
    } else {
      return res.json({
        status: false,
        message: "Please select at least one educator to send an email",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Failed to retrieve educator details or send emails",
    });
  }
};
