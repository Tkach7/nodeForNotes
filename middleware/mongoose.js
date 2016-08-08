var mongoose = require('mongoose');
var config = require('../conf/settings.json');

mongoose.connect(config.mongoose.server + config.mongoose.db);

module.exports = mongoose;