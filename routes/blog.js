const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const blogs = express.Router();
const multer = require('multer');

const { addBlogs, editBlogs, changeStatus, fetchBlogs, BlogsList, deleteBlogs, activeBlogsList } = require('../controllers/blogConfig.js');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

blogs.post('/create_new',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('blog', 'edit'), postValidation,addBlogs);

blogs.patch('/update',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('blog', 'edit'), postValidation,editBlogs);

blogs.patch('/update_status',tokenMiddlewareAdmin,authorizeAccess('blog', 'edit'), postValidation,changeStatus);

blogs.post('/detail', postValidation,fetchBlogs);

blogs.get('/s',tokenMiddlewareAdmin,authorizeAccess('blog', 'view'),BlogsList);

blogs.get('/active_blog_list',activeBlogsList);

blogs.post('/del',tokenMiddlewareAdmin,authorizeAccess('blog', 'delete'), postValidation,deleteBlogs);


module.exports = blogs;