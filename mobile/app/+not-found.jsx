import { Link, Stack } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Page Not Found",
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>
          404
        </Text>

        <Text style={styles.subtitle}>
          The page you are looking for does not exist.
        </Text>

        <Link
          href="/(protected)/dashboard"
          style={styles.link}
        >
          Go to Dashboard
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 42,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
  },

  link: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "800",
    color: "#16A34A",
  },
});