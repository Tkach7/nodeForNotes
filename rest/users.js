'use strict';

var async = require('async');
var express = require('express');
var fs = require('fs');
var crypto = require('crypto-js');
var path = require("path");
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
// router.get('/:email', function(req, res, next) {
//     req.db.user
//         .findOne({ email: req.params.email })
//         .select('-hash -sessions')
//         .exec(function(err, users) {
//             res.json(users);
//         })
// });

// Patch user
router.patch('/info', function(req, res, next) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOneAndUpdate({_id: req.user}, req.body)
    .exec(function(err, users) {
        if (err) return res.sendStatus(400);
        res.json(users);
    });
});

// Put todo
router.put('/todo', function(req, res, next) { 
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOne({ _id: req.user })
    .exec((err, user) => {
        user.todo.push(req.body);
        user.save((err) => {
            res.json(user.todo.pop());
        });
    });
});

// Patch todo
router.patch('/todo', function(req, res, next) { 
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOneAndUpdate({ _id: req.user }, req.body)
    .exec((err, user) => {
        if (err) return res.sendStatus(400);
        res.json(user);
    });
});

// Patch time todo
// Patch todo
router.patch('/todo/time', function(req, res, next) { 
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOne({ _id: req.user })
    .exec((err, user) => {
        if (err) return res.sendStatus(400);
        
        var todo = user.todo.filter(function(todo) {
            return todo._id == req.body._id;
        }).pop();

        user.todo.id(todo._id).time = req.body.time;
        user.save((err) => {
            if (err) return res.sendstatus(500);
            res.json(user);
        })
    });
});

// Delete todo
router.delete('/todo/:todoId', function(req, res, next) { 
    if (!req.body) {
        return res.sendStatus(400);
    }
    req.db.user.findOne({ _id: req.user })
    .exec((err, user) => {
        if (err) return res.sendStatus(400);

        var todo = user.todo.filter(function(todo) {
            return todo._id == req.params.todoId;
        }).pop();
        if (!!todo) user.todo.id(todo._id).remove();
        user.save((err) => {
            if (err) return res.sendstatus(500);

            res.json(user);
        })
    });
});

// Delete session
router.delete('/sessions/:sessionId', function(req, res, next) { 
    req.db.user.findOne({ _id: req.user })
    .exec((err, user) => {
        if (err) return res.sendStatus(400);

        var session = user.sessions.filter(function(session) {
            return session._id == req.params.sessionId;
        }).pop();

        if (!!session) user.sessions.id(session._id).remove();

        user.save((err) => {
            if (err) return res.sendstatus(500);

            res.json(user);
        })
    });
});

// Delete user
router.delete('/:id', function(req, res, next) {
    res.sendStatus(200);
});

/** Set Icon **/
router.patch('/icon', function(req, res) {
    let base64Data;
    try {
        base64Data = req.body.data.replace(/^data:image\/png;base64,/, "");
    } catch (e) {
        res.sendStatus(500);
    }
    let filename = crypto.lib.WordArray.random(256 / 32).toString() + '.png';

    fs.writeFile(path.join(__dirname, '../storage/pic/' + filename), base64Data, 'base64', function(err) {
        if (err) return res.sendStatus(500);

        req.db.user.findOneAndUpdate({
            _id: req.user.id,
        }, {
            icon: '/users/icon/' + filename
        })
        .exec(function(err) {
            if (err) return res.sendStatus(500);
            res.json('/users/icon/' + filename);
        });
    });
})

module.exports = router;