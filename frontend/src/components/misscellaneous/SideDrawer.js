import React, { useState } from 'react'
import { Box, Button, Tooltip ,Text, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast} from '@chakra-ui/react'
import {Spinner} from "@chakra-ui/spinner"
import {BellIcon, ChevronDownIcon} from "@chakra-ui/icons"
import { Avatar } from '@chakra-ui/avatar'
import { ChatState } from '../../Context/CheckProvider'
import ProfileModel from './ProfileModel'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/hooks'
import axios from 'axios'
import ChatLoading from '../ChatLoading'
import UserListItem from '../UserAvatar/UserListItem'
import { getSender } from '../../config/chatLogics'
import {Effect} from 'react-notification-badge'
import NotificationBadge from 'react-notification-badge';


const SideDrawer = () => {
  const [search,setSearch]=useState("")
  const [searchResult,setSearchResult]=useState([])
  const [loading,setLoading]=useState(false)
  const [loadingChat,setLoadingChat]=useState()
  const { user, setSelectedChat, chats, setChats, notification, setNotification }=ChatState()
  const navigate=useNavigate()
  const toast=useToast()
  const logoutHandler=()=>{
    localStorage.removeItem('userInfo')
    navigate('/')
  }
  const { isOpen, onOpen, onClose } = useDisclosure()

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
  
      const config = {
        headers: {
          "Content-type":" application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
  
      const { data } = await axios.post("/api/chat",{userId}, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
    } catch (error) {
      toast({
        title: "Error fetching the Chat",
        description: error.response?.data?.message || error.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } finally {
      setLoadingChat(false);
      onClose();
    }
  };
  
    const handleSearch=async ()=>{
      if(!search){
        toast({
          title:"Please Enter something in search",
          status:"warning",
          duration:5000,
          isClosable:true,
          position:"top-left",
        })
      }


      try{
               setLoading(true)
               const config={
                headers:{
                  Authorization:`Bearer ${user.token}`
                },
               }
               const {data}=await axios.get(`/api/user?search=${search}` ,config)
               setLoading(false)
               setSearchResult(data)

      }
      catch(error){
        toast({
          title:"Error Occured",
          description:"Failed to load the Search Results",
          status:"warning",
          duration:5000,
          isClosable:true,
          position:"bottom-left",
        })
      }
    }
  return (
    <div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
          <Tooltip label="Search Users to chat" hasArrow placement='bottom-end'>
               <Button variant='ghost' onClick={onOpen}>
               <i class="fa-solid fa-magnifying-glass"></i>
               <Text d={{base:"none",md:'flex'}} px='4'>
                Search User
               </Text>
               </Button>
          </Tooltip>
          <Text fontSize="2xl"  fontFamily="work sans">Share To Frnds</Text>
          <div> 
          <Menu>
            <MenuButton p={1}>
            <NotificationBadge
              count={notification.length}
              effect={Effect.SCALE}
            />
            <BellIcon fontSize="2xl" m={1}/>
            </MenuButton><MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={()=>{
                  setSelectedChat(notif.chat)
                  setNotification(notification.filter((n)=> n!==notif));
                }}>
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>


          </Menu>
          <Menu>
            
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}/>
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                
              <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider/>
              <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
            </MenuList>
          </Menu>
          </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay>
              <DrawerContent>
                <DrawerHeader borderBottomWidth='1px'>
                        Search Users
                </DrawerHeader>
                
                <DrawerBody>
                    <Box
                    display="flex"
                    pb={2}
                    >
                       <Input 
                       placeholder='Search by name or email'
                       mr={2}
                       value={search}
                       onChange={(e)=>setSearch(e.target.value)}

                       />
                        <Button 
                        onClick={handleSearch}
                        >Go</Button>
                       
                       


                    </Box>
                    {loading?(<ChatLoading/>):(searchResult?.map(user=>(
                      <UserListItem
                         key={user._id}
                         user={user}
                         handleFunction={()=>accessChat(user._id)}
                      />
                    )))}

                  {loadingChat  && <Spinner ml="auto" display="flex"/>}

                </DrawerBody>
              </DrawerContent>
            </DrawerOverlay>
      </Drawer>

    </div>
  )
}

export default SideDrawer