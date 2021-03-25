const Chat = require('../Models/chat')
const User = require('../Models/user')
const users = {}
const Chatting = (http) => {
    const io = require('socket.io')(http, { 'transports': ['websocket', 'polling'] });
    // console.log(http);
    console.log('chat');
    io.on('connection', socket => {
        console.log("Connected");


        socket.on('join', ({ userid, chatid }) => {
            // console.log("join userid chatid", userid, chatid);
            users[userid] = true;
            socket.join(chatid);
            socket.broadcast.emit('online', users);
            socket.emit('friendsonline', users)

            socket.on('disconnect', () => {
                // console.log("Disconnected ", chatid, userid);
                socket.leave(chatid)
                users[userid] = false
                console.log(users);
                socket.broadcast.emit('disconnected', userid)
            })
        })

        socket.on('getchat', ({ chatid }) => {
            Chat.findOne({ chatid: chatid }).then(res => {
                if (res !== null) {
                    socket.emit('started', res.mesDetails)
                }
            })
        })

        socket.on('newchat', ({ userid, chatid, chattingwith }) => {
            console.log('newchat', userid, chatid, chattingwith);
            User.updateOne({ _id: userid },
                {
                    $set: {
                        ["chatid." + chatid]: true
                    }
                }, { upsert: true }).then((result) => {
                    //console.log(result)
                })

            User.updateOne({ _id: chattingwith },
                {
                    $set: {
                        ["chatid." + chatid]: true
                    }
                }, { upsert: true }).then((result) => {
                })

            Chat.findOne({ chatid: chatid }).then(res => {
                if (res === null) {
                    const chat = new Chat({ chatid: chatid })
                    chat.save().then(res => {
                    })
                }
            })
        })

        socket.on('type', ({ userid, chatid }) => {
            // console.log('typing', userid, chatid);
            socket.broadcast.to(chatid).emit('typing', { userid, chatid });
        })

        socket.on('send', ({ mes, id, chatId, type }) => {
            // console.log('send', mes, id, chatId, type);
            var d = new Date(Date.now());

            var chatDocument = {
                message: mes,
                userid: id,
                type: type,
                datetime: {
                    date: d.toDateString().toString(),
                    time: d.toTimeString().toString()
                }
            }

            var datetime = chatDocument.datetime

            Chat.updateOne({ chatid: chatId },
                {
                    $push: {
                        mesDetails:
                        {
                            $each: [chatDocument]
                        }
                    }
                }, { upsert: true }).then(() => {
                    // console.log('user onnline');
                    socket.broadcast.to(chatId).emit('receive', { mes, id, datetime, type, chatId });
                })
        })
    })
}

module.exports = Chatting