const userModel = require("../models/user");
const CouponModel = require("../models/coupon");
const cartModel = require("../models/cart")
const orderModel = require("../models/order")
const courseModel = require("../models/courseMain")
const academicModel = require("../models/academic");
const mongoose = require("mongoose");
const educator = require("../models/educator");
const courseCategory = require("../models/courseCategory");
const InstitutionModel = require("../models/institution")

exports.AddCourseToCart = (req, res) => {
    try {
        let userid = req.userid;
        let { courseId } = req.body;

        userModel.findById(userid, (err, user) => {
            if (user) {
                courseModel.findById(courseId, (err, course) => {
                    if (course) {
                        orderModel.findOne({ "userId": userid, "items.courseId": course._id, status: "success", "createdAt": { $lte: Date.now() } }, (dupOError, exOrder) => {
                            //console.log(exOrder)
                            if (!exOrder) {
                                cartModel.findOne({ userId: userid }, (err, cart) => {

                                    if (cart && cart.items.length !== 0) {
                                        let updateprice = cart.totalPrice + course.discountedPrice;
                                        let cartItems = cart.items;
                                        let pIdStore = [];
                                        pIdStore.push(cartItems.map((x) => String(x.courseId)));
                                        let set = [...new Set(pIdStore.flat())];
                                        let updateCart = {};

                                        for (let i = 0; i < cartItems.length; i++) {
                                            if (cartItems[i].courseId.toString() === courseId && set.includes(courseId)
                                            ) {

                                                updateCart = {
                                                    items: cartItems,
                                                    totalPrice: updateprice,
                                                    totalItems: cartItems.length,
                                                };
                                            } else if (cartItems[i].courseId.toString() !== courseId && !set.includes(courseId)) {
                                                let newItem = { courseId: courseId };
                                                cartItems.push(newItem);
                                                updateCart = {
                                                    items: cartItems,
                                                    totalPrice: updateprice,
                                                    totalItems: cartItems.length,
                                                };
                                                break;
                                            }
                                        }

                                        cartModel.findOneAndUpdate({ _id: cart._id }, updateCart, { new: true }, (err, qty) => {
                                            if (qty) {
                                                res.json({ status: true, message: "course added to cart successfully", data: qty });
                                            } else {
                                                res.json({ status: false, message: "unable to create cart" });
                                            }
                                        }
                                        );
                                    } else if (cart && cart.items.length === 0) {
                                        let updateprice = course.discountedPrice;
                                        cartModel.findOneAndUpdate({ _id: cart._id }, { $push: { items: { courseId: courseId } }, totalPrice: updateprice, totalItems: cart.items.length + 1 }, { new: true }, (err, qty) => {
                                            if (qty) {
                                                res.json({ status: true, message: "Course added to cart successfully.", data: qty });
                                            } else {
                                                res.json({ status: false, message: "unable to create cart" });
                                            }
                                        }
                                        );
                                    } else {
                                        let findPrice = course.discountedPrice;
                                        let CartData = {
                                            userId: userid,
                                            items: [{ courseId: courseId }],
                                            totalPrice: findPrice,
                                            totalItems: 1,
                                        };
                                        cartModel.create(CartData, (err, qty) => {
                                            if (qty) {
                                                res.json({ status: true, message: "Course added to cart successfully.", data: qty });
                                            } else {
                                                res.json({ status: false, message: "unable to create cart" });
                                            }
                                        });
                                    }
                                });
                            } else {
                                return res.json({ status: false, message: "You have already purchased this course.!!!" });
                            }
                        })


                    } else {
                        return res.json({ status: false, message: "This course does not exist anymore" });
                    }
                });
            } else {
                return res.json({ status: false, message: "User not found" });
            }
        });
    } catch (e) {
        res.json({ status: false, message: "Oops! Something went wrong. Please try again later" });
    }
};


exports.removeCourseInCart = (req, res) => {
    try {
        let userid = req.userid;
        let { courseId } = req.body;

        userModel.findById({ "_id": userid }, (err, user) => {
            if (user) {
                courseModel.findById({ "_id": courseId }, (err, course) => {
                    if (course) {
                        cartModel.findOne({ "userId": userid }, (err, cart) => {
                            if (cart && cart.items.length !== 0) {

                                let cartItems = cart.items;

                                let updatedItems = cartItems.filter((item) => {
                                    return item.courseId.toString() !== courseId;
                                });


                                cartModel.findOneAndUpdate({ "_id": cart._id }, { "items": updatedItems }, { new: true }, (err, qty) => {
                                    if (qty) {
                                        res.json({ status: true, message: "Cart item removed successfully", data: qty });
                                    } else {
                                        res.json({ status: false, message: "Unable to remove cart item" });
                                    }
                                }
                                );
                            } else {
                                return res.json({ status: false, message: "Your cart is empty" });
                            }
                        });
                    } else {
                        return res.json({ status: false, message: "This course does not exist anymore" });
                    }
                });
            } else {
                return res.json({ status: true, message: "User not found" });
            }
        });
    } catch (e) {
        res.json({ status: false, message: "Oops! Something went wrong. Please try again later" });
    }
};


exports.listOfCoursesInCart = async (req, res) => {
    try {
        let userid = req.userid;
        let cartInfo = await cartModel.findOne({ "userId": userid });

        if (!cartInfo) {

            let CartData = {
                userId: userid,
                items: []
            }
            return res.json({ "status": true, "message": "Your cart is empty", "data": [CartData] });
        }
        userModel.findById({ "_id": userid }, (err, user) => {
            if (user) {
                cartModel.aggregate([
                    {
                        "$match": { userId: mongoose.Types.ObjectId(userid) }
                    },
                    {
                        $lookup: {
                            from: 'KrSity_ESRUOCNIAM',
                            localField: 'items.courseId',
                            foreignField: '_id',
                            as: 'courseDetail'
                        }
                    },
                    {
                        $addFields: {
                            'items': {
                                $map: {
                                    input: '$items',
                                    as: 'item',
                                    in: {
                                        $mergeObjects: [
                                            '$$item',
                                            {
                                                courseDetail: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$courseDetail',
                                                                as: 'pd',
                                                                cond: { $eq: ['$$item.courseId', '$$pd._id'] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            "userId": 1,
                            "items": {
                                $map: {
                                    input: "$items",
                                    as: "item",
                                    in: {
                                        $mergeObjects: [
                                            {
                                                $arrayToObject: {
                                                    $filter: {
                                                        input: { $objectToArray: "$$item" },
                                                        cond: { $ne: ["$$this.k", "courseId"] }
                                                    }
                                                }
                                            },
                                            {
                                                courseDetail: "$$item.courseDetail"
                                            }
                                        ]
                                    }
                                }
                            },

                        }
                    }

                ], async (err, getlist) => {

                    if (err) {
                        getlist[0].items = []
                        getlist[0].save()
                    } else if (getlist && getlist.length > 0) {

                        const courseDataPromises = getlist[0].items.map(async x => {

                            const eduInfo = await educator.findOne({ "_id": x.courseDetail.educators }).select({ "_id": 1, "name": 1 });
                            const catInfo = await courseCategory.findOne({ "_id": x.courseDetail.category }).select({ "_id": 1, "name": 1 });
                            x.courseDetail.educators = eduInfo ? eduInfo.name : "Kareer Sity";
                            x.courseDetail.category = catInfo ? catInfo.name : "Kareer Sity";
                            return x;
                        });

                        const courseData = await Promise.all(courseDataPromises);
                        getlist[0].items = courseData
                        return res.send({ status: true, "data": getlist });
                    } else if (getlist && getlist.length == 0) {
                        return res.json({ "status": true, "message": "Your cart is empty" });
                    }

                    return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });

                }).exec();
            } else {
                return res.json({ "status": true, "message": "user not found" });
            }
        });
    } catch (e) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" });
    }
};



exports.billingSummary = async (req, res) => {

    try {

        let userid = req.userid
        let { couponCode } = req.body
        let ttlDPrice = 0, ttlPrice = 0
        let cart = await cartModel.findOne({ "userId": userid })
        if (!cart) {

            return res.json({ "status": false, "message": "Please add items in cart" })
        }
        let cartItems = cart.items

        if (cartItems.length != 0) {
            for (let i = 0; i < cartItems.length; i++) {

                let courseInfo = await courseModel.findOne({ "_id": cartItems[i].courseId }).select({
                    "_id": 1, "title": 1, "freeForEveryone": 1,
                    "freeForEnInLast30Days": 1,
                    "expiry": 1,
                    "freeForbasedOnColleges": 1,
                    "freeColleges": 1,
                    "price": 1,
                    "regularPrice": 1,
                    "discountedPrice": 1,
                    "discountedPriceExpiry": 1
                })

                //  console.log(courseInfo.freeForbasedOnColleges ,"courseInfo")

                ttlPrice += courseInfo.price

                if (courseInfo && courseInfo.freeForbasedOnColleges) {

                    //console.log("discountedPrice",courseInfo.discountedPrice)

                    let checkUserCollege = await academicModel.findOne({ "userId": userid })
                    //console.log("checkUserCollege", checkUserCollege)
                    if (checkUserCollege && courseInfo.freeColleges && courseInfo.freeColleges.length !== 0) {
                        let checkFreeForbasedOnColleges = await InstitutionModel.findOne({ "name": checkUserCollege.collegeName })
                        //console.log("checkFreeForbasedOnColleges",courseInfo.freeColleges, checkFreeForbasedOnColleges._id)

                        if (checkFreeForbasedOnColleges && courseInfo.freeColleges && (courseInfo.freeColleges).includes(String(checkFreeForbasedOnColleges._id))) {
                            ttlDPrice += 0
                        } else {
                            ttlDPrice += courseInfo.regularPrice
                        }

                    } else {
                        ttlDPrice += courseInfo.regularPrice
                    }

                } else if (courseInfo && courseInfo.freeForEnInLast30Days) {
                    let checkUserRegDate = await userModel.findOne({ "_id": userid }).select("createdAt")
                    //console.log("checkUserRegDate",checkUserRegDate,new Date(checkUserRegDate.createdAt) < new Date(Date.now()),new Date(checkUserRegDate.createdAt) , new Date(Date.now()))
                    if (checkUserRegDate && new Date(checkUserRegDate.createdAt) < new Date(Date.now())) {

                        ttlDPrice += 0

                    } else {
                        ttlDPrice += courseInfo.regularPrice
                    }
                } else if (courseInfo && courseInfo.freeForEveryone) {

                    //  console.log("freeForEveryone")

                    ttlDPrice += 0


                } else if (new Date(courseInfo.discountedPriceExpiry * 1000) > new Date(Date.now())) {

                    //  console.log("discountedPrice",courseInfo.discountedPrice)
                    ttlDPrice += courseInfo.discountedPrice

                } else {
                    //   console.log("regularPrice",courseInfo.regularPrice)
                    ttlDPrice += courseInfo.regularPrice
                }
            }
            let couponDiscount = 0;
            if (couponCode) {
                //let couponInfo = await CouponModel.findOne({ "couponName": couponCode })

            const currentDate = new Date();
            let isValidCoupon = await CouponModel.findOne({ "couponName": couponCode, validFrom: { $lte: currentDate }, validTill: { $gte: currentDate } })
            // console.log(isValidCoupon.validFrom, currentDate, isValidCoupon.validTill, isValidCoupon.validFrom < currentDate, isValidCoupon.validTill > currentDate)


                if (isValidCoupon) {
                    const isValidCoupon4Course = cartItems.filter(item =>
                        isValidCoupon.selectedCourses.includes(String(item.courseId))
                    );

                   // console.log("isValidCoupon4Course", isValidCoupon4Course, cartItems)
                    if (isValidCoupon && isValidCoupon.couponType == "course" && isValidCoupon.isActive == true && isValidCoupon4Course.length != 0) {

                        if (isValidCoupon && isValidCoupon.discountType == 'price') {
                            //console.log(ttlDPrice, ttlPrice, "course price")
                            if (ttlDPrice >= isValidCoupon.couponValue) {
                                couponDiscount = isValidCoupon.couponValue;
                            }
                        } else if (isValidCoupon && isValidCoupon.discountType == 'percentage') {

                            // console.log(ttlDPrice, 100 - isValidCoupon.couponValue, "course percentage")

                            let disPercentage = ttlDPrice * (isValidCoupon.couponValue) / 100;

                            if (disPercentage <= ttlDPrice) {
                                couponDiscount = disPercentage;
                            }
                        }

                    } else {

                        let upGST = (ttlDPrice > 0 ? ((ttlDPrice) * .18) : 0).toFixed(2);
                        let obj = {
                            totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                            subTotal: `₹ ${ttlDPrice.toFixed(2)}`,
                            // totalSavings: `₹ ${ttlPrice - ttlDPrice}`,
                            couponDiscount: `₹ ${(0).toFixed(2)}`,
                            total: `₹ ${(Number(ttlDPrice)).toFixed(2)}`,
                            gst: `₹ ${upGST}`,
                            grandTotal: `₹ ${(Number(ttlDPrice) + Number(upGST)).toFixed(2)}`
                        }
                        return res.json({ "status": false, "message": "Invalid coupon code !!!", "data": obj })
                    }
                } else {

                    let upGST = (ttlDPrice > 0 ? ((ttlDPrice) * .18) : 0).toFixed(2);
                    let obj = {
                        totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                        subTotal: `₹ ${ttlDPrice.toFixed(2)}`,
                        // totalSavings: `₹ ${ttlPrice - ttlDPrice}`,
                        couponDiscount: `₹ ${(0).toFixed(2)}`,
                        total: `₹ ${(Number(ttlDPrice)).toFixed(2)}`,
                        gst: `₹ ${upGST}`,
                        grandTotal: `₹ ${(Number(ttlDPrice) + Number(upGST)).toFixed(2)}`
                    }
                    return res.json({ "status": false, "message": "Invalid coupon code !!!", "data": obj })
                }
            }



            let saving = ((ttlPrice - ttlDPrice) * 100 / ttlPrice).toFixed(2)
            let upCouponDiscount = (ttlDPrice >= couponDiscount ? couponDiscount : 0).toFixed(2);
            let upGST = (ttlDPrice > 0 ? ((ttlDPrice - upCouponDiscount) * .18) : 0).toFixed(2);
            // console.log(couponDiscount,upCouponDiscount,ttlDPrice, couponDiscount)
            let obj = {
                totalPrice: `₹ ${ttlPrice.toFixed(2)}`,
                subTotal: `₹ ${ttlDPrice.toFixed(2)}`,
                // totalSavings: `₹ ${ttlPrice - ttlDPrice}`,
                couponDiscount: `₹ ${upCouponDiscount}`,
                total: `₹ ${(Number(ttlDPrice) - Number(upCouponDiscount)).toFixed(2)}`,
                gst: `₹ ${upGST}`,
                grandTotal: `₹ ${(Number(ttlDPrice) - Number(upCouponDiscount) + Number(upGST)).toFixed(2)}`
            }

            return res.json({ "status": true, "message": "Billing Summary", "data": obj })

        } else {
            return res.json({ "status": false, "message": "Please add items in cart" })
        }

    }
    catch (e) {
        console.log(e, "e")
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
