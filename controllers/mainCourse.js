const courseMain = require("../models/courseMain");
const courseCategory = require("../models/courseCategory");
const courseSession = require("../models/courseSession");
const courseBundle = require("../models/courseBundle");
const lessonModel = require("../models/courseSessionLesson");
const {
  courseVideoUpload,
  courseVideoUploadTest,
  createMultipartUpload,
  createuploadLessTest,
  completeUploadTest,
  SendSMail,
} = require("../common/aws");
const courseAssessment = require("../models/courseAssessment");
const { default: mongoose } = require("mongoose");
const educator = require("../models/educator");
const userMyCourses = require("../models/userMyCourses");
const order = require("../models/order");
const courseSessionLesson = require("../models/courseSessionLesson");
const NewsletterSubscribers = require("../models/newsLetter");
const userSubscribedPlans = require("../models/userSubscriptionPlan");
const reviews = require("../models/reviews");
const user = require("../models/user");
const CartModel = require("../models/cart");
const OrderModel = require("../models/order");
const academic = require("../models/academic");
const professional = require("../models/professional");
const Notification = require("../models/Notification");
const admin = require("../models/admin");
const Institution = require("../models/institution");
const EmailTempModel = require("../models/emailTemplates");
const config = require("../nodedetails/config");

exports.addNewCourse = (req, res) => {
  try {
    let data = req.body;

    if (data && data.freeForEnInLast30Days) {
      const currentDate = new Date();
      data.expiry = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    if (data && data.freeForbasedOnColleges == true) {
      if (data && data.freeColleges == null) {
        return res.json({
          status: false,
          message: "Please, select atleast one college",
        });
      }
    } else {
      data.freeForbasedOnColleges == false;
      data.freeColleges = null;
    }

    if (data && data.isForCorporate == true) {
      if (data.corporate == null) {
        return res
          .status(400)
          .send({ status: false, message: "corporateId is required" });
      }
    } else {
      if (!data.forUsersOfType || data.forUsersOfType?.length === 0) {
        return res
          .status(400)
          .send({ status: false, message: "forUsersOfType is required" });
      }
    }

    // courseMain.findOne({ "title": data.title }, (err, exCourse) => {
    //     if (!exCourse) {

    courseCategory.findById({ _id: data.catId }, (err, exCat) => {
      if (exCat) {
        data.category = exCat._id;
        courseMain.create(data, (err, newCourse) => {
          if (newCourse) {
            res.json({
              status: true,
              message: "Thank you ! your course has been created successfully",
            });
          } else {
            res.json({
              status: false,
              message: err ? err.message : "Please try after some time",
            });
          }
        });
      } else {
        res.json({ status: false, message: "Please select the category" });
      }
    });

    //     } else {

    //         res.json({ "status": false, "message": `${exCourse.title} already exists` })

    //     }

    // })
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// This API for approve course Also

exports.editCourse = (req, res) => {
  try {
    let data = req.body;

    courseMain.findById({ _id: data.courseId }, (err, exCourse) => {
      if (exCourse) {
        data.category = data.catId;
        courseMain.findByIdAndUpdate(
          exCourse._id,
          data,
          { new: true },
          async (err, updatedCourse) => {
            if (updatedCourse) {
              if (
                updatedCourse &&
                updatedCourse.isApproved == true &&
                updatedCourse.regularPrice < exCourse.regularPrice
              ) {
                const users = await user.find();
                const notifications = users.map((user) => ({
                  userId: user._id,
                  message: `"${updatedCourse.title}" course price has dropped.Buy it fast...`,
                }));

                users.forEach(async (user) => {
                  const exTemp = await EmailTempModel.findOne({
                    templateName:
                      "To send mails  for  course price drop alert (Accessed by User)",
                  });

                  if (!exTemp) {
                    return res.json({
                      status: false,
                      message: "Template does not exist.!!!",
                    });
                  }
                  let dataToReplace = {
                    user: user.fullName,
                    coursename: updatedCourse.title,
                  };
                  let newTemp = UpdateTemplate(exTemp, dataToReplace);
                  const template = newTemp.body,
                    subject = newTemp.subject;

                  try {
                    await SendSMail(
                      subject,
                      template,
                      [user.email],
                      config.krsAWSOptions.senderOrReplyTo,
                      config.krsAWSOptions.senderOrReplyTo
                    );
                  } catch (err) {
                    console.error(err);
                  }
                });

                await Notification.insertMany(notifications);
              }

              res.json({
                status: true,
                message: "Course has been updated  successfully",
              });
            } else {
              res.json({
                status: false,
                message: "Please try after some time",
                error: err,
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: `Course does not exists` });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    let courseInfo = await courseMain.findById(courseId).select({
      category: 1,
      thumbnail: 1,
      title: 1,
      shortDescription: 1,
      duration: 1,
      level: 1,
      description: 1,
      whatWillYouLearn: 1,
      certifications: 1,
      whoThisCourseIsFor: 1,
      courseIncludes: 1,
      educators: 1,
      previewVideo: 1,
    });

    if (!courseInfo) {
      return res.json({ status: false, message: "course does not exist" });
    }

    let educatorInfo = await educator.findById(courseInfo.educators);
    if (!educatorInfo) {
      return res.json({ status: false, message: "Educator does not exist" });
    }

    let category = await courseCategory.findById(courseInfo.category);
    if (!category) {
      return res.json({ status: false, message: "Category does not exist" });
    }

    let sessionInfo = await courseSession.findOne({ courseId: courseInfo._id });
    if (!sessionInfo) {
      return res.json({
        status: false,
        message: "Course session does not exist",
      });
    }

    let lessonInfo = await courseSessionLesson.findOne({
      sessionId: sessionInfo._id,
    });
    if (!lessonInfo) {
      return res.json({
        status: false,
        message: "Course session lesson does not exist",
      });
    }

    let assessmentInfo = await courseAssessment.find({
      courseId: courseInfo._id,
    });

    if (!assessmentInfo || assessmentInfo.length == 0) {
      return res.json({
        status: false,
        message: "Course assessment does not exist",
      });
    } else if (assessmentInfo && assessmentInfo.length < 3) {
      return res.json({
        status: false,
        message: "Please add at least 3 questions in the assessment !!! ",
      });
    }

    let updatedCourse = await courseMain.findByIdAndUpdate(
      courseInfo._id,
      { isApproved: true },
      { new: true }
    );

    const users = await user.find();
    const notifications = users.map((user) => ({
      userId: user._id,
      message: `New course "${courseInfo.title}" added . you can purchase it`,
    }));

    await Notification.insertMany(notifications);
    if (updatedCourse) {
      users.forEach(async (user) => {
        try {
          let dataToReplace = {
            user: user.fullName,
            coursename: courseInfo.title,
            link:
              config.userContents.website +
              `/course-detail/${courseInfo._id}/${courseInfo.title.replace(
                / /g,
                "_"
              )}`,
          };

          const exTemp = await EmailTempModel.findOne({
            templateName:
              "To remind user when new course is added (Accessed by User)",
          });

          if (!exTemp) {
            return res.json({
              status: false,
              message: "Template does not exist.!!!",
            });
          }

          let newTemp = UpdateTemplate(exTemp, dataToReplace);
          const template = newTemp.body,
            subject = newTemp.subject;
          await SendSMail(
            subject,
            template,
            [user.email],
            config.krsAWSOptions.senderOrReplyTo,
            config.krsAWSOptions.senderOrReplyTo
          );
        } catch (err) {
          console.error(err);
        }
      });

      return res.json({
        status: true,
        message: "Course has been approved successfully",
      });
    } else {
      return res.json({ status: false, message: "Please try after some time" });
    }
  } catch (error) {
    console.log(error, "error");
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.uploadSingleFile = (req, res) => {
  try {
    const userFile = req.files["file"] ? req.files["file"][0] : null;

    if (!userFile || userFile == undefined) {
      res.json({ status: false, message: "Please provide a valid file" });
      return;
    }

    courseVideoUpload(userFile, (uploadData) => {
      if (uploadData.status) {
        res.json({ status: true, url: uploadData.url });
      } else {
        res.json({
          status: false,
          message: "Error occurred while uploading the file, please try again",
        });
        return;
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

exports.deleteCourse = async (req, res) => {
  try {
    let courseId = req.body.courseId;

    let exCourse = await courseMain.findById({ _id: courseId }).exec();

    if (!exCourse) {
      return res.json({ status: false, message: "Course does not exist" });
    }
    // check Purchased order
    let exUserOrder = await OrderModel.findOne({
      "items.courseId": courseId,
      status: "success",
    }).exec();

    if (exUserOrder) {
      return res.json({
        status: false,
        message: "Cannot delete purchased course.!!!",
      });
    }

    let exUserWishList = await user.find({ favorite: courseId }).exec();

    if (exUserWishList && exUserWishList.length > 0) {
      for (let i = 0; i < exUserWishList.length; i++) {
        let userToUpdate = exUserWishList[i];
        let updatedWishlist = userToUpdate.favorite.filter(
          (item) => String(item) !== courseId
        );
        userToUpdate.favorite = updatedWishlist;
        await userToUpdate.save();
      }
    }

    let exUserCart = await CartModel.find({
      "items.courseId": courseId,
    }).exec();

    if (exUserCart && exUserCart.length > 0) {
      for (let i = 0; i < exUserCart.length; i++) {
        let cartToUpdate = exUserCart[i];
        let updatedItems = cartToUpdate.items.filter(
          (item) => String(item.courseId) !== courseId
        );
        cartToUpdate.items = updatedItems;
        await cartToUpdate.save();
      }
    }

    let deletedCourse = await courseMain
      .findByIdAndDelete({ _id: courseId })
      .exec();

    if (deletedCourse) {
      return res.json({
        status: true,
        message: "Course has been deleted successfully",
      });
    }
    return res.json({ status: false, message: "Course does not exist" });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.courseInfo = async (req, res) => {
//     try {
//         const { id } = req.params;

//         let courseInfo = await courseMain.findById(id);

//         if (!courseInfo) {
//             return res.json({ "status": true, "message": "course does not exists" });
//         }

//         let cat = await courseCategory.findById(courseInfo.category).select({"_id":0,"name":1});
//         let educ = await educator.findById(courseInfo.educators).select({"_id":0,"name":1});

//         courseMain.aggregate([
//             { $match: { _id: courseInfo._id } },
//             {
//                 $lookup: {
//                     from: 'KrSity_NOISSES',
//                     localField: '_id',
//                     foreignField: 'courseId',
//                     as: 'sessions'
//                 }
//             },

//             {
//                 $lookup: {
//                     from: 'KrSity_NOSSEL',
//                     localField: '_id',
//                     foreignField: 'courseId',
//                     as: 'lessons'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'KrSity_TNEMSSESSA',
//                     localField: '_id',
//                     foreignField: 'courseId',
//                     as: 'assessments'
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'KrSity_YROGETAC',
//                     localField: courseInfo.category,//mongoose.Types.ObjectId(courseInfo.category),
//                     foreignField: '_id',
//                     as: 'cats'
//                 }
//             },
//             {
//                 $project: {
//                     "_id": 1,
//                     "category": 1,
//                     "title": 1,
//                     "shortDescription": 1,
//                     "duration": 1,
//                     "level": 1,
//                     "freeFor": 1,
//                     "freeColleges": 1,
//                     "price": 1,
//                     "discountedPrice": 1,
//                     "description": 1,
//                     "certifications": 1,
//                     "whoThisCourseIsFor": 1,
//                     "courseIncludes": 1,
//                     "educators": 1,
//                     "isApproved": 1,
//                     "session": {
//                         $map: {
//                             input: "$sessions",
//                             as: "sess",
//                             in: {
//                                 _id: "$$sess._id",
//                                 sessionNo: "$$sess.sessionNo",
//                                 title: "$$sess.title",
//                                 lessons: {
//                                     $filter: {
//                                         input: "$lessons",
//                                         as: "les",
//                                         cond: { $eq: ["$$les.sessionId", "$$sess._id"] }
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     "assessments": {
//                         $map: {
//                             input: "$assessments",
//                             as: "assess",
//                             in: {
//                                 _id: "$$assess._id",
//                                 question: "$$assess.question",
//                                 options: "$$assess.options"
//                             }
//                         }
//                     }

//                 }
//             },

//             { $sort: { "session.lessons.lessonNo": 1 } }

//         ], (err, result) => {
//             if (err) {
//                 return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later", error: err });
//             }

//             if (result.length === 0) {
//                 return res.json({ "status": false, "message": "course does not exist" });
//             }

//             result[0].category = cat.name;
//             result[0].educators = educ.name;

//             return res.json({
//                 "status": true,
//                 "message": "course information retrieved successfully",
//                 "data": result
//             });
//         });

//     } catch (e) {
//         console.log(e);
//         return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
//     }
// };

exports.courseDetail = async (req, res) => {
  try {
    const { courseId } = req.body;

    let courseInfo = await courseMain.findById(courseId);

    if (!courseInfo) {
      return res.json({ status: false, message: "course does not exists" });
    }

    let categoryInfo = await courseCategory.findById(courseInfo.category);
    if (!categoryInfo) {
      return res.json({ status: false, message: "category does not exists" });
    }
    let educatorInfo = await educator.findById(courseInfo.educators);
    if (!educatorInfo) {
      return res.json({ status: false, message: "Educator does not exists" });
    }

    return res.json({
      status: true,
      message: "course information retrieved successfully",
      data: {
        courseInfo,
        categoryInfo,
        educatorInfo,
      },
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.courseInfo = async (req, res) => {
  try {
    const { id } = req.params;

    let courseInfo = await courseMain.findById(id);

    if (!courseInfo) {
      return res.json({ status: false, message: "course does not exists" });
    }

    let cat = await courseCategory
      .findById(courseInfo.category)
      .select({ _id: 0, name: 1 });
    if (!cat) {
      return res.json({ status: false, message: "category does not exists" });
    }
    let educ = await educator.findById(courseInfo.educators);
    if (!educ) {
      return res.json({ status: false, message: "Educator does not exists" });
    }

    courseMain.aggregate(
      [
        { $match: { _id: courseInfo._id } },
        {
          $lookup: {
            from: "KrSity_NOISSES",
            localField: "_id",
            foreignField: "courseId",
            as: "sessions",
          },
        },

        {
          $lookup: {
            from: "KrSity_NOSSEL",
            localField: "_id",
            foreignField: "courseId",
            as: "lessons",
          },
        },
        {
          $lookup: {
            from: "KrSity_TNEMSSESSA",
            localField: "_id",
            foreignField: "courseId",
            as: "assessments",
          },
        },
        {
          $lookup: {
            from: "KrSity_YROGETAC",
            localField: courseInfo.category, //mongoose.Types.ObjectId(courseInfo.category),
            foreignField: "_id",
            as: "cats",
          },
        },
        {
          $project: {
            _id: 1,
            category: 1,
            title: 1,
            thumbnail: 1,
            previewVideo: 1,
            shortDescription: 1,
            duration: 1,
            level: 1,
            freeForEveryone: 1,
            freeForEnInLast30Days: 1,
            freeForbasedOnColleges: 1,
            freeColleges: 1,
            price: 1,
            regularPrice: 1,
            discountedPrice: 1,
            discountedPriceExpiry: 1,
            description: 1,
            certifications: 1,
            whatWillYouLearn: 1,
            whoThisCourseIsFor: 1,
            courseIncludes: 1,
            educators: 1,
            isApproved: 1,
            session: {
              $map: {
                input: "$sessions",
                as: "sess",
                in: {
                  _id: "$$sess._id",
                  sessionNo: "$$sess.sessionNo",
                  title: "$$sess.title",
                  lessons: {
                    $filter: {
                      input: "$lessons",
                      as: "les",
                      cond: { $eq: ["$$les.sessionId", "$$sess._id"] },
                    },
                  },
                  assessments: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$assessments",
                          as: "assess",
                          cond: { $eq: ["$$assess.sessionId", "$$sess._id"] },
                        },
                      },
                      as: "assess",
                      in: {
                        _id: "$$assess._id",
                        question: "$$assess.question",
                        options: "$$assess.options",
                        correctAnswer: "$$assess.correctAnswer",
                      },
                    },
                  },
                },
              },
            },
          },
        },

        { $sort: { "session.lessons.lessonNo": 1 } },
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
          return res.json({ status: false, message: "course does not exist" });
        }

        result[0].category = cat.name;
        result[0].educators = educ;

        return res.json({
          status: true,
          message: "course information retrieved successfully",
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

// exports.listOfCourses = async (req, res) => {
//     try {
//         let fetchCatEdu = await courseMain.find({}).select({
//             "_id": 1,
//             "title": 1,
//             "category": 1,
//             "thumbnail": 1,
//             "previewVideo": 1,
//             "duration": 1,
//             "level": 1,
//             "price": 1,
//             "regularPrice": 1,
//             "discountedPrice": 1,
//             "discountedPriceExpiry": 1,
//             "educators": 1,
//             "isApproved": 1
//         });

//         if (fetchCatEdu.length === 0) {
//             return res.json({ "status": false, "message": "Courses list is empty", data: [] });
//         }

//         // Uncomment the following code to transform the data
//         for (let i = 0; i < fetchCatEdu.length; i++) {
//             let cat = await courseCategory.findOne({ _id: fetchCatEdu[i].category });

//             if (cat) {
//                 fetchCatEdu[i].category = cat.name;
//             } else {
//                 fetchCatEdu[i].category = "Unknown Category";
//             }

//             let edu = await educator.findById(fetchCatEdu[i].educators);

//             if (edu) {
//                 fetchCatEdu[i].educators = edu.name;
//             } else {
//                 fetchCatEdu[i].educators = "Unknown Educator";
//             }
//         }

//         // let newData = fetchCatEdu.filter(x => x.educators != "Unknown Educator" && x.category != "Unknown Category");

//         res.json({ "status": true, "message": `${fetchCatEdu.length} course(s) found`, data: fetchCatEdu });

//     } catch (error) {
//         console.log(error);
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
//     }
// };

exports.listOfCourses = async (req, res) => {
  try {
    let {
      title,
      educatorSearch,
      selectCategory,
      price,
      pending,
      approved,
      pageNo,
    } = req.body;
    pageNo = pageNo ? pageNo : 1;

    let query = {};
    let itemsPerPage = 20;

    let userId = req.userId;
    let fetchEducatorEmail = await admin
      .findById(userId)
      .select({ _id: 1, email: 1, type: 1 });
    if (fetchEducatorEmail && fetchEducatorEmail.type == "educator") {
      let educatorInfo = await educator
        .findOne({ email: fetchEducatorEmail.email })
        .select({ _id: 1 });
      query.educators = String(educatorInfo._id);
    }

    // Handle "pending" and "approved" conditions
    if (pending === "1" || pending === 1) {
      query.isApproved = false;
    } else if (approved === "1" || approved === 1) {
      query.isApproved = true;
    }

    // Combine title and category conditions
    if (title && selectCategory) {
      query.title = { $regex: title, $options: "i" };
      query.category = selectCategory;
    } else if (title) {
      query.title = { $regex: title, $options: "i" };
    } else if (selectCategory) {
      query.category = selectCategory;
    } else if (educatorSearch) {
      let educatorSearchInfo = await educator
        .findOne({
          $or: [
            { name: new RegExp(educatorSearch, "i") },
            { email: new RegExp(educatorSearch, "i") },
          ],
        })
        .select({ _id: 1 });
      query.educators = educatorSearchInfo
        ? String(educatorSearchInfo._id)
        : null;
    }

    // Handle price conditions
    if (price) {
      if (price.toLowerCase() === "free") {
        query.$or = [
          { price: 0 },
          { regularPrice: 0 },
          {
            discountedPrice: 0,
            discountedPriceExpiry: { $gt: Date.now() / 1000 },
          },
          { price: 0, regularPrice: 0, discountedPrice: 0 }, // All three are zero
        ];
      } else if (price.toLowerCase() === "paid") {
        query.$or = [
          { price: { $gt: 0 } },
          { regularPrice: { $gt: 0 } },
          {
            discountedPrice: { $gt: 0 },
            discountedPriceExpiry: { $lt: Date.now() / 1000 },
          },
        ];
      }
    }

    const totalCourses = await courseMain.countDocuments(query);
    if (!totalCourses) {
      return res.json({
        status: false,
        message: "Courses list is empty",
        data: [],
      });
    }
    const totalPages = Math.ceil(totalCourses / itemsPerPage);
    const currentPage = Math.min(pageNo, totalPages);

    const skipCount = (currentPage - 1) * itemsPerPage;

    let fetchCourse = await courseMain
      .find(query)
      .select({
        _id: 1,
        title: 1,
        category: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        freeForEveryone: 1,
        freeForEnInLast30Days: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        expiry: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        educators: 1,
        isApproved: 1,
      })
      .skip(skipCount)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    for (let i = 0; i < fetchCourse.length; i++) {
      let eduInfo = await educator
        .findOne({ _id: fetchCourse[i].educators })
        .select({ _id: 1, name: 1 });

      fetchCourse[i].educators = eduInfo ? eduInfo.name : "NA";

      let catInfo = await courseCategory
        .findOne({ _id: fetchCourse[i].category })
        .select({ _id: 1, name: 1 });

      fetchCourse[i].category = catInfo ? catInfo.name : "NA";
    }

    res.json({
      status: true,
      message: `${totalCourses} course(s) found`,
      totalPages: totalPages,
      currentPage: currentPage,
      data: fetchCourse,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.listOfActiveCoursesWithFilterAndSortBy = async (req, res) => {
  try {
    let {
      selectedCategories,
      price,
      level,
      low_to_high,
      high_to_low,
      newest_to_oldest,
      oldest_to_newest,
      pageNo,
      corporate,
      userType,
    } = req.body;
    pageNo = pageNo ? pageNo : 1;

    //discountedPriceExpiry : { $gt : Date.now() /1000 }

    let query = { isApproved: true };

    if (price && price.toLowerCase() === "free") {
      query = {
        $or: [
          { regularPrice: 0 },
          { freeForEveryone: true },
          { freeForEnInLast30Days: true, expiry: { $gt: new Date() } },
        ],
      };
    } else if (price && price.toLowerCase() === "paid") {
      query = {
        $and: [
          { regularPrice: { $ne: 0 } },
          { freeForEveryone: false },
          { freeForEnInLast30Days: false },
        ],
      };
    }

    let itemsPerPage = 20;

    if (selectedCategories) {
      //console.log(selectedCategories,"selectedCategories")
      query.category = { $in: selectedCategories };
    }
    if (level) {
      query.level = { $regex: level, $options: "i" };
    }

    if (corporate && corporate != "undefined") {
      query.corporate = corporate;
    } else {
      query.forUsersOfType = userType;
    }
    let sortOption = { createdAt: -1 };
    if (low_to_high == 1) {
      sortOption.price = 1;
    } else if (high_to_low == 1) {
      sortOption.price = -1;
    } else if (newest_to_oldest == 1) {
      sortOption.createdAt = -1;
    } else if (oldest_to_newest == 1) {
      sortOption.createdAt = 1;
    }

    const totalCourses = await courseMain.countDocuments(query);
    if (!totalCourses) {
      return res.json({
        status: false,
        message: "Courses list is empty",
        data: [],
      });
    }
    const totalPages = Math.ceil(totalCourses / itemsPerPage);
    const currentPage = Math.min(pageNo, totalPages);

    const skipCount = (currentPage - 1) * itemsPerPage;

    let fetchCourse = await courseMain
      .find(query)
      .select({
        _id: 1,
        title: 1,
        category: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        freeForEveryone: 1,
        freeForEnInLast30Days: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        expiry: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        educators: 1,
        isApproved: 1,
        createdAt: 1,
      })
      .skip(skipCount)
      .limit(itemsPerPage)
      .sort(sortOption);

    for (let i = 0; i < fetchCourse.length; i++) {
      let eduInfo = await educator
        .findOne({ _id: fetchCourse[i].educators })
        .select({ _id: 1, name: 1 });

      fetchCourse[i].educators = eduInfo ? eduInfo.name : "Kareer Sity";
    }

    const reviewPromises = fetchCourse.map((course) =>
      reviews.find({ courseId: course._id, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    fetchCourse.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    res.json({
      status: true,
      message: `${totalCourses} course(s) found`,
      totalPages: totalPages,
      currentPage: currentPage,
      data: fetchCourse,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.listOfActiveCourses = async (req, res) => {
  try {
    let fetchCourse = await courseMain
      .find({ isApproved: true })
      .select({
        _id: 1,
        title: 1,
        category: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        freeForEveryone: 1,
        freeForEnInLast30Days: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        expiry: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        educators: 1,
        isApproved: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      message: `${fetchCourse.length} course(s) found`,
      data: fetchCourse,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.view_active_courseInfo = async (req, res) => {
  try {
    const { id } = req.params;

    let courseInfo = await courseMain.findById(id);

    if (!courseInfo) {
      return res.json({ status: false, message: "course does not exists" });
    }

    let cat = await courseCategory
      .findById(courseInfo.category)
      .select({ _id: 0, name: 1 });
    if (!cat) {
      return res.json({ status: false, message: "category does not exists" });
    }
    let educ = await educator.findById(courseInfo.educators).select({
      _id: 1,
      name: 1,
      photoUrl: 1,
      expertise: 1,
      designation: 1,
      description: 1,
    });
    if (!educ) {
      return res.json({ status: false, message: "Educator does not exists" });
    }
    let countEducatorCourses = await courseMain.countDocuments({
      educators: educ._id,
    });
    educ._doc.countCourses = countEducatorCourses;
    courseMain.aggregate(
      [
        { $match: { _id: courseInfo._id } },
        {
          $lookup: {
            from: "KrSity_NOISSES",
            localField: "_id",
            foreignField: "courseId",
            as: "sessions",
          },
        },

        {
          $lookup: {
            from: "KrSity_NOSSEL",
            localField: "_id",
            foreignField: "courseId",
            as: "lessons",
          },
        },

        {
          $lookup: {
            from: "KrSity_YROGETAC",
            localField: courseInfo.category, //mongoose.Types.ObjectId(courseInfo.category),
            foreignField: "_id",
            as: "cats",
          },
        },
        {
          $lookup: {
            from: "KrSity_ROTACUDE",
            localField: courseInfo.educators,
            foreignField: "_id",
            as: "educatorInfo",
          },
        },
        {
          $project: {
            _id: 1,
            category: 1,
            title: 1,
            thumbnail: 1,
            previewVideo: 1,
            shortDescription: 1,
            duration: 1,
            level: 1,
            freeColleges: 1,
            freeForEveryone: 1,
            freeForEnInLast30Days: 1,
            freeForbasedOnColleges: 1,
            freeColleges: 1,
            price: 1,
            regularPrice: 1,
            discountedPrice: 1,
            discountedPriceExpiry: 1,
            expiry: 1,
            description: 1,
            certifications: 1,
            whatWillYouLearn: 1,
            whoThisCourseIsFor: 1,
            courseIncludes: 1,
            educators: 1,
            countEducatorCourses: 1,
            isApproved: 1,
            avgRating: 1,
            totalRatings: 1,
            session: {
              $map: {
                input: "$sessions",
                as: "sess",
                in: {
                  _id: "$$sess._id",
                  sessionNo: "$$sess.sessionNo",
                  title: "$$sess.title",
                  lessons: {
                    $filter: {
                      input: "$lessons",
                      as: "les",
                      cond: { $eq: ["$$les.sessionId", "$$sess._id"] },
                    },
                  },
                },
              },
            },
          },
        },

        { $sort: { "session.lessons.lessonNo": 1 } },
      ],
      async (err, result) => {
        if (err) {
          return res.json({
            status: false,
            message: "Oops! Something went wrong. Please try again later",
            error: err,
          });
        }

        if (result.length === 0) {
          return res.json({ status: false, message: "course does not exist" });
        }

        let educatorENCourses = await courseMain
          .find({ educators: courseInfo.educators })
          .select({ _id: 1 });
        let educatorENCoursesIDs = educatorENCourses.map((x) => String(x._id));
        let educatorENStudents = await order.countDocuments({
          "items.courseId": { $in: educatorENCoursesIDs },
        });
        let ttlENStudentsPerCourse = await order.countDocuments({
          "items.courseId": id,
        });

        educ._doc.totalStudents = educatorENStudents;
        result[0].category = cat.name;
        result[0].educators = educ;
        const reviewPromises = await reviews.find({
          courseId: id,
          isApproved: true,
        });
        // console.log(reviewPromises,"reviewPromises")
        let reviewCount = 0;
        let totalRatings = 0;
        let totalReviews = 0;
        let total5StarRatings = 0;
        let total4StarRatings = 0;
        let total3StarRatings = 0;
        let total2StarRatings = 0;
        let total1StarRatings = 0;

        if (reviewPromises && reviewPromises.length !== 0) {
          reviewPromises.forEach((review) => {
            if (review.rating == 5) {
              total5StarRatings++;
              totalRatings += review.rating;
              totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
              reviewCount++;
            } else if (review.rating == 4) {
              total4StarRatings++;
              totalRatings += review.rating;
              totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
              reviewCount++;
            } else if (review.rating == 3) {
              total3StarRatings++;
              totalRatings += review.rating;
              totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
              reviewCount++;
            } else if (review.rating == 2) {
              total2StarRatings++;
              totalRatings += review.rating;
              totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
              reviewCount++;
            } else if (review.rating == 1) {
              total1StarRatings++;
              totalRatings += review.rating;
              totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
              reviewCount++;
            }
          });
        } else {
          totalRatings = 0;
          reviewCount = 0;
        }

        const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
        // console.log(avgRating,"avgRating")
        result[0].avgRating = avgRating.toFixed(1);
        result[0].totalRatings = reviewCount;
        result[0].total5StarRatings = total5StarRatings;
        result[0].total4StarRatings = total4StarRatings;
        result[0].total3StarRatings = total3StarRatings;
        result[0].total2StarRatings = total2StarRatings;
        result[0].total1StarRatings = total1StarRatings;
        result[0].totalReviews = totalReviews;
        result[0].totalStudents = ttlENStudentsPerCourse;

        return res.json({
          status: true,
          message: "course information retrieved successfully",
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

exports.view_active_course_ratings_and_reviews = async (req, res) => {
  try {
    let { courseId } = req.body;

    const rrInfo = await reviews.find({ courseId: courseId, isApproved: true });
    if (!rrInfo || rrInfo.length === 0) {
      return res.json({
        status: true,
        message: "List of ratings and reviews is empty !!!",
      });
    }

    const userIds = rrInfo.map((item) => item.userId);
    const courseIds = rrInfo.map((item) => item.courseId);

    // Batch database queries
    const [userInfo, userAcademicInfo, userProfessionalInfo, courseInfo] =
      await Promise.all([
        user
          .find({ _id: { $in: userIds } })
          .select({ _id: 1, userType: 1, profilePic: 1, fullName: 1 }),
        academic
          .find({ userId: { $in: userIds } })
          .select({ userId: 1, collegeName: 1, degreeOfStream: 1 }),
        professional
          .find({ userId: { $in: userIds } })
          .select({ userId: 1, companyName: 1, designation: 1 }),
        courseMain.find({ _id: { $in: courseIds } }).select({
          _id: 1,
          title: 1,
          price: 1,
          regularPrice: 1,
          discountedPrice: 1,
          discountedPriceExpiry: 1,
        }),
      ]);

    // don't delete
    // const listOfRR = rrInfo.map((item, index) => ({

    //     ...item._doc,
    //     fullName: userInfo[index]?._doc?.fullName,
    //     userType: userInfo[index]?._doc?.userType,
    //     collegeName: userAcademicInfo.find((info) => info.userId.equals(userIds[index]))?._doc?.collegeName,
    //     degreeOfStream: userAcademicInfo.find((info) => info.userId.equals(userIds[index]))?._doc?.degreeOfStream,
    //     companyName: userProfessionalInfo.find((info) => info.userId.equals(userIds[index]))?._doc?.companyName,
    //     designation: userProfessionalInfo.find((info) => info.userId.equals(userIds[index]))?._doc?.designation,
    //     title: courseInfo.find((info) => info._id.equals(courseIds[index]))?._doc?.title,
    //     price: courseInfo.find((info) => info._id.equals(courseIds[index]))?._doc?.price,
    //     regularPrice: courseInfo.find((info) => info._id.equals(courseIds[index]))?._doc?.regularPrice,
    //     discountedPrice: courseInfo.find((info) => info._id.equals(courseIds[index]))?._doc?.discountedPrice,
    //     discountedPriceExpiry: courseInfo.find((info) => info._id.equals(courseIds[index]))?._doc?.discountedPriceExpiry,
    // }));

    const listOfRR = rrInfo.map((item, index) => {
      const userIndex = userIds.indexOf(item.userId);
      const user = userInfo[userIndex];
      //  console.log(userInfo.find((info) => info._id.equals(userIds[index]))?._doc?.profilePic ,user)
      return {
        ...item._doc,
        fullName: userInfo.find((info) => info._id.equals(userIds[index]))?._doc
          ?.fullName,
        userProfile: userInfo.find((info) => info._id.equals(userIds[index]))
          ?._doc?.profilePic,
        userType: userInfo.find((info) => info._id.equals(userIds[index]))?._doc
          ?.userType,
        collegeName: userAcademicInfo.find((info) =>
          info.userId.equals(userIds[index])
        )?._doc?.collegeName,
        degreeOfStream: userAcademicInfo.find((info) =>
          info.userId.equals(userIds[index])
        )?._doc?.degreeOfStream,
        companyName: userProfessionalInfo.find((info) =>
          info.userId.equals(userIds[index])
        )?._doc?.companyName,
        designation: userProfessionalInfo.find((info) =>
          info.userId.equals(userIds[index])
        )?._doc?.designation,
      };
    });

    res.json({
      status: true,
      message: "List of ratings and reviews",
      data: listOfRR,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.view_active_related_courses_courseInfo = async (req, res) => {
  try {
    const { id } = req.params;

    let courseInfo = await courseMain.findById(id);

    if (!courseInfo) {
      return res.json({ status: false, message: "course does not exists" });
    }
    let relatedCourses = await courseMain
      .find({ category: courseInfo.category, isApproved: true })
      .select({
        _id: 1,
        title: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        freeForEveryone: 1,
        freeForEnInLast30Days: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        expiry: 1,
      })
      .limit(10)
      .sort({ createdAt: -1 });

    if (relatedCourses.length === 0) {
      return res.json({
        status: false,
        message: "Courses list is empty",
        data: [],
      });
    }

    const reviewPromises = relatedCourses.map((course) =>
      reviews.find({ courseId: course._id, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    relatedCourses.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    return res.json({ status: true, data: relatedCourses });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.list_of_free_courses = async (req, res) => {
//     try {
//         let relatedCourses = await courseMain.find({
//             $and: [
//                 { $or: [{ "regularPrice": 0 }, { "freeForEveryone": true }] },
//                 { "isApproved": true }
//             ]
//         }).select({
//             "_id": 1,
//             "title": 1,
//             "thumbnail": 1,
//             "previewVideo": 1,
//             "duration": 1,
//             "level": 1,
//             "discountedPrice": 1,
//             "discountedPriceExpiry": 1,
//             "regularPrice": 1,
//             "freeForEveryone": 1,
//             "price": 1

//         }).limit(20).sort({ "createdAt": -1 });

//         if (relatedCourses.length === 0) {
//             return res.json({ "status": false, "message": "Courses list is empty", data: [] });
//         }
//         return res.json({ "status": true, data: relatedCourses });

//     } catch (e) {
//         console.log(e);
//         return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
//     }
// };

// exports.list_of_free_courses = async (req, res) => {
//     try {
//         let relatedCourses = await courseMain.find({
//             $and: [
//                 { $or: [{ "regularPrice": 0 }, { "freeForEveryone": true }] },
//                 { "isApproved": true }
//             ]
//         }).select({
//             "_id": 1,
//             "title": 1,
//             "thumbnail": 1,
//             "previewVideo": 1,
//             "duration": 1,
//             "level": 1,
//             "discountedPrice": 1,
//             "discountedPriceExpiry": 1,
//             "regularPrice": 1,
//             "freeForEveryone": 1,
//             "price": 1,
//             "avgRating": 1,
//             "totalRatings": 1,

//         }).limit(20).sort({ "createdAt": -1 });

//         if (relatedCourses.length === 0) {
//             return res.json({ "status": false, "message": "Courses list is empty", data: [] });
//         }

//         for (let i = 0; i < relatedCourses.length; i++) {
//             let rrInfo = await reviews.find({ courseId: relatedCourses[i]._id })
//             let reviewCount = 0;
//             let totalRatings = 0
//             console.log(rrInfo, "rrinfo")
//             if (rrInfo && rrInfo.length != 0) {
//                 rrInfo.forEach(review => {
//                     if (review.rating) {
//                         totalRatings += review.rating;
//                         reviewCount++;
//                     }
//                 });
//             }else{
//                 totalRatings = 0;
//                 reviewCount = 0;
//             }
//             const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
//             console.log(avgRating, reviewCount, totalRatings, "avgRating")
//             relatedCourses[i]._doc.avgRating = (avgRating).toFixed(1);
//             relatedCourses[i]._doc.totalRatings = reviewCount;
//         }
//         return res.json({ "status": true, data: relatedCourses });

//     } catch (e) {
//         console.log(e);
//         return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
//     }
// };

exports.list_of_free_courses = async (req, res) => {
  try {
    const relatedCourses = await courseMain
      .find({
        $and: [
          { $or: [{ regularPrice: 0 }, { freeForEveryone: true }] },
          { isApproved: true },
        ],
      })
      .select({
        _id: 1,
        title: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        regularPrice: 1,
        freeForEveryone: 1,
        price: 1,
      })
      .limit(20)
      .sort({ createdAt: -1 });

    if (relatedCourses.length === 0) {
      return res.json({
        status: false,
        message: "Courses list is empty",
        data: [],
      });
    }

    const reviewPromises = relatedCourses.map((course) =>
      reviews.find({ courseId: course._id, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    relatedCourses.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    return res.json({ status: true, data: relatedCourses });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.list_of_popular_courses = async (req, res) => {
  try {
    const top20CoursesFromOrders = await order.aggregate([
      {
        $unwind: "$items", // Deconstruct the items array
      },
      {
        $group: {
          _id: "$items.courseId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    const top20CourseIds = top20CoursesFromOrders.map((item) => item._id);
    // console.log(top20CoursesFromOrders,top20CourseIds)
    let relatedCourses = await courseMain
      .find({
        _id: { $in: top20CourseIds },
      })
      .select({
        _id: 1,
        title: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        freeForEveryone: 1,
        freeForEnInLast30Days: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        expiry: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
      })
      .sort({ createdAt: -1 });

    if (relatedCourses.length === 0) {
      return res.json({
        status: false,
        message: "Courses list is empty",
        data: [],
      });
    }

    const reviewPromises = relatedCourses.map((course) =>
      reviews.find({ courseId: course._id, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    relatedCourses.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    return res.json({ status: true, data: relatedCourses });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.list_of_searched_courses = async (req, res) => {
  try {
    let { search } = req.body;
    let searchedCourses = await courseMain
      .find({
        isApproved: true,
        title: { $regex: search ? search.trim() : "", $options: "i" },
      })
      .select({
        _id: 1,
        title: 1,
        thumbnail: 1,
        previewVideo: 1,
        duration: 1,
        level: 1,
        price: 1,
        regularPrice: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
        freeForEveryone: 1,
        freeForbasedOnColleges: 1,
        freeColleges: 1,
        educators: 1,
      })
      .limit(10)
      .sort({ createdAt: -1 });

    if (searchedCourses.length === 0) {
      return res.json({
        status: true,
        message: "Courses list is empty",
        data: [],
      });
    }

    for (let element of searchedCourses) {
      let educatorInfo = await educator
        .findById(element.educators)
        .select({ name: 1 });
      if (educatorInfo) {
        element.educators = educatorInfo.name;
      } else {
        element.educators = "Kareer Sity";
      }
    }

    const reviewPromises = searchedCourses.map((course) =>
      reviews.find({ courseId: course._id, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    searchedCourses.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    return res.json({ status: true, data: searchedCourses });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//============================================== Session  ==================================================

exports.addNewSessionInCourse = (req, res) => {
  try {
    let data = req.body;

    courseMain.findById({ _id: data.courseId }, (err, exCourse) => {
      if (exCourse) {
        courseSession.findOne(
          { title: data.title, courseId: data.courseId },
          (err, exSession) => {
            if (!exSession) {
              courseSession.find(
                { courseId: data.courseId },
                (err, exSessionNo) => {
                  let sessNo = 1;
                  if (exSessionNo && exSessionNo.length > 0) {
                    const sessionNos = exSessionNo.map((session) =>
                      parseInt(session.sessionNo)
                    );
                    sessNo = Math.max(...sessionNos) + 1;
                  }

                  data.sessionNo = sessNo;
                  courseSession.create(data, (err, newSession) => {
                    if (newSession) {
                      res.json({
                        status: true,
                        message:
                          "New session successfully added to your course",
                        data: newSession,
                      });
                    } else {
                      res.json({ status: false, message: "Please try again." });
                    }
                  });
                }
              );
            } else {
              res.json({
                status: false,
                message: `Title '${data.title}' already exists. `,
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: "Course does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.editSessionInCourse = (req, res) => {
  try {
    let data = req.body;

    courseSession.findById({ _id: data.sessionId }, (err, exSession) => {
      if (exSession) {
        courseMain.findOne({ _id: data.courseId }, (err, exCourse) => {
          if (exCourse) {
            courseSession.findByIdAndUpdate(
              exSession._id,
              data,
              { new: true },
              (err, updatedSession) => {
                if (updatedSession) {
                  res.json({
                    status: true,
                    message: "Session updated successfully",
                    data: updatedSession,
                  });
                } else {
                  res.json({
                    status: false,
                    message: "Failed to update session. Please try again.",
                  });
                }
              }
            );
          } else {
            res.json({ status: false, message: "Course does not exist." });
          }
        });
      } else {
        res.json({ status: false, message: "Session does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.fetchSessionInCourse = (req, res) => {
  try {
    let data = req.body;

    courseSession.findById({ _id: data.sessionId }, (err, exSession) => {
      if (exSession) {
        res.json({
          status: true,
          message: "Session found successfully",
          data: exSession,
        });
      } else {
        res.json({ status: false, message: "Session does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.sessionListInCourse = (req, res) => {
  try {
    let data = req.body;

    courseSession
      .find({ courseId: data.courseId })
      .select({ _id: 1, sessionNo: 1, title: 1 })
      .sort({ sessionNo: 1 })
      .then((exSession) => {
        if (exSession.length > 0) {
          res.json({
            status: true,
            message: "Session found successfully",
            data: exSession,
          });
        } else {
          res.json({ status: false, message: "Session does not exist." });
        }
      })
      .catch((error) => {
        res.json({
          status: false,
          message: "Oops! Something went wrong. Please try again later.",
        });
      });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.deleteSession = (req, res) => {
  try {
    let sessionId = req.body.sessionId;

    courseSession.findByIdAndDelete(
      { _id: sessionId },
      { new: true },
      (err, exSession) => {
        if (exSession) {
          res.json({
            status: true,
            message: "Session has been deleted successfully",
            data: exSession,
          });
        } else {
          res.json({ status: false, message: `Session does not exists` });
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

//============================================== Lesson  ==================================================

exports.addNewLessonInSessionInCourse = (req, res) => {
  try {
    let data = req.body;
    const videoUrlFile = req.files["videoUrl"]
      ? req.files["videoUrl"][0]
      : null;
    if (!videoUrlFile) {
      res.json({ status: false, message: "Please provide a valid video file" });
      return;
    }

    courseSession.findOne(
      { _id: data.sessionId, courseId: data.courseId },
      (err, exSession) => {
        if (exSession) {
          lessonModel.findOne(
            {
              title: data.title,
              sessionId: data.sessionId,
              courseId: data.courseId,
            },
            (err, exLesson) => {
              if (!exLesson) {
                lessonModel.find(
                  { sessionId: data.sessionId, courseId: data.courseId },
                  (err, exLessonNo) => {
                    let lessonNo = 1;
                    if (exLessonNo && exLessonNo.length > 0) {
                      const lessonNos = exLessonNo.map(
                        (lesson) => lesson.lessonNo
                      );
                      lessonNo = Math.max(...lessonNos) + 1;
                    }
                    data.lessonNo = lessonNo;

                    courseVideoUpload(videoUrlFile, (uploadData) => {
                      if (uploadData.status) {
                        data.videoUrl = uploadData.url; // Set uploaded file URL to data object
                        lessonModel.create(data, (err, newLesson) => {
                          if (newLesson) {
                            res.json({
                              status: true,
                              message:
                                "New lesson successfully added to your course",
                              data: newLesson,
                            });
                          } else {
                            res.json({
                              status: false,
                              message: "Please try again.",
                            });
                          }
                        });
                      } else {
                        res.json({
                          status: false,
                          message:
                            "Error occurred while uploading the video file, please try again",
                        });
                        return;
                      }
                    });
                  }
                );
              } else {
                res.json({
                  status: false,
                  message: `Title '${data.title}' already exists. `,
                });
              }
            }
          );
        } else {
          res.json({ status: false, message: "Course does not exist." });
        }
      }
    );
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.editLessonInSessionInCourse = async (req, res) => {
  try {
    let data = req.body;

    let findLesson = await lessonModel.findById(data.lessonId);

    if (!findLesson) {
      res.json({ status: false, message: "Lesson does not exist." });
      return;
    }
    const videoUrlFile = req.files["videoUrl"]
      ? req.files["videoUrl"][0]
      : null;
    let videoUrl;
    if (videoUrlFile) {
      videoUrl = await new Promise((resolve) => {
        courseVideoUpload(videoUrlFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message: "Error occurred while uploading video, please try again",
            });
            return;
          }
        });
      });
    }

    let updatedLesson = await lessonModel.findByIdAndUpdate(
      findLesson._id,
      {
        title: data.title,
        isFreeVideo: data.isFreeVideo,
        duration: data.duration,
        videoUrl: videoUrl,
      },
      { new: true }
    );
    if (updatedLesson) {
      if (updatedLesson) {
        res.json({
          status: true,
          message: "Lesson updated successfully",
          data: updatedLesson,
        });
      } else {
        res.json({ status: false, message: "Please try again." });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};
exports.fetchLessonInCourse = (req, res) => {
  try {
    let data = req.body;

    lessonModel.findById({ _id: data.lessonId }, (err, exLesson) => {
      if (exLesson) {
        res.json({
          status: true,
          message: "Lesson found successfully",
          data: exLesson,
        });
      } else {
        res.json({ status: false, message: "Lesson does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

// exports.lessonListInCourse = (req, res) => {

//         let data = req.body;

//         courseSession.findOne({ "_id": data.sessionId,"courseId": data.courseId}).select({"_id":0,"sessionNo":1,"title":1}).then((exSession) => {
//             if (exSession) {
//                 lessonModel.find({ "sessionId": data.sessionId ,"courseId": data.courseId}).select({"_id":1,"lessonNo":1,"title":1}).sort({ sessionNo: 1 }).then((exLesson) => {
//                     if (exLesson.length >0) {

//                         res.json({ "status": true, "message": "Lesson found successfully","sessionNo":exSession.sessionNo,"title":exSession.title, "lessons": exLesson });
//                     } else {
//                         res.json({ "status": false, "message": "Lesson list is empty" });
//                     }
//                 }).catch((error) => {
//                     res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//                 })
//             } else {
//                 res.json({ "status": false, "message": "Session does not exists" });
//             }
//         }).catch((error) => {
//             res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//         })

// };

// exports.lessonListInCourse = async (req, res) => {
//     try {

//         let data = req.body;

//         let allSessions = await courseSession.find({ "courseId": data.courseId }).select({ "_id": 1 })

//         if (!allSessions) {
//             res.json({ "status": false, "message": "Session does not exists" })
//         }

//         let allSessId = allSessions.map(x => String(x._id))

//         let resData = {},arr = []
//         for (let i = 0; i < allSessId.length; i++) {

//             let sessionInfo = await courseSession.findOne({ "_id": allSessId[i], "courseId": data.courseId }).select({ "_id": 0, "sessionNo": 1, "title": 1 })
//            if(sessionInfo){
//             resData.sessionNo = sessionInfo.sessionNo
//             resData.title = sessionInfo.title
//             if (sessionInfo) {
//                 let lessList = await lessonModel.find({ "sessionId": allSessId[i], "courseId": data.courseId }).select({ "_id": 1, "lessonNo": 1, "title": 1 }).sort({ sessionNo: 1 })
//                 if (lessList) {
//                     resData.lessons = lessList
//                 } else {
//                     resData.lessons = []
//                 }

//             }
//            }

// arr.push(resData)
//         }

//         if (!resData) {
//             res.json({ "status": false, "message": "Lesson list is empty" })
//         } else {
//             res.json({ "status": true, "message": "Lesson found successfully", "data": arr});
//         }

//     } catch (error) {
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//     }

// };

exports.lessonListInCourse = async (req, res) => {
  try {
    let data = req.body;
    let allSessions = await courseSession
      .find({ courseId: data.courseId })
      .select({ _id: 1 });

    if (allSessions.length === 0) {
      // Check if the array is empty
      return res.json({ status: false, message: "Session does not exist" });
    }

    let allSessId = allSessions.map((x) => String(x._id));
    let arr = [];

    for (let i = 0; i < allSessId.length; i++) {
      let sessionInfo = await courseSession
        .findOne({ _id: allSessId[i], courseId: data.courseId })
        .select({ _id: 1, sessionNo: 1, title: 1 });

      if (sessionInfo) {
        let resData = {}; // Create a new object for each session
        resData.sessionId = sessionInfo._id;
        resData.sessionNo = sessionInfo.sessionNo;
        resData.title = sessionInfo.title;

        let lessList = await lessonModel
          .find({ sessionId: allSessId[i], courseId: data.courseId })
          .select({ _id: 1, lessonNo: 1, title: 1, duration: 1, videoUrl: 1 })
          .sort({ sessionNo: 1 });

        resData.lessons = lessList || []; // Set an empty array if no lessons found
        arr.push(resData);
      }
    }

    if (arr.length === 0) {
      res.json({ status: false, message: "Lesson list is empty" });
    } else {
      res.json({
        status: true,
        message: "Lessons found successfully",
        data: arr,
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.deleteLesson = (req, res) => {
  try {
    let lessonId = req.body.lessonId;

    lessonModel.findByIdAndDelete(
      { _id: lessonId },
      { new: true },
      (err, exLesson) => {
        if (exLesson) {
          res.json({
            status: true,
            message: "Lesson has been deleted successfully",
            data: exLesson,
          });
        } else {
          res.json({ status: false, message: `Lesson does not exists` });
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

//============================================== Assessment  ==================================================

// exports.addNewAssessmentInSessionInCourse = async (req, res) => {

//     try {

//         const { courseId, sessionId, question, options } = req.body;

//         const existingSession = await courseSession.findById(sessionId);

//         if (!existingSession) {
//             return res.json({ "status": false, "message": 'Session does not exists.' });
//         } else if (String(existingSession.courseId) !== courseId) {
//             return res.json({ "status": false, "message": 'Session does not belongs to this course.' });
//         }

//         const existingCourse = await courseMain.findById(courseId);
//         if (!existingCourse) {
//             return res.json({ "status": false, "message": 'Course does not exists.' });
//         }
//         const existingQuestion = await courseAssessment.findOne({ question });
//         if (existingQuestion) {
//             return res.json({ "status": false, "message": 'Question already exists.' });
//         }
//         const uniqueOptions = [...new Set(options)];
//         if (uniqueOptions.length !== options.length) {
//             return res.json({ "status": false, "message": 'Options must be unique.' });
//         }
//         const correctAnswer = req.body.correctAnswer;
//         if (!options.includes(correctAnswer)) {
//             return res.json({ "status": false, "message": 'Correct answer must be one of the options.' });
//         }
//         const assessment = new courseAssessment({
//             courseId,
//             sessionId,
//             question,
//             options,
//             correctAnswer,
//         });

//         const savedAssessment = await assessment.save();

//         res.json({ "status": true, "message": 'Question has added successfully.', "data": savedAssessment });

//     } catch (error) {

//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later","err":error })
//     }
// }

// exports.addNewAssessmentInSessionInCourse = async (req, res) => {
//     try {
//         const { courseId, sessionId, qList } = req.body;

//         // Fetch both session and course information together in one query
//         const [existingSession, existingCourse] = await Promise.all([
//             courseSession.findById(sessionId),
//             courseMain.findById(courseId)
//         ]);

//         if (!existingSession) {
//             return res.json({ "status": false, "message": 'Session does not exist.' });
//         } else if (String(existingSession.courseId) !== courseId) {
//             return res.json({ "status": false, "message": 'Session does not belong to this course.' });
//         }

//         if (!existingCourse) {
//             return res.json({ "status": false, "message": 'Course does not exist.' });
//         }

//         const existingQuestions = await courseAssessment.find({ courseId, sessionId });

//         const duplicateQuestions = qList.filter((newQuestion) => {
//             return existingQuestions.some((existingQuestion) => {
//                 return existingQuestion.question === newQuestion.question &&
//                     JSON.stringify(existingQuestion.options) === JSON.stringify(newQuestion.options) &&
//                     existingQuestion.correctAnswer === newQuestion.correctAnswer;
//             });
//         });

//         if (duplicateQuestions.length > 0) {
//             const duplicateQuestionNames = duplicateQuestions.map(q => q.question);
//             return res.json({ "status": false, "message": 'Duplicate questions found in the assessment.', "duplicateQuestions": duplicateQuestionNames });
//         }

//         const questions = qList.map((qData) => ({
//             courseId,
//             sessionId,
//             question: qData.question,
//             options: qData.options,
//             correctAnswer: qData.correctAnswer,
//         }));

//         const savedAssessments = await courseAssessment.insertMany(questions);

//         res.json({ "status": true, "message": 'Questions have been added successfully.', "data": savedAssessments });

//     } catch (error) {
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//     }
// }

exports.addNewAssessmentInSessionInCourse = async (req, res) => {
  try {
    const { courseId, sessionId, qList } = req.body;
    const [existingLessons, existingSession, existingCourse] =
      await Promise.all([
        lessonModel.findOne({ sessionId }),
        courseSession.findById(sessionId),
        courseMain.findById(courseId),
      ]);

    if (!existingLessons) {
      return res.json({
        status: false,
        message: "Please add at least one lesson for the session!!!",
      });
    }
    if (!existingSession) {
      return res.json({ status: false, message: "Session does not exist." });
    } else if (String(existingSession.courseId) !== courseId) {
      return res.json({
        status: false,
        message: "Session does not belong to this course.",
      });
    }

    if (!existingCourse) {
      return res.json({ status: false, message: "Course does not exist." });
    }

    const existingQuestions = await courseAssessment.find({
      sessionId: sessionId,
    });

    const duplicateQuestions = qList.filter((newQuestion) => {
      return existingQuestions.some((existingQuestion) => {
        return (
          existingQuestion.question === newQuestion.question ||
          (existingQuestion.question === newQuestion.question &&
            existingQuestion.correctAnswer === newQuestion.correctAnswer)
        );
      });
    });

    if (duplicateQuestions.length > 0) {
      const duplicateQuestionNames = duplicateQuestions.map((q) => q.question);
      return res.json({
        status: false,
        message: "Duplicate questions found in the assessment.",
        duplicateQuestions: duplicateQuestionNames,
      });
    }

    const questions = qList.map((qData) => ({
      courseId,
      sessionId,
      question: qData.question,
      options: [qData.option1, qData.option2, qData.option3, qData.option4],
      correctAnswer: qData.correctAnswer,
    }));

    const savedAssessments = await courseAssessment.insertMany(questions);

    res.json({
      status: true,
      message: "Questions have been added successfully.",
      data: savedAssessments,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.editAssessmentInSessionInCourse = async (req, res) => {
  try {
    const { assId, question, options } = req.body;

    const existingAss = await courseAssessment.findById(assId);

    if (!existingAss) {
      return res.json({
        status: false,
        message: "Assessment does not exists.",
      });
    }

    const existingQuestion = await courseAssessment.findOne({ question });
    if (existingQuestion) {
      return res.json({ status: false, message: "Question already exists." });
    }

    if (options == null && assId && question) {
      const qTitleOnly = await courseAssessment.findByIdAndUpdate(
        assId,
        {
          question: question,
        },
        { new: true }
      );

      return res.json({
        status: true,
        message: "Question has updated successfully.",
        data: qTitleOnly,
      });
    }

    const uniqueOptions = [...new Set(options)];
    if (uniqueOptions.length !== options.length) {
      return res.json({ status: false, message: "Options must be unique." });
    }
    const correctAnswer = req.body.correctAnswer;
    if (!options.includes(correctAnswer)) {
      return res.json({
        status: false,
        message: "Correct answer must be one of the options.",
      });
    }
    const savedAssessment = await courseAssessment.findByIdAndUpdate(
      assId,
      {
        question: question,
        options: options,
        correctAnswer: correctAnswer,
      },
      { new: true }
    );

    res.json({
      status: true,
      message: "Question has updated successfully.",
      data: savedAssessment,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.fetchAssessmentInCourse = (req, res) => {
  try {
    let { assId } = req.body;

    courseAssessment.findById(assId, (err, exAssessment) => {
      if (exAssessment) {
        res.json({ status: true, data: exAssessment });
      } else {
        res.json({ status: false, message: "Assessment does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};
exports.assessmentListInCourse = async (req, res) => {
  try {
    let { sessionId } = req.body;

    let allQuestions = await courseAssessment
      .find({ sessionId: sessionId })
      .select({ _id: 1, question: 1, options: 1, correctAnswer: 1 });

    if (allQuestions.length === 0) {
      return res.json({ status: false, message: "Assessment does not exist" });
    } else {
      res.json({
        status: true,
        message: `${allQuestions.length} question(s) found in the assessment`,
        data: allQuestions,
      });
    }
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.activeAssessmentQuestionsListInUserMyCourses = async (req, res) => {
  try {
    let { sessionId } = req.body;

    let allQuestions = await courseAssessment
      .find({ sessionId: sessionId })
      .select({ _id: 1, question: 1, options: 1, sessionId: 1 });

    if (allQuestions.length === 0) {
      return res.json({ status: false, message: "Assessment does not exist" });
    } else {
      res.json({ status: true, data: allQuestions });
    }
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.deleteAssessment = (req, res) => {
  try {
    let assId = req.body.assId;

    courseAssessment.findByIdAndDelete(
      { _id: assId },
      { new: true },
      (err, exAssessment) => {
        if (exAssessment) {
          res.json({
            status: true,
            message: "Assessment has been deleted successfully",
            data: exAssessment,
          });
        } else {
          res.json({ status: false, message: `Assessment does not exists` });
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

//============================================== Bundle Courses  ==================================================

exports.selectCoursesInBundleCourse = async (req, res) => {
  try {
    let courseInfo = await courseMain.find().select({ _id: 1, title: 1 });

    res.json({
      status: true,
      message: `${courseInfo.length} course(s) found`,
      data: courseInfo,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.addNewbundleInSessionInCourse = async (req, res) => {
  try {
    const { selectedCourses, title } = req.body;

    const existingBundle = await courseBundle.findOne({ title });

    if (existingBundle) {
      return res.json({ status: false, message: "Title already exists." });
    }

    const uniqueCourses = [...new Set(selectedCourses)];
    if (uniqueCourses.length !== selectedCourses.length) {
      return res.json({
        status: false,
        message: "selectedCourses must be unique.",
      });
    }
    let totalPrice = 0,
      discountedPrice = 0;

    for (let i = 0; i < uniqueCourses.length; i++) {
      let courseInfo = await courseMain
        .findById(uniqueCourses[i])
        .select({ price: 1, discountedPrice: 1 });

      (totalPrice += courseInfo.price),
        (discountedPrice += courseInfo.discountedPrice);
    }

    const Courses = new courseBundle({
      title,
      selectedCourses,
      totalPrice,
      discountedPrice,
    });

    const savedCourses = await Courses.save();

    res.json({
      status: true,
      message: "Courses bundle has added successfully.",
      data: savedCourses,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.editBundleCourseInCourse = async (req, res) => {
  try {
    let { id, discountedPrice, selectedCourses, title } = req.body;

    const existingBundle = await courseBundle.findById(id);

    if (!existingBundle) {
      return res.json({
        status: false,
        message: "Bundle course does not exists.",
      });
    }

    const existingBundleTitle = await courseBundle.findByIdAndUpdate(
      existingBundle._id,
      { title },
      { new: true }
    );

    if (existingBundleTitle && !selectedCourses) {
      res.json({
        status: true,
        message: "Courses bundle has updated successfully.",
        data: existingBundleTitle,
      });
    } else if (title || selectedCourses) {
      const uniqueCourses = [...new Set(selectedCourses)];
      if (uniqueCourses.length !== selectedCourses.length) {
        return res.json({
          status: false,
          message: "selectedCourses must be unique.",
        });
      }
      let totalPrice = 0,
        disPrice = 0;

      for (let i = 0; i < uniqueCourses.length; i++) {
        let courseInfo = await courseMain
          .findById(uniqueCourses[i])
          .select({ price: 1, discountedPrice: 1 });

        (totalPrice += courseInfo.price),
          (disPrice += courseInfo.discountedPrice);
      }

      discountedPrice = discountedPrice ? discountedPrice : disPrice;

      const savedCourses = await courseBundle.findByIdAndUpdate(
        id,
        {
          title,
          selectedCourses,
          totalPrice,
          discountedPrice,
        },
        { new: true }
      );

      res.json({
        status: true,
        message: "Courses bundle has updated successfully.",
        data: savedCourses,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.updateStatusBundleCourseInCourse = async (req, res) => {
  try {
    let { bundleId, isActive } = req.body;

    const existingBundle = await courseBundle.findById(bundleId);

    if (!existingBundle) {
      return res.json({
        status: false,
        message: "Bundle course does not exists.",
      });
    }

    const savedCourses = await courseBundle.findByIdAndUpdate(
      bundleId,
      {
        isActive,
      },
      { new: true }
    );

    res.json({
      status: true,
      message: "Courses bundle status has updated successfully.",
      data: savedCourses,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.fetchbundleInCourse = async (req, res) => {
  try {
    let { bundleId } = req.body;

    const existingBundle = await courseBundle.findById(bundleId);

    if (!existingBundle) {
      return res.json({
        status: false,
        message: "Bundle course does not exist.",
      });
    }

    // Convert selectedCourses array to an array of ObjectIds
    const selectedCoursesIds = existingBundle.selectedCourses.map((courseId) =>
      mongoose.Types.ObjectId(courseId)
    );

    const courseInfo = await courseMain.aggregate([
      {
        $match: {
          _id: { $in: selectedCoursesIds },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          // price: 1,
          // discountedPrice: 1
        },
      },
    ]);

    // let resObj = {
    //     "_id": existingBundle._id,
    //     "title": existingBundle.title,
    //     "selectedCourses":courseInfo,
    //     "totalPrice": existingBundle.totalPrice,
    //     "discountedPrice": existingBundle.discountedPrice,

    // }
    res.json({
      status: true,
      data: {
        _id: existingBundle._id,
        title: existingBundle.title,
        selectedCourses: courseInfo,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.bundleListInCourse = async (req, res) => {
//     try {

//         const existingBundle = await courseBundle.find().select({ "_id": 1, "title": 1 ,"selectedCourses":1});

//         if (!existingBundle) {
//             return res.json({ "status": false, "message": 'Bundle course does not exist.' });
//         }
//         for (let i = 0; i < existingBundle.length; i++) {

//             const courseInfo = await courseMain.find({ _id: { $in: existingBundle[i].selectedCourses } }).select({ "_id": 1, "title": 1 })

//             existingBundle[i].selectedCourses = courseInfo.map(course => course.title)
//         }

//         res.json({
//             "status": true, "data": existingBundle
//         });
//     } catch (e) {
//         console.log(e)
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
//     }
// };

exports.bundleListInCourse = async (req, res) => {
  try {
    const existingBundle = await courseBundle
      .find()
      .select({ _id: 1, title: 1, selectedCourses: 1, isActive: 1 })
      .lean();

    if (!existingBundle) {
      return res.json({
        status: false,
        message: "Bundle course does not exist.",
      });
    }

    const fetchCourseInfoPromises = existingBundle.map(async (bundle) => {
      const courseIds = bundle.selectedCourses;
      const courseInfo = await courseMain
        .find({ _id: { $in: courseIds } })
        .select({ _id: 1, title: 1 })
        .lean();

      bundle.selectedCourses = courseInfo.map((course) => ({
        courseId: String(course._id),
        title: course.title,
      }));
      return bundle;
    });

    const updatedExistingBundle = await Promise.all(fetchCourseInfoPromises);

    res.json({
      status: true,
      data: updatedExistingBundle,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.activeBundleListInCourse = async (req, res) => {
  try {
    const existingBundle = await courseBundle
      .find({ isActive: true })
      .select({ _id: 1, title: 1, selectedCourses: 1, isActive: 1 })
      .lean();

    if (!existingBundle) {
      return res.json({
        status: false,
        message: "Bundle course does not exist.",
      });
    }

    const fetchCourseInfoPromises = existingBundle.map(async (bundle) => {
      const courseIds = bundle.selectedCourses;
      const courseInfo = await courseMain
        .find({ _id: { $in: courseIds } })
        .select({ _id: 1, title: 1 })
        .lean();

      bundle.selectedCourses = courseInfo.map((course) => course.title);
      return bundle;
    });

    const updatedExistingBundle = await Promise.all(fetchCourseInfoPromises);

    res.json({
      status: true,
      data: updatedExistingBundle,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//=======================================User My Courses ===========================================
function convertHHMMSSToSeconds(hhmmss) {
  const timearr = hhmmss.split(":").map(Number);

  if (timearr.length == 3) {
    return timearr[0] * 3600 + timearr[1] * 60 + timearr[2];
  } else if (timearr.length == 2) {
    return timearr[0] * 60 + timearr[1];
  }
}

exports.add_course_to_my_courses = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userid;

    const courseInfo = await courseMain
      .findById(courseId)
      .select({ _id: 1, duration: 1, title: 1, level: 1 });

    if (!courseInfo) {
      return res.json({ status: false, message: "Course does not exist" });
    }
    // working fine
    // const existingCourse = await userMyCourses.findOne({ "userId": userId, "courseId": courseId ,"validTill":{$gt : new Date()} });

    // if (existingCourse) {
    //     return res.json({ status: false, message: 'Course already exists in your courses' });
    // }

    const sessions = await courseSession
      .find({ courseId: courseId })
      .select({ _id: 1 });

    const sessionPromises = sessions.map(async (session) => {
      const lessons = await lessonModel.find({ sessionId: session._id });

      let totalSessionDuration = 0;

      for (const lesson of lessons) {
        totalSessionDuration += convertHHMMSSToSeconds(lesson.duration);
      }

      return {
        sessionId: session._id,
        lessons: lessons.map((lesson) => ({
          lessonId: lesson._id,
          lessonWatchedDuration: 0,
          lessonTotalDuration: convertHHMMSSToSeconds(lesson.duration),
        })),
        sessionWatchedDuration: 0,
        sessionTotalDuration: totalSessionDuration,
      };
    });

    const watchedHistory = await Promise.all(sessionPromises);

    const validTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const data = {
      userId: userId,
      courseId: courseId,
      courseName: courseInfo.title,
      courseLevel: courseInfo.level,
      watchedHistory: watchedHistory,
      courseDuration: convertHHMMSSToSeconds(courseInfo.duration),
      validTill: validTill,
    };

    const myCourseInfo = await userMyCourses.create(data);

    if (!myCourseInfo) {
      return res.json({
        status: false,
        message: "Unable to add the course in my courses",
      });
    }

    return res.json({
      status: true,
      data: myCourseInfo,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.my_course_Info = async (req, res) => {
//     try {
//         const purchasedCourseId = req.params.purchasedCourseId;

//         const course = await userMyCourses.findOne({ _id: purchasedCourseId });
//         if (!course) {
//             return res.json({ status: false, message: 'Course not found' });
//         }

//         let history = course.watchedHistory;

//         for (let i = 0; i < history.length; i++) {
//             const [sessionInfo, lessonInfo, assessmentInfo] = [

//                 await courseSession.findOne({ _id: history[i].sessionId }),
//                 await lessonModel.findOne({ sessionId: history[i].sessionId }),
//                 await courseAssessment.countDocuments({ sessionId: history[i].sessionId })
//             ];

//             if (sessionInfo && lessonInfo && assessmentInfo > 0) {
//                 history[i]._doc.title = sessionInfo.title;

//                 for (let j = 0; j < history[i].lessons.length; j++) {
//                     history[i].lessons[j]._doc.title = lessonInfo.title;
//                     history[i].lessons[j]._doc.videoUrl = lessonInfo.videoUrl;
//                 }
//             }
//         }

//         course.watchedHistory = history;
//         await course.save();

//         return res.json({ status: true, data: course });
//     } catch (error) {
//         console.error(error);
//         res.json({ status: false, message: 'Oops! Something went wrong. Please try again later' });
//     }
// };

exports.my_course_Info = async (req, res) => {
  try {
    const purchasedCourseId = req.params.purchasedCourseId;

    const course = await userMyCourses.findOne({ _id: purchasedCourseId });
    if (!course) {
      return res.json({ status: false, message: "Course not found" });
    }
    //  console.log(course.watchedHistory[0].lessons,"course")
    const history = course.watchedHistory;

    // Extract sessionIds from history
    const sessionIds = history
      .map((item) => String(item.sessionId))
      .filter(
        (sessionId) => typeof sessionId === "string" && sessionId.trim() !== ""
      );
    //    console.log(sessionIds,"sessionIds")
    if (sessionIds && sessionIds.length == 0) {
      return res.json({
        status: false,
        message: "Course does not contain active sessions",
      });
    }
    const sessionInfo = await courseSession.find({ _id: { $in: sessionIds } });
    //console.log(sessionInfo,sessionIds)
    for (let i = 0; i < history.length; i++) {
      // const lessonInfo = await lessonModel.findOne({ sessionId: history[i].sessionId });
      const lessonsPerSession = await lessonModel.find({
        sessionId: history[i].sessionId,
      });
      const assessmentInfo = await courseAssessment.countDocuments({
        sessionId: history[i].sessionId,
      });
      history[i]._doc.title = sessionInfo[i].title;
      //console.log(sessionInfo[i].title)
      if (sessionInfo && lessonsPerSession) {
        //console.log(lessonsPerSession,"lessonsPerSession")
        // for (let j = 0; j < lessonsPerSession.length; j++) {

        //     history[i].lessons[j]._doc.title = lessonsPerSession[j].title;
        //     history[i].lessons[j]._doc.videoUrl = lessonsPerSession[j].videoUrl;
        // }

        for (
          let j = 0;
          j < lessonsPerSession.length && j < history[i].lessons.length;
          j++
        ) {
          history[i].lessons[j]._doc.title = lessonsPerSession[j].title;
          history[i].lessons[j]._doc.videoUrl = lessonsPerSession[j].videoUrl;
        }
      }
    }

    course.watchedHistory = history;

    let fetchEduId = await courseMain
      .findOne({ _id: course.courseId })
      .select({ educators: 1 });
    let educatorENCourses = await courseMain
      .find({ educators: fetchEduId.educators })
      .select({ _id: 1 });
    let educatorENCoursesIDs = educatorENCourses.map((x) => String(x._id));
    let educatorENStudents = await order.countDocuments({
      "items.courseId": { $in: educatorENCoursesIDs },
    });
    //console.log(fetchEduId,educatorENCourses,educatorENStudents,"educatorENCourses",educatorENCoursesIDs)

    const reviewPromises = await reviews.find({
      courseId: course.courseId,
      isApproved: true,
    });
    let reviewCount = 0;
    let totalRatings = 0;
    let totalReviews = 0;

    if (reviewPromises && reviewPromises.length !== 0) {
      reviewPromises.forEach((review) => {
        if (review.rating) {
          totalRatings += review.rating;
          totalReviews += review.reviews.trim().length === 0 ? 0 : 1;
          reviewCount++;
        }
      });
    } else {
      totalRatings = 0;
      reviewCount = 0;
    }

    const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
    // console.log(avgRating,"avgRating")
    course._doc.avgRating = avgRating.toFixed(1);
    course._doc.totalRatings = reviewCount;
    course._doc.totalReviews = totalReviews;
    course._doc.totalStudents = educatorENStudents;

    await course.save();

    return res.json({ status: true, data: course });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.update_watched_history_of_my_course = async (req, res) => {
  try {
    const {
      purchasedCourseId,
      lessonId,
      lessonWatchedDuration,
      lessonTotalDuration,
    } = req.body;

    const course = await userMyCourses.findOne({ _id: purchasedCourseId });

    if (!course) {
      return res.json({ status: false, message: "Course not found" });
    }

    // Update lessonWatchedDuration within watchedHistory
    for (const session of course.watchedHistory) {
      for (const lesson of session.lessons) {
        if (lesson.lessonId === lessonId) {
          // lesson.lessonWatchedDuration = lessonWatchedDuration;
          // lesson.lessonTotalDuration =lessonTotalDuration;
          // complete lesson before 3 seconds
          // if ( Math.abs(lesson.lessonWatchedDuration - lesson.lessonTotalDuration) <= 0.1) {

          lesson.lessonWatchedDuration = lesson.lessonTotalDuration;
          lesson.isLessonCompleted = true;
          //}
        }
      }
    }

    // Calculate sessionWatchedDuration and totalWatchedDuration
    let sessionWatchedDuration = 0;
    let totalWatchedDuration = 0;
    let isAllSessionsCompleted = true; // Initialize to true

    for (const session of course.watchedHistory) {
      session.sessionWatchedDuration = 0;
      let isSessionCompleted = true; // Initialize to true

      for (const lesson of session.lessons) {
        session.sessionWatchedDuration += lesson.lessonWatchedDuration;
        totalWatchedDuration += lesson.lessonWatchedDuration;

        if (!lesson.isLessonCompleted) {
          // Check if the lesson is not completed
          isSessionCompleted = false;
        }
      }

      // Update isSessionCompleted for the session
      session.isSessionCompleted = isSessionCompleted;

      // Check if the session is not completed
      if (!isSessionCompleted) {
        isAllSessionsCompleted = false;
      }
    }

    // Update totalWatchedDuration in the course
    course.totalWatchedDuration = totalWatchedDuration;

    // Update sessionTotalDuration for each session
    for (const session of course.watchedHistory) {
      session.sessionTotalDuration = session.lessons.reduce(
        (total, lesson) => total + lesson.lessonTotalDuration,
        0
      );
    }

    // Update isCourseCompleted for the course
    course.isCourseCompleted = isAllSessionsCompleted;

    // Save the updated course document
    const updatedCourse = await course.save();

    return res.json({ status: true, data: updatedCourse });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: "Server error" });
  }
};

exports.listOfMyCourses = async (req, res) => {
  try {
    const existingCourses = await userMyCourses.find({ userId: req.userid });

    if (!existingCourses || existingCourses.length === 0) {
      return res.json({
        status: false,
        message: "Your list of courses is empty",
        data: [],
      });
    }

    const simplifiedCourses = await Promise.all(
      existingCourses.map(async (course) => {
        const allSessionWatchedDuration = course.watchedHistory.reduce(
          (total, session) => total + session.sessionWatchedDuration,
          0
        );
        const allSessionTotalDuration = course.watchedHistory.reduce(
          (total, session) => total + session.sessionTotalDuration,
          0
        );
        const courseCompl =
          (allSessionWatchedDuration * 100) / allSessionTotalDuration;
        const isCourseCompleted =
          allSessionWatchedDuration > allSessionTotalDuration * 0.9
            ? true
            : false;

        const updatedCourse = await userMyCourses
          .findOneAndUpdate(
            { _id: course._id, courseId: course.courseId },
            {
              isCourseCompleted: isCourseCompleted,
            },
            { new: true }
          )
          .select({
            courseId: 1,
            courseName: 1,
            thumbnail: 1,
            courseLevel: 1,
            isCourseCompleted: 1,
            totalWatchedDuration: 1,
            courseDuration: 1,
            validTill: 1,
            createdAt: 1,
          });

        updatedCourse._doc.courseCompleted = courseCompl.toFixed(0) + " %";
        return updatedCourse;
      })
    );
    //const result = await userMyCourses.bulkWrite(simplifiedCourses);

    const reviewPromises = simplifiedCourses.map((course) =>
      reviews.find({ courseId: course.courseId, isApproved: true })
    );
    const reviewResults = await Promise.all(reviewPromises);
    simplifiedCourses.forEach((course, index) => {
      const rrInfo = reviewResults[index];
      let reviewCount = 0;
      let totalRatings = 0;

      if (rrInfo && rrInfo.length !== 0) {
        rrInfo.forEach((review) => {
          if (review.rating) {
            totalRatings += review.rating;
            reviewCount++;
          }
        });
      } else {
        totalRatings = 0;
        reviewCount = 0;
      }

      const avgRating = reviewCount > 0 ? totalRatings / reviewCount : 0;
      course._doc.avgRating = avgRating.toFixed(1);
      course._doc.totalRatings = reviewCount;
    });

    return res.json({ status: true, data: simplifiedCourses });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.dashboardInfo = async (req, res) => {
//     try {
//         const enrolledCourses = await userMyCourses.countDocuments({ "userId": req.userid });
//         const activeCourses = await userMyCourses.countDocuments({ "userId": req.userid , "validTill":{$lt :new Date(Date.now())} });
//         const completedCourses = await userMyCourses.countDocuments({ "userId": req.userid,"isCourseCompleted":true });
//         const noOfCertificates = await userMyCourses.countDocuments({ "userId": req.userid,"certUrl":{$ne : ''} });

//         return res.json({ status: true, "data": {enrolledCourses,activeCourses,completedCourses,noOfCertificates} });
//     } catch (error) {
//         console.log(error);
//         return res.json({ status: false, message: 'Oops! Something went wrong. Please try again later' });
//     }
// };

exports.dashboardInfo = async (req, res) => {
  try {
    // Use Promise.all to perform asynchronous operations in parallel
    const [enrolledCourses, activeCourses, completedCourses, noOfCertificates] =
      await Promise.all([
        userMyCourses.countDocuments({ userId: req.userid }),
        userMyCourses.countDocuments({
          userId: req.userid,
          validTill: { $gte: new Date(Date.now()) },
        }),
        userMyCourses.countDocuments({
          userId: req.userid,
          isCourseCompleted: true,
        }),
        userMyCourses.countDocuments({
          userId: req.userid,
          certUrl: { $ne: "" },
        }),
      ]);

    return res.json({
      status: true,
      data: {
        enrolledCourses,
        activeCourses,
        completedCourses,
        noOfCertificates,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.adminDashboardInfo = async (req, res) => {
  try {
    // Use Promise.all to perform asynchronous operations in parallel
    const [
      totalCourse,
      activeCourse,
      totalSubscribers,
      totalLearners,
      totalEducators,
    ] = await Promise.all([
      courseMain.countDocuments({}),
      courseMain.countDocuments({ isApproved: true }),
      (await userSubscribedPlans.distinct("userId")).length,
      user.countDocuments({}),
      educator.countDocuments({}),
    ]);

    return res.json({
      status: true,
      data: {
        totalCourse,
        activeCourse,
        pendingCourse: totalCourse - activeCourse,
        totalSubscribers,
        totalLearners,
        totalEducators,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.completeUpload = async (req, res) => {
//     try {
//         const { fileName,uploadId } = req.body;

//         completeUploadTest(req.body,(test)=>{
//             res.json({ status: true, test});
//         })

//     } catch (error) {
//         console.log(error);
//         return res.json({ status: false, message: 'Oops! Something went wrong. Please try again later' });
//     }
// };

// exports.uploadLessTest = async (req, res) => {
//     try {
//             const file = req.file;
//             createuploadLessTest(file,req.body,(uploadData) => {
//                 res.json({ "status": true, "data": uploadData });
//             })

//     } catch (error) {
//         console.log(error);
//         return res.json({ status: false, message: 'Oops! Something went wrong. Please try again later' });
//     }
// };

// exports.initiateUpload = async (req, res) => {
//     try {
//               const { fileName } = req.body;
//               createMultipartUpload(fileName,(uploadData) => {
//                     res.json({ "status": true, "data": uploadData });
//                 })

//     } catch (error) {
//         console.log(error);
//         return res.json({ status: false, message: 'Oops! Something went wrong. Please try again later' });
//     }
// };
const aws = require("aws-sdk");
const { UpdateTemplate } = require("../common/nommoc");
//const { userContents } = require("../nodedetails/local")

const bucketName = config.awsOptionsCourseVideos.Bucket;
const s3 = new aws.S3(config.awsOptionsCourseVideos);

exports.initiateUpload = async (req, res) => {
  try {
    const data = req.body;
    //console.log(data);
    let exCourse = await courseMain.findById({ _id: data.courseId });
    if (!exCourse) {
      return res.json({ status: false, message: "Course does not exist!!!" });
    }
    // let exSession = courseSession.findOne({ "_id": data.sessionId, courseId: data.courseId })
    // if (exSession) {
    //     return res.json({ status: false, message: 'Session already exists!!!' });
    // }
    let exLesson = await lessonModel.findOne({
      $and: [
        {
          courseId: data.courseId,
          sessionId: data.sessionId,
          title: data.title,
        },
      ],
    });

    if (exLesson) {
      return res.json({ status: false, message: "Lesson already exists!!!" });
    }

    const params = {
      Bucket: bucketName,
      Key: data.fileName,
    };
    const upload = await s3.createMultipartUpload(params).promise();
    return res.json({ uploadId: upload.UploadId });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.uploadLessTest = async (req, res) => {
  try {
    const { index, fileName } = req.body;
    const file = req.file;
    //console.log( index, fileName, req.query.uploadId ," index, fileName ")
    const s3Params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      PartNumber: Number(index) + 1,
      UploadId: req.query.uploadId,
    };

    s3.uploadPart(s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Error uploading chunk" });
      }

      return res.json({
        success: true,
        message: "Chunk uploaded successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.completeUpload = async (req, res) => {
  try {
    const reqData = req.body;
    // console.log(data)
    const { fileName } = req.query;
    const s3Params = {
      Bucket: bucketName,
      Key: fileName,
      UploadId: req.query.uploadId,
    };

    s3.listParts(s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Error listing parts" });
      }

      const parts = [];
      data.Parts.forEach((part) => {
        parts.push({
          ETag: part.ETag,
          PartNumber: part.PartNumber,
        });
      });

      s3Params.MultipartUpload = {
        Parts: parts,
      };

      s3.completeMultipartUpload(s3Params, (err, uploaddayta) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ success: false, message: "Error completing upload" });
        }

        //         // console.log("data: ", data)
        //         // return res.json({ success: true, message: 'Upload complete', data: data.Location });
        lessonModel.findOne(
          {
            sessionId: reqData.sessionId,
            courseId: reqData.courseId,
            title: reqData.title,
          },
          (err, exLesson) => {
            //console.log("exLesson: ", exLesson)
            if (!exLesson) {
              lessonModel.find(
                { sessionId: reqData.sessionId, courseId: reqData.courseId },
                (err, exLessonNo) => {
                  let lessonNo = 1;
                  if (exLessonNo && exLessonNo.length > 0) {
                    const lessonNos = exLessonNo.map(
                      (lesson) => lesson.lessonNo
                    );
                    lessonNo = Math.max(...lessonNos) + 1;
                  }
                  reqData.lessonNo = lessonNo;
                  reqData.fileName = fileName;
                  reqData.videoUrl = uploaddayta.Location;

                  lessonModel.create(reqData, (err, newLesson) => {
                    if (err) {
                      // console.log(err,"err")
                      return res.json({
                        status: false,
                        message: `Unable to add lesson`,
                      });
                    }
                    return res.json({
                      status: true,
                      message: "New lesson successfully added to your course",
                      data: newLesson,
                    });
                  });
                }
              );
            } else {
              return res.json({
                status: false,
                message: `Title  already exists.`,
              });
            }
          }
        );
      });
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.initiateUploadToEditLesson = async (req, res) => {
  try {
    const data = req.body;
    //console.log(data);
    let findLesson = await lessonModel.findById(data.lessonId);

    if (!findLesson) {
      res.json({ status: false, message: "Lesson does not exist." });
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: data.fileName,
    };
    const upload = await s3.createMultipartUpload(params).promise();
    return res.json({ uploadId: upload.UploadId });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.completeUploadToEditLesson = async (req, res) => {
  try {
    const reqData = req.body;
    // console.log(data)
    const { fileName } = req.query;

    const s3Params = {
      Bucket: bucketName,
      Key: fileName,
      UploadId: req.query.uploadId,
    };
    if (s3Params.Key == undefined || s3Params.UploadId == undefined) {
      lessonModel.findByIdAndUpdate(
        reqData.lessonId,
        reqData,
        { new: true },
        (err, updatedLesson) => {
          if (err) {
            return res.json({
              status: false,
              message: `Unable to update lesson`,
            });
          } else {
            return res.json({
              status: true,
              message: "Lesson updated successfully.",
              data: updatedLesson,
            });
          }
        }
      );
    } else {
      s3.listParts(s3Params, (err, data) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ success: false, message: "Error listing parts" });
        }

        const parts = [];
        data.Parts.forEach((part) => {
          parts.push({
            ETag: part.ETag,
            PartNumber: part.PartNumber,
          });
        });

        s3Params.MultipartUpload = {
          Parts: parts,
        };

        s3.completeMultipartUpload(s3Params, (err, uploaddayta) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ success: false, message: "Error completing upload" });
          }

          reqData.fileName = fileName;
          reqData.videoUrl = uploaddayta.Location;

          lessonModel.findByIdAndUpdate(
            reqData.lessonId,
            reqData,
            { new: true },
            (err, updatedLesson) => {
              if (err) {
                // console.log(err,"err")
                return res.json({
                  status: false,
                  message: `Unable to update lesson`,
                });
              }
              return res.json({
                status: true,
                message: "Lesson updated successfully.",
                data: updatedLesson,
              });
            }
          );
        });
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

//========================================== Intitutions ==================================================

exports.addInstitution = async (req, res) => {
  try {
    let addedIns = await Institution.create(req.body);
    if (!addedIns) {
      return res.json({ status: false, message: "Unable to add record.!!!" });
    }

    return res.json({
      success: true,
      message: "Record inserted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.editInstitution = async (req, res) => {
  try {
    let data = req.body;
    let exIns = await Institution.findById(data._id);
    if (!exIns) {
      return res.json({ status: false, message: "Unable to find record.!!!" });
    }
    let updatedIns = await Institution.findByIdAndUpdate(exIns._id, data, {
      new: true,
    });
    if (!updatedIns) {
      return res.json({
        status: false,
        message: "Unable to update record.!!!",
      });
    }
    return res.json({ success: true, message: "Record updated successfully." });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.listOfInstitutions = async (req, res) => {
  try {
    let { search } = req.body;
    let exIns = await Institution.find({
      $or: [
        { name: new RegExp(search, "i") },
        { state: new RegExp(search, "i") },
        { statePharmacyCouncil: new RegExp(search, "i") },
        { contactUs: new RegExp(search, "i") },
      ],
    })
      .limit(25)
      .select("name");
    if (!exIns) {
      return res.json({ status: false, message: "Unable to find record.!!!" });
    }

    return res.json({ success: true, data: exIns });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
