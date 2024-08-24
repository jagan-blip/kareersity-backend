const mongoose = require('mongoose');
const config = require("../nodedetails/config");
 // main banner 30000+ phrmaceutical companies....
const RatingAndReviewsSchema = new mongoose.Schema({
   
    "courseId": {
        type: String,
        default: ""
    },
    "userId": {       //display list of type
        type: String,
        default: ""
    },
    "userProfile": {       
        type: String,
        default: ""
    },
    "rating": {
        type: Number,
        default: 0
    },
    "reviews": {
        type: String,
        default: ""
    },
    "isApproved" :{
        type :Boolean,
        default :false
    }
   

}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('RatingAndReviews', RatingAndReviewsSchema, config.dbPrefix + 'SWEIVERDNAGNITAR')