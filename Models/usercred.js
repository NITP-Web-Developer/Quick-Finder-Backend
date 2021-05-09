var mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserCred = new schema({
    "password": {
        type: String
    },
    "email": {
        type: String
    },
    "activated": {
        type: Boolean,
        default: false
    },
});
const usercred = mongoose.model('usercred', UserCred);
module.exports = usercred;
