import chatMessages from '@/__mocks__/chatMessages';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';


const ChatPage =()=> {
    const params = useLocalSearchParams();
    const otherUser: User = {
    _id: parseInt(params._id as string),
    name: params.name as string,
    avatar: params.avatar as string,
  };
    const navigation = useNavigation();
    const allMessages = chatMessages;
    
  const currentUser: User = {
    _id: 1001,
    name: 'Rudra',
    avatar: 'https://avatar.iran.liara.run/public',
  }


  const [messages, setMessages] = useState<IMessage[]>([])

  useEffect(() => {

    const sortedMessages:IMessage[] = [];
    allMessages.forEach((message)=>{
        if(message.toId===currentUser._id && message.user._id===otherUser._id) sortedMessages.push(message);
    })

    setMessages(sortedMessages);
  }, [])

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    )
  }, [])

  return (
    <View style={{ flex: 1 ,backgroundColor:"rgb(232, 234, 237)"}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>◀</Text>
        </TouchableOpacity>
        <Image source={{ uri: otherUser.avatar as string }} style={styles.avatar} />


        <Text style={styles.username}>{otherUser.name}</Text>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        showUserAvatar
        showAvatarForEveryMessage
      />
    </View>
  )
}

export default ChatPage

const styles = StyleSheet.create({
    container:{

    },
  header: {
    height: 110,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop:50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },  
  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
})
