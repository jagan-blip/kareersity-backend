const express = require('express');
const learners = express.Router();
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { learnersList, sendEmailToLearners, editLearnersStatus, learnerInfo, learnersActiveList } = require('../controllers/userConfig');
const { authorizeAccess } = require('../controllers/adminConfig');

learners.get('/list',tokenMiddlewareAdmin,authorizeAccess('learners','view'),  learnersList);
learners.get('/activeList',tokenMiddlewareAdmin,authorizeAccess('learners','view'),  learnersActiveList);
learners.post('/sendMail',tokenMiddlewareAdmin,authorizeAccess('learners','edit'), postValidation, sendEmailToLearners);
learners.patch('/changeStatus',tokenMiddlewareAdmin,authorizeAccess('learners','edit'), postValidation, editLearnersStatus);
learners.post('/lInfo',tokenMiddlewareAdmin,authorizeAccess('learners','view'), postValidation, learnerInfo);


module.exports = learners;