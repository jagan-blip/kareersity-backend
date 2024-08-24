const validator = require("node-validator");
let emptycheck = /([^\s])/i;
let videoDuration = /^([0-9][0-9][0-9]|[0-9][0-9]):([0-5][0-9]):([0-5][0-9])$/;
let email =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
// let isValidVideo =(filename) => {
//     return (/\.(mp4|mov|avi|mkv|wmv|flv|webm)$/i).test(filename);
//   };
exports.postValidation = (req, res, next) => {
  try {
    let path = req.route.path;

    let data = req.body;
    let check;
    if (path == "/signUp") {
      check = validator
        .isObject()
        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withRequired(
          "roleId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid roleId",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: email,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "status",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid status",
          })
        );
    } else if (path == "/signIn") {
      check = validator
        .isObject()
        .withRequired(
          "email",
          validator.isString({
            regex: email,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "password",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid password",
          })
        );
    } else if (path == "/changePassword") {
      check = validator
        .isObject()
        .withRequired(
          "newPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid new password",
          })
        )
        .withRequired(
          "confirmPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid confirm password",
          })
        );
    } else if (path == "/add_admin_role") {
      check = validator
        .isObject()
        .withRequired(
          "role",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid role",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid staus",
          })
        );
    } else if (path == "/add_email_template") {
      check = validator
        .isObject()
        .withRequired(
          "templateName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template name",
          })
        )
        //.withRequired('greeting', validator.isString({ regex: emptycheck, message: "Please provide valid template greeting" }))
        .withRequired(
          "subject",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template subject",
          })
        )
        .withRequired(
          "body",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template body",
          })
        );
    } else if (path == "/edit_email_template") {
      check = validator
        .isObject()
        .withRequired(
          "templateName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template name",
          })
        )
        //.withRequired('greeting', validator.isString({ regex: emptycheck, message: "Please provide valid template greeting" }))
        .withRequired(
          "subject",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template subject",
          })
        )
        .withRequired(
          "body",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid template body",
          })
        );
    } else if (path == "/delete_admin_role") {
      check = validator.isObject().withRequired(
        "roleId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid roleId",
        })
      );
    } else if (path == "/add_admin_users") {
      check = validator
        .isObject()
        .withRequired(
          "username",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid user name",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "roleId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid roleId",
          })
        )
        .withRequired(
          "status",
          validator.isInteger({
            regex: emptycheck,
            message: "Please provide valid status",
          })
        );
    } else if (
      path == "/delete_admin_user" ||
      path == "/change_admin_user_status"
    ) {
      check = validator.isObject().withRequired(
        "adminId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid adminId",
        })
      );
    } else if (path == "/create_permissions") {
      check = validator
        .isObject()
        .withRequired(
          "roleId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid roleId",
          })
        )
        .withRequired(
          "section",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid section",
          })
        )
        .withRequired(
          "permissions",
          validator.isArray(
            validator.isString({
              regex: /^(view|edit|delete)$/,
              message: "Please provide valid permissions",
            })
          )
        );
    } else if (path == "/assign_permissions") {
      check = validator
        .isObject()
        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid _id",
          })
        )
        .withOptional(
          "permissions",
          validator.isArray(
            validator.isString({
              regex: /^(view|edit|delete)$/,
              message: "Please provide valid permissions",
            })
          )
        );
    } else if (path == "/category/new") {
      check = validator
        .isObject()
        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withRequired(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid description",
          })
        );
    } else if (path == "/category/edit") {
      check = validator
        .isObject()
        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid category id",
          })
        )
        .withOptional(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withOptional(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid description",
          })
        )
        .withOptional(
          "isHidden",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isHidden",
          })
        );
    } else if (path == "/category/delete") {
      check = validator.isObject().withRequired(
        "_id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid category id",
        })
      );
    } else if (path == "/courses/addNew") {
      check = validator
        .isObject()
        .withRequired(
          "catId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid category id",
          })
        )
        .withRequired(
          "thumbnail",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid thumbnail",
          })
        )
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withRequired(
          "shortDescription",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid short description",
          })
        )
        .withRequired(
          "duration",
          validator.isString({
            regex: videoDuration,
            message: "Please provide valid duration in HH:MM:SS format",
          })
        )
        .withRequired(
          "level",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid level",
          })
        )
        .withOptional(
          "freeForEveryone",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForEveryone",
          })
        )
        .withOptional(
          "freeForEnInLast30Days",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForEnInLast30Days",
          })
        )
        .withOptional(
          "freeForbasedOnColleges",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForbasedOnColleges",
          })
        )
        .withOptional(
          "freeColleges",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid freeColleges",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "forUsersOfType",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid forUsersOfType",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "isForCorporate",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isForCorporate",
          })
        )
        .withOptional(
          "corporate",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid corporate",
          })
        )
        .withRequired(
          "price",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid price",
          })
        )
        .withRequired(
          "regularPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid regular price",
          })
        )
        .withRequired(
          "discountedPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid discountedPrice",
          })
        )
        .withRequired(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  overview description",
          })
        )
        .withRequired(
          "whatWillYouLearn",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid content for whatWillYouLearn",
          })
        )
        .withRequired(
          "certifications",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid certifications",
          })
        )
        .withRequired(
          "whoThisCourseIsFor",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid whoThisCourseIsFor",
          })
        )
        .withRequired(
          "courseIncludes",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid string",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "educators",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid educators",
          })
        )
        .withOptional(
          "isApproved",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isApproved",
          })
        )
        .withOptional(
          "discountedPriceExpiry",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid discountedPriceExpiry",
          })
        )
        .withOptional(
          "previewVideo",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid previewVideo",
          })
        );
    } else if (path == "/courses/edit") {
      check = validator
        .isObject()
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        )
        .withOptional(
          "catId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid category id",
          })
        )
        .withOptional(
          "thumbnail",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid thumbnail",
          })
        )
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withOptional(
          "shortDescription",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid short description",
          })
        )
        .withOptional(
          "duration",
          validator.isString({
            regex: videoDuration,
            message: "Please provide valid duration",
          })
        )
        .withOptional(
          "level",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid level",
          })
        )
        .withOptional(
          "freeForEveryone",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForEveryone",
          })
        )
        .withOptional(
          "freeForEnInLast30Days",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForEnInLast30Days",
          })
        )
        .withOptional(
          "freeForbasedOnColleges",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid freeForbasedOnColleges",
          })
        )
        .withOptional(
          "freeColleges",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid freeColleges",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "price",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid price",
          })
        )
        .withOptional(
          "regularPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid regular price",
          })
        )
        .withOptional(
          "discountedPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid discountedPrice",
          })
        )
        .withOptional(
          "discountedPriceExpiry",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid discountedPriceExpiry",
          })
        )
        .withOptional(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  overview description",
          })
        )
        .withOptional(
          "whatWillYouLearn",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid content for whatWillYouLearn",
          })
        )
        .withOptional(
          "certifications",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid certifications",
          })
        )
        .withOptional(
          "whoThisCourseIsFor",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid whoThisCourseIsFor",
          })
        )
        .withOptional(
          "courseIncludes",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid string",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "educators",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid educators",
          })
        )
        .withOptional(
          "isApproved",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isApproved",
          })
        )
        .withOptional(
          "previewVideo",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid previewVideo",
          })
        );
    } else if (
      path == "/courses/delete" ||
      path == "/course/session/active_session_list" ||
      path == "/course/session/list" ||
      path == "/course/detail" ||
      path == "/course/lesson/list" ||
      path == "/courses/approve_course"
    ) {
      check = validator.isObject().withRequired(
        "courseId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid course id",
        })
      );
    } else if (path == "/course/session/addNew") {
      check = validator
        .isObject()
        // .withRequired('sessionNo', validator.isInteger({ regex: emptycheck, message: "Please provide valid session number of the course" }))
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session title",
          })
        )
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        );
    } else if (path == "/course/session/edit") {
      check = validator
        .isObject()
        .withRequired(
          "sessionId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session id",
          })
        )
        // .withOptional('sessionNo', validator.isInteger({ regex: emptycheck, message: "Please provide valid session number of the course" }))
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session title",
          })
        )
        .withOptional(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        );
    } else if (
      path == "/course/session/delete" ||
      path == "/course/assessment/active_assessment_questions" ||
      path == "/course/session/info" ||
      path == "/course/assessment/list"
    ) {
      check = validator.isObject().withRequired(
        "sessionId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid session id",
        })
      );
    }
    //============================================== Lesson =============================================
    else if (path == "/course/lesson/addNew") {
      check = validator
        .isObject()
        .withRequired(
          "sessionId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session Id of the course",
          })
        )
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        )
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session title",
          })
        )
        .withRequired(
          "duration",
          validator.isString({
            regex: videoDuration,
            message: "Please provide valid lession duration",
          })
        )
        .withRequired(
          "isFreeVideo",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid lession isFreeVideo",
          })
        );
      //.withRequired('videoUrl', validator.isString({ regex: isValidVideo('videoUrl'), message: "Please provide valid session videoUrl" }))
    } else if (path == "/course/lesson/edit") {
      check = validator
        .isObject()
        .withRequired(
          "lessonId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid lesson Id of the course",
          })
        )

        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session title",
          })
        )
        .withOptional(
          "duration",
          validator.isString({
            regex: videoDuration,
            message: "Please provide valid lession duration",
          })
        )
        .withOptional(
          "isFreeVideo",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid lession isFreeVideo",
          })
        );
    } else if (
      path == "/course/lesson/delete" ||
      path == "/course/lesson/info"
    ) {
      check = validator.isObject().withRequired(
        "lessonId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid lesson id",
        })
      );
    } else if (path == "/course/initiateUpload") {
      check = validator
        .isObject()
        .withRequired(
          "fileName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid file name",
          })
        )
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        )
        .withRequired(
          "sessionId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session Id of the course",
          })
        )
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session title",
          })
        );
    } else if (path == "/course/lesson_edit/initiate_upload") {
      check = validator
        .isObject()
        .withRequired(
          "fileName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid file name",
          })
        )
        .withRequired(
          "lessonId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid lesson id",
          })
        );
    }

    //============================================== Assessment =============================================
    else if (path == "/course/assessment/addNew") {
      check = validator
        .isObject()
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid course id",
          })
        )
        .withRequired(
          "sessionId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session Id of the course",
          })
        )
        //don't delete
        // .withRequired('qList', validator.isArray(validator.isObject().withRequired('question', validator.isString({ regex: emptycheck, message: "Please provide valid question" }))
        // .withRequired('options', validator.isArray(validator.isString({ regex: emptycheck, message: "Please provide valid options" }),{min: 4}))
        // .withRequired('correctAnswer', validator.isString({ regex: emptycheck, message: "Please provide valid  correctAnswer" }))))
        .withRequired(
          "qList",
          validator.isArray(
            validator
              .isObject()
              .withRequired(
                "question",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid question",
                })
              )
              .withRequired(
                "option1",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  option1",
                })
              )
              .withRequired(
                "option2",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  option2",
                })
              )
              .withRequired(
                "option3",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  option3",
                })
              )
              .withRequired(
                "option4",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  option4",
                })
              )
              .withRequired(
                "correctAnswer",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  correctAnswer",
                })
              )
          )
        );
    } else if (path == "/course/assessment/edit") {
      check = validator
        .isObject()
        .withRequired(
          "assId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid assessment id",
          })
        )
        .withOptional(
          "question",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid question",
          })
        )
        .withOptional(
          "options",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid options",
            }),
            { min: 4 }
          )
        )
        .withOptional(
          "correctAnswer",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  correctAnswer",
          })
        );
    } else if (
      path == "/course/assessment/info" ||
      path == "/course/Assessment/delete"
    ) {
      check = validator.isObject().withRequired(
        "assId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid assessment id",
        })
      );
    } else if (path == "/exam/take_assessment") {
      check = validator
        .isObject()
        .withRequired(
          "sessionId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid session id",
          })
        )
        .withRequired(
          "qList",
          validator.isArray(
            validator
              .isObject()
              .withRequired(
                "questionId",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  questionId",
                })
              )
              .withOptional(
                "yourAnswer",
                validator.isString({
                  regex: emptycheck,
                  message: "Please provide valid  yourAnswer",
                })
              )
          )
        );
    }
    //============================================== Bundle Courses =============================================
    else if (path == "/course/bundle/addNew") {
      check = validator
        .isObject()

        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withRequired(
          "selectedCourses",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid selectedCourses",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "discountedPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid  discountedPrice",
          })
        );
    } else if (path == "/course/bundle/edit") {
      check = validator
        .isObject()
        .withRequired(
          "id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bundle Courses Id",
          })
        )
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withOptional(
          "selectedCourses",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid selectedCourses",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "discountedPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid  discountedPrice",
          })
        );
    } else if (
      path == "/course/bundle/info" ||
      path == "/course/bundle/delete"
    ) {
      check = validator.isObject().withRequired(
        "bundleId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid bundle courses id",
        })
      );
    } else if (path == "/course/bundle/changeStatus") {
      check = validator
        .isObject()
        .withRequired(
          "bundleId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bundle courses id",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid bundle status",
          })
        );
    }

    //================================== Listen to Experts =============================================
    else if (path == "/shorts/add") {
      check = validator
        .isObject()
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withRequired(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        );
    } else if (path == "/shorts/edit") {
      check = validator
        .isObject()
        .withRequired(
          "shortsId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid shortsId",
          })
        )
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        );
    } else if (path == "/shorts/changeStatus") {
      check = validator
        .isObject()
        .withRequired(
          "shortsId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid shortsId",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid  e.g. true | false",
          })
        );
    } else if (path == "/shorts/info" || path == "/shorts/delete") {
      check = validator.isObject().withRequired(
        "shortsId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid shortsId",
        })
      );
    }

    //================================== Jobs ==============================================================
    else if (path == "/add_new_job") {
      check = validator
        .isObject()
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        //.withRequired('description', validator.isString({ regex: emptycheck, message: "Please provide valid description" }))
        .withRequired(
          "experienceLevel",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid experience level",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "jobType",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid job type",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "department",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid job department",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "remote",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid remote",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "location",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid location",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isActive or not",
          })
        )
        .withRequired(
          "lastDateForApply",
          validator.isIsoDateTime({
            regex: emptycheck,
            message: "Please provide valid last date for apply",
          })
        );
    } else if (path == "/update_job_detail") {
      check = validator
        .isObject()
        .withRequired(
          "jobId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid jobId",
          })
        )
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        //.withOptional('description', validator.isString({ regex: emptycheck, message: "Please provide valid description" }))
        .withOptional(
          "experienceLevel",
          validator.isArray(
            validator.isString(
              {
                regex: emptycheck,
                message: "Please provide valid experience level",
              },
              { min: 1 }
            )
          )
        )
        .withOptional(
          "jobType",
          validator.isArray(
            validator.isString(
              { regex: emptycheck, message: "Please provide valid job type" },
              { min: 1 }
            )
          )
        )
        .withOptional(
          "department",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid job department",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "remote",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid remote",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "location",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid location",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isActive or not",
          })
        )
        .withOptional(
          "lastDateForApply",
          validator.isIsoDateTime({
            regex: emptycheck,
            message: "Please provide valid last date for apply",
          })
        );
    } else if (path == "/delete_job") {
      check = validator.isObject().withRequired(
        "jobId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid blogId",
        })
      );
    }

    //================================== Job Applicants ==============================================================
    else if (path == "/apply_now") {
      check = validator
        .isObject()
        .withRequired(
          "jobId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid blogId",
          })
        )
        .withRequired(
          "positionAppliedFor",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid position applied for",
          })
        )
        //.withRequired('jobCategory', validator.isString({ regex: emptycheck, message: "Please select job category." }))
        .withRequired(
          "fullName",
          validator.isString({
            regex: emptycheck,
            message: "Please enter full name.",
          })
        )
        .withRequired(
          "gender",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid gender",
          })
        )
        .withRequired(
          "emailId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid emailId",
          })
        )
        .withRequired(
          "phoneNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid phone number",
          })
        )
        .withRequired(
          "address",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid address",
          })
        )
        .withRequired(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withRequired(
          "pincode",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid pincode.",
          })
        )
        .withOptional(
          "totalWorkExperience",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid total work experience.",
          })
        )
        .withOptional(
          "lastEmployer",
          validator.isString({
            regex: emptycheck,
            message: "Please enter previous / current employer .",
          })
        )
        //.withOptional('preferredLocation', validator.isString({ regex: emptycheck, message: "Please provide valid preferred location" }))
        .withOptional(
          "source",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid 'how did you heard about us?'",
          })
        );
      //.withRequired('jobType', validator.isString({ regex: emptycheck, message: "Please provide valid job type" }))
    }

    //================================== Direct Training ==============================================================
    else if (path == "/add_direct_training_installment") {
      check = validator
        .isObject()
        .withRequired(
          "title",
          validator.isNumber({
            regex: emptycheck,
            message: "Please enter title.",
          })
        )
        .withRequired(
          "amount",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid installment amount.",
          })
        );
    } else if (path == "/proceed_to_pay") {
      console.log(req.body);
      check = validator
        .isObject()
        .withRequired(
          "fullName",
          validator.isString({
            regex: emptycheck,
            message: "Please enter full name.",
          })
        )
        .withRequired(
          "mobileNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid mobile number",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid emailId",
          })
        )
        .withRequired(
          "designation",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid designation.",
          })
        )
        .withRequired(
          "role",
          validator.isString({
            regex: emptycheck,
            message: "Please select role.",
          })
        )
        .withOptional("companyName")
        .withOptional("experience")
        .withRequired(
          "headQuarter",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid head quarter",
          })
        )
        .withRequired(
          "currentAddress",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid current address.",
          })
        )
        .withOptional("permanentAddress")
        .withRequired(
          "purpose",
          validator.isString({
            regex: emptycheck,
            message: "Please select valid purpose.",
          })
        )
        .withRequired(
          "selectedCentre",
          validator.isString({
            regex: emptycheck,
            message: "Please choose  centre.",
          })
        )
        .withRequired(
          "termsAndConditions",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid terms and conditions",
          })
        )
        .withRequired(
          "selectedInstallments",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please choose valid Installments.",
            })
          )
        )
        .withRequired(
          "qualification"
          // validator.isString({
          //   regex: emptycheck,
          //   message: "Please select qualification.",
          // })
        )
        .withRequired(
          "currentAddress2",
          validator.isString({
            regex: emptycheck,
            message: "Please select currentAddress2.",
          })
        )
        .withRequired(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please select city.",
          })
        )
        .withRequired(
          "pincode",
          validator.isString({
            regex: emptycheck,
            message: "Please select pincode.",
          })
        )
        .withRequired(
          "state",
          validator.isString({
            regex: emptycheck,
            message: "Please select state.",
          })
        )
        .withRequired(
          "pcurrentAddress",
          validator.isString({
            regex: emptycheck,
            message: "Please select permanent currentAddress.",
          })
        )
        .withRequired(
          "pcurrentAddress2",
          validator.isString({
            regex: emptycheck,
            message: "Please select permanent currentAddress2.",
          })
        )
        .withRequired(
          "pcity",
          validator.isString({
            regex: emptycheck,
            message: "Please select permanent city.",
          })
        )
        .withRequired(
          "ppincode",
          validator.isString({
            regex: emptycheck,
            message: "Please select permanent pincode.",
          })
        )
        .withRequired(
          "pstate",
          validator.isString({
            regex: emptycheck,
            message: "Please select permanent state.",
          })
        )
        .withOptional("subQualification");
    } else if (path == "/remove_selected_installments") {
      check = validator
        .isObject()
        .withRequired(
          "traineeId",
          validator.isString({
            regex: emptycheck,
            message: "Please enter traineeId.",
          })
        )
        .withRequired(
          "installmentTitle",
          validator.isString({
            regex: /^(1|2|3|4|5|6)$/,
            message: "Please choose valid installment title.",
          })
        );
    } else if (path == "/checkout") {
      check = validator.isObject().withRequired(
        "traineeId",
        validator.isString({
          regex: emptycheck,
          message: "Please enter traineeId.",
        })
      );
    } else if (path == "/pay_now") {
      check = validator.isObject().withRequired(
        "orderId",
        validator.isString({
          regex: emptycheck,
          message: "Please enter orderId.",
        })
      );
    }
    //================================== Blogs ==============================================================
    else if (path == "/create_new") {
      check = validator
        .isObject()
        .withRequired(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withRequired(
          "sDesc",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid short discription",
          })
        )
        .withRequired(
          "dDesc",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  detailed discription",
          })
        );
    } else if (path == "/update") {
      check = validator
        .isObject()
        .withRequired(
          "blogId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid blogId",
          })
        )
        .withOptional(
          "title",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid title",
          })
        )
        .withOptional(
          "sDesc",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid short discription",
          })
        )
        .withOptional(
          "dDesc",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  detailed discription",
          })
        );
    } else if (path == "/update_status") {
      check = validator
        .isObject()
        .withRequired(
          "blogId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid blogId",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid  e.g. true | false",
          })
        );
    } else if (path == "/detail" || path == "/del") {
      check = validator.isObject().withRequired(
        "blogId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid blogId",
        })
      );
    }
    //================================== Testimonials ==================================================
    else if (path == "/testimonial/create_new") {
      check = validator
        .isObject()
        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withRequired(
          "qualification",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid qualification",
          })
        )
        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )
        .withRequired(
          "feedback",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  feedback",
          })
        )
        .withOptional(
          "isActive",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  isActive",
          })
        );
    } else if (path == "/testimonial/update") {
      check = validator
        .isObject()
        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid testimonialId",
          })
        )
        .withOptional(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withOptional(
          "qualification",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid qualification",
          })
        )
        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )
        .withOptional(
          "feedback",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  feedback",
          })
        )
        .withOptional(
          "isActive",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  isActive",
          })
        );
    } else if (path == "/testimonial/del") {
      check = validator.isObject().withRequired(
        "_id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid testimonialId",
        })
      );
    } else if (path == "/video_testimonial/create_new") {
      check = validator
        .isObject()

        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )
        .withOptional(
          "isActive",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  isActive",
          })
        );
    } else if (path == "/video_testimonial/update") {
      check = validator
        .isObject()
        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid testimonialId",
          })
        )

        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )

        .withOptional(
          "isActive",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid  isActive",
          })
        );
    } else if (path == "/video_testimonial/del") {
      check = validator.isObject().withRequired(
        "_id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid testimonialId",
        })
      );
    }
    //================================== FAQs ==============================================================
    else if (path == "/faq/create_new") {
      check = validator
        .isObject()
        .withRequired(
          "question",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid question",
          })
        )
        .withRequired(
          "answer",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid answer",
          })
        );
    } else if (path == "/faq/update") {
      check = validator
        .isObject()
        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid faqId",
          })
        )
        .withOptional(
          "question",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid question",
          })
        )
        .withOptional(
          "answer",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid answer",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid  isActive",
          })
        );
    } else if (path == "/faq/del") {
      check = validator.isObject().withRequired(
        "_id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid faqId",
        })
      );
    }

    //================================== Banner =============================================
    else if (
      path == "/add_banner" ||
      path == "/add_subscription_banner" ||
      path == "/add_live_program_banner"
    ) {
      check = validator
        .isObject()
        .withRequired(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )
        .withRequired(
          "bannerFor",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bannerFor",
          })
        )
        .withOptional(
          "corporate",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid corporate",
          })
        );
    } else if (
      path == "/edit_banner" ||
      path == "/edit_subscription_banner" ||
      path == "/edit_live_program_banner"
    ) {
      check = validator
        .isObject()
        .withRequired(
          "bannerId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bannerId",
          })
        )
        .withOptional(
          "videoUrl",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid videoUrl",
          })
        )
        .withOptional(
          "bannerFor",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bannerFor",
          })
        )
        .withOptional(
          "corporate",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid corporate",
          })
        );
    } else if (
      path == "/change_status_of_banner" ||
      path == "/change_status_of_subscription_banner" ||
      path == "/change_status_of_live_program_banner"
    ) {
      check = validator
        .isObject()
        .withRequired(
          "bannerId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bannerId",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid  e.g. true | false",
          })
        );
    } else if (
      path == "/banner_info" ||
      path == "/delete_banner" ||
      path == "/subscription_banner_info" ||
      path == "/delete_subscription_banner" ||
      path == "/live_program_banner_info" ||
      path == "/delete_live_program_banner"
    ) {
      check = validator.isObject().withRequired(
        "bannerId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid bannerId",
        })
      );
    }
    //================================== Subscription Plan Banner =============================================
    else if (path == "/add_subscription_plan") {
      check = validator
        .isObject()
        .withRequired(
          "planName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid plan name",
          })
        )
        .withRequired(
          "oneMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid one month price",
            min: 1,
            max: 99999,
          })
        )
        .withRequired(
          "threeMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid three month price",
            min: 1,
            max: 99999,
          })
        )
        .withRequired(
          "sixMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid six month price",
            min: 1,
            max: 99999,
          })
        )
        .withRequired(
          "twelveMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid twelve month price",
            min: 1,
            max: 99999,
          })
        )
        .withRequired(
          "features",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid features",
            }),
            { min: 1 }
          )
        )
        .withRequired(
          "courseBundles",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid courseBundles",
            }),
            { min: 1 }
          )
        );
    } else if (path == "/edit_subscription_plan") {
      check = validator
        .isObject()
        .withRequired(
          "subscriptionPlanId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid subscriptionPlanId",
          })
        )
        .withOptional(
          "planName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid plan name",
          })
        )
        .withOptional(
          "oneMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid one month price",
            min: 1,
          })
        )
        .withOptional(
          "threeMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid three month price",
            min: 1,
          })
        )
        .withOptional(
          "sixMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid six month price",
            min: 1,
          })
        )
        .withOptional(
          "twelveMonthPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid twelve month price",
            min: 1,
          })
        )
        .withOptional(
          "features",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid features",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "courseBundles",
          validator.isArray(
            validator.isString({
              regex: emptycheck,
              message: "Please provide valid courseBundles",
            }),
            { min: 1 }
          )
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isActive",
          })
        );
    } else if (
      path == "/subscription_plan_info" ||
      path == "/delete_subscription_plan"
    ) {
      check = validator.isObject().withRequired(
        "subscriptionPlanId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid subscriptionPlanId",
        })
      );
    }

    //================================== My Subscription Plan for User =============================================
    else if (path == "/subscribe_a_plan") {
      check = validator
        .isObject()
        .withRequired(
          "planId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid planId",
          })
        )
        .withRequired(
          "selectedPPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid selected price of Plan",
          })
        )
        .withOptional(
          "upgrade",
          validator.isNumber({
            regex: emptycheck,
            message: "Do you want to continue.....?",
          })
        )
        .withOptional(
          "couponCode",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid coupon code.",
          })
        );
    } else if (path == "/cancel_renewal") {
      check = validator.isObject().withRequired(
        "_id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid _id",
        })
      );
    } else if (path == "/billing_summary") {
      check = validator
        .isObject()
        .withRequired(
          "planId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid planId. !!!",
          })
        )
        .withOptional(
          "couponCode",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid coupon code.!!!",
          })
        )
        .withOptional(
          "selectedPPrice",
          validator.isNumber({
            regex: emptycheck,
            message: "Please choose plan price.!!!",
          })
        );
    }

    //================================== coupon =============================================
    else if (path == "/add_coupon") {
      check = validator
        .isObject()
        .withRequired(
          "couponName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid couponName",
          })
        )
        .withRequired(
          "validFrom",
          validator.isIsoDateTime({
            regex: emptycheck,
            message: "Please provide valid validFrom",
          })
        )
        .withRequired(
          "validTill",
          validator.isIsoDateTime({
            regex: emptycheck,
            message: "Please provide valid validTill",
          })
        )
        .withRequired(
          "couponType",
          validator.isString({
            regex: /^(course|subscription)$/,
            message: "Please provide valid couponType",
          })
        )
        .withOptional(
          "selectedCourses",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid selectedCourses",
            })
          )
        )
        .withOptional(
          "selectedSubscriptions",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid selectedSubscriptions",
            })
          )
        )
        .withRequired(
          "discountType",
          validator.isString({
            regex: /^(percentage|price)$/,
            message: "Please provide valid discountType",
          })
        )
        .withRequired(
          "couponValue",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid couponValue",
          })
        );
    } else if (path == "/edit_coupon") {
      check = validator
        .isObject()
        .withRequired(
          "couponId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid couponId",
          })
        )
        .withOptional(
          "couponName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid couponName",
          })
        )
        .withOptional(
          "validFrom",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid validFrom",
          })
        )
        .withOptional(
          "validTill",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid validTill",
          })
        )
        .withOptional(
          "couponType",
          validator.isString({
            regex: /^(course|subscription)$/,
            message: "Please provide valid couponType",
          })
        )
        .withOptional(
          "selectedCourses",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid selectedCourses",
            })
          )
        )
        .withOptional(
          "selectedSubscriptions",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid selectedSubscriptions",
            })
          )
        )
        .withOptional(
          "discountType",
          validator.isString({
            regex: /^(percentage|price)$/,
            message: "Please provide valid discountType",
          })
        )
        .withOptional(
          "couponValue",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid couponValue",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isActive",
          })
        );
    } else if (path == "/coupon_info" || path == "/delete_coupon") {
      check = validator.isObject().withRequired(
        "couponId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid couponId",
        })
      );
    }

    // //================================== Subscription Banner =============================================

    // else if (path == '/add_subscription_banner') {

    //     check = validator.isObject()
    //     .withRequired('title', validator.isString({ regex: emptycheck, message: "Please provide valid title" }))
    //     .withRequired('content1', validator.isString({ regex: emptycheck, message: "Please provide valid content1" }))
    //     .withRequired('content2', validator.isString({ regex: emptycheck, message: "Please provide valid content2" }))
    //     .withRequired('bannerFor', validator.isString({ regex: emptycheck, message: "Please provide valid bannerFor" }))
    //     .withRequired('url', validator.isString({ regex: emptycheck, message: "Please provide valid url" }))
    // }
    // else if (path == '/edit_subscription_banner') {

    //     check = validator.isObject()
    //         .withRequired('subscription_bannerId', validator.isString({ regex: emptycheck, message: "Please provide valid subscription_bannerId" }))
    //         .withOptional('title', validator.isString({ regex: emptycheck, message: "Please provide valid title" }))
    //         .withOptional('content1', validator.isString({ regex: emptycheck, message: "Please provide valid content1" }))
    //         .withOptional('content2', validator.isString({ regex: emptycheck, message: "Please provide valid content2" }))
    //         .withOptional('bannerFor', validator.isString({ regex: emptycheck, message: "Please provide valid bannerFor" }))
    //         .withOptional('url', validator.isString({ regex: emptycheck, message: "Please provide valid url" }))

    // }
    // else if (path == '/change_status_of_subscription_banner') {

    //     check = validator.isObject()
    //         .withRequired('subscription_bannerId', validator.isString({ regex: emptycheck, message: "Please provide valid subscription_bannerId" }))
    //         .withOptional('isActive', validator.isBoolean({ regex: emptycheck, message: "Please provide valid  e.g. true | false" }))

    // }
    // else if (path == '/subscription_banner_info' || path == '/delete_subscription_banner') {

    //     check = validator.isObject()
    //         .withRequired('subscription_bannerId', validator.isString({ regex: emptycheck, message: "Please provide valid subscription_bannerId" }))

    // }

    //============================================== Leaners =============================================
    else if (path == "/sendMail") {
      check = validator
        .isObject()
        .withRequired(
          "selectedLearnersIds",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid learner's Id",
            })
          )
        )
        .withOptional(
          "subject",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid subject",
          })
        )
        .withRequired(
          "message",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid message",
          })
        );
    } else if (path == "/changeStatus") {
      check = validator
        .isObject()
        .withRequired(
          "id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid learner's Id",
          })
        )
        .withRequired(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid status",
          })
        );
    } else if (path == "/lInfo") {
      check = validator.isObject().withRequired(
        "id",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid learner's Id",
        })
      );
    }

    //============================================== Educator =============================================
    else if (path == "/signUpFrom") {
      check = validator
        .isObject()
        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "phoneNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid mobile number",
          })
        )
        .withRequired(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withRequired(
          "expertise",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid expertise",
          })
        )
        .withRequired(
          "designation",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid designation",
          })
        )
        .withRequired(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid description",
          })
        );
    } else if (path == "/updateProfile/:id") {
      check = validator
        .isObject()
        .withOptional(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name",
          })
        )
        .withOptional(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid email",
          })
        )
        .withOptional(
          "phoneNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid mobile number",
          })
        )
        .withOptional(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withOptional(
          "expertise",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid expertise",
          })
        )
        .withOptional(
          "designation",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid designation",
          })
        )
        .withOptional(
          "description",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid description",
          })
        );
    } else if (
      path == "/generate_login_credential" ||
      path == "/approve" ||
      path == "/delete"
    ) {
      check = validator.isObject().withRequired(
        "eduId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid educator Id",
        })
      );
    } else if (path == "/updateStatus") {
      check = validator
        .isObject()
        .withRequired(
          "eduId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid educator Id",
          })
        )
        .withRequired(
          "status",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid status",
          })
        );
    } else if (path == "/sendEmail") {
      check = validator
        .isObject()
        .withRequired(
          "selectedEducatorIds",
          validator.isArray(
            validator.isStringOrNull({
              regex: emptycheck,
              message: "Please provide valid educator Ids",
            })
          )
        )
        .withOptional(
          "subject",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid subject",
          })
        )
        .withRequired(
          "message",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid message",
          })
        );
    }

    //========================================== Website ==========================================================
    else if (path == "/contact_us") {
      check = validator
        .isObject()

        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid full name",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: email,
            message: "Please provide valid email",
          })
        )
        .withOptional(
          "mobile",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid mobile number",
          })
        )
        .withRequired(
          "message",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid message",
          })
        );
    } else if (path == "/register") {
      check = validator
        .isObject()
        .withRequired(
          "userType",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid user type",
          })
        )
        .withRequired(
          "fullName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid full name",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: email,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "phoneNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid phone number",
          })
        )
        .withRequired(
          "reasonId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid reasonId",
          })
        )
        .withRequired(
          "password",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid password",
          })
        )
        .withRequired(
          "confirmPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid confirm Password",
          })
        );
    } else if (path == "/personnelInfo") {
      check = validator
        .isObject()
        .withOptional(
          "userType",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid userType",
          })
        )
        .withOptional(
          "fullName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid fullName",
          })
        )
        .withOptional(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid email",
          })
        )
        .withOptional(
          "phoneNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid phoneNumber",
          })
        );
    } else if (path == "/passwordInfo") {
      check = validator
        .isObject()
        .withRequired(
          "currentPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid current Password",
          })
        )
        .withRequired(
          "newPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid new password",
          })
        )
        .withRequired(
          "confirmPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid confirmPassword",
          })
        );
    } else if (path == "/addressInfo") {
      check = validator
        .isObject()
        .withOptional(
          "addressLine",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid address",
          })
        )
        .withOptional(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withOptional(
          "state",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid state",
          })
        )
        .withOptional(
          "country",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid country",
          })
        )
        .withOptional(
          "pinCode",
          validator.isInteger({
            regex: emptycheck,
            message: "Please provide valid pinCode",
          })
        );
    } else if (path == "/academicInfo") {
      check = validator
        .isObject()
        .withOptional(
          "collegeId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name of the college Id",
          })
        )
        .withOptional(
          "collegeName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name of the college",
          })
        )
        .withOptional(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withOptional(
          "yearOfCollege",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid year of the college",
          })
        )
        .withOptional(
          "degreeOfStream",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid degree of stream",
          })
        )
        .withOptional(
          "pinCode",
          validator.isInteger({
            regex: emptycheck,
            message: "Please provide valid pinCode",
          })
        );
    } else if (path == "/professionalInfo") {
      check = validator
        .isObject()
        .withOptional(
          "companyName",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid name of the company",
          })
        )
        .withOptional(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid city",
          })
        )
        .withOptional(
          "designation",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid designation",
          })
        )
        .withOptional(
          "totalExperince",
          validator.isString({
            regex: emptycheck,
            message: "Please provide total year of experience",
          })
        )
        .withOptional(
          "degreeOfStream",
          validator.isString({
            regex: emptycheck,
            message: "Please provide total degree of stream",
          })
        )
        .withOptional(
          "pinCode",
          validator.isInteger({
            regex: emptycheck,
            message: "Please provide valid pinCode",
          })
        );
    } else if (path == "/wishlist_actions") {
      check = validator.isObject().withRequired(
        "courseId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid courseId",
        })
      );
    } else if (path == "/add" || path == "/remove") {
      check = validator.isObject().withRequired(
        "courseId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid courseId",
        })
      );
    } else if (path == "/give_rating_and_reviews") {
      check = validator
        .isObject()
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid courseId",
          })
        )
        .withRequired(
          "rating",
          validator.isNumber({
            min: 1,
            max: 5,
            regex: emptycheck,
            message: "Please provide valid rating",
          })
        )
        .withRequired(
          "reviews",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid reviews",
          })
        );
    } else if (
      path == "/approve_ratings_and_reviews" ||
      path == "/delete_ratings_and_reviews" ||
      path == "/fetch_ratings_and_reviews"
    ) {
      check = validator.isObject().withRequired(
        "rrId",
        validator.isString({
          regex: emptycheck,
          message: "Please provide valid ratings_and_reviews Id",
        })
      );
    } else if (path == "/edit_ratings_and_reviews") {
      check = validator
        .isObject()
        .withRequired(
          "rrId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid ratings_and_reviews Id",
          })
        )
        .withOptional(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid courseId",
          })
        )
        .withOptional(
          "userId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid userId",
          })
        )
        .withOptional(
          "rating",
          validator.isNumber({
            regex: emptycheck,
            message: "Please provide valid rating",
          })
        )
        .withOptional(
          "reviews",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid reviews",
          })
        )
        .withOptional(
          "isApproved",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isApproved",
          })
        );
    }
    // =========================================== order =========================================
    else if (path == "/subscribe_limited_time_offer") {
      check = validator
        .isObject()
        .withRequired(
          "bundleId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid bundleId",
          })
        )
        .withOptional(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing name",
          })
        )
        .withOptional(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing email",
          })
        )
        .withOptional(
          "mobileNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing mobile number",
          })
        )
        .withOptional(
          "country",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing country",
          })
        )
        .withOptional(
          "state",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing state",
          })
        )
        .withOptional(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing billing city",
          })
        );
    } else if (path == "/buy_now") {
      check = validator
        .isObject()
        .withRequired(
          "courseId",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid courseId",
          })
        )
        .withRequired(
          "name",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing name",
          })
        )
        .withRequired(
          "email",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing email",
          })
        )
        .withRequired(
          "mobileNumber",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing mobile number",
          })
        )
        .withRequired(
          "country",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing country",
          })
        )
        .withRequired(
          "state",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing state",
          })
        )
        .withRequired(
          "city",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid billing billing city",
          })
        );
    }
    // else if (path == '/place_order') {

    //     check = validator.isObject()
    //         .withRequired('cartId', validator.isString({ regex: emptycheck, message: "Please provide valid cartId" }))
    //         .withRequired('name', validator.isString({ regex: emptycheck, message: "Please provide valid billing name" }))
    //         .withRequired('email', validator.isString({ regex: emptycheck, message: "Please provide valid billing email" }))
    //         .withRequired('mobileNumber', validator.isString({ regex: emptycheck, message: "Please provide valid billing mobile number" }))
    //         .withRequired('country', validator.isString({ regex: emptycheck, message: "Please provide valid billing country" }))
    //         .withRequired('state', validator.isString({ regex: emptycheck, message: "Please provide valid billing state" }))
    //         .withRequired('city', validator.isString({ regex: emptycheck, message: "Please provide valid billing billing city" }))
    //         .withOptional('couponCode', validator.isStringOrNull({ regex: emptycheck, message: "Please provide valid billing billing couponCode" }))

    // }
    else if (path == "/login") {
      check = validator
        .isObject()
        .withRequired(
          "email",
          validator.isString({
            regex: email,
            message: "Please provide valid email",
          })
        )
        .withRequired(
          "password",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid password",
          })
        );
    } else if (path == "/confirmPassword") {
      check = validator
        .isObject()
        .withRequired(
          "token",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid token",
          })
        )
        .withRequired(
          "password",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid password",
          })
        )
        .withRequired(
          "confirmPassword",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid confirmPassword",
          })
        );
    } else if (path == "/forgotPassword") {
      check = validator.isObject().withRequired(
        "email",
        validator.isString({
          regex: email,
          message: "Please provide valid email",
        })
      );
    } else if (path == "/createReason") {
      check = validator
        .isObject()

        .withRequired(
          "reason",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid reason",
          })
        );
    } else if (path == "/editReason") {
      check = validator
        .isObject()

        .withRequired(
          "_id",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid _id",
          })
        )
        .withRequired(
          "reason",
          validator.isString({
            regex: emptycheck,
            message: "Please provide valid reason",
          })
        )
        .withOptional(
          "isActive",
          validator.isBoolean({
            regex: emptycheck,
            message: "Please provide valid isActive",
          })
        );
    } else {
      // Handle unsupported paths
      throw new Error("not found");
    }

    validator.run(check, data, (errorcount, errors) => {
      if (errorcount === 0) {
        next();
      } else {
        let currentIndex = 0;

        function convertToUserFriendly(parameter) {
          let friendlyParameter = parameter
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
            .replace(/^./, (str) => str.toUpperCase());

          // Remove ".length" suffix for array-related errors
          friendlyParameter = friendlyParameter.replace(/\.length$/, "");
          if (parameter.includes("[") && parameter.includes("]")) {
            friendlyParameter = friendlyParameter.replace(/\[\d+\]/, "");
          }
          return friendlyParameter;
        }

        function displayError() {
          if (currentIndex < errors.length) {
            let currentError = errors[currentIndex];

            let errormsg = "";
            if (
              currentError.message == "Required value." &&
              currentError.value == undefined
            ) {
              currentError.message =
                convertToUserFriendly(currentError.parameter) +
                " is required.!";
            } else if (
              currentError.value != undefined ||
              currentError.value == "" ||
              currentError.value == [] ||
              currentError.message == "Unexpected value."
            ) {
              currentError.message =
                "Not a valid " +
                convertToUserFriendly(currentError.parameter) +
                ".!";
            } else {
              currentError.message = currentError.message;
            }
            errormsg = currentError.message;

            res.json({ status: false, message: errormsg });

            currentIndex++;
          } else {
            // If all errors are displayed, you can proceed to the next step
            next();
          }
        }

        // Initial display of the first error
        displayError();
      }
    });
  } catch (e) {
    if (e.message === "not found") {
      res.json({ status: false, message: "Invalid URL !!!" });
    } else {
      res.json({
        status: false,
        message: "Oops! Something went wrong. Please try again later",
      });
    }
  }
};

exports.validateCSVData = (data) => {
  const errors = [];

  data.forEach((row, index) => {
    if (!email.test(row.email)) {
      errors.push({
        row: index + 1,
        field: "email",
        message: "Invalid email format",
      });
    }
    if (!row.fullName || row.fullName.trim() === "") {
      errors.push({
        row: index + 1,
        field: "fullName",
        message: "Full name is required",
      });
    }
    if (!row.phoneNumber || row.phoneNumber.trim() === "") {
      errors.push({
        row: index + 1,
        field: "phoneNumber",
        message: "Phone number is required",
      });
    }

    // Add other field validations as necessary
  });

  return errors;
};
