import { HomePage } from "@/types/homepage.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  HelperText,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function AddHomepageScreen() {
  const [editName, setEditName] = useState<string>("");
  const [editUrl, setEditUrl] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [errorImageMessage, setErrorImageMessage] = useState<string>("");
  const [errorNameMessage, setErrorNameMessage] = useState<string>("");
  const [errorUrlMessage, setErrorUrlMessage] = useState<string>("");

  const router = useRouter();
  const theme = useTheme();

  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const { url, name, custom_position } = useLocalSearchParams<{
    url: string;
    name: string;
    custom_position: string;
  }>();

  useEffect(() => {
    setEditName(name);
    setEditUrl(url);
    handleFetchImage(url);
  }, [name, url]);

  const handleChangeName = (input: string) => {
    setEditName(input);
    if (input.length <= 0) {
      setErrorNameMessage("Name field required");
    } else {
      setErrorNameMessage("");
    }
  };

  const handleChangeUrl = (input: string) => {
    setEditUrl(input);
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
        setErrorImageMessage("Favicon not found");
      }
    } catch (error) {
      setImage(
        "https://img.icons8.com/?size=100&id=j1UxMbqzPi7n&format=png&color=000000"
      );
      setErrorImageMessage("Favicon not found");
    }
  };

  const handleSaveHomepage = async () => {
    if (!editName || !editUrl || !image) return;

    try {
      const currentList = JSON.parse(
        (await AsyncStorage.getItem("homepage-list")) || "[]"
      );

      const oldObject = currentList.filter(
        (homepage: HomePage) =>
          homepage.custom_position === parseInt(custom_position)
      );

      const addObject: HomePage = {
        name: editName,
        url: editUrl,
        image,
        custom_position: oldObject[0].custom_position,
        created_at: oldObject[0].created_at,
      };

      const alterList: HomePage[] = currentList.filter(
        (homepage: HomePage) =>
          homepage.custom_position !== parseInt(custom_position)
      );

      const newList: HomePage[] = [...alterList, addObject];

      await AsyncStorage.setItem("homepage-list", JSON.stringify(newList));
    } catch (error) {
      console.error(error);
    }

    router.navigate("/");
  };

  const handleCancelHomepage = () => {
    router.navigate("/");
  };

  const handleDeleteHomepage = async () => {
    try {
      const currentList = JSON.parse(
        (await AsyncStorage.getItem("homepage-list")) || "[]"
      );

      const newList: HomePage[] = currentList.filter(
        (homepage: HomePage) =>
          homepage.custom_position !== parseInt(custom_position)
      );

      const alterList: HomePage[] = newList.map((homepage: HomePage) => {
        if (homepage.custom_position > parseInt(custom_position)) {
          return { ...homepage, custom_position: homepage.custom_position - 1 };
        } else {
          return homepage;
        }
      });

      await AsyncStorage.setItem("homepage-list", JSON.stringify(alterList));
    } catch (error) {
      console.error(error);
    }

    router.navigate("/");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.navigate("/")} />
        <Appbar.Content title="Edit Homepage" />
      </Appbar.Header>
      <View style={styles.imageContainer}>
        <Image src={image} width={100} height={100} style={styles.image} />
        <HelperText type="error">{errorImageMessage}</HelperText>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Name"
          value={editName}
          onChangeText={(input) => handleChangeName(input)}
          style={styles.input}
        />
        <TextInput
          label="URL"
          value={editUrl}
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
            buttonColor="#4caf50"
            onPress={handleSaveHomepage}
            disabled={errorNameMessage.length > 0 || errorUrlMessage.length > 0}
            style={styles.button}
          >
            Save
          </Button>
          <Button
            mode="outlined"
            onPress={handleCancelHomepage}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            buttonColor="#e53935"
            onPress={showDialog}
            style={styles.button}
          >
            Delete
          </Button>
          <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
              <Dialog.Icon icon="trash-can" />
              <Dialog.Title>Delete</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  Are you sure you want to delete {editName}
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button mode="outlined" onPress={hideDialog}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    hideDialog();
                    handleDeleteHomepage();
                  }}
                >
                  Delete
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </View>
    </View>
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
