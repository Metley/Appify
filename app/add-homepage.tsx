import { HomePage } from "@/types/homepage.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddHomepageScreen() {
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [errorImageMessage, setErrorImageMessage] = useState<string>("");
  const [errorNameMessage, setErrorNameMessage] = useState<string>("");
  const [errorUrlMessage, setErrorUrlMessage] = useState<string>("");
  const [debugMessage, setDebugMessage] = useState("");

  const router = useRouter();
  const theme = useTheme();

  const handleChangeName = (input: string) => {
    setName(input);
    if (input.length <= 0) {
      setErrorNameMessage("Name field required");
    } else {
      setErrorNameMessage("");
    }
  };

  const handleChangeUrl = (input: string) => {
    setUrl(input);
    if (input.slice(0, 7) === "http://" || input.slice(0, 8) === "https://") {
      handleFetchImage(input);
      setErrorUrlMessage("");
    } else {
      setErrorUrlMessage("URL must start with http:// or https://");
    }
  };

  const checkContentType = (input: string) => {
    if (!input) return false;
    if (input.includes("image")) return true;
    if (input.includes("icon")) return true;
    return false;
  };

  const handleFetchImage = async (input: string) => {
    if (!input) return;
    setDebugMessage("");
    try {
      const response = await fetch(input.toLowerCase() + "/favicon.ico");
      const contentType = (
        response.headers.get("content-type") || ""
      ).toLowerCase();
      // Check if response content-type is image or icon
      if (checkContentType(contentType)) {
        setImage(input.toLowerCase() + "/favicon.ico");
        setErrorImageMessage("");
      } else {
        setImage(
          "https://img.icons8.com/?size=100&id=j1UxMbqzPi7n&format=png&color=000000"
        );
        setErrorImageMessage("Favicon not found because of Content-Type");
      }

      // Skip Content-Type check
      // setImage(input.toLowerCase() + "/favicon.ico");
      // setErrorImageMessage("");
    } catch (error) {
      setImage(
        "https://img.icons8.com/?size=100&id=j1UxMbqzPi7n&format=png&color=000000"
      );
      setErrorImageMessage("Favicon not found");
      setDebugMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const handleAddHomepage = async () => {
    if (!name || !url || !image) return;

    try {
      const currentList = JSON.parse(
        (await AsyncStorage.getItem("homepage-list")) || "[]"
      );
      const custom_position: number = currentList.length || 0;
      const created_at: string = new Date().toISOString();
      const addObject: HomePage = {
        name,
        url,
        image,
        custom_position,
        created_at,
      };

      const newList: HomePage[] = [...currentList, addObject];
      await AsyncStorage.setItem("homepage-list", JSON.stringify(newList));
    } catch (error) {
      console.error(error);
    }

    router.navigate("/");
  };

  const handleCancelHomepage = () => {
    router.navigate("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.navigate("/")} />
        <Appbar.Content title="Add Homepage" />
      </Appbar.Header>
      <View style={styles.imageContainer}>
        <Image src={image} width={100} height={100} style={styles.image} />
        <HelperText type="error">{errorImageMessage}</HelperText>
        {/* <Text>{debugMessage}</Text> */}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Name"
          onChangeText={(input) => handleChangeName(input)}
          style={styles.input}
        />
        <TextInput
          label="URL"
          placeholder="http://"
          onChangeText={(input) => handleChangeUrl(input.toLowerCase())}
          autoCapitalize="none"
        />
        <HelperText type="error">
          {errorNameMessage} {errorUrlMessage}
        </HelperText>
        <View>
          <Button
            mode="contained"
            onPress={handleAddHomepage}
            disabled={errorNameMessage.length > 0 || errorUrlMessage.length > 0}
            style={styles.button}
          >
            Add
          </Button>
          <Button
            mode="outlined"
            onPress={handleCancelHomepage}
            style={styles.button}
          >
            Cancel
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  imageContainer: {
    padding: 16,
    alignItems: "center",
  },
  image: {
    height: 100,
    width: 100,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
});
