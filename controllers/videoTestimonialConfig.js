
const { fileUpload } = require("../common/aws");
const VideoTestimonialModel = require("../models/videoTestimonial")

exports.addVideoTestimonial = (req, res) => {
    try {
        let data = req.body;

        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        if (!thumbnailFile) {
            res.json({ "status": false, message: "Please provide a valid thumbnail file" });
            return;
        }

        fileUpload(thumbnailFile, (uploadData) => {
            if (uploadData.status) {
                data.thumbnail = uploadData.url;
                VideoTestimonialModel.create(data, (err, newTestimonial) => {
                    if (newTestimonial) {
                        res.json({ "status": true, "message": "New Testimonial added successfully", "data": newTestimonial });
                    } else {
                        res.json({ "status": false, "message": "Please try again." });
                    }
                });


            } else {
                res.json({ "status": false, "message": "Please try again." });
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editVideoTestimonial = async (req, res) => {
    try {

        let data = req.body;

        let findTestimonial = await VideoTestimonialModel.findById(data._id)

        if (!findTestimonial) {
            res.json({ "status": false, "message": "Testimonial does not exist." });
            return;
        }

        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        let thumbnail
        if (thumbnailFile) {
            thumbnail = await new Promise((resolve) => {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        resolve(uploadData.url);
                    } else {
                        res.json({ "status": false, message: "Error occurred while uploading video, please try again" });
                        return;
                    }
                });
            });
        }

           data.thumbnail = thumbnail;

        let updatedTestimonial = await VideoTestimonialModel.findByIdAndUpdate(findTestimonial._id, data, { new: true })
        if (updatedTestimonial) {
            if (updatedTestimonial) {
                res.json({ "status": true, "message": "Testimonial updated successfully" });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.fetchVideoTestimonial = (req, res) => {
    try {
        let data = req.params;

        VideoTestimonialModel.findById({ "_id": data.id }, (err, exTestimonial) => {
            if (exTestimonial) {
                res.json({ "status": true, "data": exTestimonial });
            } else {
                res.json({ "status": false, "message": "Testimonial does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.videoTestimonialList = (req, res) => {

    VideoTestimonialModel.find().sort({ "createdAt": -1 }).then((exTestimonial) => {

        if (exTestimonial.length > 0) {

            res.json({ "status": true, "data": exTestimonial });
        } else {
            res.json({ "status": false, "message": "Testimonial list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.videoTestimonialActiveList = (req, res) => {

    VideoTestimonialModel.find({ "isActive": true }).select({ "_id": 1, "name": 1, "qualification": 1, "feedback": 1, "thumbnail": 1,"videoUrl": 1 }).sort({ "createdAt": -1 }).then((exTestimonial) => {

        if (exTestimonial.length > 0) {

            res.json({ "status": true, "data": exTestimonial });
        } else {
            res.json({ "status": false, "message": "Testimonial list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteVideoTestimonial = (req, res) => {

    try {

        let TestimonialId = req.body._id

        VideoTestimonialModel.findByIdAndDelete({ "_id": TestimonialId }, { new: true }, (err, exTestimonial) => {
            if (exTestimonial) {

                res.json({ "status": true, "message": "Testimonial has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `Testimonial does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
