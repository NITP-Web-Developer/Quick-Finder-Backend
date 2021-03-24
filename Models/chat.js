const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chat = new Schema({
    chatid:{
        type:String,
    },
    mesDetails:Array
});

const chat = mongoose.model('chats', Chat);
module.exports=chat
