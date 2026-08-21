import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "yieldsense_access_token";

export const tokenStorage = {
  async save(token) {
    if (!token) {
      throw new Error("Cannot save an empty authentication token.");
    }

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async get() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async remove() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },
};