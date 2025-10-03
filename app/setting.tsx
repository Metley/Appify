import { useSettingContext } from "@/lib/setting.context";
import { HomePage } from "@/types/homepage.context";
import {
  Setting,
  SortPrefrence,
  ThemePreference,
} from "@/types/setting.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  RadioButton,
  SegmentedButtons,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setThemePreference } = useSettingContext();

  const [themeMode, setThemeMode] = useState<ThemePreference>("System");
  const [originalThemeMode, setOriginalThemeMode] =
    useState<ThemePreference>("System");

  const [headerMode, setHeaderMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<string>("App");
  const [sortPrefrence, setSortPrefrence] = useState<SortPrefrence>("CUSTOM");

  const [homepageList, setHomepageList] = useState<HomePage[]>([]);
  const [appSetting, setAppSetting] = useState<Setting>();

  useEffect(() => {
    fetchHomepages();
    fetchAppSetting();

    const backAction = () => {
      setThemePreference(originalThemeMode);

      router.navigate("/");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const fetchHomepages = async () => {
    try {
      const currentList = JSON.parse(
        (await AsyncStorage.getItem("homepage-list")) || "[]"
      );
      setHomepageList(currentList);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAppSetting = async () => {
    try {
      const appSettingStorage = await AsyncStorage.getItem("setting");
      if (appSettingStorage !== null) {
        const appSetting = JSON.parse(appSettingStorage);
        setAppSetting(appSetting);
        setThemeMode(appSetting.theme);
        setOriginalThemeMode(appSetting.theme);
        setHeaderMode(appSetting.navBar);
        setViewMode(appSetting.viewStyle);
        setSortPrefrence(appSetting.sortPrefrence);
      } else {
        console.log("Failed to retrieve setting");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveUp = ({ homepage }: { homepage: HomePage }) => {
    if (homepage.custom_position !== 0) {
      const currentList: HomePage[] = [...homepageList];

      const currentIndex = homepageList.indexOf(homepage);

      const swapItem = homepageList.filter(
        (item) => item.custom_position === homepage.custom_position - 1
      );

      const swapIndex = homepageList.indexOf(swapItem[0]);

      currentList[currentIndex].custom_position = homepage.custom_position - 1;
      currentList[swapIndex].custom_position = swapItem[0].custom_position + 1;
      setHomepageList(currentList);
    }
  };

  const moveDown = ({ homepage }: { homepage: HomePage }) => {
    if (homepage.custom_position !== homepageList.length - 1) {
      const currentList: HomePage[] = [...homepageList];

      const currentIndex = homepageList.indexOf(homepage);

      const swapItem = homepageList.filter(
        (item) => item.custom_position === homepage.custom_position + 1
      );

      const swapIndex = homepageList.indexOf(swapItem[0]);

      currentList[currentIndex].custom_position = homepage.custom_position + 1;
      currentList[swapIndex].custom_position = swapItem[0].custom_position - 1;
      setHomepageList(currentList);
    }
  };

  const ListItem = ({ homepage }: { homepage: HomePage }) => (
    <View style={styles.cardView}>
      <Text numberOfLines={1} style={styles.cardTitle}>
        {homepage.name}
      </Text>
      <IconButton
        disabled={homepage.custom_position === 0}
        style={styles.cardIcon}
        icon="arrow-up"
        onPress={() => moveUp({ homepage })}
      />

      <IconButton
        disabled={homepage.custom_position === homepageList.length - 1}
        style={styles.cardIcon}
        icon="arrow-down"
        onPress={() => moveDown({ homepage })}
      />
    </View>
  );

  const saveSetting = async () => {
    try {
      const newAppSetting: Setting = {
        theme: themeMode,
        navBar: headerMode,
        viewStyle: viewMode,
        sortPrefrence: sortPrefrence,
      };
      await AsyncStorage.setItem("setting", JSON.stringify(newAppSetting));
      await AsyncStorage.setItem("homepage-list", JSON.stringify(homepageList));
      setThemePreference(themeMode);
      router.navigate("/");
    } catch (error) {
      console.error("Saving Setting Error", error);
    }
  };

  const sortedHomepageList = homepageList.sort(function (
    a: HomePage,
    b: HomePage
  ) {
    return a.custom_position - b.custom_position;
  });

  const currentTheme = (settingTheme: ThemePreference) => {
    setThemeMode(settingTheme);
    setThemePreference(settingTheme);
  };

  const cancelSetting = () => {
    setThemePreference(originalThemeMode);

    router.navigate("/");
  };

  return (
    <>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={cancelSetting} />
          <Appbar.Content title="Setting" />
        </Appbar.Header>
        <ScrollView style={{ marginBottom: 20 }}>
          <View>
            <Text style={styles.sectionTitle} variant="displaySmall">
              Apperance
            </Text>
            <Divider />

            <Text style={styles.sectionSubTitle} variant="titleMedium">
              UI Theme:
            </Text>
            <SegmentedButtons
              value={themeMode}
              onValueChange={(current) =>
                currentTheme(current as ThemePreference)
              }
              buttons={[
                {
                  value: "System",
                  label: "System",
                },
                {
                  value: "Dark",
                  label: "Dark",
                },
                {
                  value: "Light",
                  label: "Light",
                },
              ]}
            />

            <Text style={styles.sectionSubTitle} variant="titleMedium">
              Navigation:
            </Text>
            <View style={styles.navButtonView}>
              <Switch
                value={headerMode}
                onValueChange={() => setHeaderMode(!headerMode)}
              />
              <Text variant="titleMedium">
                Top Navigation Bar in Browser Window
              </Text>
            </View>

            <Text style={styles.sectionSubTitle} variant="titleMedium">
              View Style:
            </Text>
            <SegmentedButtons
              value={viewMode}
              onValueChange={setViewMode}
              buttons={[
                {
                  value: "App",
                  label: "App",
                },
                {
                  value: "List",
                  label: "List",
                },
              ]}
            />
          </View>
          <Text style={styles.sectionTitle} variant="displaySmall">
            Sorting
          </Text>
          <Divider />
          <Text style={styles.sectionSubTitle} variant="titleMedium">
            Default Sorting Preference:
          </Text>

          <RadioButton.Group
            onValueChange={(newValue: string) =>
              setSortPrefrence(newValue as SortPrefrence)
            }
            value={sortPrefrence}
          >
            <View style={styles.radioRowView}>
              <RadioButton value="CUSTOM" />
              <Text>Custom</Text>
            </View>
            <View style={styles.radioRowView}>
              <View style={styles.radioButtonView}>
                <RadioButton value="ADDED - ASCENDING" />
                <Text>Added - Ascending</Text>
              </View>
              <View style={styles.radioButtonView}>
                <RadioButton value="ADDED - DESCENDING" />
                <Text>Added - Descending</Text>
              </View>
            </View>
            <View style={styles.radioRowView}>
              <View style={styles.radioButtonView}>
                <RadioButton value="NAME - ASCENDING" />
                <Text>Name - Ascending</Text>
              </View>
              <View style={styles.radioButtonView}>
                <RadioButton value="NAME - DESCENDING" />
                <Text>Name - Descending</Text>
              </View>
            </View>
          </RadioButton.Group>

          <Text style={styles.sectionSubTitle} variant="titleMedium">
            Custom:
          </Text>
          <FlatList
            numColumns={1}
            data={sortedHomepageList}
            renderItem={({ item }) => <ListItem homepage={item} />}
            scrollEnabled={false}
          />
        </ScrollView>
        <View style={styles.buttonView}>
          <Button mode="outlined" style={styles.button} onPress={cancelSetting}>
            Cancel
          </Button>
          <Button mode="contained" style={styles.button} onPress={saveSetting}>
            Save
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 4,
    marginLeft: 4,
    marginTop: 16,
  },
  sectionSubTitle: {
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  description: {},
  cardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    margin: 2,
  },
  cardIcon: {},
  cardTitle: {
    width: "50%",
  },
  navButtonView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  buttonView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    width: "50%",
    height: 50,
    justifyContent: "center",
    alignContent: "center",
  },
  radioRowView: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButtonView: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
  },
});
