
const FAQModel = require("../models/faq")

exports.addFAQ = (req, res) => {
    try {
        let data = req.body;

        FAQModel.create(data, (err, newFAQ) => {
            if (newFAQ) {
                res.json({ "status": true, "message": "New FAQ added successfully", "data": newFAQ });
            } else {
                res.json({ "status": false, "message": "Please try again." });
            }
        })
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editFAQ = async (req, res) => {
    try {

        let data = req.body;

        let findFAQ = await FAQModel.findById(data._id)

        if (!findFAQ) {
            res.json({ "status": false, "message": "FAQ does not exist." });
            return;
        }


        let updatedFAQ = await FAQModel.findByIdAndUpdate(findFAQ._id, {
            "question": data.question, "answer": data.answer, "isActive": data.isActive
        }, { new: true })
        if (updatedFAQ) {
            if (updatedFAQ) {
                res.json({ "status": true, "message": "FAQ updated successfully" });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.fetchFAQ = (req, res) => {
    try {
        let data = req.params;

        FAQModel.findById({ "_id": data.id }, (err, exFAQ) => {
            if (exFAQ) {
                res.json({ "status": true, "data": exFAQ });
            } else {
                res.json({ "status": false, "message": "FAQ does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.FAQList = (req, res) => {

    FAQModel.find().select({ "_id": 1, "question": 1, "answer": 1, "isActive": 1 }).sort({ "createdAt": -1 }).then((exFAQ) => {

        if (exFAQ.length > 0) {

            res.json({ "status": true, "data": exFAQ });
        } else {
            res.json({ "status": false, "message": "FAQ list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.FAQActiveList = (req, res) => {

    FAQModel.find({ "isActive": true }).sort({ "createdAt": -1 }).then((exFAQ) => {

        if (exFAQ.length > 0) {

            res.json({ "status": true, "data": exFAQ });
        } else {
            res.json({ "status": false, "message": "FAQ list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteFAQ = (req, res) => {

    try {

        let FAQId = req.body._id

        FAQModel.findByIdAndDelete({ "_id": FAQId }, { new: true }, (err, exFAQ) => {
            if (exFAQ) {

                res.json({ "status": true, "message": "FAQ has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `FAQ does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
