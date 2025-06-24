import { Dimensions } from "react-native";

export const appInfo = {
  size: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  //BASE_URL: "http://localhost:3000",
  BASE_URL: "https://childschedulemanagement-server.onrender.com", // Sử dụng server online để iOS gọi được API
  // BASE_URL: "http://192.168.1.27:3000",
  //   BASE_URL: "http://10.0.2.2:3000",
  //   192.168.1.133:8081
};
