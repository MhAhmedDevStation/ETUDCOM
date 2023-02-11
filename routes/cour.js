
const mongoose = require('mongoose');
const  Cour  = require('../models/cour');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const verifyTeamOwner = require('../helpers/isTeamOwner');
const cour = require('../models/cour');
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/html':''
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid file type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'files');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.post(`/files/:userId/:teamId`, uploadOptions.array('file'), async (req, res) => {
    const team = req.params.teamId
    const user = req.params.userId
    const name = req.body.courName
    const files = req.files;
    let filesPaths = [];
    let filesNames=[]
    if (!files) return res.status(400).send('No files in the request');

    const basePath = `${req.protocol}://${req.get('host')}/files/`;
    if (files) {
        files.map((file) => {
            filesPaths.push(`${basePath}${file.filename}`);
            filesNames.push(`${file.originalname}`)
        });
    }
    let cour = new Cour({
        courName:name,
        teamId: team,
        senderId: user,
        files: filesPaths, 
        fNames: filesNames
    });
    cour = await cour.save();

    if (!cour) return res.status(500).send('The cour cannot be created');

    res.send(cour);
});
router.get('/cours/:teamId', getTeamCours = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.teamId)) {
        return res.status(400).send('Invalid user Id');
    }
    let filter = {};
    if (req.params.teamId) {
        filter = { teamId: req.params.teamId };
    }
    const courList = await Cour.find(filter)
        .populate({ path: 'senderId', select: 'userName + imageURL' })
        .populate({ path: 'teamId', select: 'name' });
    
    if (!courList) {
        res.status(500).json({ success: false });
    }
    res.send(courList);
});
router.delete('/cours/:id/:courId',verifyTeamOwner,deleteCour=async(req,res)=>{
    Cour.findByIdAndRemove(req.params.courId).then((cour) => {
        if (cour) {
            return res.status(200).json({ success: true, message: ' Cour  deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'Cour not found!' });
        }
    })
    .catch((err) => {
        return res.status(500).json({ success: false, error: err });
    });
})

module.exports = router;
