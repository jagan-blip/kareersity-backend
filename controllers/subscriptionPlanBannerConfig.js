const { SendMessage } = require("../common/nommoc");
const SubscriptionPlanBannerModel = require("../models/subscriptionPlanBanner")
const User = require("../models/user")
const CouponModel = require("../models/coupon")
const CourseModel = require("../models/courseMain")
const SessionModel = require("../models/courseSession")
const LessonModel = require("../models/courseSessionLesson")
const UserMyCoursesModel = require("../models/userMyCourses")
const UserSubscriptionPlan = require("../models/userSubscriptionPlan")
const courseBundleModel = require("../models/courseBundle")
//const { ccAvenuePG, orderURLs, subsPlansURLs } = require("../nodedetails/local");
const config = require("../nodedetails/config");
const CCAvenue = require('node-ccavenue');
const ccav = new CCAvenue.Configure({
    merchant_id: config.ccAvenuePG.merchantId,
    access_code: config.ccAvenuePG.accessCode,
    working_key: config.ccAvenuePG.workingKey
});

function convertHHMMSSToSeconds(hhmmss) {
    const timearr = hhmmss.split(':').map(Number);

    if (timearr.length == 3) {
        return timearr[0] * 3600 + timearr[1] * 60 + timearr[2];
    } else if (timearr.length == 2) {
        return timearr[0] * 60 + timearr[1];
    }
}

exports.addSubscriptionPlanBanner = (req, res) => {
    try {
        let data = req.body;

        if (data && data.features.length == 0) {
            return res.json({ "status": false, "message": "Please add atleast one features" });
        }
        if (data && data.courseBundles.length == 0) {
            return res.json({ "status": false, "message": "Please add atleast one course bundle" });
        }


        SubscriptionPlanBannerModel.findOne({ "planName": data.planName }, (err, exSubscriptionPlanBanner) => {
            if (!exSubscriptionPlanBanner) {
                SubscriptionPlanBannerModel.create(data, (err, newSubscriptionPlanBanner) => {
                    if (newSubscriptionPlanBanner) {
                        return res.json({ "status": true, "message": "New Subscription Plan added successfully", "data": newSubscriptionPlanBanner });
                    } else {
                        console.log(err)
                        return res.json({ "status": false, "message": "Please try again." });
                    }
                });
            } else {
                let errorMessage = `Plan name '${data.planName}' already exists. `;

                return res.json({ "status": false, "message": errorMessage });
            }
        });
    } catch (error) {
        return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editSubscriptionPlanBanner = async (req, res) => {
    try {

        let data = req.body;

        let findSubscriptionPlanBanner = await SubscriptionPlanBannerModel.findById(data.subscriptionPlanId)

        if (!findSubscriptionPlanBanner) {
            res.json({ "status": false, "message": "SubscriptionPlanBanner does not exist." });
            return;
        }


        let updatedSubscriptionPlanBanner = await SubscriptionPlanBannerModel.findByIdAndUpdate(findSubscriptionPlanBanner._id, data, { new: true })
        if (updatedSubscriptionPlanBanner) {
            if (updatedSubscriptionPlanBanner) {
                res.json({ "status": true, "message": "SubscriptionPlan Banner updated successfully", "data": updatedSubscriptionPlanBanner });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.fetchSubscriptionPlanBanner = async (req, res) => {
    try {
        let data = req.body;

        let exSubscriptionPlanInfo = await SubscriptionPlanBannerModel.findById({ "_id": data.subscriptionPlanId })

        if (!exSubscriptionPlanInfo) {
            return res.json({ "status": false, "message": "Subscription Plan does not exist." });
        }
        let exCourseBundle = await courseBundleModel.find({ _id: { $in: exSubscriptionPlanInfo.courseBundles } })
        const selectedCoursesArray = exCourseBundle.flatMap(bundle => bundle.selectedCourses);
        const uniqueSelectedCourses = [...new Set(selectedCoursesArray)];


        const selectedCourses = await CourseModel.find({ _id: { $in: uniqueSelectedCourses } }).select({
            "_id": 1,
            "thumbnail": 1, "title": 1, "price": 1,
            "regularPrice": 1, "discountedPrice": 1, "courseIncludes": 1,
            "duration": 1, "level": 1
        });

        exSubscriptionPlanInfo._doc.courseBundles = selectedCourses
        return res.json({ "status": true, "data": exSubscriptionPlanInfo });

    } catch (error) {
        console.log(error);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.SubscriptionPlanBannerList = (req, res) => {


    SubscriptionPlanBannerModel.find().sort({ "createdAt": -1 }).then((exSubscriptionPlanBanner) => {
        if (exSubscriptionPlanBanner.length > 0) {

            res.json({ "status": true, "data": exSubscriptionPlanBanner });
        } else {
            res.json({ "status": false, "message": "SubscriptionPlanBanner list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};
exports.activeSubscriptionPlanBannerList = (req, res) => {

    SubscriptionPlanBannerModel.find({ "isActive": true }).sort({ "createdAt": -1 }).then((exSubscriptionPlanBanner) => {
        if (exSubscriptionPlanBanner) {

            res.json({ "status": true, "data": exSubscriptionPlanBanner });
        } else {
            res.json({ "status": false, "message": "Subscription Plan list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteSubscriptionPlanBanner = (req, res) => {

    try {

        let SubscriptionPlanBannerId = req.body.subscriptionPlanId

        SubscriptionPlanBannerModel.findByIdAndDelete({ "_id": SubscriptionPlanBannerId }, { new: true }, (err, exSubscriptionPlanBanner) => {
            if (exSubscriptionPlanBanner) {

                res.json({ "status": true, "message": "Subscription Plan has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `Subscription Plan does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}


//========================================= User Subscription Plan =====================================

exports.buySubscriptionPlan = async (req, res) => {
    try {
        let userId = req.userid;
        let data = req.body;
        let planPrice = 0, renewalDate, validTillDate;
        let exUser = await User.findById(userId).lean();

        if (!exUser) {
            return res.json({ "status": false, "message": "User does not exist !!!" });
        }

        let exUserSubscriptionPlan = await UserSubscriptionPlan.findOne({ "userId": userId, "isActive": true }).lean();

        if (exUserSubscriptionPlan && data.upgrade !== 1) {
            return res.json({ "status": false, "message": "You have already an active Subscription Plan.Proceed to continue..." });
        } else if (exUserSubscriptionPlan && data.upgrade == 1 || !exUserSubscriptionPlan) {

            let exSubscriptionPlanBanner = await SubscriptionPlanBannerModel.findById({ "_id": data.planId }).exec();
            let currentDate = new Date();

            if (!exSubscriptionPlanBanner) {
                return res.json({ "status": false, "message": "Please select a valid Subscription Plan!!!" });
            } else if (exSubscriptionPlanBanner && exSubscriptionPlanBanner.oneMonthPrice == data.selectedPPrice) {
                planPrice = exSubscriptionPlanBanner.oneMonthPrice;
                validTillDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
            } else if (exSubscriptionPlanBanner && exSubscriptionPlanBanner.threeMonthPrice == data.selectedPPrice) {
                planPrice = exSubscriptionPlanBanner.threeMonthPrice;
                validTillDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
            } else if (exSubscriptionPlanBanner && exSubscriptionPlanBanner.sixMonthPrice == data.selectedPPrice) {
                planPrice = exSubscriptionPlanBanner.sixMonthPrice;
                validTillDate = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
            } else if (exSubscriptionPlanBanner && exSubscriptionPlanBanner.twelveMonthPrice == data.selectedPPrice) {
                planPrice = exSubscriptionPlanBanner.twelveMonthPrice;
                validTillDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
            } else {
                return res.json({ "status": false, "message": "Please select a valid Subscription Plan price!!!" });
            }

            // Set renewalDate conditionally based on the selected plan
            if (planPrice > 0) {
                renewalDate = new Date(validTillDate);
                renewalDate.setMinutes(renewalDate.getMinutes() + 1);
            }
            //console.log(data.couponCode)
            let couponDiscount = 0;
            if (data && data.couponCode) {
                let couponInfo = await CouponModel.findOne({ "couponName": data.couponCode })
                //console.log(couponInfo)
                if (couponInfo) {

                    let isValidCoupon = await CouponModel.findOne({ "couponName": data.couponCode, validFrom: { $lte: couponInfo.validFrom }, validTill: { $gte: couponInfo.validTill } })
                    //console.log(isValidCoupon)

                    if (isValidCoupon && couponInfo.isActive == true) {
                        //console.log("subsItems", isValidCoupon.selectedSubscriptions)
                        let selectedSubscriptions = isValidCoupon.selectedSubscriptions.includes(String(data.planId))
                       
                        //console.log("subsItems", selectedSubscriptions)
                        if (couponInfo && couponInfo.couponType == "subscription" && couponInfo.discountType == 'price' && selectedSubscriptions ) {
                            //console.log(ttlPrice - couponInfo.couponValue, "fdhfh")
                            if (planPrice > couponInfo.couponValue) {
                                couponDiscount = couponInfo.couponValue;
                            }
                        } else if (couponInfo && couponInfo.couponType == "subscription" && couponInfo.discountType == 'percentage'&& selectedSubscriptions) {
                            //console.log(planPrice - couponInfo.couponValue, "percentage")
                            let disPercentage = (planPrice * (couponInfo.couponValue) / 100);
                            if (disPercentage < planPrice) {
                                couponDiscount = disPercentage;
                            }
                        } else {

                            return res.json({ "status": false, "message": "Invalid coupon code !!!" })
                        }
                    } else {

                        return res.json({ "status": false, "message": "Invalid coupon code !!!" })
                    }
                } else {

                    return res.json({ "status": false, "message": "Invalid coupon code !!!" })
                }
            }

            let newObj = {
                "userId": exUser._id,
                "planId": exSubscriptionPlanBanner._id,
                "planName": exSubscriptionPlanBanner.planName,
                "price": (planPrice > couponDiscount) ? (planPrice - couponDiscount) : planPrice,
                "couponCode": data.couponCode,
                "couponDiscount": couponDiscount,
                "renewalDate": renewalDate,
                "validTill": validTillDate,
                "paymentInfo": {}
            };
            if (exUserSubscriptionPlan && exUserSubscriptionPlan.planId) {
                await UserMyCoursesModel.deleteMany({ "userId": userId }, { "planId": exUserSubscriptionPlan.planId }).exec();
            }
            let mySubscriptionPlan = await UserSubscriptionPlan.create(newObj);
            if (mySubscriptionPlan) {
                // add bundle courses to user puchased courses i.e. user's my courses
                let addBundle = await courseBundleModel.find({ _id: { $in: exSubscriptionPlanBanner.courseBundles } })
                //console.log(addBundle)
                const selectedCoursesArray = addBundle.flatMap(bundle => bundle.selectedCourses);
                // Remove duplicates by converting the array to a Set and then back to an array
                const uniqueSelectedCourses = [...new Set(selectedCoursesArray)];

                //console.log(uniqueSelectedCourses);


                for (let i = 0; i < uniqueSelectedCourses.length; i++) {

                    const courseInfo = await CourseModel.findById(uniqueSelectedCourses[i]).select({ "_id": 1, "thumbnail": 1, "duration": 1, "title": 1, "level": 1 });

                    if (!courseInfo) {
                        return res.json({ status: false, message: 'Course does not exist' });
                    }


                    const sessions = await SessionModel.find({ "courseId": uniqueSelectedCourses[i] }).select({ "_id": 1 });

                    const sessionPromises = sessions.map(async (session) => {
                        const lessons = await LessonModel.find({ "sessionId": session._id });

                        let totalSessionDuration = 0;

                        for (const lesson of lessons) {
                            totalSessionDuration += convertHHMMSSToSeconds(lesson.duration);
                        }

                        return {
                            "sessionId": session._id,
                            "lessons": lessons.map(lesson => ({
                                "lessonId": lesson._id,
                                "lessonWatchedDuration": 0,
                                "lessonTotalDuration": convertHHMMSSToSeconds(lesson.duration),
                            })),
                            "sessionWatchedDuration": 0,
                            "sessionTotalDuration": totalSessionDuration,
                        };
                    });

                    const watchedHistory = await Promise.all(sessionPromises);

                    const validTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                    const myCourseObj = {
                        "userId": userId,
                        "courseId": uniqueSelectedCourses[i],
                        "planId": data.planId,
                        "courseName": courseInfo.title,
                        "thumbnail": courseInfo.thumbnail,
                        "courseLevel": courseInfo.level,
                        "watchedHistory": watchedHistory,
                        "courseDuration": convertHHMMSSToSeconds(courseInfo.duration),
                        "validTill": validTillDate,
                    };


                    const myCourseInfo = await UserMyCoursesModel.create(myCourseObj)

                    if (!myCourseInfo) {
                        return res.json({ status: false, message: 'Unable to add the course in my courses' });
                    }
                }



                // let message = `Dear ${exUser.fullName}, you have successfully purchased course(s) with ${exSubscriptionPlanBanner.planName} plan - Kareer Sity`
                //SendMessage(exUser.phoneNumber, message);
                let gtPricewithGST = mySubscriptionPlan.price * 1.18
                let pgOrderData = {
                    order_id: mySubscriptionPlan._id,
                    amount: gtPricewithGST,
                    currency: 'INR',
                    redirect_url: `${config.subsPlansURLs.payment_success}`,
                    cancel_url: `${config.subsPlansURLs.payment_success}`,
                    language: 'EN',



                }
                let paymentDetail = ccav.getEncryptedOrder(pgOrderData)



                return res.json({ "status": true, "message": "Make payment", "data": `${config.orderURLs.payment_gateway}&encRequest=${paymentDetail}&access_code=${config.ccAvenuePG.accessCode}` })

            }

            return res.json({ "status": false, "message": "Unable to subscribe to the Subscription Plan. Please try again." });
        }

    } catch (error) {
        console.error(error);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.paymentSuccesssResponse = async (req, res) => {

    try {
        const { encResp } = req.body;

        //console.log("encResp" ,encResp)
        const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);
        // To check order_status: - 
        //console.log("decryptedJsonResponse",decryptedJsonResponse)

        // // !orderId || !trackingId || !statusCode
        // let order_status = (decryptedJsonResponse.order_status).toLowerCase()
        // let updateDetail = await order.findByIdAndUpdate(decryptedJsonResponse.order_id, { status: order_status, "paymentInfo": decryptedJsonResponse }, { new: true })
        //res.json({ "status": true, "message": "success", "data": decryptedJsonResponse })

        //"billing_name": "Pankaj Singh", "billing_address": "127 P", "billing_city": "ch", "billing_state": "tn", "billing_zip": "600040", "billing_country": "India", "billing_tel": "9997867860", "billing_email": "pankaj@cortexmarketing.in",  "vault": "N", "offer_type": "null", "offer_code": "null", 

        if (decryptedJsonResponse.order_status == "Success") {


            let updateDetail = await UserSubscriptionPlan.findByIdAndUpdate(decryptedJsonResponse.order_id, {
                "isActive": true, "paymentInfo": decryptedJsonResponse
            }, { new: true })
            //console.log("updateDetail" ,updateDetail)

            // await Notification.create({ userId: updateDetail.userId, message: `Your order has been successfully placed with Order Id: #${String(decryptedJsonResponse.order_id).slice(0, 7)} .` })
            // let adminList = await AdminModel.findOne({ type: 'super_admin' })
            // await AdminNotification.create({ userId: updateDetail.userId, adminId: adminList._id, redirectId: decryptedJsonResponse.order_id, message: `${decryptedJsonResponse.billing_name} has  placed new order.` })
            // let message = `Dear ${decryptedJsonResponse.billing_name}, you have successfully purchased course Order Id - #${String(decryptedJsonResponse.order_id).slice(0, 7)} - Kareer Sity`
            // SendMessage(decryptedJsonResponse.billing_tel, message);
            return res.redirect(`${config.subsPlansURLs.payment_success_page}`);
        } else {
            await UserSubscriptionPlan.findByIdAndUpdate(decryptedJsonResponse.order_id, {
                "isActive": false, "paymentInfo": decryptedJsonResponse
            }, { new: true })
            return res.redirect(`${config.orderURLs.payment_failed_page}`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error processing payment response', "err": err });
    }
};


exports.checkSubscriptionPlanExpiry = async (req, res) => {
    try {
        let userId = req.userid;

        let exUser = await User.findById(userId).lean();

        if (!exUser) {
            return res.json({ "status": false, "message": "User does not exist !!!" });
        }

        let exUserSubscriptionPlan = await UserSubscriptionPlan.findOne({ "userId": userId }).sort({ "createdAt": -1 });
        if (!exUserSubscriptionPlan) {
            return res.json({ "status": false, "message": "You have not any active Subscription Plan.!!!" });
        }
        let currentDate = new Date();
        let validTillDate = new Date(exUserSubscriptionPlan.validTill);
        if (exUserSubscriptionPlan && validTillDate < currentDate) {
            return res.json({ "status": true, "message": "Your Subscription Plan has expired!!!", "data": exUserSubscriptionPlan });
        }

        return res.json({ "status": true, "data": exUserSubscriptionPlan });
    } catch (error) {
        console.error(error);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.cancelRenewal = async (req, res) => {
    try {
        let userId = req.userid;
        let data = req.body;
        let exUser = await User.findById(userId).lean();

        if (!exUser) {
            return res.json({ "status": false, "message": "User does not exist !!!" });
        }

        let exUserSubscriptionPlan = await UserSubscriptionPlan.findOne({ "userId": userId, "_id": data._id });

        if (!exUserSubscriptionPlan) {
            return res.json({ "status": false, "message": "You do not have an active Subscription Plan.!!!" });
        }

        if (exUserSubscriptionPlan.isActive === false) {
            return res.json({ "status": true, "message": "You have already cancelled this Subscription Plan.!!!" });
        } else if (exUserSubscriptionPlan.isActive === true) {
            exUserSubscriptionPlan.isActive = false;
            await exUserSubscriptionPlan.save();
            return res.json({ "status": true, "message": "The 'Subscription Plan' cancelled successfully. !!!" });
        }

        return res.json({ "status": false, "message": "Unexpected error occurred. Please try again later.!!!" });

    } catch (error) {
        console.error(error);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.billingSummary = async (req, res) => {

    try {

        let userId = req.userid
        let { planId, couponCode, selectedPPrice } = req.body
        let ttlDPrice = 0, ttlPrice = 0

        let exUser = await User.findById(userId).lean();

        if (!exUser) {
            return res.json({ "status": false, "message": "User does not exist !!!" });
        }

        let planInfo = await SubscriptionPlanBannerModel.findById({ "_id": planId }).exec();
        //console.log(planInfo)
        let currentDate = new Date();
        if (!planInfo) {
            return res.json({ "status": false, "message": "Invalid planId!!!" });
        }

        switch (selectedPPrice) {
            case planInfo.oneMonthPrice:
                ttlPrice = planInfo.oneMonthPrice;
                break;
            case planInfo.threeMonthPrice:
                ttlPrice = planInfo.threeMonthPrice;
                break;
            case planInfo.sixMonthPrice:
                ttlPrice = planInfo.sixMonthPrice;
                break;
            case planInfo.twelveMonthPrice:
                ttlPrice = planInfo.twelveMonthPrice;
                break;
            default:
                return res.json({ "status": false, "message": "Please select a valid Subscription Plan price!!!" });
        }



        let couponDiscount = 0;
        if (couponCode) {
            let couponInfo = await CouponModel.findOne({ "couponName": couponCode })
            //console.log(couponInfo, planInfo)
            if (couponInfo) {

                let isValidCoupon = await CouponModel.findOne({ "couponName": couponCode, validFrom: { $lte: couponInfo.validFrom }, validTill: { $gte: couponInfo.validTill } })
                //console.log(isValidCoupon)

                if (isValidCoupon && couponInfo.isActive == true) {
                   // console.log("subsItems", isValidCoupon.selectedSubscriptions,planInfo._id)
                    let selectedSubscriptions = isValidCoupon.selectedSubscriptions.includes(String(planInfo._id))
                    //console.log("subsItems", selectedSubscriptions)
                    if (couponInfo && couponInfo.couponType == "subscription" && couponInfo.discountType == 'price' && selectedSubscriptions) {
                        //console.log(ttlPrice - couponInfo.couponValue, "fdhfh")
                        if (ttlPrice > couponInfo.couponValue) {
                            couponDiscount = couponInfo.couponValue;
                        }
                    } else if (couponInfo && couponInfo.couponType == "subscription" && couponInfo.discountType == 'percentage' && selectedSubscriptions) {
                        //console.log(ttlPrice - couponInfo.couponValue, "percentage")
                        let disPercentage = (ttlPrice * (couponInfo.couponValue) / 100);
                        if (disPercentage < ttlPrice) {
                            couponDiscount = disPercentage;
                        }
                    }else {
                        let upGST = (ttlPrice > 0 ? ((ttlPrice) * .18) : 0).toFixed(2);
                        let obj = {
                            totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                            subTotal: `₹ ${ttlPrice.toFixed(2)}`,
                            // totalSavings: `₹ ${ttlPrice - ttlPrice}`,
                            couponDiscount: `₹ ${(0).toFixed(2)}`,
                            total: `₹ ${(Number(ttlPrice)).toFixed(2)}`,
                            gst: `₹ ${upGST}`,
                            grandTotal: `₹ ${(Number(ttlPrice) + Number(upGST)).toFixed(2)}`
                        }
                        return res.json({ "status": false, "message": "Invalid coupon code !!!", "data": obj })
                    }
                } else {

                    let upGST = (ttlPrice > 0 ? ((ttlPrice) * .18) : 0).toFixed(2);
                    let obj = {
                        totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                        subTotal: `₹ ${ttlPrice.toFixed(2)}`,
                        // totalSavings: `₹ ${ttlPrice - ttlPrice}`,
                        couponDiscount: `₹ ${(0).toFixed(2)}`,
                        total: `₹ ${(Number(ttlPrice)).toFixed(2)}`,
                        gst: `₹ ${upGST}`,
                        grandTotal: `₹ ${(Number(ttlPrice) + Number(upGST)).toFixed(2)}`
                    }
                    return res.json({ "status": false, "message": "Invalid coupon code !!!", "data": obj })
                }
            } else {
                let upGST = (ttlPrice > 0 ? ((ttlPrice) * .18) : 0).toFixed(2);
                let obj = {
                    totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                    subTotal: `₹ ${ttlPrice.toFixed(2)}`,
                    // totalSavings: `₹ ${ttlPrice - ttlPrice}`,
                    couponDiscount: `₹ ${(0).toFixed(2)}`,
                    total: `₹ ${(Number(ttlPrice)).toFixed(2)}`,
                    gst: `₹ ${upGST}`,
                    grandTotal: `₹ ${(Number(ttlPrice) + Number(upGST)).toFixed(2)}`
                }
                return res.json({ "status": false, "message": "Invalid coupon code !!!", "data": obj })
            }
        }
        let upCouponDiscount = ((ttlPrice - couponDiscount) >= couponDiscount ? couponDiscount : 0).toFixed(2);
        let upGST = (ttlPrice > 0 ? ((ttlPrice - upCouponDiscount) * .18) : 0).toFixed(2);
        //console.log(couponDiscount,upCouponDiscount)
        let obj = {
            totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
            subTotal: `₹ ${ttlPrice.toFixed(2)}`,
            // totalSavings: `₹ ${ttlPrice - ttlPrice}`,
            couponDiscount: `₹ ${upCouponDiscount}`,
            total: `₹ ${(Number(ttlPrice) - Number(upCouponDiscount)).toFixed(2)}`,
            gst: `₹ ${upGST}`,
            grandTotal: `₹ ${(Number(ttlPrice) - Number(upCouponDiscount) + Number(upGST)).toFixed(2)}`
        }

        return res.json({ "status": true, "message": "Billing Summary", "data": obj })



    } catch (e) {
        console.log(e, "e")
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}

exports.subscribed_plans_for_user = async (req, res) => {
    try {
        let userId = req.userid
        console.log(userId)
        let getlist = await UserSubscriptionPlan.find({ userId: userId ,paymentInfo :{$ne :null}})
            .populate({
                path: 'userId',
                model: 'User',
                select: 'fullName email'
            })
            .populate({
                path: 'planId',
                model: 'SubscriptionPlanBanner',
                populate: {
                    path: 'courseBundles',
                    model: 'CourseBundle',
                    select: 'title selectedCourses',
                    populate: {
                        path: 'selectedCourses',
                        model: 'MainCourse',
                        select: 'title'
                    }
                },
                select: 'planName planId.courseBundles'
            })
           
           .select("_id userId fullName email planId planName price amount isActive status paymentInfo.order_id paymentInfo.tracking_id paymentInfo.bank_ref_no paymentInfo.order_status paymentInfo.failure_message paymentInfo.payment_mode paymentInfo.card_name paymentInfo.status_code paymentInfo.status_message paymentInfo.currency paymentInfo.amount paymentInfo.billing_name paymentInfo.billing_address paymentInfo.billing_city paymentInfo.billing_state paymentInfo.billing_zip paymentInfo.billing_country paymentInfo.billing_tel paymentInfo.billing_email paymentInfo.delivery_name paymentInfo.delivery_address paymentInfo.delivery_city paymentInfo.delivery_state paymentInfo.delivery_zip paymentInfo.delivery_country paymentInfo.delivery_tel paymentInfo.mer_amount paymentInfo.trans_date").sort({ "updatedAt": -1 });

        if (getlist) {
            res.send({ status: true, message: `Total ${getlist.length} order(s) found`, data: getlist });
        } else {
            res.send({ status: false, data: [] });
        }
    } catch (e) {
        res.json({ status: false, message: "Oops! Something went wrong. Please try again later" });
    }
}

exports.list_of_SubscriptionPlans_for_admin = async (req, res) => {
    try {
        let { search, status } = req.body;
        const query = {};

        if (status) {
            query["paymentInfo.order_status"] = { $regex: new RegExp(status, 'i') };
        }

        if (search) {
            query.$or = [
                { 'paymentInfo.billing_name': { $regex: search, $options: 'i' } },
                { 'paymentInfo.billing_email': { $regex: search, $options: 'i' } }
            ];
        }

        let getlist = await UserSubscriptionPlan.find(query)
            .populate({
                path: 'userId',
                model: 'User',
                select: 'fullName email'
            })
            .select("_id userId fullName email planId planName price amount isActive status paymentInfo.amount paymentInfo.order_status billing_name paymentInfo.billing_name paymentInfo.billing_email paymentInfo.trans_date planInfo").sort({ "updatedAt": -1 });

        if (getlist) {
            res.send({ status: true, message: `Total ${getlist.length} order(s) found`, data: getlist });
        } else {
            res.send({ status: false, data: [] });
        }
    } catch (e) {
        res.json({ status: false, message: "Oops! Something went wrong. Please try again later" });
    }
}



exports.fetchSubscriptionPlanForAdmin = async (req, res) => {
    try {
        const orderId = req.body.orderId;

        const getlist = await UserSubscriptionPlan.findById(orderId)
        // .populate({
        //     path: 'items.courseId',
        //     model: CourseModel
        // })
        //.select('userId totalMrp totalDiscountedPrice totalItems status  paymentInfo createdAt updatedAt items');

        res.send({ status: true, data: getlist });
    } catch (e) {
        console.error(e);
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
    }
};