const express = require('express');
const educator = express.Router();
const { signUp ,editEducatorProfile, updateStatus, educatorInfo, educators, searchEducators, sendEmailToEducators, generate_login_credential, approveEducator, deleteEducator, verifiedEducators, ActiveEducators, educatorInfoByEmail } = require("../controllers/educatorConfig");
const {tokenMiddlewareAdmin} = require("../common/encDec")
const { postValidation } = require('../common/validation')
const multer = require('multer');
const { authorizeAccess } = require('../controllers/adminConfig');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

educator.post('/signUpFrom',s3upload.fields([{ name: 'cvUrl', maxCount: 1 }, { name: 'course1Url', maxCount: 1 }, { name: 'course2Url', maxCount: 1 },{ name: 'photoUrl', maxCount: 1 }]),postValidation,  signUp);

educator.patch('/updateProfile/:id',tokenMiddlewareAdmin,authorizeAccess('educators', 'edit'),s3upload.fields([{ name: 'photoUrl', maxCount: 1 },{ name: 'cvUrl', maxCount: 1 }, { name: 'course1Url', maxCount: 1 }, { name: 'course2Url', maxCount: 1 }]),postValidation, editEducatorProfile);

educator.patch('/generate_login_credential',tokenMiddlewareAdmin,authorizeAccess('educators', 'edit'), postValidation, generate_login_credential);

educator.patch('/updateStatus',tokenMiddlewareAdmin,authorizeAccess('educators', 'edit'), postValidation, updateStatus);
educator.patch('/approve',tokenMiddlewareAdmin,authorizeAccess('educators', 'edit'), postValidation, approveEducator);

educator.post('/delete',tokenMiddlewareAdmin,authorizeAccess('educators', 'delete'), postValidation, deleteEducator);

educator.get('/detail/:eduId',tokenMiddlewareAdmin, educatorInfo);
educator.post('/educatorInfo',tokenMiddlewareAdmin, educatorInfoByEmail);

educator.get('/educators',tokenMiddlewareAdmin,authorizeAccess('educators', 'view'), educators);

educator.get('/verifiedEducators',tokenMiddlewareAdmin,authorizeAccess('educators', 'view'), verifiedEducators);

educator.get('/activeEducators', ActiveEducators);

educator.get('/search',tokenMiddlewareAdmin,authorizeAccess('educators', 'view'), searchEducators);

educator.post('/sendEmail',tokenMiddlewareAdmin,authorizeAccess('educators', 'edit'),postValidation, sendEmailToEducators);

module.exports = educator;