import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  BarChart3,
  BrainCircuit,
  CloudRain,
  CloudSun,
  Database,
  FlaskConical,
  History,
  Home,
  Sprout,
  Tractor,
  UserRound,
  UsersRound,
} from "lucide-react-native";

import LoadingScreen from "../../src/components/common/LoadingScreen";
import CustomDrawerContent from "../../src/components/navigation/CustomDrawerContent";
import { useAuth } from "../../src/hooks/useAuth";
import { colors } from "../../src/constants/colors";

export default function ProtectedLayout() {
  const {
    initializing,
    isAuthenticated,
    user,
  } = useAuth();

  if (initializing) {
    return <LoadingScreen message="Loading account..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isAdmin = user?.role === "admin";

  const hiddenDrawerItem = {
    display: "none",
  };

  const visibleDrawerItem = {
    borderRadius: 12,
    marginHorizontal: 6,
    marginVertical: 2,
  };

  return (
    <Drawer
      drawerContent={(props) => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: colors.surface,
        },

        headerShadowVisible: false,
        headerTintColor: colors.primaryDark,

        headerTitleStyle: {
          fontSize: 17,
          fontWeight: "800",
        },

        drawerActiveBackgroundColor: colors.primaryLight,
        drawerActiveTintColor: colors.primaryDark,
        drawerInactiveTintColor: colors.textSecondary,

        drawerLabelStyle: {
          marginLeft: -14,
          fontSize: 14,
          fontWeight: "700",
        },

        drawerItemStyle: visibleDrawerItem,

        drawerStyle: {
          width: 300,
          backgroundColor: colors.surface,
        },

        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="farms"
        options={{
          title: "My Farms",
          drawerLabel: "My Farms",
          drawerIcon: ({ color, size }) => (
            <Tractor size={size} color={color} />
          ),
          drawerItemStyle: isAdmin
            ? hiddenDrawerItem
            : visibleDrawerItem,
        }}
      />

      <Drawer.Screen
        name="admin-farms"
        options={{
          title: "All Farms",
          drawerLabel: "All Farms",
          drawerIcon: ({ color, size }) => (
            <UsersRound size={size} color={color} />
          ),
          drawerItemStyle: isAdmin
            ? visibleDrawerItem
            : hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="prediction"
        options={{
          title: "Crop Yield Prediction",
          drawerLabel: "Prediction",
          drawerIcon: ({ color, size }) => (
            <BrainCircuit
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: isAdmin
            ? hiddenDrawerItem
            : visibleDrawerItem,
        }}
      />

      <Drawer.Screen
        name="recommendation"
        options={{
          title: "Crop Recommendation",
          drawerLabel: "Crop Recommendation",
          drawerIcon: ({ color, size }) => (
            <Sprout
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: isAdmin
            ? hiddenDrawerItem
            : visibleDrawerItem,
        }}
      />

      <Drawer.Screen
        name="recommendation-history"
        options={{
          title: "Recommendation History",
          drawerLabel: "Recommendation History",
          drawerIcon: ({ color, size }) => (
            <History
              size={size}
              color={color}
            />
          ),
          drawerItemStyle: isAdmin
            ? hiddenDrawerItem
            : visibleDrawerItem,
        }}
      />

      <Drawer.Screen
        name="weather-analysis"
        options={{
          title: "Weather Analysis",
          drawerLabel: "Weather Analysis",
          drawerIcon: ({ color, size }) => (
            <CloudRain color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="soil-analysis"
        options={{
          title: "Soil Analysis",
          drawerLabel: "Soil Analysis",
          drawerIcon: ({ color, size }) => (
            <FlaskConical color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="analytics"
        options={{
          title: "Analytics Dashboard",
          drawerLabel: "Analytics",
          drawerIcon: ({ color, size }) => (
            <BarChart3
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="historical-yield"
        options={{
          title: "Historical Yield",
          drawerLabel: "Historical Yield",
          drawerIcon: ({ color, size }) => (
            <Database size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="soil-data"
        options={{
          title: "Soil Data",
          drawerLabel: "Soil Data",
          drawerIcon: ({ color, size }) => (
            <Sprout size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="weather-data"
        options={{
          title: "Weather Data",
          drawerLabel: "Weather Data",
          drawerIcon: ({ color, size }) => (
            <CloudSun size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile & Security",
          drawerLabel: "Profile & Security",
          drawerIcon: ({ color, size }) => (
            <UserRound size={size} color={color} />
          ),
        }}
      />

      {/* Hidden workflow screens */}

      <Drawer.Screen
        name="create-farm"
        options={{
          title: "Create Farm",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="farm-details"
        options={{
          title: "Farm Details",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="edit-farm"
        options={{
          title: "Edit Farm",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="prediction-history"
        options={{
          title: "Prediction History",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="prediction-details"
        options={{
          title: "Prediction Details",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />

      <Drawer.Screen
        name="recommendation-details"
        options={{
          title: "Recommendation Details",
          drawerItemStyle: hiddenDrawerItem,
        }}
      />
    </Drawer>
  );
}