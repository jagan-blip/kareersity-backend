const express = require('express');
const { postValidation } = require('../common/validation.js');
const { tokenMiddlewareAdmin } = require('../common/encDec.js');
const jobs = express.Router();
const multer = require('multer');
const { addJobs, editJobs,  fetchJobs, JobsList, deleteJobs, activeJobsList, applyNow, applicant_list, applicant_Information, getStatesList, addStates } = require('../controllers/jobConfig.js');
const { authorizeAccess } = require('../controllers/adminConfig.js');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

jobs.post('/add_new_job',tokenMiddlewareAdmin,authorizeAccess('jobs', 'edit'), postValidation,addJobs);

jobs.patch('/update_job_detail',tokenMiddlewareAdmin,authorizeAccess('jobs', 'edit'), postValidation,editJobs);

jobs.get('/job_detail/:jobId',fetchJobs);

jobs.get('/job_list',tokenMiddlewareAdmin,authorizeAccess('jobs', 'view'),JobsList);

jobs.get('/list_of_states',getStatesList);

jobs.post('/add_states',addStates);

jobs.post('/active_job_list',activeJobsList);

jobs.delete('/delete_job/:jobId',tokenMiddlewareAdmin,authorizeAccess('jobs', 'delete'),deleteJobs);

// ==================================    Job Applicants ============================================

jobs.post('/apply_now',s3upload.fields([{ name: 'cv', maxCount: 1 }]), postValidation,applyNow);

jobs.get('/applicant_Information/:applicantId',tokenMiddlewareAdmin,authorizeAccess('jobs', 'view'), applicant_Information);

jobs.get('/applicant_list',tokenMiddlewareAdmin,authorizeAccess('jobs', 'view'), applicant_list);

module.exports = jobs;