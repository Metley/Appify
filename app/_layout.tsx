import { SettingProvider, useSettingContext } from "@/lib/setting.context";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const AppContent = () => {
  const insets = useSafeAreaInsets();

  const { theme } = useSettingContext();

  return (
    <PaperProvider theme={theme}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen name="browser" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-homepage"
            options={{
              title: "Add",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="edit-homepage"
            options={{ title: "Edit", headerShown: false }}
          />
          <Stack.Screen
            name="setting"
            options={{ title: "Setting", headerShown: false }}
          />
        </Stack>
      </View>
    </PaperProvider>
  );
};

function RouteSetting({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingProvider>
        <GestureHandlerRootView>
          <RouteSetting>
            <AppContent />
          </RouteSetting>
        </GestureHandlerRootView>
      </SettingProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
