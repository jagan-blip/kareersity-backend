const express = require('express');
const route = express.Router();
const {addCategory,editCategory, getCategoryInfo, categories, deleteCategory, activeCategories} = require("../controllers/category");
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');

route.post('/category/new',tokenMiddlewareAdmin,authorizeAccess('category', 'edit'), postValidation, addCategory);

route.patch('/category/edit',tokenMiddlewareAdmin,authorizeAccess('category', 'edit'), postValidation, editCategory);

route.post('/category/delete',tokenMiddlewareAdmin,authorizeAccess('category', 'delete'), postValidation, deleteCategory);

route.get('/category/info/:id',tokenMiddlewareAdmin,authorizeAccess('category', 'view'),  getCategoryInfo);

route.get('/category/list_of_categories',tokenMiddlewareAdmin,authorizeAccess('category', 'view'),  categories);
route.get('/categories', categories);

route.get('/activeCategories',  activeCategories);

module.exports = route;