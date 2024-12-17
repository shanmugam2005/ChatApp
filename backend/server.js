const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const { chats } = require('./data/data');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const messageRoutes = require('./routes/messageRoutes'); 
const deleteRoutes=require('./routes/deleteRoutes')
const path=require('path')

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
dotenv.config();
connectDB();

  
app.use(express.json());


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/message',messageRoutes);
app.use('/api/chat',deleteRoutes);

//-----------deployment-------------------------

const __dirname1=path.resolve();
if(process.env.NODE_ENV==="production"){
        app.use(express.static(path.join(__dirname1,"/frontend/build")))

        app.get("*",(req,res)=>{
            res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"))
        })       
}
else{
    app.get("/",(req,res)=>{
        res.send("API is Runnning Successfully");
    })

}
//-----------deployment----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server=app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

const io=require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000"
    }
})
io.on("connection",(socket)=>{
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        socket.emit('connected');
    })
    socket.on('join chat',(room)=>{
        socket.join(room);
    })

    socket.on('typing',(room)=>socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));

socket.on("new message",(newMessageReceived)=>{
    var chat=newMessageReceived.chat
    if(!chat.users)return console.log("chat.users not defined");
    chat.users.forEach((user)=>{
            if(user._id===newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received",newMessageReceived);
    })
})

    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
})