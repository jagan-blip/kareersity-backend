const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const liveProgramBanner = express.Router();
const multer = require('multer');
const { addLiveProgramBanner, editLiveProgramBanner, changeStatus, fetchLiveProgramBanner, LiveProgramBannerList, deleteLiveProgramBanner ,activeLiveProgramBannerList} = require('../controllers/liveProgrambannerConfig');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } });

liveProgramBanner.post('/add_live_program_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('live_program_banner', 'edit'), postValidation,addLiveProgramBanner);

liveProgramBanner.patch('/edit_live_program_banner',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('live_program_banner', 'edit'), postValidation,editLiveProgramBanner);

liveProgramBanner.patch('/change_status_of_live_program_banner',tokenMiddlewareAdmin,authorizeAccess('live_program_banner', 'edit'), postValidation,changeStatus);

liveProgramBanner.post('/live_program_banner_info',tokenMiddlewareAdmin,authorizeAccess('live_program_banner', 'view'), postValidation,fetchLiveProgramBanner);

liveProgramBanner.get('/live_program_banner_list',tokenMiddlewareAdmin,authorizeAccess('live_program_banner', 'view'),LiveProgramBannerList);

liveProgramBanner.get('/active_live_program_banner_list',activeLiveProgramBannerList);

liveProgramBanner.post('/delete_live_program_banner',tokenMiddlewareAdmin,authorizeAccess('live_program_banner', 'delete'), postValidation,deleteLiveProgramBanner);


module.exports = liveProgramBanner;