import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useContext } from "react";
import themeContext from "../../../context/themeContext";
import { Subjects } from "../../../api/apiHome";
import { useNavigation } from "@react-navigation/native";

const Subject = () => {
  const navigation = useNavigation();
  const theme = useContext(themeContext);

  const handleNavigationSubjects = (id) => {
    switch (id) {
      case 1:
        navigation.navigate("ScheduleNavigation");
        break;
      case 2:
        navigation.navigate("ActivitiesNavigation");
        break;
      case 3:
        navigation.navigate("FollowAndEvaluation");
        break;
      case 4:
        navigation.navigate("DevelopThinkingNavigation");
        break;
      case 5:
        navigation.navigate("ChildrenNavigation");
        break;
      case 6:
        navigation.navigate("RankingChild");
        break;
      default:
        navigation.navigate("Home");
        break;
    }
  };

  const listSubjects = ({ item }) => (
    <View
      style={{
        width: 130,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
      }}
    >
      <TouchableOpacity onPress={() => handleNavigationSubjects(item.id)}>
        <Image
          source={item.image}
          style={{ width: 55, height: 55, resizeMode: "contain" }}
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 16,
          marginTop: 5,
          textAlign: "center",
          color: theme.color,
        }}
      >
        {item.name}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            marginLeft: 17,
            color: theme.color,
          }}
        >
          Chức năng
        </Text>
      </View>
      <View style={{ flex: 9 }}>
        <FlatList
          keyExtractor={(item) => item.id}
          numColumns={3}
          horizontal={false}
          renderItem={listSubjects}
          data={Subjects}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

export default Subject;

const styles = StyleSheet.create({});
