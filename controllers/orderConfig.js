const userrModel = require("../models/user");
const cartModel = require("../models/cart");
const courseModel = require("../models/courseMain");
const order = require("../models/order");
const CouponModel = require("../models/coupon");
const { default: mongoose } = require("mongoose");
const courseBundle = require("../models/courseBundle");
const educator = require("../models/educator");
const courseCategory = require("../models/courseCategory");
const courseMain = require("../models/courseMain");
const courseSession = require("../models/courseSession");
const courseSessionLesson = require("../models/courseSessionLesson");
const userMyCourses = require("../models/userMyCourses");
const UserSubscriptionPlan = require("../models/userSubscriptionPlan");
const Notification = require("../models/Notification");
const AdminNotification = require("../models/adminNotifications");
const academicModel = require("../models/academic");
const InstitutionModel = require("../models/institution");
const AdminModel = require("../models/admin");
const { SendMessage } = require("../common/nommoc");
const config = require("../nodedetails/config");
const CCAvenue = require("node-ccavenue");
const user = require("../models/user");
const ccav = new CCAvenue.Configure({
  merchant_id: config.ccAvenuePG.merchantId,
  access_code: config.ccAvenuePG.accessCode,
  working_key: config.ccAvenuePG.workingKey,
});

exports.subscribeNowForBundleCourse = async (req, res) => {
  try {
    let userid = req.userid;
    let { bundleId, name, email, mobileNumber, country, state, city } =
      req.body;

    let fetchCourse = await courseBundle
      .findOne({ _id: bundleId })
      .select({
        _id: 1,
        selectedCourses: 1,
        totalPrice: 1,
        discountedPrice: 1,
      });
    if (!fetchCourse) {
      return res.json({
        status: false,
        message: "This plan does not exist anymore !!!",
      });
    }

    let orderData = {
      userId: userid,
      items: fetchCourse.selectedCourses.map((courseId) => ({ courseId })),
      totalMrp: parseFloat(fetchCourse.totalPrice.toFixed(2)),
      totalDiscountedPrice: parseFloat(fetchCourse.discountedPrice.toFixed(2)),

      totalItems: fetchCourse.selectedCourses.length,

      status: "success", //active  after payment confirmation

      billingDetails: {
        name,
        email,
        mobileNumber,
        country,
        state,
        city,
      },
    };

    let createOrder = await order.create(orderData);

    if (!createOrder) {
      return res.json({ status: false, message: "Unable to plan" });
    }

    return res.json({
      status: true,
      message: "You have subscribed plan successfully",
      data: createOrder,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.BuyNow = async (req, res) => {
  try {
    let userid = req.userid;
    let { courseId, name, email, mobileNumber, country, state, city } =
      req.body;
    let totalDiscountedPrice = 0,
      totalPrice = 0;

    let fetchCourse = await courseModel
      .findOne({ _id: courseId })
      .select({
        _id: 1,
        price: 1,
        discountedPrice: 1,
        discountedPriceExpiry: 1,
      });
    if (!fetchCourse) {
      return res.json({
        status: false,
        message: "This course does not exist anymore !!!",
      });
    }
    //console.log(fetchCourse.discountedPriceExpiry > Date.now())
    if (fetchCourse && fetchCourse.discountedPriceExpiry > Date.now()) {
      totalDiscountedPrice = fetchCourse.discountedPrice;
    } else {
      totalDiscountedPrice = fetchCourse.price;
    }

    totalPrice = fetchCourse.price;

    let orderData = {
      userId: userid,
      items: [{ courseId: fetchCourse._id }],
      totalMrp: parseFloat(totalPrice.toFixed(2)),
      totalDiscountedPrice: parseFloat(totalDiscountedPrice.toFixed(2)),

      totalItems: 1,

      status: "success", //active  after payment confirmation

      billingDetails: {
        name,
        email,
        mobileNumber,
        country,
        state,
        city,
      },
    };

    let createOrder = await order.create(orderData);

    if (!createOrder) {
      return res.json({ status: false, message: "Unable to place order" });
    }

    return res.json({
      status: true,
      message: "Order placed successfully",
      data: createOrder,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

function convertHHMMSSToSeconds(hhmmss) {
  const timearr = hhmmss.split(":").map(Number);

  if (timearr.length == 3) {
    return timearr[0] * 3600 + timearr[1] * 60 + timearr[2];
  } else if (timearr.length == 2) {
    return timearr[0] * 60 + timearr[1];
  }
}

exports.PlaceAnOrder = async (req, res) => {
  try {
    let userid = req.userid;
    let { name, email, mobileNumber, country, state, city, couponCode } =
      req.body;
    let totalPriceAfterDiscount = 0,
      totalPrice = 0;

    let cart = await cartModel.findOne({ userId: userid });
    if (!cart) {
      return res.json({ status: false, message: "Please add items in cart" });
    }
    if (!name || !email || !mobileNumber || !country || !state || !city) {
      return res.json({
        status: false,
        message: "Please provide complete billing detail.!!!",
      });
    }
    let cartItems = cart.items;
    if (cartItems.length != 0) {
      for (let i = 0; i < cartItems.length; i++) {
        let duplicateOrders = await order.findOne({
          userId: userid,
          items: [{ courseId: cartItems[i].courseId }],
          status: "success",
        });
        let courseInfo = await courseModel
          .findOne({ _id: cartItems[i].courseId })
          .select({
            _id: 1,
            title: 1,
            freeForEveryone: 1,
            freeForEnInLast30Days: 1,
            expiry: 1,
            freeForbasedOnColleges: 1,
            freeColleges: 1,
            price: 1,
            regularPrice: 1,
            discountedPrice: 1,
            discountedPriceExpiry: 1,
          });

        if (!duplicateOrders) {
          // totalPrice += courseInfo.price;
          // if (new Date(courseInfo.discountedPriceExpiry * 1000) > new Date(Date.now())) {

          //     // console.log("discountedPrice",courseInfo.discountedPrice)
          //     totalPriceAfterDiscount += courseInfo.discountedPrice

          // } else {
          //     //    console.log("regularPrice",courseInfo.regularPrice)
          //     totalPriceAfterDiscount += courseInfo.regularPrice
          // }

          totalPrice += courseInfo.price;

          if (courseInfo && courseInfo.freeForbasedOnColleges) {
            //console.log("discountedPrice",courseInfo.discountedPrice)

            let checkUserCollege = await academicModel.findOne({
              userId: userid,
            });
            //console.log("checkUserCollege", checkUserCollege)
            if (
              checkUserCollege &&
              courseInfo.freeColleges &&
              courseInfo.freeColleges.length !== 0
            ) {
              let checkFreeForbasedOnColleges = await InstitutionModel.findOne({
                name: checkUserCollege.collegeName,
              });
              //console.log("checkFreeForbasedOnColleges",courseInfo.freeColleges, checkFreeForbasedOnColleges._id)

              if (
                checkFreeForbasedOnColleges &&
                courseInfo.freeColleges &&
                courseInfo.freeColleges.includes(
                  String(checkFreeForbasedOnColleges._id)
                )
              ) {
                totalPriceAfterDiscount += 0;
              } else {
                totalPriceAfterDiscount += courseInfo.regularPrice;
              }
            } else {
              totalPriceAfterDiscount += courseInfo.regularPrice;
            }
          } else if (courseInfo && courseInfo.freeForEnInLast30Days) {
            let checkUserRegDate = await userModel
              .findOne({ _id: userid })
              .select("createdAt");
            //console.log("checkUserRegDate",checkUserRegDate,new Date(checkUserRegDate.createdAt) < new Date(Date.now()),new Date(checkUserRegDate.createdAt) , new Date(Date.now()))
            if (
              checkUserRegDate &&
              new Date(checkUserRegDate.createdAt) < new Date(Date.now())
            ) {
              totalPriceAfterDiscount += 0;
            } else {
              totalPriceAfterDiscount += courseInfo.regularPrice;
            }
          } else if (courseInfo && courseInfo.freeForEveryone) {
            //  console.log("freeForEveryone")

            totalPriceAfterDiscount += 0;
          } else if (
            new Date(courseInfo.discountedPriceExpiry * 1000) >
            new Date(Date.now())
          ) {
            //  console.log("discountedPrice",courseInfo.discountedPrice)
            totalPriceAfterDiscount += courseInfo.discountedPrice;
          } else {
            //   console.log("regularPrice",courseInfo.regularPrice)
            totalPriceAfterDiscount += courseInfo.regularPrice;
          }
        } else {
          return res.json({
            status: false,
            message: `You have already purchased the course '${courseInfo.title}'`,
          });
        }
      }

      let totalPriceAfterDiscountWithoutCoupon = totalPriceAfterDiscount;

      if (couponCode) {
        let couponInfo = await CouponModel.findOne({ couponName: couponCode });
        // console.log(couponInfo,"couponInfo")
        if (couponInfo) {
          let validFrom = new Date(couponInfo.validFrom);
          let validTill = new Date(couponInfo.validTill);
          validTill.setDate(validTill.getDate() + 1);
          let currentDate = new Date(Date.now());

          const isValidCoupon4Course = cartItems.filter((item) =>
            couponInfo.selectedCourses.includes(String(item.courseId))
          );

          //  console.log("isValidCoupon4Course",isValidCoupon4Course,cartItems)
          //console.log(currentDate , validFrom < validTill ,currentDate ,validFrom , validTill)

          if (
            couponInfo &&
            validFrom <= currentDate &&
            currentDate < validTill &&
            couponInfo.isActive == true &&
            isValidCoupon4Course.length !== 0
          ) {
            if (
              couponInfo &&
              couponInfo.couponType == "subscription" &&
              couponInfo.discountType == "price"
            ) {
              //console.log(ttlDPrice - couponInfo.couponValue, "fdhfh")
              if (totalPriceAfterDiscount > couponInfo.couponValue) {
                totalPriceAfterDiscount -= couponInfo.couponValue;
              }
            } else if (
              couponInfo &&
              couponInfo.couponType == "subscription" &&
              couponInfo.discountType == "percentage"
            ) {
              //console.log(totalPriceAfterDiscount - couponInfo.couponValue, "percentage")
              let disPercentage =
                (totalPriceAfterDiscount * (100 - couponInfo.couponValue)) /
                100;
              if (disPercentage < totalPriceAfterDiscount) {
                totalPriceAfterDiscount = disPercentage;
              }
            } else if (
              couponInfo &&
              couponInfo.couponType == "course" &&
              couponInfo.discountType == "price"
            ) {
              //console.log(totalPriceAfterDiscount - couponInfo.couponValue, "course price")
              if (totalPriceAfterDiscount > couponInfo.couponValue) {
                totalPriceAfterDiscount -= couponInfo.couponValue;
              }
            } else if (
              couponInfo &&
              couponInfo.couponType == "course" &&
              couponInfo.discountType == "percentage"
            ) {
              ///console.log(100 - couponInfo.couponValue, "course percentage")

              let disPercentage =
                (totalPriceAfterDiscount * (100 - couponInfo.couponValue)) /
                100;

              if (disPercentage < totalPriceAfterDiscount) {
                totalPriceAfterDiscount = disPercentage;
              }
            }
          } else {
            return res.json({
              status: false,
              message: "Invalid coupon code !!!",
            });
          }
        } else {
          return res.json({
            status: false,
            message: "Invalid coupon code !!!",
          });
        }
      }

      let orderData = {
        userId: userid,
        items: [...cart.items],
        totalMrp: parseFloat(totalPrice.toFixed(2)),
        totalDiscountedPrice: parseFloat(
          (totalPriceAfterDiscount * 1.18).toFixed(2)
        ),

        totalItems: cart.items.length,

        status: "pending", //active  after payment confirmation

        billingDetails: {
          name,
          email,
          mobileNumber,
          country,
          state,
          city,
        },
        paymentDetails: {
          totalMrp: parseFloat(totalPrice.toFixed(2)),
          couponDiscount: parseFloat(
            totalPriceAfterDiscountWithoutCoupon.toFixed(2) -
              totalPriceAfterDiscount.toFixed(2)
          ),
          totalDiscount: parseFloat(
            totalPrice.toFixed(2) - totalPriceAfterDiscount.toFixed(2)
          ),
          paidAmount: parseFloat((totalPriceAfterDiscount * 1.18).toFixed(2)),
        },
      };

      let createOrder = await order.create(orderData);

      if (!createOrder) {
        return res.json({ status: false, message: "Unable to place order" });
      }
      //====================================================================================
      for (let i = 0; i < cartItems.length; i++) {
        const courseInfo = await courseMain
          .findById(cartItems[i].courseId)
          .select({ _id: 1, thumbnail: 1, duration: 1, title: 1, level: 1 });

        if (!courseInfo) {
          return res.json({ status: false, message: "Course does not exist" });
        }
        // working fine
        // const existingCourse = await userMyCourses.findOne({ "userId": userId, "courseId": courseId ,"validTill":{$gt : new Date()} });

        // if (existingCourse) {
        //     return res.json({ status: false, message: 'Course already exists in your courses' });
        // }

        const sessions = await courseSession
          .find({ courseId: cartItems[i].courseId })
          .select({ _id: 1 });

        const sessionPromises = sessions.map(async (session) => {
          const lessons = await courseSessionLesson.find({
            sessionId: session._id,
          });

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
          userId: userid,
          courseId: cartItems[i].courseId,
          courseName: courseInfo.title,
          thumbnail: courseInfo.thumbnail,
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
      }

      if (createOrder && createOrder.totalDiscountedPrice == 0) {
        let updateDetail = await order.findByIdAndUpdate(
          createOrder._id,
          { status: "success" },
          { new: true }
        );
        await cartModel.findOneAndRemove({ userId: updateDetail.userId });
        let getFavv = await user.findById(updateDetail.userId);
        let updatedItems = updateDetail.items.map((x) => String(x.courseId));
        // console.log(getFavv.favorite, updatedItems)
        const notInItems = getFavv.favorite.filter(
          (fav) => !updatedItems.includes(String(fav))
        );
        await user.findByIdAndUpdate(
          updateDetail.userId,
          { favorite: notInItems, isExUser: true },
          { new: true }
        );
        await Notification.create({
          userId: updateDetail.userId,
          message: `Your order has been successfully placed with Order Id: #${String(
            createOrder._id
          ).slice(0, 7)} .`,
        });
        let adminList = await AdminModel.findOne({ type: "super_admin" });
        await AdminNotification.create({
          userId: updateDetail.userId,
          adminId: adminList._id,
          redirectId: createOrder._id,
          message: `${name} has  placed new order.`,
        });
        let message = `Dear ${name}, you have successfully purchased course Order Id - #${String(
          createOrder._id
        ).slice(0, 7)} - Kareer Sity`;
        SendMessage(mobileNumber, message);
        return res.json({
          status: true,
          message: "Your order has been successfully placed.",
          data: `${config.orderURLs.payment_success_page}`,
        });
      }
      //====================================================================================

      const pgOrderData = {
        order_id: createOrder._id,
        amount: createOrder.totalDiscountedPrice,
        currency: "INR",
        redirect_url: `${config.orderURLs.payment_success}`,
        cancel_url: `${config.orderURLs.payment_success}`,
        language: "EN",
        billing_name: createOrder.billingDetails.name,
        billing_address: createOrder.billingDetails.city,
        billing_city: createOrder.billingDetails.city,
        billing_state: createOrder.billingDetails.state,
        billing_country: "India",
        billing_pincode: "OPTIONAL",
        billing_tel: createOrder.billingDetails.mobileNumber,
        billing_email: createOrder.billingDetails.email,
        delivery_name: createOrder.billingDetails.name,
        delivery_address: createOrder.billingDetails.city,
        delivery_city: createOrder.billingDetails.city,
        delivery_state: createOrder.billingDetails.state,
        billing_pincode: "OPTIONAL",
        delivery_country: "India",
        delivery_tel: createOrder.billingDetails.mobileNumber,
      };
      console.log(pgOrderData);
      let paymentDetail = ccav.getEncryptedOrder(pgOrderData);

      return res.json({
        status: true,
        message: "Make payment",
        data: `${config.orderURLs.payment_gateway}&encRequest=${paymentDetail}&access_code=${config.ccAvenuePG.accessCode}`,
      });
    } else {
      return res.json({ status: false, message: "Please add items in cart" });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.paymentSuccesssResponse = async (req, res) => {
  try {
    const { encResp } = req.body;
    const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);
    // To check order_status: -
    // console.log(decryptedJsonResponse)

    // // !orderId || !trackingId || !statusCode

    //"billing_name": "Pankaj Singh", "billing_address": "127 P", "billing_city": "ch", "billing_state": "tn", "billing_zip": "600040", "billing_country": "India", "billing_tel": "9997867860", "billing_email": "pankaj@cortexmarketing.in",  "vault": "N", "offer_type": "null", "offer_code": "null",

    let fetchExOrder = await order.findById(decryptedJsonResponse.order_id);

    let updatePaymentInfo = {
      ...fetchExOrder.paymentDetails,
      ...decryptedJsonResponse,
    };

    if (decryptedJsonResponse.order_status == "Success") {
      let updateDetail = await order.findByIdAndUpdate(
        decryptedJsonResponse.order_id,
        {
          status: decryptedJsonResponse.order_status.toLowerCase(),
          paymentDetails: updatePaymentInfo,
        },
        { new: true }
      );
      await cartModel.findOneAndRemove({ userId: updateDetail.userId });
      let getFavv = await user.findById(updateDetail.userId);
      let updatedItems = updateDetail.items.map((x) => String(x.courseId));
      //console.log(getFavv.favorite,updatedItems)
      const notInItems = getFavv.favorite.filter(
        (fav) => !updatedItems.includes(String(fav))
      );
      await user.findByIdAndUpdate(
        updateDetail.userId,
        { favorite: notInItems, isExUser: true },
        { new: true }
      );

      await Notification.create({
        userId: updateDetail.userId,
        message: `Your order has been successfully placed with Order Id: #${String(
          decryptedJsonResponse.order_id
        ).slice(0, 7)} .`,
      });
      let adminList = await AdminModel.findOne({ type: "super_admin" });
      await AdminNotification.create({
        userId: updateDetail.userId,
        adminId: adminList._id,
        redirectId: decryptedJsonResponse.order_id,
        message: `${decryptedJsonResponse.billing_name} has  placed new order.`,
      });
      let message = `Dear ${
        decryptedJsonResponse.billing_name
      }, you have successfully purchased course Order Id - #${String(
        decryptedJsonResponse.order_id
      ).slice(0, 7)} - Kareer Sity`;
      SendMessage(decryptedJsonResponse.billing_tel, message);
      return res.redirect(`${config.orderURLs.payment_success_page}`);
    } else {
      await order.findByIdAndUpdate(
        decryptedJsonResponse.order_id,
        {
          status: decryptedJsonResponse.order_status.toLowerCase(),
          paymentDetails: updatePaymentInfo,
        },
        { new: true }
      );
      return res.redirect(`${config.orderURLs.payment_failed_page}`);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error processing payment response", err: err });
  }
};

exports.listOfOrderPlacedByUser = async (req, res) => {
  try {
    const userId = req.userid;
    const status = req.query.status;

    const user = await userrModel.findById(userId);

    if (!user) {
      return res.json({ status: true, message: "User not found" });
    }

    const query = {
      userId: mongoose.Types.ObjectId(userId),
      status: status ? status : { $in: ["pending", "success"] },
    };

    const orders = await order
      .find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "items.courseId",
        model: "MainCourse",
        select: "category title duration level price discountedPrice educators",
      })
      .select(
        "userId totalMrp totalDiscountedPrice totalItems status billingDetails paymentDetails createdAt updatedAt"
      )
      .lean();

    const promises = orders.map(async (order) => {
      for (let i = 0; i < order.items.length; i++) {
        const courseDetail = order.items[i].courseId;

        // Validate and convert educators and category to ObjectId
        if (courseDetail && mongoose.isValidObjectId(courseDetail.educators)) {
          const eduInfo = await educator
            .findOne({ _id: courseDetail.educators })
            .select({ _id: 0, name: 1 });
          order.items[i].courseId.educators = eduInfo
            ? eduInfo.name
            : "Kareer Sity";
        }

        if (courseDetail && mongoose.isValidObjectId(courseDetail.category)) {
          const catInfo = await courseCategory
            .findOne({ _id: courseDetail.category })
            .select({ _id: 0, name: 1 });
          order.items[i].courseId.category = catInfo
            ? catInfo.name
            : "Kareer Sity";
        }
      }

      order.items = order.items.map((item) => {
        return item.courseId;
      });
      return order;
    });

    const results = await Promise.all(promises);

    res.json({
      status: true,
      message: `You have placed a total of ${results.length} order(s)`,
      data: results,
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.listOfOrdersForAdmin = async (req, res) => {
  try {
    let { search, status } = req.body;

    const query = {
      status: status ? status : { $in: ["pending", "success"] },
    };

    if (search) {
      query.$or = [
        { "billingDetails.name": { $regex: search, $options: "i" } },
        { "billingDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    order
      .aggregate(
        [
          {
            $match: query,
          },

          {
            $lookup: {
              from: "KrSity_ESRUOCNIAM",
              localField: "items.courseId",
              foreignField: "_id",
              as: "items.courses",
            },
          },
          // {
          //     $project: {

          //         "userId": 1,
          //         "items.courses": 1,
          //         "totalMrp": 1,
          //         "totalDiscountedPrice": 1,
          //         "totalItems": 1,
          //         "status": 1,
          //         "billingDetails": 1,
          //         "paymentDetails": 1,
          //         "createdAt": 1,
          //         "updatedAt": 1,

          //     }
          // },
          {
            $project: {
              userId: 1,
              items: {
                courses: {
                  _id: 1,
                  title: 1,
                  price: 1,
                  regularPrice: 1,
                  discountedPrice: 1,
                },
              },
              // "totalMrp": 1,
              // "totalDiscountedPrice": 1,
              totalItems: 1,
              status: 1,
              billingDetails: {
                name: 1,
                email: 1,
                mobileNumber: 1,
              },
              paymentDetails: {
                totalMrp: 1,
                couponDiscount: 1,
                totalDiscount: 1,
                paidAmount: 1,
              },
              createdAt: 1,
              updatedAt: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        (err, getlist) => {
          res.send({
            status: true,
            message: `Total  ${getlist.length}  order (s) found`,
            data: getlist,
          });
        }
      )
      .exec();
  } catch (e) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.fetchOrderDetailForAdmin = async (req, res) => {
  try {
    const orderId = req.body.orderId;

    const getlist = await order
      .findById(orderId)
      .populate({
        path: "items.courseId",
        model: courseModel,
      })
      .select(
        "userId totalMrp totalDiscountedPrice totalItems status billingDetails paymentDetails createdAt updatedAt items"
      );

    res.send({ status: true, data: getlist });
  } catch (e) {
    console.error(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

// exports.salesAndRevenueInAdminDashboard = async (req, res) => {
//     try {
//         const monthlySales = await order.aggregate([
//             {
//                 $group: {
//                     _id: { $month: "$createdAt" },
//                     totalDiscountedPrice: { $sum: "$totalDiscountedPrice" },
//                 },
//             },
//             // {
//             //     $project: {
//             //         _id: 0,
//             //         month: {
//             //             $switch: {
//             //                 branches: [
//             //                     { case: { $eq: ["$_id", 1] }, then: "January" },
//             //                     { case: { $eq: ["$_id", 2] }, then: "February" },
//             //                     { case: { $eq: ["$_id", 3] }, then: "March" },
//             //                     { case: { $eq: ["$_id", 4] }, then: "April" },
//             //                     { case: { $eq: ["$_id", 5] }, then: "May" },
//             //                     { case: { $eq: ["$_id", 6] }, then: "June" },
//             //                     { case: { $eq: ["$_id", 7] }, then: "July" },
//             //                     { case: { $eq: ["$_id", 8] }, then: "August" },
//             //                     { case: { $eq: ["$_id", 9] }, then: "September" },
//             //                     { case: { $eq: ["$_id", 10] }, then: "October" },
//             //                     { case: { $eq: ["$_id", 11] }, then: "November" },
//             //                     { case: { $eq: ["$_id", 12] }, then: "December" },
//             //                 ],
//             //                 default: "Unknown",
//             //             },
//             //         },
//             //         totalDiscountedPrice: 1,
//             //     },
//             // },
//             {
//                 $sort: {
//                     month: 1,
//                 },
//             },
//         ]);

//         res.json({ status: true, data: monthlySales });
//     } catch (error) {
//         console.log(error);
//         res.json({ status: false, message: 'Oops! Something went wrong. Please try again later.' });
//     }
// };

exports.salesAndRevenueInAdminDashboard = async (req, res) => {
  try {
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 11);

    const monthlyCoursesSales = await order.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalDiscountedPrice: {
            $sum: {
              $cond: [
                { $eq: ["$totalDiscountedPrice", null] },
                0,
                "$totalDiscountedPrice",
              ],
            },
          },
        },
      },
    ]);

    const monthlySubsPlanSales = await UserSubscriptionPlan.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalDiscountedPrice: {
            $sum: "$price",
          },
        },
      },
    ]);

    let result = [];

    for (let i = 0; i < monthlyCoursesSales.length; i++) {
      let found = false;

      for (let j = 0; j < monthlySubsPlanSales.length; j++) {
        if (
          monthlyCoursesSales[i]._id.year ===
            monthlySubsPlanSales[j]._id.year &&
          monthlyCoursesSales[i]._id.month === monthlySubsPlanSales[j]._id.month
        ) {
          result.push({
            _id: {
              month: monthlyCoursesSales[i]._id.month,
              year: monthlyCoursesSales[i]._id.year,
            },
            totalDiscountedPrice:
              monthlyCoursesSales[i].totalDiscountedPrice +
              monthlySubsPlanSales[j].totalDiscountedPrice,
          });

          found = true;
          break;
        }
      }

      if (!found) {
        result.push({
          _id: {
            month: monthlyCoursesSales[i]._id.month,
            year: monthlyCoursesSales[i]._id.year,
          },
          totalDiscountedPrice: monthlyCoursesSales[i].totalDiscountedPrice,
        });
      }
    }

    result.sort((a, b) => {
      if (a._id.year === b._id.year) {
        return b._id.month - a._id.month;
      }
      return b._id.year - a._id.year;
    });

    res.json({
      status: true,
      data: result,
      //monthlyCoursesSales: monthlyCoursesSales,monthlySubsPlanSales:monthlySubsPlanSales
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};
