import { Redirect, Stack } from "expo-router";

import LoadingScreen from "../../src/components/common/LoadingScreen";
import { useAuth } from "../../src/hooks/useAuth";

export default function AuthLayout() {
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <LoadingScreen message="Checking account..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}