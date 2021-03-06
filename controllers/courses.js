const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse"); //Custom error class
const asyncHandler = require("../utils/asyncHandler"); //This util is used to call next() in case of error  in async functions

//@desc     Get courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.count, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }

  const courses = await query;

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

//@desc     Get single course
//@route    GET /api/v1/courses/:id
//@access   public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id} `, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

//@desc     Add course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId} `,
        404
      )
    );
  }

  //Make sure logged user is same as bootcamp user
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }
  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: course });
});

//@desc     Add course
//@route    PUT /api/v1/courses/:id
//@access   private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id} `, 404)
    );
  }
  //Make sure logged user is same as bootcamp user
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a course of bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

//@desc     Delete course
//@route    PUT /api/v1/courses/:id
//@access   private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id} `, 404)
    );
  }
  //Make sure logged user is same as bootcamp user
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete a course of bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
