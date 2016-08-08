'use strict';

var crypto = require('crypto-js');
var express = require('express');
var async = require('async');

var router = express.Router();

let key = require('../middleware/key');

/** Get key token **/
router.get('/key/:promise', function(req, res) {
    if (!req.params.promise || req.params.promise.length < 16) {
        return res.sendStatus(400);
    }
    key.get(req.params.promise, function(err, key) {
        if (err) return res.sendStatus(500);
        res.json(key);
    });

});


/** Sign in action **/
router.post('/in', function(req, res, next) {

    if (!req.body.email || !req.body.password || !req.body.promise) {
        return res.sendStatus(400);
    }

    async.waterfall([
        function(callback) {
            req.db.user.findOne({
                email: req.body.email
            }, callback);
        },
        function(user, callback) {
            key.get(req.body.promise, function(err, key) {
                if (err) callback(err);

                var password = crypto.AES.decrypt(req.body.password, key).toString(crypto.enc.Utf8);

                if (user) {
                    user.auth(password, req.ip, callback);
                } else {
                    req.db.user.create({
                        email: req.body.email,
                        password: password,
                    }, function(err, user) {
                        if (err) callback(err);

                        let session = {
                            ip: req.ip,
                            token: crypto.lib.WordArray.random(256 / 8).toString()
                        };

                        user.sessions.unshift(session);
                        user.save(function(err) {
                            if (err) callback(err);

                            callback(null, session);
                        });
                    })
                }
            });
        }
    ], function(err, session) {
        if (err && err.status) return res.sendStatus(err.status);
        if (err) return res.sendStatus(500);
        res.json(session);
    });
});

/* Sign out action */
router.post('/out', function(req, res, next) {
    if (!req.headers['authorization']) return res.sendStatus(400);

    req.db.user.findOneAndUpdate({
        'sessions.token': req.headers['authorization']
    }, {
        $pull: {
            'sessions': {
                'token': req.headers['authorization']
            }
        }
    }, function(err, user) {
        if (err) return res.sendStatus(500);
        res.sendStatus(200);
    });
});

module.exports = router;