const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const faq = express.Router();
const { addFAQ, editFAQ, fetchFAQ, deleteFAQ, FAQList, FAQActiveList } = require('../controllers/faqConfig');


faq.post('/faq/create_new',tokenMiddlewareAdmin,authorizeAccess('faq', 'edit'), postValidation,addFAQ);

faq.patch('/faq/update',tokenMiddlewareAdmin,authorizeAccess('faq', 'edit'), postValidation,editFAQ);

faq.get('/faq/list',tokenMiddlewareAdmin,authorizeAccess('faq', 'view'),FAQList);

faq.get('/faq/active_list',FAQActiveList);

faq.post('/faq/del',tokenMiddlewareAdmin,authorizeAccess('faq', 'delete'), postValidation,deleteFAQ);


module.exports = faq;