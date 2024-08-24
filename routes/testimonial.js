const express = require('express');
const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const testimonials = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 200 * 1024 * 1024 } });


const { addTestimonial, editTestimonial, fetchTestimonial, deleteTestimonial, testimonialList, testimonialActiveList } = require('../controllers/testimonialConfig');

const { addVideoTestimonial, editVideoTestimonial, fetchVideoTestimonial, deleteVideoTestimonial, videoTestimonialList, videoTestimonialActiveList } = require('../controllers/videoTestimonialConfig');


testimonials.post('/testimonial/create_new',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('testimonial', 'edit'), postValidation,addTestimonial);

testimonials.patch('/testimonial/update',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('testimonial', 'edit'), postValidation,editTestimonial);

testimonials.get('/testimonial/:id',tokenMiddlewareAdmin,authorizeAccess('testimonial', 'edit'),fetchTestimonial);

testimonials.get('/testimonials',tokenMiddlewareAdmin,authorizeAccess('testimonial', 'edit'),testimonialList);

testimonials.get('/testimonials/active',testimonialActiveList);

testimonials.post('/testimonial/del',tokenMiddlewareAdmin,authorizeAccess('testimonial', 'edit'), postValidation,deleteTestimonial);





testimonials.post('/video_testimonial/create_new',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('video_testimonial', 'edit'), postValidation,addVideoTestimonial);

testimonials.patch('/video_testimonial/update',tokenMiddlewareAdmin,s3upload.fields([{ name: 'thumbnail', maxCount: 1 }]),authorizeAccess('video_testimonial', 'edit'), postValidation,editVideoTestimonial);

testimonials.get('/video_testimonial/:id',tokenMiddlewareAdmin,authorizeAccess('video_testimonial', 'view'),fetchVideoTestimonial);

testimonials.get('/video_testimonials',tokenMiddlewareAdmin,authorizeAccess('video_testimonial', 'view'),videoTestimonialList);

testimonials.get('/video_testimonials/active',videoTestimonialActiveList);

testimonials.post('/video_testimonial/del',tokenMiddlewareAdmin,authorizeAccess('video_testimonial', 'delete'), postValidation,deleteVideoTestimonial);

module.exports = testimonials;