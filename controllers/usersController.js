const { User } = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { json } = require('express/lib/response');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const multer = require('multer');
const { sendConfirmationEmail,sendforgotPasswordEmail,sendVerificationEmail } = require('../helpers/nodemailer');
updateRejectedUserStatus = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid user Id');
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isRejected: true }, { new: true });
    if (user){
        const email = user.email;
        const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
            expiresIn: '10m'
        });
        sendVerificationEmail(email, token);
        res.send(user)
    } 
    else{return res.status(500).send(`USER not found`);}
    
};
deleetUser = async (req, res, next) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({ success: true, message: ' user  deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'user not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
};
updateUserStatus = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid user Id');
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true,isRejected:false }, { new: true });

    if (!user) return res.status(500).send(`USER not found`);

    res.send(user);
};
updateUser = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid user Id');
    }
    const file = req.file;
    const user = await User.findByIdAndUpdate(
        req.params.id,

        req.body,
        // {
        //   firstname: req.body.firstName,
        //   lastName: req.body.lastName,
        //   cin: req.body.cin,
        //   email: req.body.email,
        //   passwordHash: bcrypt.hashSync(req.body.password, 10),
        //   phone: req.body.phone,
        // },
        { new: true }
    );

    if (!user) return res.status(500).send(`USER not found`);

    res.send(user);
};
updateUserPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ err: 'Mot de passe doit avoir au moins 7 caractéres' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid user Id');
    }
    const { newPassword, cnewPassword } = req.body;
 

    let user = await User.findById(req.params.id);


    if (user && !bcrypt.compareSync(req.body.oldPassword, user.passwordHash)) {
        return res.status(403).json({ err: 'ancien mot de passe incorrect' });
    }
    if (
        user &&
        bcrypt.compareSync(req.body.oldPassword, user.passwordHash) &&
        !(newPassword == cnewPassword)
    ) {
        return res.status(403).json({ err: 'confirmer votre mot de passe' });
    }

    const obj = {
        passwordHash: bcrypt.hashSync(newPassword, 10)
    };

    user = _.extend(user, obj);
    user.save((err, result) => {
        if (err) {
            return res.status(401).json({ error: 'erreur de réinitialisation du mot de passe' });
        } else {
            return res.status(200).json({ message: 'Votre mot de passe a été changé, ' });
        }
    });
};
createUser = (req, res, next) => {
    // INPUT VALIDATION
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { firstName, lastName, cin, email, password, phone, role } = req.body;

    // VALDATE IF USER DOESN'T ALREADY EXIST
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(401).json({ error: "L'utilisateur avec cet email existe déjà." });
        }

        // CREATE VALIDATION TOKEN
        const token = jwt.sign(
            { cin, firstName, lastName, email, password, phone, role },
            process.env.JWT_ACC_ACTIVATE,
            { expiresIn: '20m' }
        );
        // SENDING VALIDATION EMAIL
        sendConfirmationEmail(email, token);
        if (!sendConfirmationEmail) {
            return res.json({ message: 'verifier' });
        } else {
            return res.json({
                message: "L'e-mail a été envoyé, activez votre compte"
            });
        }
    });
};
activateAccount = (req, res) => {
    const token = req.params.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function (err, decodedToken) {
            if (err) {
                return res.status(400).json({ error: 'Lien incorrect ou expiré' });
            }
            const { firstName, lastName, cin, email, password, phone, role } = decodedToken;
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    return res
                        .status(400)
                        .json({ error: 'Utilisateur avec ce courriel existe déjà. ' });
                }

                let newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    userName: firstName + ' ' + lastName,
                    cin: cin,
                    email: email,
                    passwordHash: bcrypt.hashSync(password, 10),
                    phone: phone,
                    role: role
                });
                newUser.save((err, success) => {
                    if (err) {
                        return res.status(401), json({ error: "erreur d'activation du compte" });
                    }
                    res.redirect(process.env.CLIENT_LOGIN_URL);
                });
            });
        });
    } else {
        return res.json({ error: "Quelque chose s'est mal passé !" });
    }
};
loginUser = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('Adresse email incorrect !');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userInfo: user
            },
            secret
        );
        return res.status(200).send({
            token: token
        });
    } else {
        res.status(401).send('Mot de passe incorrect !');
    }
};
forgotPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Adresse email incorrect ! ' });
        }
        const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
            expiresIn: '10m'
        });
        sendforgotPasswordEmail(email, token);

        return user.updateOne({ resetLink: token }, function (err, success) {
            if (err) {
                return res.status(401).json({
                    error: 'erreur de lien de réinitialisation du mot de passe'
                });
            } else {
                if (err) {
                    return res.json({ msg: 'ss' });
                }
                return res.json({
                    message: "L'e-mail a été envoyé, suivez les instructions "
                });
            }
        });
    });
};
resetPassword = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { resetLink, newPassword } = req.body;
    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (error, decodedData) {
            if (error) {
                return res.status(401).json({
                    error: 'Jeton incorrect ou expiré'
                });
            }
            User.findOne({ resetLink }, (err, user) => {
                if (err || !user) {
                    return res
                        .status(400)
                        .json({ error: "L'utilisateur avec ce jeton n'existe pas." });
                }
                const obj = {
                    passwordHash: bcrypt.hashSync(newPassword, 10),
                    resetLink: ''
                };
                user = _.extend(user, obj);
                user.save((err, result) => {
                    if (err) {
                        return res
                            .status(401)
                            .json({ error: 'erreur de réinitialisation du mot de passe' });
                    } else {
                        return res
                            .status(200)
                            .json({ message: 'Votre mot de passe a été changé, ' });
                    }
                });
            });
        });
    } else {
        return res.status(401).json({ error: "Erreur d'authentification !" });
    }
};
getTeachers = async (req, res) => {
    const teacherList = await User.find({ role: 'enseignant', isActive: 'true' });

    if (!teacherList) {
        res.status(500).json({ success: false });
    }
    res.send(teacherList);
};
getStudents = async (req, res) => {
    const studentList = await User.find({ role: 'etudiant', isActive: 'true' });

    if (!studentList) {
        res.status(500).json({ success: false });
    }
    res.send(studentList);
};
getStudentsPendingList = async (req, res) => {
    const pendingList = await User.find({ role: 'etudiant', isActive: 'false' ,isRejected:'false' });

    if (!pendingList) {
        res.status(500).json({ success: false });
    }
    res.send(pendingList);
};
getTeachersPendingList = async (req, res) => {
    const pendingList = await User.find({ role: 'enseignant', isActive: 'false',isRejected:'false' });

    if (!pendingList) {
        res.status(500).json({ success: false });
    }
    res.send(pendingList);
};
getStudentsRejectedList = async (req, res) => {
    const pendingList = await User.find({ role: 'etudiant',isRejected:'true' });

    if (!pendingList) {
        res.status(500).json({ success: false });
    }
    res.send(pendingList);
};
getTeachersRejectedList = async (req, res) => {
    const pendingList = await User.find({ role: 'enseignant',isRejected:'true' });

    if (!pendingList) {
        res.status(500).json({ success: false });
    }
    res.send(pendingList);
};
getAllUsers = async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.send(userList);
};
getOneUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(500).json({ success: false });
    }
    res.send(user);
};
getMemberByUserName = async (req, res) => {
    let user = await User.find({
        $or: [{ userName: { $regex: req.params.key } }]
    });
    res.send(user);
};

module.exports = {
    // AutoDeleetStudents,
    getAllUsers,
    createUser,
    loginUser,
    getOneUser,
    activateAccount,
    forgotPassword,
    resetPassword,
    deleetUser,
    updateUser,
    getTeachers,
    getStudents,
    getTeachersPendingList,
    getStudentsPendingList,
    updateUserStatus,
    updateUserPassword,
    getMemberByUserName,
    updateRejectedUserStatus,
    getStudentsRejectedList,
    getTeachersRejectedList
};
