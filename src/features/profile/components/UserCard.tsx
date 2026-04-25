import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from 'react-native-gifted-chat';



const UserCard = (user: User) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => {
      router.push({
        pathname: "/chat/conversation",
        params: {
          _id: user._id.toString(),
          name: user.name,
          avatar: user.avatar?.toString(),
        }
      });
    }}>
      <Image source={{ uri: user.avatar as string }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{user.name}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default UserCard

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
})