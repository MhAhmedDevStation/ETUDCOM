const { Team } = require("../models/team");

module.exports = async function (req, res, next) {
    const team = await Team.findById(req.params.id);


	if (team.user.toString()   !==  req.body.members) {
        next();
       
	} else {
        return res.status(403).json("Vous etes le propriétaire de l'equipe");
	}
    
};