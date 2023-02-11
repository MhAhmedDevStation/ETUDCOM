const teamController = require('../controllers/teamController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../helpers/verifyToken');
const verifyOwner = require('../helpers/isNotTeamOwner');
const verifyMember = require('../helpers/isNotTeamMember');
const verifyTeamOwner = require('../helpers/isTeamOwner');
const multer = require('multer');
const mongoose = require('mongoose');
const { Team } = require('../models/team');
const XLSX = require('xlsx')
const fs = require("fs");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx'
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
router.put('/addTeamMembers/file/xlsx/:id', uploadOptions.single('file'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Identifiant de l’équipe Invalide');
    }
    
    const file = req.file;
    let filepath;
    let membersList= [];
    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
        filepath = `${basePath}${fileName}`;
        // console.log(fileName)
        const wb = XLSX.readFile('./files/'+fileName)
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(ws)
        // console.log(json)
        json.forEach((document)=>{
            membersList.push(document._id)
        })
        fs.unlink("./files/"+fileName, (err) => {
            if (err) { console.error(err); }
          });    
    }
    // console.log(membersList)
    const team = await Team.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { members: membersList } },
        { new: true }
    );
      await team.save()
    if (!team) return res.status(500).send('équipe Introuvable');
    res.send(team);
   
  });

router.put('/files/:id', uploadOptions.array('file', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Team Id');
    }
    const files = req.files;
    let filesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/files/`;

    if (files) {
        files.map((file) => {
            filesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const team = await Team.findByIdAndUpdate(
        req.params.id,
        {
            $addToSet: { files: filesPaths } 
        },
        { new: true }
    );

    if (!team) return res.status(500).send('les fichiers ne peuvent pas être mis à jour!');

    res.send(team);
});

router.get('/team/:id', teamController.getTeamById);
router.get('/members/:id', teamController.getTeamMembers);
router.get('/files/:id', teamController.getTeamFiles);
router.get('/owner/:id', teamController.getTeamOwner);
router.get('/', teamController.getTeacherTeams);
router.get('/studentList', teamController.getStudentTeams);

router.post('/teamMembers/:id', verifyOwner, verifyMember, teamController.addTeamMembers);
router.post('/:id', teamController.createTeam);

router.put('/teamMembers/:id',verifyTeamOwner, teamController.deleteTeamMember);
router.put('/updateTeam/:id', verifyTeamOwner, teamController.updateTeam);

router.delete('/:id', verifyTeamOwner, teamController.deleteTeam);

module.exports = router;
