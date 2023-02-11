const { Team } = require("../models/team");


module.exports = async function (req, res, next) {
    

    const team = await Team.findById(req.params.id);
    let tab = team.members.toString().split(",");
	if (tab.indexOf( req.body.members.toString() )=== -1) {
        req.team=team;
		next();
	} else {
		return res.status(403).json("L'utilisateur est deja un membre de l'equipe ");
	}
};