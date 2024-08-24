const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const listenToExperts = express.Router();
const multer = require('multer');
const { addShorts, editShorts, changeStatus, fetchShorts, shortsList, deleteshorts } = require('../controllers/listenToExpertsConfig');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 300 * 1024 * 1024 } });

listenToExperts.post('/shorts/add',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('listen_to_experts', 'edit'), postValidation,addShorts);

listenToExperts.patch('/shorts/edit',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('listen_to_experts', 'edit'), postValidation,editShorts);

listenToExperts.patch('/shorts/changeStatus',tokenMiddlewareAdmin,authorizeAccess('listen_to_experts', 'edit'), postValidation,changeStatus);

listenToExperts.post('/shorts/info',tokenMiddlewareAdmin,authorizeAccess('listen_to_experts', 'view'), postValidation,fetchShorts);

listenToExperts.get('/shorts',tokenMiddlewareAdmin,authorizeAccess('listen_to_experts', 'view'),shortsList);

listenToExperts.get('/shorts/list',shortsList);

listenToExperts.post('/shorts/delete',tokenMiddlewareAdmin,authorizeAccess('listen_to_experts', 'delete'), postValidation,deleteshorts);


module.exports = listenToExperts;