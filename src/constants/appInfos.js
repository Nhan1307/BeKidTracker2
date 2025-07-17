import { Dimensions } from "react-native";

export const appInfo = {
  size: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

BASE_URL : "http://192.168.111.5:3000/",
 
  //BASE_URL: "http://localhost:3000",
  //BASE_URL: "https://e51d-2001-ee0-4fd4-5ad0-5027-30d8-2358-1a4c.ngrok-free.app", // Sử dụng server ngrok để mobile gọi được API
  // BASE_URL: "http://192.168.1.27:3000",
  //   BASE_URL: "http://10.0.2.2:3000",
  //   192.168.1.133:8081
};
