const express = require('express');
const { Socket } = require('socket.io');
const { RateLimiterMemory } = require('rate-limiter-flexible');

module.exports = function(io) {
    let router = express.Router();

    //for user-socket.id mapping 
    var users = {}; 

    io.on('connection', (socket) => { 

        //for ddos attack prevention
        const msgRateLimiter = new RateLimiterMemory({
            points: 3,  // 3 messages
            duration: 1 // per second
        });
        
        //current connection's user id
        var currentUserId; 

        //map user with socketid
        socket.on('map', (userId) => {
            currentUserId = userId
            users[socket.id] = userId
            console.log(userId,' connected')
        })

        //new message event
        socket.on("privateMessage", (data) => {

            msgRateLimiter.consume(socket.id) // consume 1 point per event
            .then(() => {
                var receiverSocketIds = []
                var senderOtherSocketIds = []

                //we get all the current socketIds of the receiver and the sender
                Object.keys(users).forEach((key) => { //key is the socket.id of the receiver

                    //for receiver
                    if(users[key] === data.receiverId){
                        receiverSocketIds.push(key)    
                    }

                    //for sender
                    if((users[key] === data.senderId) && (key !== socket.id)){
                        senderOtherSocketIds.push(key) 
                    }
                                    
                });

                
                //emit to all of the receiver sockets
                if(receiverSocketIds.length>0){
                    receiverSocketIds.forEach((socketId) => {
                        socket.to(socketId).emit("privateMessage", data);
                    })
                }
                
                //emit to the other sockets of the sender (px. open multiple tabs)
                if(senderOtherSocketIds.length>0){
                    senderOtherSocketIds.forEach((socketId) => {
                        socket.to(socketId).emit("myMessage", data);
                    })
                }
            })
            .catch(err => {
                console.log("Tooo many messages sent (DDoS prevention)")
            });
            
            
        })

        //disconnect
        socket.on('disconnect', () => {

            delete users[socket.id]; //remove from mapping
            console.log(currentUserId,'disconnected')
        });

    });

    return router;
}