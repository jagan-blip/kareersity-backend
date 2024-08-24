
const TestimonialModel = require("../models/testimonial")

exports.addTestimonial = (req, res) => {
    try {
        let data = req.body;

                TestimonialModel.create(data, (err, newTestimonial) => {
                    if (newTestimonial) {
                        res.json({ "status": true, "message": "New Testimonial added successfully", "data": newTestimonial });
                    } else {
                        res.json({ "status": false, "message": "Please try again." });
                    }
                });

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editTestimonial = async (req, res) => {
    try {

        let data = req.body;

        let findTestimonial = await TestimonialModel.findById(data._id)

        if (!findTestimonial) {
            res.json({ "status": false, "message": "Testimonial does not exist." });
            return;
        }

        let updatedTestimonial = await TestimonialModel.findByIdAndUpdate(findTestimonial._id, data, { new: true })
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


exports.fetchTestimonial = (req, res) => {
    try {
        let data = req.params;

        TestimonialModel.findById({ "_id": data.id }, (err, exTestimonial) => {
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

exports.testimonialList = (req, res) => {

    TestimonialModel.find().sort({ "createdAt": -1 }).then((exTestimonial) => {

        if (exTestimonial.length > 0) {

            res.json({ "status": true, "data": exTestimonial });
        } else {
            res.json({ "status": false, "message": "Testimonial list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.testimonialActiveList = (req, res) => {

    TestimonialModel.find({ "isActive": true }).select({ "_id": 1, "name": 1, "qualification": 1, "feedback": 1, "thumbnail": 1,"videoUrl": 1 }).sort({ "createdAt": -1 }).then((exTestimonial) => {

        if (exTestimonial.length > 0) {

            res.json({ "status": true, "data": exTestimonial });
        } else {
            res.json({ "status": false, "message": "Testimonial list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteTestimonial = (req, res) => {

    try {

        let TestimonialId = req.body._id

        TestimonialModel.findByIdAndDelete({ "_id": TestimonialId }, { new: true }, (err, exTestimonial) => {
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
