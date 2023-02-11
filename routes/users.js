const userController = require("../controllers/usersController");
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const mongoose = require("mongoose");
const multer = require('multer');
const { User } = require("../models/user");


const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if (isValid) {
          uploadError = null;
      }
      cb(uploadError, 'uploads');
  },
  filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`);
  }
});

const uploadOptions = multer({ storage: storage });



router.put('/image/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid User Id');
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send('Invalid user!');

  const file = req.file;
  let imagepath;

  if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
      imagepath = `${basePath}${fileName}`;
  } else {
      imagepath = user.imageURL;
  }

  const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {

          imageURL: imagepath,

      },
      { new: true }
  );

  if (!updatedUser) return res.status(500).send('the user cannot be updated!');

  res.send(updatedUser);
});

// router.get("/ahla", userController.AutoDeleetStudents)
router.get("/search/:key", userController.getMemberByUserName)
router.get("/teachers", userController.getTeachers);
router.get("/students", userController.getStudents);
router.get("/teachers/pending", userController.getTeachersPendingList);
router.get("/students/pending", userController.getStudentsPendingList);
router.get("/teachers/rejected", userController.getTeachersRejectedList);
router.get("/students/rejected", userController.getStudentsRejectedList);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getOneUser);
router.delete("/:id", userController.deleetUser);
router.put("/:id", userController.updateUser);
router.put("/statusRejected/:id",userController.updateRejectedUserStatus)
router.put("/status/:id",userController.updateUserStatus)
router.put("/updatePassword/:id",
  check("newPassword", "Mot de passe doit avoir au moins 7 caractéres").isLength({
    min: 7,
  }),
  userController.updateUserPassword
 );

//authentication routes
router.post(
  "/auth/signup",
  check("cin","Cin doit avoir au moins 8 chifres").isNumeric().isLength({min:8,}),
  check("phone","Numéro de télephone doit avoir au moins 8 chifres").isNumeric().isLength({min:8,}),
  check("email", "adresse email incorrect ").isEmail(),
  check("password", "Mot de passe doit avoir au moins 7 caractéres").isLength({
    min: 7,
  }),
  userController.createUser
);
router.get("/auth/email-activate/:token", userController.activateAccount);
router.post("/auth/login", userController.loginUser);
router.put("/auth/forgot-password", userController.forgotPassword);
router.put(
  "/auth/reset-password",
  check(
    "newPassword",
    "Nouveau mot de passe doit avoir au moins 7 caractéres "
  ).isLength({
    min: 7,
  }),
  userController.resetPassword
);




module.exports = router;
