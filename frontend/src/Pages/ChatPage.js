import { useState } from "react";
import ChatBox from "../components/misscellaneous/ChatBox";
import MyChat from "../components/misscellaneous/MyChat";
import SideDrawer from "../components/misscellaneous/SideDrawer";
import { ChatState } from "../Context/CheckProvider";
import { Box } from "@chakra-ui/react";

const ChatPage = () => {

  const {user}=ChatState() 
  const [fetchAgain,setfetchAgain]=useState(false)


  return (
    <div style={{width:"100%"}}>
      {user && <SideDrawer/>}
      <Box
          display="flex"
          justifyContent="space-between"
          p="10px"
          h="91.5vh"
          w="100%"
      >
         {user && <MyChat fetchAgain={fetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />}

      </Box>
    </div>
  );
};

export default ChatPage;
