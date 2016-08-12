'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors')
const logger = require('morgan');
const bodyParser = require('body-parser');

var app = express();

app.use(cors({
    allowedHeaders: ['Authorization', 'Content-Type'],
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

require('./rest')(app);
var server = http.createServer(app);
server.listen(3000);
