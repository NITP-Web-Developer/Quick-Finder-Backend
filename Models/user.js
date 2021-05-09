var mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = new schema({
    "name": {
        type: String
    },
    "sname": {
        type: String
    },
    "mobile": {
        type: Number
    },
    "address": {
        type: String
    },
    "chatid": {
        type: Object,
        default:{}
    }
});
const user = mongoose.model('Users', UserSchema);
module.exports = user;
