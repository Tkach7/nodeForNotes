var async = require('async');
var express = require('express');

var router = express.Router();

// Get users
router.get('/self', function(req, res, next) {
    res.json(req.user);
});

// Get users
router.get('/', function(req, res, next) {
    req.db.user
        .find()
        .select('-hash -sessions')
        .exec(function(err, users) {
            res.json(users);
        });
});

// Get user
router.get('/:email', function(req, res, next) {
    req.db.user
        .findOne({ email: req.params.email })
        .select('-hash -sessions')
        .exec(function(err, users) {
            res.json(users);
        })
});

// Patch user
router.patch('/:email', function(req, res, next) {
    if (!req.body.user) {
        return res.sendStatus(400);
    }
    req.db.findOneAndUpdate({
        email: email
    }, req.body)
    .exec(function(err, users) {
        if (err) return res.sendStatus(400);
        res.json(users);
        res.sendStatus(200);
    })
});

// Delete user
router.delete('/:id', function(req, res, next) {
    res.sendStatus(200);
});

module.exports = router;