const { fileUpload } = require("../common/aws");
const JobModel = require("../models/job")
const StateModel = require("../models/states")
const JobApplicantModel = require("../models/jobApplicants")
exports.addJobs = (req, res) => {
    try {
        let data = req.body;


        JobModel.findOne({ "title": data.title }, (err, exJobs) => {
            if (!exJobs) {

                if (data && data.department) {
                    data.department = data.department.map(x => x.toLowerCase())
                }
                if (data && data.experienceLevel) {
                    data.experienceLevel = data.experienceLevel.map(x => x.toLowerCase())
                }
                if (data && data.jobType) {
                    data.jobType = data.jobType.map(x => x.toLowerCase())
                }
                if (data && data.remote) {
                    data.remote = data.remote.map(x => x.toLowerCase())
                }
                if (data && data.location) {
                    data.location = data.location.map(x => x.toLowerCase())
                }
                JobModel.create(data, (err, newJobs) => {
                    if (newJobs) {
                        res.json({ "status": true, "message": "New Job added successfully", "data": newJobs });
                    } else {
                        res.json({ "status": false, "message": "Please try again." });
                    }
                });
            } else {

                res.json({ "status": false, "message": `Title '${exJobs.title}' already exists. ` });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editJobs = async (req, res) => {
    try {

        let data = req.body;

        let findJobs = await JobModel.findById(data.jobId)

        if (!findJobs) {
            res.json({ "status": false, "message": "Job does not exist." });
            return;
        }
        if (data && data.department) {
            data.department = data.department.map(x => x.toLowerCase())
        }
        if (data && data.experienceLevel) {
            data.experienceLevel = data.experienceLevel.map(x => x.toLowerCase())
        }
        if (data && data.jobType) {
            data.jobType = data.jobType.map(x => x.toLowerCase())
        }
        if (data && data.remote) {
            data.remote = data.remote.map(x => x.toLowerCase())
        }
        if (data && data.location) {
            data.location = data.location.map(x => x.toLowerCase())
        }

        let updatedJobs = await JobModel.findByIdAndUpdate(findJobs._id, data, { new: true })
        if (updatedJobs) {
            if (updatedJobs) {
                res.json({ "status": true, "message": "Job updated successfully", "data": updatedJobs });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};


exports.fetchJobs = (req, res) => {
    try {
        let { jobId } = req.params;


        JobModel.findById(jobId, (err, exJobs) => {
            if (exJobs) {
                res.json({ "status": true, "data": exJobs });
            } else {
                res.json({ "status": false, "message": "Job does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.JobsList = (req, res) => {

    JobModel.find().sort({ "createdAt": -1 }).then((exJobs) => {
        if (exJobs.length > 0) {

            res.json({ "status": true, "data": exJobs });
        } else {
            res.json({ "status": false, "message": "Job list is empty", "data": [] });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.activeJobsList = (req, res) => {

    let { department, jobType, location } = req.body
    //console.log(department, jobType, location)
    JobModel.find({
        "isActive": true,
        $and: [
            { "department": { $regex: new RegExp(department, 'i') } },

            { "jobType": { $regex: new RegExp(jobType, 'i') } },

            { "location": { $regex: new RegExp(location, 'i') } },

            {
                "department": { $regex: new RegExp(department, 'i') },
                "jobType": { $regex: new RegExp(jobType, 'i') }
            },

            {
                "jobType": { $regex: new RegExp(jobType, 'i') },
                "location": { $regex: new RegExp(location, 'i') }
            },
            {
                "department": { $regex: new RegExp(department, 'i') },
                "location": { $regex: new RegExp(location, 'i') }
            },
            {
                "department": { $regex: new RegExp(department, 'i') },
                "jobType": { $regex: new RegExp(jobType, 'i') },
                "location": { $regex: new RegExp(location, 'i') }
            }

        ]
    }).sort({ "lastDateForApply": -1 }).then((exJobs) => {
        //console.log(exJobs)
        if (exJobs.length > 0) {

            res.json({ "status": true, "data": exJobs });
        } else {
            res.json({ "status": false, "message": "Job list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.deleteJobs = (req, res) => {

    try {

        let JobId = req.params.jobId
        //console.log(JobId, "JobId")
        JobModel.findByIdAndDelete({ "_id": JobId }, { new: true }, (err, exJobs) => {
            if (exJobs) {

                res.json({ "status": true, "message": "Job has been deleted successfully", "data": exJobs })

            } else {
                res.json({ "status": false, "message": `Job does not exist` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
exports.addStates = (req, res) => {
    try {
        let data = req.body;


        StateModel.findOne({ "country": new RegExp(data.country, "i") }, (err, exStates) => {
            if (!exStates) {


                StateModel.create(data, (err, newStates) => {
                    if (newStates) {
                        res.json({ "status": true, "message": "Added successfully", "data": newStates });
                    } else {
                        res.json({ "status": false, "message": "Please try again." });
                    }
                });
            } else {

                res.json({ "status": false, "message": `Title '${exStates.country}' already exists. ` });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};
exports.getStatesList = (req, res) => {


    StateModel.findOne({ "country": "India" }).then((exStates) => {

        if (exStates) {
            res.json({ "status": true, "data": exStates.state });
        } else {
            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};
// ==================================    Job Applicants  APIs ============================================

exports.applyNow = (req, res) => {
    try {
        let data = req.body;

        JobModel.findById(data.jobId, (err, checkExJob) => {
            //console.log(new Date(checkExJob.lastDateForApply) > new Date(Date.now()),new Date(checkExJob.lastDateForApply) , new Date(Date.now()))
            if (checkExJob && new Date(checkExJob.lastDateForApply) < new Date(Date.now())) { 
              return  res.json({ "status": false, "message": "The apply link has expired for This position.!!!" });
            }else if (checkExJob) {

                    if (data && data.emailId) {
                        data.emailId = data.emailId.toLowerCase()
                    }
                    JobApplicantModel.findOne({ $or: [{ "phoneNumber": new RegExp(data.phoneNumber, "i") }, { "emailId": data.emailId }] }, (err, exJobApplicant) => {
                        if (!exJobApplicant) {


                            if (data && data.jobType) {
                                data.jobType = data.jobType.toLowerCase()
                            }
                            const cvFile = req.files['cv'] ? req.files['cv'][0] : null;
                            if (!cvFile) {
                                res.json({ "status": false, message: "Please provide a valid cv file" });
                                return;
                            }
                            fileUpload(cvFile, (uploadData) => {
                                if (uploadData.status) {
                                    data.cv = uploadData.url;
                                    data.jobTitle = checkExJob.title;
                                    JobApplicantModel.create(data, (err, newJobApplicant) => {
                                        if (newJobApplicant) {
                                            res.json({ "status": true, "message": "Your job application submitted successfully", "data": newJobApplicant });
                                        } else {
                                            res.json({ "status": false, "message": "Please try again." });
                                        }
                                    });
                                } else {
                                    res.json({ "status": false, message: "Error occurred while uploading the thumbnail file, please try again" });
                                    return;
                                }
                            });

                        } else {

                            res.json({ "status": false, "message": `You have already applied for this Job. ` });
                        }
                    });
                } else {
                    res.json({ "status": false, "message": "This position is no longer available.!!!" });
                }
        });


    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.applicant_Information = (req, res) => {
    let { applicantId } = req.params;
    JobApplicantModel.findById(applicantId).then((exApplicants) => {
        if (exApplicants) {
            res.json({ "status": true, "data": exApplicants });
        } else {
            res.json({ "status": false, "message": "Applicant Info not available." });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.applicant_list = (req, res) => {

    JobApplicantModel.find().sort({ "createdAt": -1 }).then((exApplicants) => {
        if (exApplicants.length > 0) {

            res.json({ "status": true, "data": exApplicants });
        } else {
            res.json({ "status": false, "message": "No one has applied.!!!", "data": [] });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};