const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const banner = express.Router();
const multer = require('multer');
const { addBanner, editBanner, changeStatus, fetchBanner, BannerList, deleteBanner } = require('../controllers/bannerConfig');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

banner.post('/add_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('banner','edit'), postValidation,addBanner);

banner.patch('/edit_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('banner','edit'), postValidation,editBanner);

banner.patch('/change_status_of_banner',tokenMiddlewareAdmin,authorizeAccess('banner','edit'), postValidation,changeStatus);

banner.post('/banner_info',tokenMiddlewareAdmin,authorizeAccess('banner','view'), postValidation,fetchBanner);

banner.get('/banner_list',tokenMiddlewareAdmin,authorizeAccess('banner','view'),BannerList);

banner.get('/active_banner_list',BannerList);

banner.post('/delete_banner',tokenMiddlewareAdmin,authorizeAccess('banner','delete'), postValidation,deleteBanner);


module.exports = banner;