import UserCard from "@/features/profile/components/UserCard";
import chatUserData from "@/__mocks__/chatUserData";
import { useNavigation } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "react-native-gifted-chat";

const ChatMenu = () => {
  const users:User[] = chatUserData;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backArrow}>
      ◀</Text>
              </TouchableOpacity>
        <Text style={styles.topBarText}>Messages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {users.map((user, index) => (
          <UserCard key={index} _id={user._id} name={user.name} avatar={user.avatar} />
        ))}
      </ScrollView>
    </View>
  );
};

export default ChatMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  topBar: {
    paddingTop:60,
    flexDirection:"row",

    height: 100,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topBarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  list: {
    paddingTop: 8,
  },
  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
});
