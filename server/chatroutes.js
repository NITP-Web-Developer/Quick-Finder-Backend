const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const Chat = require("../Models/chat");

router.get('/prevchats/:userid',async (req,res)=>{
    const userid = req.params.userid
    console.log("userid ", userid);

    await User.findOne({ _id: userid }).then(result => {
        console.log("result ", result, "userid ", userid);
        res.json({ result })
    })
})

router.get('/alluser', async (req, res) => {
    await User.find().then(result => {
        // console.log(result);
        res.json({ result })
    })
})

router.get('/getchat/:chatid',async(req,res)=>{
    await Chat.findOne({chatid:req.params.chatid}).then(result=>{
        res.json({[req.params.chatid]:result})
    })
})

module.exports=router