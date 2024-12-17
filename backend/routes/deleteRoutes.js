const express = require('express');
const router = express.Router();
const Chat = require('../models/messageModel');
router.delete('/deleteChat/:id', async (req, res) => {
    const chatId = req.params.id;
    try {
        const deletedChat = await Chat.deleteMany({chat:chatId});
        if (!deletedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json({ message: 'Chat deleted successfully', deletedChat });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting chat', error });
    }
});

module.exports = router;
