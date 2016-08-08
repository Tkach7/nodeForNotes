module.exports = function(req, res, next) {

    req.db = {
        user: require('./user')
    }

    next();
}