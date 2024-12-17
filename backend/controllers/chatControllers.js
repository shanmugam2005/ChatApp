const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// Access or create a chat
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log('userId parameter not sent with request');
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        // Check if a chat already exists between the two users
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } }
            ]
        })
        .populate('users', '-password')
        .populate('latestMessage');

        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        });

        if (isChat.length > 0) {
            return res.status(200).send(isChat[0]);
        } else {
            // Create a new chat if it doesn't exist
            const chatData = {
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user._id, userId], // Correct property
            };

            const createdChat = await Chat.create(chatData);

            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate('users', '-password');

            return res.status(200).send(fullChat);
        }
    } catch (error) {
        console.error('Error accessing or creating chat:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


const fetchChats = asyncHandler(async (req, res) => {
    try {
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmit','-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        // Optional: Populate the sender of the latest message
        const fullChats = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        });

        res.status(200).send(fullChats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
    }
});

const createGroupChat=asyncHandler(async (req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"Please Fill all the fields"});
    }
    var users=JSON.parse(req.body.users)

    if(users.length<2){
        return res.status(400).send("More than 2 users are required to form a group chat")
    }
    
    users.push(req.user);
    try{
        const groupChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user
        })

        const fullGroupChat=await Chat.findOne({_id:groupChat.id})
           .populate("users","-password")
           .populate("groupAdmin","-password")
        res.status(200).json(fullGroupChat)
    }
    catch(error){
            res.status(400)
            throw new Error(error.message)
    }
});

const renameGroup=asyncHandler(async (req,res)=>{
    const {chatId,chatName}=req.body;
    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,{
            chatName,
        },
        {
            new:true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(!updatedChat){
        res.status(404);
        throw new Error("Chat not Found");
    }
    else{
        res.json(updatedChat)
    }
})

const addToGroup=asyncHandler(async (req,res)=>{
    const {chatId,userId}=req.body;
    const added=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId},
        },
        {new:true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(!added){
        res.status(404);
        throw new Error("Chat not Found");
    }
    else{
        res.json(added);
    }
})


const removeFromGroup=asyncHandler(async (req,res)=>{
    const {chatId,userId}=req.body;
    const removed=await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        {new:true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if(!removed){
        res.status(404);
        throw new Error("Chat not Found");
    }
    else{
        res.json(removed);
    }
})

module.exports = { fetchChats };

module.exports = { 
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup};
