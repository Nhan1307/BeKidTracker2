import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../../SplashScreen/SplashScreen";
import { useState } from "react";
import { useEffect } from "react";
import {
  RequestResetPassword,
  ResetPassword,
  SignIn,
  SignUp,
  Verification,
} from "../view/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { authSelector, addAuth } from "../redux/reducers/authReducer";
import HomeScreen from "../view/tabScreen/HomeScreen";
import AccountScreen from "../view/tabScreen/AccountScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ChatBotAI, UserManagementScreen } from "../view/tabScreen";
import { Ionicons } from "@expo/vector-icons";
import { AddSchedule, ScheduleScreen ,UpdateSchedule} from "../view/schedule";
import { ActivitiesScreen, AddActivities ,UpdateActivities} from "../view/activities";
import { AddChildren, Children ,UpdateChildren} from "../view/children";
import FollowAndEvaluation from "../view/followAndEvaluation/FollowAndEvaluation";
import RankingChild from "../view/ranking/RankingChild";
import InformationOfUser from "../view/informationOfUser/InformationOfUser";
import DevelopThinking from "../view/developThinking/DevelopThinking";
import AddDevelopThinking from "../view/developThinking/AddDevelopThinking";

import SuccessScreen from '../view/payment/SuccessScreen';
import FailScreen from '../view/payment/FailScreen';
import PayOSPaymentScreen from '../view/payment/PayOSPaymentScreen';
import PaymentScreen from '../view/payment';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthenNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Verification"
        component={Verification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RequestResetPassword"
        component={RequestResetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TabNavigationContainer = () => {
  const auth = useSelector(authSelector);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="home-outline" size={size} color={color} />;
          },
          headerShown: false,
        }}
      />
      {/* <Tab.Screen
        name="ManageScreen"
        component={ManageScreen}
        options={{
          tabBarLabel: "Quản lý",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="reader-outline" size={size} color={color} />;
          },
          headerShown: false,
        }}
      /> */}
      {/* chatbot */}
      <Tab.Screen
        name="ChatBotAI"
        component={ChatBotAI}
        options={{
          tabBarLabel: "ChatBot",
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            );
          },
          headerShown: false,
        }}
      />


      {auth.role === "admin" && (
        <Tab.Screen
          name="ManageUser"
          component={ManageUser}
          options={{
            tabBarLabel: "QL Người Dùng",
            tabBarIcon: ({ color, size }) => {
              return <Ionicons name="people-outline" size={size} color={color} />;
            },
            headerShown: false,
          }}
      />
      )}
      

      <Tab.Screen
        name="Account"
        component={AccountNavigation}
        options={{
          tabBarLabel: "Tài khoản",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="person-outline" size={size} color={color} />;
          },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const ManageUser = () => {
  return (
    <Stack.Navigator>
      {/* {auth.role === "admin" && (
       
      )} */}
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InformationOfUser"
        component={InformationOfUser}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ScheduleNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddSchedule"
        component={AddSchedule}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateSchedule"
        component={UpdateSchedule}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ActivitiesNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ActivitiesScreen"
        component={ActivitiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddActivities"
        component={AddActivities}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateActivities"
        component={UpdateActivities}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const DevelopThinkingNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DevelopThinking"
        component={DevelopThinking}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddDevelopThinking"
        component={AddDevelopThinking}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AccountNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ChildrenNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Children"
        component={Children}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddChildren"
        component={AddChildren}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateChildren"
        component={UpdateChildren}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TabNavigationContainer"
        component={TabNavigationContainer}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ScheduleNavigation"
        component={ScheduleNavigation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ActivitiesNavigation"
        component={ActivitiesNavigation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ChildrenNavigation"
        component={ChildrenNavigation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="FollowAndEvaluation"
        component={FollowAndEvaluation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RankingChild"
        component={RankingChild}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DevelopThinkingNavigation"
        component={DevelopThinkingNavigation}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FailScreen"
        component={FailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PayOSPaymentScreen"
        component={PayOSPaymentScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const NavigationStack = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const { getItem } = useAsyncStorage("auth");

  const auth = useSelector(authSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    checkLogin();

    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const checkLogin = async () => {
    const res = await getItem();
    // console.log("res checkLogin :", res);

    if (res) {
      dispatch(addAuth(JSON.parse(res)));
      console.log("res :", res);
    } else {
      // Xử lý trường hợp không tìm thấy thông tin đăng nhập
    }
  };

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : auth.accesstoken ? (
        <MainNavigator />
      ) : (
        <AuthenNavigation />
      )}
      {/* <MainNavigator /> */}
    </>
  );
};

export default NavigationStack;
