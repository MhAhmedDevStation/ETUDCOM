const { Team } = require('../models/team');
const { User } = require('../models/user');
module.exports = async function (req, res, next) {
    const team = await Team.findById(req.params.id);
    if (team.user.toString() !== req.query.user ) {
        return res.status(403).json("Vous etes pas le propriétaire de l'equipe");
    } else {
        next()
    }
};
