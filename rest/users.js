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
        })
});

// Get user
router.get('/:id', function(req, res, next) {
    req.db.user
        .findOne({ _id: req.params.id })
        .select('-hash -sessions')
        .exec(function(err, users) {
            res.json(users);
        })
});

// Patch user
router.patch('/:id', function(req, res, next) {
    if (!req.body.user) {
        return res.sendStatus(400);
    }
    
    res.sendStatus(200);
});

// Delete user
router.delete('/:id', function(req, res, next) {
    res.sendStatus(200);
});

module.exports = router;