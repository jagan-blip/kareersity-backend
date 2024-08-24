
const CourseModel = require("../models/courseMain")
const CouponModel = require("../models/coupon")
const SubscriptionPlanModel = require("../models/subscriptionPlanBanner")
exports.addCoupon = (req, res) => {
    try {
        let data = req.body;

        CouponModel.create(data, (err, newCoupon) => {
            if (newCoupon) {
                res.json({ "status": true, "message": "New Coupon added successfully", "data": newCoupon });
            } else {
                res.json({ "status": false, "message": "Please try again.",err:err });
            }
        });

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editCoupon = async (req, res) => {
    try {

        let data = req.body;

        let findCoupon = await CouponModel.findById(data.couponId)

        if (!findCoupon) {
            res.json({ "status": false, "message": "Coupon does not exist." });
            return;
        }

        let updatedCoupon = await CouponModel.findByIdAndUpdate(findCoupon._id, data, { new: true })
        if (updatedCoupon) {
            if (updatedCoupon) {
                res.json({ "status": true, "message": "Coupon updated successfully" });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.fetchCoupon = (req, res) => {
    try {
        let data = req.body;

        CouponModel.findById({ "_id": data.couponId }, (err, exCoupon) => {
            if (exCoupon && (exCoupon.selectedCourses).length != 0) {
                CourseModel.find({ _id: { $in: exCoupon.selectedCourses } }).select({
                    "_id": 1, "title": 1, "price": 1,
                    "regularPrice": 1,
                    "discountedPrice": 1,
                    "discountedPriceExpiry": 1
                }).then(result => {
                    exCoupon._doc.selectedCourses = result
                    res.json({ "status": true, "data": exCoupon });
                }).catch(err => {
                    res.json({ "status": false, "err": err });
                })


            } else {
                res.json({ "status": false, "message": "Coupon does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

// exports.CouponList = (req, res) => {

//     CouponModel.find().sort({ "createdAt": -1 }).then((exCoupon) => {

//         if (exCoupon.length > 0) {

//             res.json({ "status": true, "data": exCoupon });
//         } else {
//             res.json({ "status": false, "message": "Coupon list is empty" });
//         }
//     }).catch((error) => {
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//     })

// };


exports.CouponList = async (req, res) => {
    try {
        const exCoupon = await CouponModel.find().sort({ "createdAt": -1 });

        if (exCoupon.length > 0) {
            // Use lean() to convert Mongoose documents to plain JavaScript objects
            const couponListWithTitles = await Promise.all(exCoupon.map(async (coupon) => {
                const selectedCourses = await Promise.all(
                    coupon.selectedCourses.map(async (courseId) => {
                        const course = await CourseModel.findById(courseId).select({ _id: 1, title: 1 }).lean();
                        return course ? {
                            courseId: String(course._id),
                            title: String(course.title)
                        } : null;
                    })
                );

                const selectedSubscriptions = await Promise.all(
                    coupon.selectedSubscriptions.map(async (planId) => {
                        const subscriptionPlan = await SubscriptionPlanModel.findById(planId).select({ _id: 1, planName: 1 }).lean();
                        return subscriptionPlan ? {
                            planId: String(subscriptionPlan._id),
                            planName: String(subscriptionPlan.planName)
                        } : null;
                    })
                );

                coupon.selectedSubscriptions = selectedSubscriptions.filter(plan => plan !== null);
                
                coupon.selectedCourses = selectedCourses.filter(course => course !== null);

                return {
                    ...coupon.toObject(),
                    selectedSubscriptions,
                    selectedCourses
                };
            }));

            res.json({ "status": true, "data": couponListWithTitles });
        } else {
            res.json({ "status": false, "message": "Coupon list is empty" });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.CouponActiveList = (req, res) => {

    CouponModel.find({ "isActive": true }).select({ "_id": 1, "name": 1, "qualification": 1, "feedback": 1, "thumbnail": 1, "videoUrl": 1 }).sort({ "createdAt": -1 }).then((exCoupon) => {

        if (exCoupon.length > 0) {

            res.json({ "status": true, "data": exCoupon });
        } else {
            res.json({ "status": false, "message": "Coupon list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteCoupon = (req, res) => {

    try {

        let CouponId = req.body.couponId

        CouponModel.findByIdAndDelete({ "_id": CouponId }, { new: true }, (err, exCoupon) => {
            if (exCoupon) {

                res.json({ "status": true, "message": "Coupon has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `Coupon does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
