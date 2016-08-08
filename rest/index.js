module.exports = function(app) {

    /** Load Models **/
    app.use('*', require('../models'));

    /** Unsecured REST **/
    app.use('/sign', require('./sign'));

    // /** Secured REST **/
    app.use('*', function(req, res, next) {
        if (req.method === 'OPTIONS') next();
        var session = req.headers['authorization'];

        if (!session) return res.sendStatus(403);
        req.db.user.findOne({
                'sessions.token': session
            })
            .select('-hash -sessions')
            .exec(function(err, user) {
                if (err) return res.sendStatus(500);

                if (!user) return res.sendStatus(403);
                req.user = user;
                next();
            });

    });

    /** Models REST **/
    app.use('/users', require('./users'));

    /** Undefined REST **/
    app.use('*', function(req, res, next) {
        res.sendStatus(404);
    });


}