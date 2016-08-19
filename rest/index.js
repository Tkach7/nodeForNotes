'use strict';
var fs = require('fs');
var path = require("path");
module.exports = function(app) {

    /** Load Models **/
    app.use('*', require('../models'));

    /** Unsecured REST **/
    app.use('/sign', require('./sign'));

   /** Get icons **/
    app.get('/users/icon/:pic', function(req, res) {
        console.log('123');
        fs.access(path.join(__dirname, '../storage/pic/' + req.params.pic), fs.R_OK, function(err) {
            if (err) return res.sendStatus(404);
            res.sendFile(path.join(__dirname, '../storage/pic/' + req.params.pic));
        })
    });
    // /** Secured REST **/
    app.use('*', function(req, res, next) {
        if (req.method === 'OPTIONS') next();
        var session = req.headers['authorization'];

        if (!session) return res.sendStatus(403);
        req.db.user.findOne({
                'sessions.token': session
            })
            .select('-hash')
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