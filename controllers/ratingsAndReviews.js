const RatingsAndReviewsModel = require("../models/reviews")
const UserModel = require("../models/user")
const userAcademicModel = require("../models/academic")
const userProfessionalModel = require("../models/professional")
const CoursesModel = require("../models/courseMain")

// exports.list_of_ratings_and_reviews = async (req, res) => {
//     try {

//         let rrInfo = await RatingsAndReviewsModel.find();
//         if (!rrInfo || rrInfo.length == 0) {

//             res.json({ "status": true, "message": "List of ratings and reviews is empty !!!" });
//         }

//         let listOfRR = []

//         for (let i = 0; i < rrInfo.length; i++) {

//             let userInfo = await UserModel.findById(rrInfo[i].userId).select({"_id": 1, "userType":1, "fullName":1});
//             let userAcademicInfo = await userAcademicModel.findOne({"userId": userInfo._id})
//             let userProfessionalInfo = await userProfessionalModel.findOne({"userId": userInfo._id})
//             let courseInfo = await CoursesModel.findById(rrInfo[i].courseId).select({ "_id": 1, "title": 1, "price": 1,
//                 "regularPrice": 1, "discountedPrice": 1,"discountedPriceExpiry": 1});
//             console.log(userInfo,userAcademicInfo,userProfessionalInfo, courseInfo, "userInfouserInfouserInfouserInfo")
//             if (!userInfo) {

//                 res.json({ "status": false, "message": "User information not available!!!" });
//             }

//             listOfRR.push({
//                 rrInfo: rrInfo[i],
//                 userInfo,
//                 userAcademicInfo,
//                 userProfessionalInfo,
//                 courseInfo,

//             });

//         }

//         res.json({ "status": true, "message": "New RatingsAndReviews added successfully", "data": listOfRR });

//     } catch (error) {
//         res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
//     }
// };


exports.list_of_ratings_and_reviews = async (req, res) => {
    try {
        const rrInfo = await RatingsAndReviewsModel.find();
        if (!rrInfo || rrInfo.length === 0) {
            return res.json({ "status": true, "message": "List of ratings and reviews is empty !!!" });
        }

        const userIds = rrInfo.map((item) => item.userId);
        const courseIds = rrInfo.map((item) => item.courseId);

        // Batch database queries
        const [userInfo, userAcademicInfo, userProfessionalInfo, courseInfo] = await Promise.all([
            UserModel.find({ _id: { $in: userIds } }).select({ "_id": 1, "userType": 1, "profilePic": 1, "fullName": 1 }),
            userAcademicModel.find({ userId: { $in: userIds } }).select({ "userId": 1, "collegeName": 1, "degreeOfStream": 1 }),
            userProfessionalModel.find({ userId: { $in: userIds } }).select({ "userId": 1, "companyName": 1, "designation": 1 }),
            CoursesModel.find({ _id: { $in: courseIds } }).select({ "_id": 1, "title": 1, "price": 1, "regularPrice": 1, "discountedPrice": 1, "discountedPriceExpiry": 1 }),
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
            // const userIndex = userIds.indexOf(item.userId);
            // const user = userInfo[userIndex];

            return {
                rrInfo: item,
                userInfo: userInfo.find((info) => info._id.equals(userIds[index])),
                userAcademicInfo: userAcademicInfo.find((info) => info.userId.equals(userIds[index])),
                userProfessionalInfo: userProfessionalInfo.find((info) => info.userId.equals(userIds[index])),
                courseInfo: courseInfo.find((info) => info._id.equals(courseIds[index])),
            };
        });

        res.json({ "status": true, "message": "List of ratings and reviews", "data": listOfRR });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.approve_ratings_and_reviews = async (req, res) => {
    try {

        const { rrId } = req.body;

        const rrInfo = await RatingsAndReviewsModel.findByIdAndUpdate(rrId, { isApproved: true }, { new: true });

        if (!rrInfo) {
            return res.json({ "status": false, "message": "Data does not exists!!!" });
        }

        res.json({ "status": true, "message": "Approved successfully", "data": rrInfo });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.edit_ratings_and_reviews = async (req, res) => {
    try {

        const data = req.body;

        const rrInfo = await RatingsAndReviewsModel.findByIdAndUpdate(data.rrId);

        if (!rrInfo) {
            return res.json({ "status": false, "message": "Data does not exists!!!" });
        }

        const updatedRRInfo = await RatingsAndReviewsModel.findByIdAndUpdate(data.rrId, data, { new: true });

        if (!rrInfo) {
            return res.json({ "status": false, "message": "Unable to update!!!" });
        }

        return res.json({ "status": true, "message": "Ratings and reviews updated successfully", "data": updatedRRInfo });
    } catch (error) {
        return res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};




exports.fetch_ratings_and_reviews = async (req, res) => {
    try {
        const { rrId } = req.body;
        const rrInfo = await RatingsAndReviewsModel.findById(rrId);
        if (!rrInfo) {
            return res.json({ "status": true, "message": "Ratings and reviews does not exist!!!" });
        }
        // console.log(rrInfo, rrInfo.courseId, "rrInfo.courseId")
        const [userInfo, userAcademicInfo, userProfessionalInfo, courseInfo] = await Promise.all([
            UserModel.find({ _id: rrInfo.userId }).select({ "_id": 1, "userType": 1,"profilePic": 1, "fullName": 1 }),
            userAcademicModel.find({ userId: rrInfo.userId }).select({ "userId": 1, "collegeName": 1, "degreeOfStream": 1 }),
            userProfessionalModel.find({ userId: rrInfo.userId }).select({ "userId": 1, "companyName": 1, "designation": 1 }),
            CoursesModel.find({ _id: rrInfo.courseId }).select({ "_id": 1, "title": 1, "price": 1, "regularPrice": 1, "discountedPrice": 1, "discountedPriceExpiry": 1 }),
        ]);

        // console.log(userAcademicInfo, "userAcademicInfo")
        let data = {
            ...rrInfo.toObject(),
            "userType":userInfo[0]?.userType || "NA",
            "fullName": userInfo[0]?.fullName || "NA" ,
            "profilePic": userInfo[0]?.profilePic || "NA" ,
            "collegeName": userAcademicInfo[0]?.collegeName || "NA" ,
            "degreeOfStream": userAcademicInfo[0]?.degreeOfStream || "NA" ,
            "companyName": userProfessionalInfo[0]?.companyName || "NA" ,
            "designation": userProfessionalInfo[0]?.designation || "NA" ,
            "title": courseInfo[0]?.title || "NA" ,
            "price": courseInfo[0]?.price || "NA" ,
            "regularPrice": courseInfo[0]?.regularPrice || "NA" ,
            "discountedPrice": courseInfo[0]?.discountedPrice || "NA" ,
            "discountedPriceExpiry": courseInfo[0]?.discountedPriceExpiry || "NA"
        };

       // data._id = rrId;
        res.json({
            "status": true,
            "message": "Ratings and reviews information",
            "data": data
        });
    } catch (error) {
        console.error(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};



exports.delete_ratings_and_reviews = (req, res) => {

    try {

        let RatingsAndReviewsId = req.body.rrId

        RatingsAndReviewsModel.findByIdAndDelete({ "_id": RatingsAndReviewsId }, { new: true }, (err, exRatingsAndReviews) => {
            if (exRatingsAndReviews) {

                res.json({ "status": true, "message": "RatingsAndReviews has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `RatingsAndReviews does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
