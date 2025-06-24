// RankingChild: displays monthly totalScore rankings from backend
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import HeaderScreen from "../../components/header/HeaderScreen";
import { DataTable, PaperProvider } from "react-native-paper";
import { useDispatch } from "react-redux";
import { appInfo } from "../../constants/appInfos";
import { getToken } from "../../ultis/authHelper";

const RankingChild = () => {
  const [isChartView, setIsChartView] = useState(true);
  const [animatedData, setAnimatedData] = useState([]);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const medals = {
    0: require("../../img/imgTab/gold.png"),
    1: require("../../img/imgTab/silver.png"),
    2: require("../../img/imgTab/bronze.png"),
  };

  // Fetch rankingData from API once
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const token = await getToken(dispatch);
        if (!token) return;
        const res = await fetch(`${appInfo.BASE_URL}/api/rankings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setRankingData(json.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy bảng xếp hạng:", error.message);
        Alert.alert("Lỗi", "Không thể tải bảng xếp hạng");
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  // Sort by totalScore descending
  const sortedRanking = React.useMemo(
    () => [...rankingData].sort((a, b) => b.totalScore - a.totalScore),
    [rankingData]
  );

  const rowColors = ["#F5DC4D", "#FFA726", "#4FC3F7", "#90A4AE"];

  // Animate bars only when chart view toggles
  useEffect(() => {
    if (!isChartView) return;
    const anims = sortedRanking.map(() => new Animated.Value(0));
    setAnimatedData(anims);
    setTimeout(() => {
      Animated.stagger(
        200,
        anims.map((value, i) =>
          Animated.timing(value, {
            toValue: sortedRanking[i]?.totalScore || 0,
            duration: 800,
            useNativeDriver: false,
          })
        )
      ).start();
    }, 100);
  }, [isChartView, sortedRanking]);

  // Chart scale based on max totalScore
  const maxScore = sortedRanking.length
    ? Math.max(...sortedRanking.map((r) => r.totalScore))
    : 1;

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {sortedRanking.map((item, index) => {
        const height = animatedData[index]?.interpolate({
          inputRange: [0, maxScore],
          outputRange: [0, 220],
          extrapolate: "clamp",
        });
        const isTopThree = index < 3;
        return (
          <View key={item.childId} style={styles.barItem}>
            {isTopThree && (
              <Image source={medals[index]} style={styles.medalIcon} />
            )}
            <View style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor:
                      rowColors[index] || rowColors[rowColors.length - 1],
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Animated.Text style={styles.barScore}>
                  {Math.round(item.totalScore)}
                </Animated.Text>
              </Animated.View>
            </View>
            <Text style={styles.barName}>{item.childName}</Text>
          </View>
        );
      })}
    </View>
  );

  // Animated row for table
  const AnimatedRow = ({ item, index, medalIcon, backgroundColor }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <DataTable.Row style={{ backgroundColor, height: 70 }}>
          <DataTable.Cell style={styles.cellRank}>
            {medalIcon && <Image source={medalIcon} style={styles.medalIcon} />}
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellName}>
            <Text style={styles.cellText}>{item.childName}</Text>
          </DataTable.Cell>
          <DataTable.Cell numeric style={styles.cellScore}>
            <Text style={styles.cellText}>{item.totalScore}</Text>
          </DataTable.Cell>
        </DataTable.Row>
      </Animated.View>
    );
  };

  const renderTable = () => (
    <DataTable>
      <DataTable.Header style={styles.tableHeader}>
        <DataTable.Title style={styles.cellRank}>
          <Text style={styles.headerText}>Hạng</Text>
        </DataTable.Title>
        <DataTable.Title style={styles.cellName}>
          <Text style={styles.headerText}>Họ và tên bé</Text>
        </DataTable.Title>
        <DataTable.Title numeric style={styles.cellScore}>
          <Text style={styles.headerText}>Điểm</Text>
        </DataTable.Title>
      </DataTable.Header>
      <ScrollView>
        {sortedRanking.map((item, index) => (
          <AnimatedRow
            key={item.childId}
            item={item}
            index={index}
            backgroundColor={rowColors[index] || "white"}
            medalIcon={medals[index]}
          />
        ))}
      </ScrollView>
    </DataTable>
  );

  if (loading) {
    return (
      <PaperProvider>
        <HeaderScreen title="Bảng Xếp Hạng" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Đang tải...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <HeaderScreen title="Bảng Xếp Hạng" />
      <View style={styles.bannerContainer}>
        <Image
          source={require("../../img/imgTab/bannerRanking.png")}
          style={styles.banner}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../img/imgTab/rankingChild.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.chartOrTableContainer}>
          {isChartView ? renderBarChart() : renderTable()}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setIsChartView(!isChartView)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {isChartView ? "Xem dạng bảng" : "Xem dạng cột"}
          </Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
};

export default RankingChild;

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: { width: "65%", height: "65%", resizeMode: "contain" },
  contentContainer: { flex: 7, paddingBottom: 10 },
  logoContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: "80%", height: "80%", resizeMode: "contain" },
  chartOrTableContainer: { flex: 2, justifyContent: "flex-end" },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  barItem: { alignItems: "center", marginHorizontal: 10 },
  medalIcon: { width: 45, height: 45, marginBottom: 6, resizeMode: "contain" },
  barWrapper: { flex: 1, justifyContent: "flex-end" },
  bar: { width: 60, borderRadius: 6 },
  barName: { marginTop: 8, fontSize: 16, textAlign: "center" },
  barScore: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  tableHeader: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#d0d0d0",
  },
  cellRank: { flex: 0.5, borderRightWidth: 1, borderColor: "#d0d0d0" },
  cellName: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#d0d0d0",
  },
  cellScore: { flex: 0.7, alignItems: "center", justifyContent: "center" },
  cellText: { fontSize: 17 },
  headerText: { fontWeight: "bold", fontSize: 15 },
  buttonContainer: { flex: 2, justifyContent: "center", alignItems: "center" },
  button: {
    backgroundColor: "#2ecc71",
    width: "80%",
    height: 55,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 20, color: "#fff", fontWeight: "bold" },
});
