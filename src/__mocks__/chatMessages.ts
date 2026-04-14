const chatMessages = [
    {
        _id: 2,
        toId:1001,
        text: 'Hello I am Corenelius,nice to meet you',
        createdAt: new Date(),
        user:{
        _id: 1002,
        name: 'Cornelius',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
      },
      {
        _id: 3,
        toId:1001,
        text: 'Are you a Programmer?',
        createdAt: new Date(),
        user:{
        _id: 1003,
        name: 'Dingus',
        avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
        },
      },
      {
        _id: 4,
        toId:1001,
        text: 'You are great!!!',
        createdAt: new Date(),
        user:{
        _id: 1004,
        name: 'Earl',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        },
      },{
        _id: 5,
        toId:1002,
        text: 'You are great!!!',
        createdAt: new Date(),
        user:{
        _id: 1004,
        name: 'Earl',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        },
      },
]
export default chatMessages;