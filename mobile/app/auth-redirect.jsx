import { Redirect } from "expo-router";

import LoadingScreen from "../src/components/common/LoadingScreen";
import { useAuth } from "../src/hooks/useAuth";

export default function AuthRedirect() {
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return (
      <LoadingScreen message="Preparing YieldSense AI..." />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}