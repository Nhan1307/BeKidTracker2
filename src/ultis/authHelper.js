import AsyncStorage from "@react-native-async-storage/async-storage";

import { useDispatch } from "react-redux";
import { addAuth } from "../redux/reducers/authReducer";

export const getToken = async (dispatch) => {
  try {
    const res = await AsyncStorage.getItem("auth");
    if (res) {
      const parsedRes = JSON.parse(res);
      dispatch(addAuth(parsedRes));
      return parsedRes.accesstoken; // Trả về token
    }
    return null; // Trả về null nếu không có token
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};
