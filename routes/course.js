const express = require('express');

const { addNewCourse, editCourse, deleteCourse, lessVideoTest,completeUpload,uploadLessTest,initiateUpload,addNewSessionInCourse, editSessionInCourse, deleteSession, fetchSessionInCourse, sessionListInCourse, addNewLessonInSessionInCourse, editLessonInSessionInCourse, fetchLessonInCourse, lessonListInCourse, deleteLesson, addNewAssessmentInSessionInCourse, editAssessmentInSessionInCourse, fetchAssessmentInCourse, assessmentListInCourse, deleteAssessment, addNewbundleInSessionInCourse, selectCoursesInBundleCourse, editBundleCourseInCourse, fetchbundleInCourse, bundleListInCourse, listOfCourses, updateStatusBundleCourseInCourse, courseInfo, coursesList, courseDetail, listOfActiveCoursesWithFilterAndSortBy, view_active_courseInfo, view_active_related_courses_courseInfo, activeAssessmentQuestionsListInUserMyCourses, list_of_free_courses, list_of_popular_courses, list_of_searched_courses, uploadSingleFile, approveCourse,view_active_course_ratings_and_reviews, activeBundleListInCourse, completeUploadToEditLesson, uploadLessTestToEditLesson, initiateUploadToEditLesson, listOfActiveCourses,  editInstitution, addInstitution, listOfInstitutions } = require('../controllers/mainCourse');

const { postValidation } = require('../common/validation');
const { tokenMiddlewareAdmin, tokenMiddlewareUser } = require('../common/encDec');
const { authorizeAccess } = require('../controllers/adminConfig');
const courses = express.Router();
const multer = require('multer');
const upload = multer();
const storage = multer.memoryStorage();
const s3upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } });

courses.post('/courses/addNew',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,addNewCourse);
courses.patch('/courses/edit', tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'),postValidation,editCourse);
courses.patch('/courses/approve_course', tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'),postValidation,approveCourse);
courses.post('/courses/delete',tokenMiddlewareAdmin,authorizeAccess('courses', 'delete'), postValidation,deleteCourse);
courses.post('/course/detail',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'),courseDetail);
courses.get('/course/:id',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'),courseInfo);
courses.post('/courses/all',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'),listOfCourses);

courses.post('/courses/list_of_active_courses',listOfActiveCoursesWithFilterAndSortBy);

courses.get('/courses/active_courses',tokenMiddlewareAdmin,listOfActiveCourses);
courses.get('/courses/view_active_course/:id',view_active_courseInfo);
courses.post('/courses/view_active_course_ratings_and_reviews',view_active_course_ratings_and_reviews);
courses.get('/courses/list_of_related_courses/:id',view_active_related_courses_courseInfo);
courses.get('/courses/list_of_free_courses',list_of_free_courses);
courses.get('/courses/list_of_popular_courses',list_of_popular_courses);
courses.post('/courses/search_courses',list_of_searched_courses);
courses.post('/upload_single_file',tokenMiddlewareAdmin,s3upload.fields([{ name: 'file', maxCount: 1 }]),uploadSingleFile);

courses.post('/courses/add_institution',tokenMiddlewareAdmin,addInstitution);

courses.patch('/courses/edit_institution',tokenMiddlewareAdmin,editInstitution);

courses.post('/courses/institutions',listOfInstitutions);

courses.post('/course/session/addNew',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,addNewSessionInCourse);
courses.patch('/course/session/edit',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,editSessionInCourse);
courses.post('/course/session/info',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,fetchSessionInCourse);
courses.post('/course/session/list',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,sessionListInCourse);
courses.post('/course/session/active_session_list',tokenMiddlewareUser, postValidation,sessionListInCourse);
courses.post('/course/session/delete',tokenMiddlewareAdmin,authorizeAccess('courses', 'delete'), postValidation,deleteSession);
// to /course/lesson/addNew    new Flow by Gokul
courses.post('/course/initiateUpload',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'),postValidation,initiateUpload );
courses.post('/course/upload',upload.single("file"), uploadLessTest);
courses.post('/course/completeUpload',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), completeUpload);

// to /course/lesson/edit    new Flow
courses.post('/course/lesson_edit/initiate_upload',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'),postValidation,initiateUploadToEditLesson );
courses.post('/course/lesson_edit/complete_upload',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), completeUploadToEditLesson);


// to /course/lesson/addNew Old
courses.post('/course/lesson/addNew',tokenMiddlewareAdmin,s3upload.fields([{ name: 'videoUrl', maxCount: 1 }]),authorizeAccess('courses', 'edit'), postValidation,addNewLessonInSessionInCourse);
courses.patch('/course/lesson/edit',tokenMiddlewareAdmin,s3upload.fields([{ name: 'videoUrl', maxCount: 1 }]),authorizeAccess('courses', 'edit'), editLessonInSessionInCourse);
courses.post('/course/lesson/info',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,fetchLessonInCourse);
courses.post('/course/lesson/list',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,lessonListInCourse);
courses.post('/course/lesson/delete',tokenMiddlewareAdmin,authorizeAccess('courses', 'delete'), postValidation,deleteLesson);


courses.post('/course/assessment/addNew',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,addNewAssessmentInSessionInCourse);
courses.patch('/course/assessment/edit',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,editAssessmentInSessionInCourse);
courses.post('/course/assessment/info',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,fetchAssessmentInCourse);
courses.post('/course/assessment/list',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,assessmentListInCourse);
courses.post('/course/assessment/active_assessment_questions',tokenMiddlewareUser, postValidation,activeAssessmentQuestionsListInUserMyCourses);
courses.post('/course/Assessment/delete',tokenMiddlewareAdmin,authorizeAccess('courses', 'delete'), postValidation,deleteAssessment);


courses.get('/course/bundle/selectCourses',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), selectCoursesInBundleCourse);
courses.post('/course/bundle/addNew',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,addNewbundleInSessionInCourse);
courses.patch('/course/bundle/edit',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,editBundleCourseInCourse);
courses.patch('/course/bundle/changeStatus',tokenMiddlewareAdmin,authorizeAccess('courses', 'edit'), postValidation,updateStatusBundleCourseInCourse);
courses.post('/course/bundle/info',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), postValidation,fetchbundleInCourse);
courses.get('/course/bundle/list',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), bundleListInCourse);
courses.get('/course/bundle/activelist',tokenMiddlewareAdmin,authorizeAccess('courses', 'view'), activeBundleListInCourse);

module.exports = courses;