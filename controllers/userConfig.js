const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
const userModel = require("../models/user");
const { createPayloadUser } = require("../common/encDec");
const {
  encrypt,
  decrypt,
  SendEmail,
  krsCertTemp,
  UpdateTemplate,
} = require("../common/nommoc");
const reasonForSignUp = require("../models/reasonForSignUp");
const address = require("../models/address");
const academic = require("../models/academic");
const professional = require("../models/professional");
const courseMain = require("../models/courseMain");
const { fileUpload, SendSMail } = require("../common/aws");
const exam = require("../models/exam");
const courseAssessment = require("../models/courseAssessment");
const newsLetterModel = require("../models/newsLetter");
const userMyCourses = require("../models/userMyCourses");
const courseSession = require("../models/courseSession");
const Notification = require("../models/Notification");
const reviews = require("../models/reviews");
const { default: mongoose } = require("mongoose");
const cart = require("../models/cart");
const EmailTempModel = require("../models/emailTemplates");
//const { userContents } = require("../nodedetails/local")
const config = require("../nodedetails/config");
// =========================================== User Login/SignUp API=================================================

exports.contactUs = async (req, res) => {
  try {
    let { name, email, mobile, message } = req.body;

    let adminSubject = `${name} has sent a message`;
    // for admin
    const exTemp = await EmailTempModel.findOne({
      templateName: "To get mail when someone contacts us",
    });

    if (!exTemp) {
      return res.json({
        status: false,
        message: "Template does not exist.!!!",
      });
    }
    let dataToReplace = {
      user: "Dear Sir,",
      message: message,
      name: name,
      mobile: mobile,
      email: email,
    };
    let newTemp = UpdateTemplate(exTemp, dataToReplace);
    const template = newTemp.body,
      subject = adminSubject,
      mail = [email];

    console.log(
      config.krsAWSOptions.senderOrReplyTo,
      config.krsAWSOptions.doNotReply
    );

    SendSMail(
      subject,
      template,
      [email],
      config.krsAWSOptions.senderOrReplyTo,
      config.krsAWSOptions.senderOrReplyTo
    )
      .then(async () => {
        //for user
        const exTemp1 = await EmailTempModel.findOne({
          templateName: "To send mail when someone contacts us",
        });

        if (!exTemp1) {
          return res.json({
            status: false,
            message: "Template does not exist.!!!",
          });
        }
        let dataToReplace1 = {
          user: name,
        };
        let newTemp = UpdateTemplate(exTemp1, dataToReplace1);
        let template = newTemp.body,
          subject = newTemp.subject,
          mail = ["pankazkrsinghania@gmail.com"];
        SendSMail(
          subject,
          template,
          mail,
          config.krsAWSOptions.doNotReply,
          config.krsAWSOptions.senderOrReplyTo
        )
          .then(() => {
            res.json({
              status: true,
              message: "Your query has sent successfully to KareerSity",
            });
          })
          .catch((err) => {
            console.error(err);
            res.json({ status: false, message: "Unable to send query" });
          });
      })
      .catch((err) => {
        console.error(err);
        res.json({ status: false, message: "Unable to send query" });
      });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.register = async (req, res) => {
  try {
    let data = req.body;
    if (data && data.password != data.confirmPassword) {
      return res.json({
        status: false,
        message: "Confirm password does not match",
      });
    }

    data.password = encrypt(data.password);

    userModel.findOne(
      { $or: [{ phoneNumber: data.phoneNumber }, { email: data.email }] },
      (err, exUser) => {
        if (exUser && exUser.email == data.email) {
          res.json({ status: false, message: `Email Id already exists` });
        } else if (exUser && exUser.phoneNumber == data.phoneNumber) {
          res.json({ status: false, message: `Mobile Number already exists` });
        } else if (!exUser) {
          reasonForSignUp.findById({ _id: data.reasonId }, (err, Rjn) => {
            if (Rjn) {
              data.isAccountVerified = false;
              userModel.create(data, async (err, newUser) => {
                if (newUser) {
                  //     let subject = "Activate your account"
                  //     const message = `${newUser.fullName}, click on the following button to activate your account\n

                  //     <div style="text-align: center; margin-top: 50px;">
                  //     <a href="https://www.kareersity.com/account-activated/${encrypt(newUser._id.toString())}"
                  //         style="display: block; margin: 0 auto; background: #107B38; padding: 13px; color: white; cursor: pointer; text-decoration: none; width: 150px;">
                  //         Activate Now
                  //     </a>
                  // </div>
                  //     `
                  const exTemp = await EmailTempModel.findOne({
                    templateName: "To  activate user account",
                  });

                  if (!exTemp) {
                    return res.json({
                      status: false,
                      message: "Template does not exist.!!!",
                    });
                  }

                  let dataToReplace = {
                    user: newUser.fullName,
                    activationLink:
                      `${config.userContents.accountActivated}` +
                      encrypt(newUser._id.toString()),
                  };
                  let newTemp = UpdateTemplate(exTemp, dataToReplace);
                  const template = newTemp.body,
                    subject = newTemp.subject;
                  // console.log(newTemp.body, newTemp.subject, [email])

                  SendSMail(
                    subject,
                    template,
                    [newUser.email],
                    config.krsAWSOptions.senderOrReplyTo,
                    config.krsAWSOptions.senderOrReplyTo
                  )
                    .then(() => {
                      res.json({
                        status: true,
                        message:
                          "You have registered successfully,Please activate your account!!!",
                        data: newUser,
                      });
                    })
                    .catch((err) => {
                      res.json({ status: false, message: "Unable to sign Up" });
                    });

                  // res.json({ "status": true, "message": "You have registered successfully,Please activate your account!!!", "data": newUser })
                } else {
                  res.json({
                    status: false,
                    message: "Please try after some time",
                    error: err,
                  });
                }
              });
            } else {
              res.json({ status: false, message: "Please select the reason" });
            }
          });
        } else if (err) {
          res.json({
            status: false,
            message: "Oops! Something went wrong. Please try again later",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.userLogin = (req, res) => {
  let data = req.body;

  data.password = encrypt(data.password);

  userModel.findOne({ email: data.email }, (err, dbUser) => {
    if (dbUser && dbUser.isActive == false) {
      res.json({
        status: false,
        message:
          "Account deactivated due to inactivity. Contact admin for reactivation.",
      });
    } else if (dbUser && dbUser.isAccountVerified == true) {
      // console.log(dbUser,"---", decrypt(dbUser.password),"---",decrypt(data.password))
      if (dbUser && dbUser.password === data.password) {
        if (dbUser && dbUser.isNewUser == null) {
          dbUser.isNewUser = true;

          dbUser.save();

          let payload = createPayloadUser(encrypt(dbUser._id.toString()));

          res.json({
            status: true,
            message: "Logged in successfully",
            userName: dbUser.fullName,
            origin: payload,
            newlySignUp: true,
          });
        } else if (
          (dbUser && dbUser.isNewUser == true) ||
          (dbUser && dbUser.isNewUser == false)
        ) {
          dbUser.isNewUser = false;
          dbUser.save();
          let payload = createPayloadUser(encrypt(dbUser._id.toString()));

          res.json({
            status: true,
            message: "Logged in successfully",
            userName: dbUser.fullName,
            origin: payload,
            newlySignUp: false,
          });
        }
      } else {
        res.json({ status: false, message: "Invalid login credentials" });
      }
    } else if (dbUser && dbUser.isAccountVerified == false) {
      console.log(dbUser);
      res.json({ status: false, message: "Please , verify your account !!!" });
    } else {
      return res.json({ status: false, message: "User does not exists" });
    }
  });
};

exports.verifyAccount = async (req, res) => {
  try {
    const verificationCode = decrypt(req.params.token);
    //console.log(verificationCode)

    const user = await userModel.findOneAndUpdate(
      { _id: verificationCode },
      { $set: { isAccountVerified: true } },
      { new: true }
    );

    if (!user) {
      return res.json({ status: false, message: "Invalid Verification code" });
    }

    return res.json({ status: true, message: "Account verified successfully" });
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.json({ message: "Internal server error" });
  }
};

exports.editUserPersonelProfile = async (req, res) => {
  try {
    let id = req.userid;
    let data = req.body;

    let findUser = await userModel.findById(id);

    if (!findUser) {
      return res.json({ status: false, message: "User does not exists" });
    }

    let dupEmail = await userModel.findOne({ email: data.email });

    if (dupEmail) {
      return res.json({ status: false, message: "Email already exists" });
    }
    let dupPhone = await userModel.findOne({ phoneNumber: data.phoneNumber });
    if (dupPhone) {
      return res.json({
        status: false,
        message: "Phone number already exists",
      });
    }

    let updateUser = await userModel.findByIdAndUpdate(id, data, { new: true });

    if (updateUser) {
      return res.json({
        status: true,
        message: "User profile updated successfully",
        data: updateUser,
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to update user detail",
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
exports.updateUserProfilePhoto = async (req, res) => {
  try {
    let id = req.userid;

    const profilePicFile = req.files["profilePic"]
      ? req.files["profilePic"][0]
      : null;
    if (!profilePicFile) {
      res.json({
        status: false,
        message: "Please provide a valid profile picture",
      });
      return;
    }

    userModel.findById(id, (err, findUser) => {
      if (findUser) {
        fileUpload(profilePicFile, (uploadData) => {
          if (uploadData.status) {
            findUser.profilePic = uploadData.url;
            userModel.findByIdAndUpdate(
              id,
              { profilePic: findUser.profilePic },
              { new: true },
              (err, updateUser) => {
                if (updateUser) {
                  return res.json({
                    status: true,
                    message: "User profile picture updated successfully",
                    data: updateUser.profilePic,
                  });
                } else {
                  return res.json({
                    status: false,
                    message: "Unable to update user picture",
                  });
                }
              }
            );
          } else {
            res.json({
              status: false,
              message:
                "Error occurred while uploading the  picture, please try again",
            });
            return;
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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
exports.fetchUserPersonelProfileAndPasswordInfo = (req, res) => {
  try {
    let id = req.userid;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        return res.json({ status: true, data: exUser });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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

exports.fetchUserCartAndFavoriteItems = async (req, res) => {
  try {
    let id = req.userid;
    let userInfo = await userModel.findById(id).select({
      _id: 1,
      fullName: 1,
      email: 1,
      favorite: 1,
    });
    if (!userInfo) {
      return res.json({ status: false, message: "User does not exist" });
    }
    let cartInfo = await cart.findOne({ userId: userInfo._id });

    const notificationsCount = await Notification.countDocuments({
      userId: userInfo._id,
      isRead: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
    userInfo._doc.itemsInCart = cartInfo ? cartInfo.items.length : 0;
    userInfo._doc.notifications = notificationsCount;
    userInfo._doc.itemsInWishlist = userInfo.favorite.length;

    return res.json({ status: true, data: userInfo });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.ListOfUserNotifications = async (req, res) => {
  try {
    let id = req.userid;

    const findUserNotification = await Notification.find({
      userId: id,
      isRead: { $ne: true },
    })
      .select({ _id: 1, message: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(20);

    if (findUserNotification && findUserNotification.length > 0) {
      return res.json({ status: true, data: findUserNotification });
    } else {
      return res.json({ status: true, data: [] });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.userNotificationsIsRead = async (req, res) => {
  try {
    let userId = req.userid;
    let { id } = req.body;

    const findUserNotification = await Notification.findByIdAndUpdate(
      { _id: id, userId: userId },
      { isRead: true },
      { new: true }
    );

    if (findUserNotification) {
      return res.json({ status: true });
    } else {
      return res.json({ status: false });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.editUserPassword = async (req, res) => {
  try {
    let id = req.userid;
    let data = req.body;

    let findUser = await userModel.findById(id);

    if (!findUser) {
      return res.json({ status: false, message: "User does not exists" });
    } else if (
      findUser &&
      decrypt(findUser.password) !== data.currentPassword
    ) {
      return res.json({
        status: false,
        message: "Current password does not match",
      });
    }
    if (data && data.newPassword != data.confirmPassword) {
      return res.json({
        status: false,
        message: "Confirm password does not match",
      });
    }

    data.password = encrypt(data.confirmPassword);

    let updateUser = await userModel.findByIdAndUpdate(id, data, { new: true });

    if (updateUser) {
      return res.json({
        status: true,
        message: "User profile updated successfully",
        data: updateUser,
      });
    } else {
      return res.json({
        status: false,
        message: "Unable to update user detail",
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

exports.editOrAddUserAddress = async (req, res) => {
  try {
    let id = req.userid;
    let data = req.body;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        address.findOne({ userId: id }, (err, exAddress) => {
          if (exAddress) {
            data.userId = id;
            address.findByIdAndUpdate(
              exAddress._id,
              data,
              { new: true },
              (err, upAdd) => {
                if (upAdd) {
                  return res.json({
                    status: true,
                    message: "User's address updated successfully",
                    data: upAdd,
                  });
                } else {
                  return res.json({
                    status: false,
                    message: "Unable to update address",
                  });
                }
              }
            );
          } else {
            data.userId = id;
            address.create(data, (err, newAdd) => {
              if (newAdd) {
                return res.json({
                  status: true,
                  message: "User's address added successfully",
                  data: newAdd,
                });
              } else {
                return res.json({
                  status: false,
                  message: "Unable to add address",
                });
              }
            });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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
exports.fetchUserAddress = async (req, res) => {
  try {
    let id = req.userid;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        address.findOne({ userId: id }, (err, exAddress) => {
          if (exAddress) {
            return res.json({ status: true, data: exAddress });
          } else {
            return res.json({ status: false, data: {} });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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

exports.editOrAddUserAcademicInfo = async (req, res) => {
  try {
    let id = req.userid;
    let data = req.body;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        academic.findOne({ userId: id }, (err, exacademic) => {
          if (exacademic) {
            data.userId = id;
            academic.findByIdAndUpdate(
              exacademic._id,
              data,
              { new: true },
              (err, upAdd) => {
                if (upAdd) {
                  return res.json({
                    status: true,
                    message: "User's academic information updated successfully",
                    data: upAdd,
                  });
                } else {
                  return res.json({
                    status: false,
                    message: "Unable to update academic information",
                  });
                }
              }
            );
          } else {
            data.userId = id;
            academic.create(data, (err, newAcademicInfo) => {
              if (newAcademicInfo) {
                return res.json({
                  status: true,
                  message: "User's academic information added successfully",
                  data: newAcademicInfo,
                });
              } else {
                console.log(err);
                return res.json({
                  status: false,
                  message: "Unable to add academic information",
                  error: err.message,
                });
              }
            });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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
exports.fetchUserAcademicInfo = async (req, res) => {
  try {
    let id = req.userid;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        academic.findOne({ userId: id }, (err, exacademic) => {
          if (exacademic) {
            return res.json({ status: true, data: exacademic });
          } else {
            return res.json({ status: false, data: {} });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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

exports.editOrAddUserProfessionalInfo = async (req, res) => {
  try {
    let id = req.userid;
    let data = req.body;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        professional.findOne({ userId: id }, (err, exprofessional) => {
          if (exprofessional) {
            data.userId = id;
            professional.findByIdAndUpdate(
              exprofessional._id,
              data,
              { new: true },
              (err, upAdd) => {
                if (upAdd) {
                  return res.json({
                    status: true,
                    message:
                      "User's professional information updated successfully",
                    data: upAdd,
                  });
                } else {
                  return res.json({
                    status: false,
                    message: "Unable to update professional information",
                  });
                }
              }
            );
          } else {
            data.userId = id;
            professional.create(data, (err, newprofessionalInfo) => {
              if (newprofessionalInfo) {
                return res.json({
                  status: true,
                  message: "User's professional information added successfully",
                  data: newprofessionalInfo,
                });
              } else {
                console.log(err);
                return res.json({
                  status: false,
                  message: "Unable to add professional information",
                  error: err.message,
                });
              }
            });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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
exports.fetchUserProfessionalInfo = async (req, res) => {
  try {
    let id = req.userid;

    userModel.findById(id, (err, exUser) => {
      if (exUser) {
        professional.findOne({ userId: id }, (err, exprofessional) => {
          if (exprofessional) {
            return res.json({ status: true, data: exprofessional });
          } else {
            return res.json({ status: false, data: {} });
          }
        });
      } else {
        return res.json({ status: false, message: "User does not exists" });
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

exports.userProfileStatus = async (req, res) => {
  try {
    const userId = req.userid;

    const userInfo = await userModel.findById(userId);
    if (!userInfo) {
      return res.json({ status: false, message: "User does not exist" });
    } else if (userInfo && userInfo.profilePerCompleted > 75) {
      return res.json({ status: true, data: userInfo.profilePerCompleted });
    }

    const userAddInfo = await address.findOne({ userId: userId });
    const userAcademicInfo = await academic.findOne({ userId: userId });
    const userProfessionalInfo = await professional.findOne({ userId: userId });
    let profilePer = 0;
    if (userInfo && userInfo.userType == "student") {
      profilePer += 50;
    }

    if (userInfo && userInfo.userType == "workingProfessional") {
      profilePer += 25;
    }

    if (userInfo && userInfo.userType == "doctor") {
      profilePer += 25;
    }

    if (userInfo && userInfo.userType == "corporateUser") {
      profilePer += 25;
    }

    if (userAddInfo) {
      profilePer += 25;
    }
    if (userAcademicInfo) {
      profilePer += 25;
    }
    if (userProfessionalInfo) {
      profilePer += 25;
    }

    if (profilePer > 100) {
      profilePer = 100;
    }
    userInfo.profilePerCompleted = profilePer;
    userInfo.save();
    return res.json({ status: true, data: profilePer });

    // userModel.aggregate([
    //     {
    //         $match: { _id: userInfo._id }
    //     },
    //     {
    //         $lookup: {
    //             from: 'KrSity_SSERDDA',
    //             localField: '_id',
    //             foreignField: 'userId',
    //             as: 'address'
    //         }
    //     },
    //     {
    //         $unwind: '$address'
    //     },
    //     {
    //         $lookup: {
    //             from: 'KrSity_CIMEDACA',
    //             localField: '_id',
    //             foreignField: 'userId',
    //             as: 'academic'
    //         }
    //     },
    //     {
    //         $unwind: '$academic'
    //     },
    //     {
    //         $lookup: {
    //             from: 'KrSity_UDELANOISSEFORP',
    //             localField: '_id',
    //             foreignField: 'userId',
    //             as: 'professional'
    //         }
    //     },
    //     {
    //         $unwind: '$professional'
    //     },
    //     {
    //         $project: {
    //             "_id": 1,
    //             "profilePic": 1,
    //             "userType": 1,
    //             "fullName": 1,
    //             "email": 1,
    //             "phoneNumber": 1,
    //             "favorite": 1,
    //             "addressLine": "$address.addressLine",
    //             "city": "$address.city",
    //             "state": "$address.state",
    //             "country": "$address.country",
    //             "pinCode": "$address.pinCode",
    //             "companyName": "$professional.companyName",
    //             "designation": "$professional.designation",
    //             "totalExperince": "$professional.totalExperince",
    //             "ProfCity": "$professional.city",
    //             "ProfPinCode": "$professional.pinCode",
    //             "collegeName": "$academic.collegeName",
    //             "yearOfCollege": "$academic.yearOfCollege",
    //             "degreeOfStream": "$academic.degreeOfStream",
    //             "academicCity": "$academic.city",
    //             "academicPinCode": "$academic.pinCode"

    //         }
    //     }
    // ], (err, data) => {
    //     if (err) {
    //         console.error(err);
    //         return res.json({ "status": false, "message": "Error during aggregation" });
    //     }

    //     if (!data || data.length === 0) {
    //         return res.json({ "status": false, "message": "User data not found" });
    //     }

    //     let ttlFields = Object.keys(data[0]).length;
    //     let EmptyFields = (Object.values(data[0])).filter(x => (x == 0) || ((String(x)).trim().length == 0))
    //     let profilePercentage = (ttlFields - EmptyFields) * 100 / ttlFields
    //     let profilePer = profilePercentage > 90 ? 100 : profilePercentage
    //     userInfo.profilePerCompleted = profilePer
    //     userInfo.save()
    //     return res.json({ "status": true, "data": profilePer }); // Assuming there's only one matching user
    // });
  } catch (e) {
    console.error(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//==============================Don't delete below forgot and reset password ====================================
// exports.forgotPassword = (req, res) => {

//     let data = req.body

//     userModel.findOne({ 'email': data.email }, (err, dbUser) => {

//         if (dbUser) {
//             // const resetToken = crypto.randomBytes(20).toString('hex');
//             // user.resetPasswordToken = resetToken;
//             // user.resetPasswordExpires = Date.now() + 3600000;

//             let subject = "Reset your password -Kareer Sity"

//             const message = `Hi ${dbUser.fullName}, click on the following link to reset your password:\n https://www.kareersity.com/user/resetPassword?token=${encrypt(dbUser._id.toString() + Date.now() + 3600000)}`

//             SendSMail(subject, message ,[dbUser.email] ).then(() => {
//                 res.json({ "status": true, "message": `Reset password link sent successfully on ${dbUser.email}` })
//             }).catch(err => {
//                 res.json({ "status": false, "message": "Unable to send reset link" })
//             })

//         } else {

//             res.json({ status: false, message: 'Error sending SMS' });
//         }

//     })

// }

exports.resetPassword = (req, res) => {
  let { token } = req.query;
  let id = decrypt(token).substring(0, 24);

  let data = req.body;
  if (data && data.password != data.confirmPassword) {
    return res.json({
      status: false,
      message: "Confirm password does not match",
    });
  }
  userModel.findById(id, (err, dbUser) => {
    if (dbUser) {
      userModel.findByIdAndUpdate(
        id,
        { password: data.password },
        (err, dbUser) => {
          if (dbUser) {
            res.json({
              status: true,
              message: `${dbUser.fullName} your password has been updated sucessfully`,
            });
          } else {
            res.json({ status: false, message: "Error resetting password" });
          }
        }
      );
    } else {
      res.json({ status: false, message: "Error resetting password " });
    }
  });
};
//==============================Don't delete above forgot and reset password ====================================

exports.forgotPassword = (req, res) => {
  let data = req.body;

  userModel.findOne({ email: data.email }, (err, dbUser) => {
    if (dbUser) {
      res.json({ status: true, token: encrypt(dbUser._id.toString()) });
    } else {
      res.json({ status: false, message: "User does not exists" });
    }
  });
};

exports.confirmPasswordUser = (req, res) => {
  let { token, password, confirmPassword } = req.body;
  let id = decrypt(token).substring(0, 24);

  if (password !== confirmPassword) {
    return res.json({
      status: false,
      message: "Confirm password does not match",
    });
  }
  userModel.findById(id, async (err, dbUser) => {
    if (dbUser) {
      let dataToEncrypt =
        dbUser._id.toString() +
        "|||" +
        Date.now() +
        15 * 60 * 1000 +
        "|||" +
        password;
      let encryptedData = encrypt(dataToEncrypt);
      //     let subject = "Reset your password Kareer - Sity"
      //     const message = `${dbUser.fullName}, Someone has reset your password, click on the following link to reset your password\n

      //     <div style="text-align: center; margin-top: 50px;">
      //     <a href="https://www.kareersity.com/password-reseted/${encryptedData}"
      //         style="display: block; margin: 0 auto; background: #107B38; padding: 13px; color: white; cursor: pointer; text-decoration: none; width: 150px;">
      //         Activate Now
      //     </a>
      // </div> `

      const exTemp = await EmailTempModel.findOne({
        templateName: "To Reset user password",
      });

      if (!exTemp) {
        return res.json({
          status: false,
          message: "Template does not exist.!!!",
        });
      }
      let dataToReplace = {
        user: dbUser.fullName,
        link: config.userContents.resetPassword + `${encryptedData}`,
      };
      let newTemp = UpdateTemplate(exTemp, dataToReplace);

      //console.log(newTemp.body, newTemp.subject, [dbUser.email])
      SendSMail(
        newTemp.subject,
        newTemp.body,
        [dbUser.email],
        config.krsAWSOptions.senderOrReplyTo,
        config.krsAWSOptions.senderOrReplyTo
      )
        .then(() => {
          res.json({
            status: true,
            message: `Reset password link has sent successfully on your email address`,
          });
        })
        .catch((err) => {
          res.json({ status: false, message: "Unable to send reset link" });
        });
      // res.json({ "status": true, "message": `Reset password link has sent successfully on your email address` })
    } else {
      console.log(err);
      res.json({ status: false, message: "Error resetting password " });
    }
  });
};
exports.resetPasswordButton = (req, res) => {
  let { token } = req.params;
  let decryptToken = decrypt(token);
  let newDT = decryptToken.split("|||");
  // console.log(newDT,"uyukiyuk")
  let id = newDT[0];
  let password = encrypt(newDT[2]);
  // console.log(password)
  // console.log(newDT,(decrypt(token)).substring(24, 43),password ,id.length)

  let expTime = Number(newDT[1]);
  //console.log(new Date(Date.now()).getTime() < new Date(expTime / 1000000).getTime())
  if (new Date(Date.now()).getTime() < new Date(expTime / 1000000).getTime()) {
    return res.json({ status: false, message: "The link has been expired!!!" });
  }
  userModel.findById(id, (err, dbUser) => {
    if (dbUser) {
      userModel.findByIdAndUpdate(
        id,
        { password: password },
        { new: true },
        (err, dbUser) => {
          if (dbUser) {
            return res.json({
              status: true,
              message: `${dbUser.fullName} your password has been updated sucessfully`,
            });
          } else {
            return res.json({
              status: false,
              message: "Error occurred updating the password",
            });
          }
        }
      );
    } else {
      return res.json({ status: false, message: "User does not exists" });
    }
  });
};
//==================================================== Reason For Sign Up ====================================

exports.creatReason = (req, res) => {
  try {
    let { reason } = req.body;

    reasonForSignUp.findOne({ reason: reason }, (err, exReason) => {
      if (!exReason) {
        reasonForSignUp.create({ reason: reason }, (err, newReason) => {
          if (newReason) {
            res.send({
              status: true,
              message: "New reason added successfully",
              data: newReason,
            });
          } else {
            res.json({ status: false, message: "Could not add reason  !!!" });
          }
        });
      } else {
        res.json({ status: false, message: "Reason already exists" });
      }
    });
  } catch (e) {
    console.log(e);

    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.editReason = (req, res) => {
  try {
    let { reason, _id, isActive } = req.body;

    reasonForSignUp.findById({ _id: _id }, (err, exReason) => {
      if (exReason) {
        reasonForSignUp.findByIdAndUpdate(
          { _id: _id },
          { reason: reason, isActive: isActive },
          { new: true },
          (err, newReason) => {
            if (newReason) {
              res.send({
                status: true,
                message: "The reason updated successfully",
                data: newReason,
              });
            } else {
              res.json({
                status: false,
                message: "Could not update reason !!!",
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: "Reason does not exists" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.reasons = (req, res) => {
  try {
    reasonForSignUp.find({}, (err, resons) => {
      if (resons) {
        res.send({
          status: true,
          message: `${resons.length} reasons(s) found`,
          data: resons,
        });
      } else {
        res.json({ status: false, message: "Reason List is empty !!!" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//========================================= API for customer Favorite ===========================

exports.AddToOrRemoveFromFavorite = (req, res) => {
  try {
    let userid = req.userid;

    let { courseId } = req.body;

    userModel.findById({ _id: userid }, (err, user) => {
      if (user) {
        courseMain.findById({ _id: courseId }, (err, product) => {
          if (product && !user.favorite.includes(courseId)) {
            user.favorite = user.favorite.concat(courseId);

            userModel.findOneAndUpdate(
              { _id: userid },
              user,
              { new: true },
              (err, qty) => {
                if (qty) {
                  res.send({
                    status: true,
                    message: "Course added to favorite list successfully",
                    data: qty.favorite,
                  });
                } else {
                  res.json({
                    status: false,
                    message: "unable to add Course in favorite list",
                  });
                }
              }
            );
          } else if (product && user.favorite.includes(courseId)) {
            user.favorite = user.favorite.remove(courseId);

            userModel.findOneAndUpdate(
              { _id: userid },
              user,
              { new: true },
              (err, qty) => {
                if (qty) {
                  res.send({
                    status: true,
                    message: "Course removed from favorite list successfully",
                    data: qty.favorite,
                  });
                } else {
                  res.json({
                    status: false,
                    message: "unable to add course in favorite list",
                  });
                }
              }
            );
          } else {
            res.json({ status: false, message: "Course does not exists" });
          }
        });
      } else {
        return res.json({ status: true, message: " user not found" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.FavoriteList = (req, res) => {
  try {
    let userid = req.userid;

    userModel.findOne({ _id: userid }, (err, items) => {
      if (items) {
        courseMain
          .find({ _id: { $in: items.favorite } })
          .populate({
            path: "educators",
            select: "name",
            model: "Educator",
          })
          .exec((err, data) => {
            if (data.length > 0) {
              res.send({
                status: true,
                message: `${data.length} course(s) in your favarite list`,
                data: data,
              });
            } else {
              // items.favorite = [];
              // items.save()
              console.log(err);
              res.json({
                status: true,
                message: "Your favarite list is empty",
                data: [],
              });
            }
          });
      } else {
        res.json({ status: false, message: "User  does not exists" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.CreateRatingAndReviewsForCourse = (req, res) => {
  try {
    let userid = req.userid;
    let data = req.body;

    userModel.findOne({ _id: userid }, (err, exUser) => {
      if (exUser) {
        data.userId = userid;
        data.userProfile = exUser.profilePic;

        reviews.findOne(
          { userId: userid, courseId: data.courseId },
          (err, existingRR) => {
            if (err) {
              res.json({
                status: false,
                message: "Error ocuured while giving rating and reviews !!!",
              });
            } else if (existingRR) {
              existingRR._doc.userName = exUser.fullName;
              res.json({
                status: true,
                message:
                  "Thank you ! We appreciate your efforts in making Kareer Sity better!!!",
                data: existingRR,
              });
            } else {
              reviews.create(data, (err, newRR) => {
                if (newRR) {
                  res.send({
                    status: true,
                    message: "Reviews Added successfully",
                    data: data,
                  });
                } else {
                  res.json({
                    status: true,
                    message:
                      "Error ocuured while giving rating and reviews !!!",
                  });
                }
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: "User  does not exists" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.ExistingRatingAndReviewsForCourse = (req, res) => {
  try {
    let userid = req.userid;
    let { courseId } = req.body;

    userModel.findOne({ _id: userid }, (err, exUser) => {
      if (exUser) {
        reviews.findOne(
          { userId: userid, courseId: courseId },
          (err, existingRR) => {
            if (existingRR) {
              existingRR._doc.userName = exUser.fullName;
              res.json({
                status: true,
                message:
                  "Thank you ! We appreciate your efforts in making Kareer Sity better!!!",
                data: existingRR,
              });
            } else {
              res.json({
                status: false,
                message: "Error ocuured while fetching rating and reviews !!!",
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: "User  does not exists" });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//============================================== Learners ===============================================

// exports.learnersList = async (req, res) => {
//     try {
//         const users = await userModel.find().exec();

//         if (users.length === 0) {
//             return res.json({ status: true, message: "Learner's list is empty", data: [] });
//         }

//         const learnersList = [];
//         for (const user of users) {
//             const academicData = await academic.findOne({ userId: user._id }).exec();
//             const collegeName = academicData ? academicData.collegeName : 'N/A';

//             learnersList.push({
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 collegeName: collegeName,
//                 learnerType: user.userType,
//                 status: user.isActive
//             });
//         }

//         res.send({ status: true, message: `${users.length} learner(s) found`, data: learnersList });
//     } catch (e) {
//         res.json({ status: false, message: "Oops! Something went wrong. Please try again later" });
//     }
// };

exports.learnersList = async (req, res) => {
  try {
    const { fullName, learnerType, collegeName } = req.query;
    let query = {};

    if (fullName) {
      query.fullName = { $regex: fullName, $options: "i" };
    }
    if (fullName && learnerType) {
      query.fullName = { $regex: fullName, $options: "i" };
      query.userType = { $regex: learnerType, $options: "i" };
    }

    if (learnerType) {
      query.userType = { $regex: learnerType, $options: "i" };
    }

    const users = await userModel.find(query).sort({ updatedAt: -1 }).exec();

    if (users.length === 0) {
      return res.json({
        status: true,
        message: "Learner's list is empty",
        data: [],
      });
    }

    const learnersList = [];
    for (const user of users) {
      const academicData = await academic.findOne({ userId: user._id }).exec();

      const collegeName = academicData ? academicData.collegeName : "N/A";

      learnersList.push({
        _id: user._id,
        profilePic: user.profilePic,
        name: user.fullName,
        email: user.email,
        collegeName: collegeName,
        learnerType: user.userType,
        isActive: user.isActive,
        lastLogin: user.updatedAt,
      });
    }

    if (collegeName) {
      const filteredLearners = learnersList.filter(
        (learner) => learner.collegeName === collegeName
      );
      res.send({
        status: true,
        message: `${filteredLearners.length} learner(s) found`,
        data: filteredLearners,
      });
    } else {
      res.send({
        status: true,
        message: `${users.length} learner(s) found`,
        data: learnersList,
      });
    }
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.learnersActiveList = async (req, res) => {
  try {
    const { fullName, learnerType, collegeName } = req.query;
    let query = { isActive: true };

    if (fullName) {
      query.fullName = { $regex: fullName, $options: "i" };
    }
    if (fullName && learnerType) {
      query.fullName = { $regex: fullName, $options: "i" };
      query.userType = { $regex: learnerType, $options: "i" };
    }

    if (learnerType) {
      query.userType = { $regex: learnerType, $options: "i" };
    }

    const users = await userModel.find(query).sort({ updatedAt: -1 }).exec();

    if (users.length === 0) {
      return res.json({
        status: true,
        message: "Learner's list is empty",
        data: [],
      });
    }

    const learnersList = [];
    for (const user of users) {
      const academicData = await academic.findOne({ userId: user._id }).exec();

      const collegeName = academicData ? academicData.collegeName : "N/A";

      learnersList.push({
        _id: user._id,
        profilePic: user.profilePic,
        name: user.fullName,
        email: user.email,
        collegeName: collegeName,
        learnerType: user.userType,
        isActive: user.isActive,
        lastLogin: user.updatedAt,
      });
    }

    if (collegeName) {
      const filteredLearners = learnersList.filter(
        (learner) => learner.collegeName === collegeName
      );
      res.send({
        status: true,
        message: `${filteredLearners.length} learner(s) found`,
        data: filteredLearners,
      });
    } else {
      res.send({
        status: true,
        message: `${users.length} learner(s) found`,
        data: learnersList,
      });
    }
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.sendEmailToLearners = (req, res) => {
  const { selectedLearnersIds, subject, message } = req.body;

  if (!selectedLearnersIds || selectedLearnersIds.length === 0) {
    return res.json({
      status: false,
      message: "Please select at least one learner",
    });
  }

  userModel
    .find({ _id: { $in: selectedLearnersIds } })
    .select({ fullName: 1, email: 1 })
    .then((learners) => {
      if (learners.length === 0) {
        return res.json({
          status: false,
          message: "No learners found with the provided IDs",
        });
      }

      //const recipients = learners.map((learner) => learner.email);

      // SendSMail(subject, message, recipients)
      //     .then(() => {
      //         res.json({ status: true, message: 'Emails sent successfully' });
      //     })
      //     .catch((error) => {
      //         console.log(error);
      //         res.json({ status: false, message: 'Failed to send emails' });
      //     });

      learners.forEach(async (user) => {
        try {
          const exTemp = await EmailTempModel.findOne({
            templateName: "To send mails to learners (Accessed by User)",
          });

          if (!exTemp) {
            return res.json({
              status: false,
              message: "Template does not exist.!!!",
            });
          }
          //console.log(user)
          let dataToReplace = {
            user: user.fullName,
            message: message,
          };
          // console.log(dataToReplace)
          let newTemp = UpdateTemplate(exTemp, dataToReplace);
          let newSub = subject ? subject : newTemp.subject;
          await SendSMail(
            newSub,
            newTemp.body,
            [user.email],
            config.krsAWSOptions.senderOrReplyTo,
            config.krsAWSOptions.senderOrReplyTo
          );
        } catch (err) {
          console.error(err);
        }
      });
      return res.json({ status: true, message: "Emails sent successfully" });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: false,
        message: "Failed to retrieve learner details",
      });
    });
};

exports.editLearnersStatus = async (req, res) => {
  try {
    let { id, isActive } = req.body;
    let findLearner = await userModel.findById(id);
    if (!findLearner) {
      return res.json({ status: false, message: "Learner does not exists" });
    }
    let updateLearner = await userModel.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    );
    if (updateLearner) {
      return res.json({
        status: true,
        message: "Learner's status has changed successfully",
        data: updateLearner,
      });
    } else {
      return res.json({
        status: false,
        message: "Failed to update Learner status",
      });
    }
  } catch (e) {
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.learnerInfo = async (req, res) => {
  try {
    const { id } = req.body;

    let userInfo = await userModel.findById(id);

    if (!userInfo) {
      return res.json({ status: true, message: "User does not exist" });
    }

    userModel.aggregate(
      [
        { $match: { _id: userInfo._id } },
        {
          $lookup: {
            from: "KrSity_SSERDDA",
            localField: "_id",
            foreignField: "userId",
            as: "addressInfo",
          },
        },
        {
          $lookup: {
            from: "KrSity_CIMEDACA",
            localField: "_id",
            foreignField: "userId",
            as: "academicInfo",
          },
        },
        {
          $lookup: {
            from: "KrSity_UDELANOISSEFORP",
            localField: "_id",
            foreignField: "userId",
            as: "professionalInfo",
          },
        },
        {
          $project: {
            _id: 1,
            userType: 1,
            profilePic: 1,
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            isActive: 1,
            addressLine: { $arrayElemAt: ["$addressInfo.addressLine", 0] },
            city: { $arrayElemAt: ["$addressInfo.city", 0] },
            state: { $arrayElemAt: ["$addressInfo.state", 0] },
            country: { $arrayElemAt: ["$addressInfo.country", 0] },
            pinCode: { $arrayElemAt: ["$addressInfo.pinCode", 0] },
            collegeName: { $arrayElemAt: ["$academicInfo.collegeName", 0] },
            yearOfCollege: { $arrayElemAt: ["$academicInfo.yearOfCollege", 0] },
            degreeOfStream: {
              $arrayElemAt: ["$academicInfo.degreeOfStream", 0],
            },
            City: { $arrayElemAt: ["$academicInfo.city", 0] },
            PinCode: { $arrayElemAt: ["$academicInfo.pinCode", 0] },
            companyName: { $arrayElemAt: ["$professionalInfo.companyName", 0] },
            designation: { $arrayElemAt: ["$professionalInfo.designation", 0] },
            totalExperince: {
              $arrayElemAt: ["$professionalInfo.totalExperince", 0],
            },
            CiTy: { $arrayElemAt: ["$professionalInfo.city", 0] },
            Pincode: { $arrayElemAt: ["$professionalInfo.pinCode", 0] },
          },
        },
      ],
      (err, result) => {
        if (err) {
          return res.json({
            status: false,
            message: "Oops! Something went wrong. Please try again later",
            error: err,
          });
        }

        if (result.length === 0) {
          return res.json({ status: false, message: "User does not exist" });
        }

        return res.json({
          status: true,
          message: "User's information retrieved successfully",
          data: result,
        });
      }
    );
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.takeAssessment = async (req, res) => {
  try {
    const { sessionId, qList } = req.body;
    const userId = req.userid;
    if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.json({ status: false, message: "Invalid sessionId." });
    }
    // Check if the user has already taken the assessment
    const alreadyTaken = await exam.findOne({
      userId: userId,
      sessionId: sessionId,
    });
    if (alreadyTaken && String(alreadyTaken.sessionId) === String(sessionId)) {
      return res.json({
        status: false,
        message: "Oops! You have already attempted this exam.",
      });
    }

    // Prepare the examRecords array
    const examRecords = qList.map((qItem) => ({
      questionId: qItem.questionId,
      yourAnswer: qItem.yourAnswer || "",
      isAnswered: (qItem.yourAnswer || "").trim() !== "",
    }));

    // Fetch the correct answers from the database for the given sessionId
    const listOfQuesOfAss = await courseAssessment
      .find({ sessionId: sessionId })
      .select({ _id: 1, correctAnswer: 1 });

    // Count the correct answers
    const countCorrectAnswers = examRecords.filter((takenQuestion) => {
      const matchingAnswer = listOfQuesOfAss.find((question) =>
        question._id.equals(takenQuestion.questionId)
      );
      return (
        matchingAnswer &&
        matchingAnswer.correctAnswer === takenQuestion.yourAnswer
      );
    });

    // Prepare the data for the new exam entry
    const data = {
      userId: userId,
      sessionId: sessionId,
      examInfo: examRecords,
      obtainedMarks: countCorrectAnswers.length,
      maximumMarks: listOfQuesOfAss.length,
    };

    // Save the new exam entry
    const savedExams = await exam.create(data);

    return res.json({
      status: true,
      message: "Thanks for attending assessment.",
      data: savedExams,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.assessmentScore = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userid;

    const alreadyTaken = await exam.findOne({
      userId: userId,
      sessionId: sessionId,
    });

    // const listOfQuesOfAss = await courseAssessment.find({ "sessionId": sessionId })
    // // Create an array of objects that includes questions and corresponding answers
    // const questionsWithAnswers = listOfQuesOfAss.map(qObj => {
    //     const matchingAnswer = alreadyTaken.examInfo.find(takenQuestion => takenQuestion.questionId.equals(qObj._id));
    //     return {
    //         questionId: qObj._id,
    //         question: qObj.question,
    //         options: qObj.options,
    //         correctAnswer: qObj.correctAnswer,
    //         yourAnswer: matchingAnswer ? matchingAnswer.yourAnswer : null
    //     };
    // });

    return res.json({
      status: true,
      message: `You have already attempted this exam.`,
      data: alreadyTaken,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.downloadCertificate = async (req, res) => {
//     try {

//         const { courseId } = req.body;
//         const userId = req.userid;
//         let userInfo = await userModel.findById(userId);

//         const existingCourses = await userMyCourses.findOne({ userId, courseId });

//         if (!existingCourses) {

//             return res.json({ status: false, message: 'course does not exists' });
//         }

//         // let ttlCorseDur  =existingCourses.courseDuration * 90 /100;
//         // let totalWatchedDuration  =existingCourses.totalWatchedDuration;

//         if (existingCourses && existingCourses.isCourseCompleted == false) {

//             return res.json({ status: false, message: 'Please complete course at least 90% !!!' });
//         }

//         let sessions = existingCourses.watchedHistory.map(x => String(x.sessionId))

//         const topics = await courseSession.find({ _id: { $in: sessions } });
//         let coveredTopics = String(topics.map((x, i) => String(i + 1 + "." + x.title)))

//         // Your variable values
//         const StudentName = userInfo.fullName;
//         const CertificateDetail = `In recognition of participation in the ${existingCourses.
//             courseLevel} Training Course for pharmacy students entitled ${existingCourses.courseName}. Organized by KareerSity via Online from ${moment(existingCourses.createdAt).format('DD MMM YYYY')} to  ${moment(existingCourses.validTill).format('DD MMM YYYY')}`;
//         const TopicDetail = coveredTopics;
//         const cgDate = new Date(Date.now()).toLocaleDateString('en-GB');

//         // Generate HTML content using your function (krsCertTemp)
//         const htmlContent = krsCertTemp(StudentName, CertificateDetail, TopicDetail, cgDate);

//         const browser = await puppeteer.launch({
//             headless: 'new',
//             args: ['--disable-web-security', '--allow-file-access-from-files'],
//         });
//         const page = await browser.newPage();

//         await page.setContent(htmlContent);

//         const pdfPath = './uploads/certificate.pdf'; // Provide a complete file path
//         const pdfDirectory = './uploads'; // Directory path

//         // Create the directory if it doesn't exist
//         if (!fs.existsSync(pdfDirectory)) {
//             fs.mkdirSync(pdfDirectory, { recursive: true }); // Create directory recursively if needed
//         }

//       const pdfBuffer =  await page.pdf({
//             path: pdfPath,
//             format: 'A4',
//             printBackground: true
//         });

//         await browser.close();
//         //return pdfBuffer
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('Error generating certificate:', error);
//         res.send({ "status": false, "message": 'Error generating certificate' });
//     }
// }

exports.downloadCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userid;
    let userInfo = await userModel.findById(userId);

    const existingCourses = await userMyCourses.findOne({ userId, courseId });

    if (!existingCourses) {
      return res.json({ status: false, message: "course does not exist" });
    }

    if (existingCourses && existingCourses.isCourseCompleted == false) {
      return res.json({
        status: false,
        message: "Please complete the course at least 90% !!!",
      });
    }
    // else if (existingCourses && existingCourses.isCourseCompleted == true && (existingCourses.certUrl).trim().length != 0) {
    //     return res.json({ status: true, data: existingCourses.certUrl });
    // }

    let sessions = existingCourses.watchedHistory.map((x) =>
      String(x.sessionId)
    );
    const topics = await courseSession.find({ _id: { $in: sessions } });
    let coveredTopics = String(
      topics.map((x, i) => String(i + 1 + ". " + x.title))
    );

    // Your variable values
    const StudentName = userInfo.fullName;
    const CertificateDetail = `In recognition of participation in the ${
      existingCourses.courseLevel
    } Training Course for pharmacy students entitled ${
      existingCourses.courseName
    }. Organized by KareerSity via Online from ${moment(
      existingCourses.createdAt
    ).format("DD MMM YYYY")} to ${moment(existingCourses.validTill).format(
      "DD MMM YYYY"
    )}`;
    const TopicDetail = coveredTopics;
    const cgDate = new Date(Date.now()).toLocaleDateString("en-GB");

    const htmlContent = krsCertTemp(
      StudentName,
      CertificateDetail,
      TopicDetail,
      cgDate
    );

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.waitForTimeout(1000); // Adjust the wait time as needed

    const certificateTitle = await page.$(".pm-certificate-title");
    const studentName = await page.$(".pm-student-name");
    const certificateDetail = await page.$(".pm-earned-text");
    const topicDetail = await page.$(".pm-topic-detail");
    const creditsText = await page.$(".pm-credits-text");
    await page.setJavaScriptEnabled(true);
    await page.evaluateOnNewDocument(() => {
      const certificateTitle = document.querySelector(".pm-certificate-title");
      const studentName = document.querySelector(".pm-student-name");
      const certificateDetail = document.querySelector(".pm-earned-text");
      const topicDetail = document.querySelector(".pm-topic-detail");
      const cgDate = document.querySelector(".pm-credits-text");
    });
    await page.evaluate(() => {
      const certificateTitle = document.querySelector(".pm-certificate-title");
      const studentName = document.querySelector(".pm-student-name");
      const certificateDetail = document.querySelector(".pm-earned-text");
      const topicDetail = document.querySelector(".pm-topic-detail");
      const cgDate = document.querySelector(".pm-credits-text");

      console.log("Certificate Title:", certificateTitle.textContent);
      console.log("Student Name:", studentName.textContent);
      console.log("Certificate Detail:", certificateDetail.textContent);
      console.log("Topic Detail:", topicDetail.textContent);
      console.log("CG Date:", cgDate.textContent);
    });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err));

    // await page.screenshot({ path: 'screenshot.png' });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    const pdffile = {
      originalname: `${Date.now().toLocaleString()}_${StudentName}_Certificate.pdf`,
      buffer: pdfBuffer,
    };
    fileUpload(pdffile, async (uploadData) => {
      if (uploadData.status) {
        existingCourses.certUrl = uploadData.url;
        await existingCourses.save();
        return res.json({ status: true, data: uploadData.url });
      } else {
        res.json({
          status: false,
          message:
            "Error occurred while uploading the  picture, please try again",
        });
        return;
      }
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.send({ status: false, message: "Error generating certificate" });
  }
};

exports.subscribeNL = async (req, res) => {
  try {
    let { email } = req.body;

    newsLetterModel.findOne(
      { email: email, isSubscribed: true },
      (err, oldOtps) => {
        if (oldOtps) {
          res.json({
            status: true,
            message: "You have already subscribed our newsletter ",
          });
        } else {
          newsLetterModel.create(
            { email: email, isSubscribed: true },
            async (err, newUser) => {
              if (newUser) {
                const exTemp = await EmailTempModel.findOne({
                  templateName:
                    "To send mail when someone subscribe newsletter",
                });

                if (!exTemp) {
                  return res.json({
                    status: false,
                    message: "Template does not exist.!!!",
                  });
                }
                const username =
                  email.split("@")[0].charAt(0).toUpperCase() +
                  email.split("@")[0].slice(1);
                let dataToReplace = {
                  user: username,
                };
                let newTemp = UpdateTemplate(exTemp, dataToReplace);
                const template = newTemp.body,
                  subject = newTemp.subject;
                // console.log(newTemp.body, newTemp.subject, [email])

                SendSMail(
                  subject,
                  template,
                  [email],
                  config.krsAWSOptions.senderOrReplyTo,
                  config.krsAWSOptions.senderOrReplyTo
                )
                  .then(() => {
                    res.json({
                      status: true,
                      message: "Thanks for subscribing KareerSity ",
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    res.json({ status: false, message: "Failed to subscribe" });
                  });
                //res.json({ "status": true, "message": "Thanks for subscribing KareerSity " })
              } else {
                res.json({
                  status: false,
                  message: "Please try again after some time",
                });
              }
            }
          );
        }
      }
    );
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.subscribersListOfNewsLetter = async (req, res) => {
  try {
    newsLetterModel.find({}, (err, nlSubs) => {
      if (nlSubs) {
        res.json({ status: true, data: nlSubs });
      } else {
        res.json({ status: false, data: [] });
      }
    });
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
