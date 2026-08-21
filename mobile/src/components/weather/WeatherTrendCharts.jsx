import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { colors } from "../../constants/colors";

const screenWidth = Dimensions.get("window").width;

export default function WeatherTrendCharts({
  records = [],
}) {
  if (!records.length) {
    return null;
  }

  const labels = records.map((item) =>
    String(item.year)
  );

  return (
    <View
      style={{
        marginTop: 18,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          marginBottom: 14,
          color: "#0F172A",
        }}
      >
        Historical Weather Trends
      </Text>

      <ChartCard
        title="Temperature (°C)"
        labels={labels}
        data={records.map(
          (item) => item.avg_temp_c
        )}
      />

      <ChartCard
        title="Rainfall (mm)"
        labels={labels}
        data={records.map(
          (item) => item.total_rainfall_mm
        )}
      />

      <ChartCard
        title="Humidity (%)"
        labels={labels}
        data={records.map(
          (item) => item.avg_humidity_percent
        )}
      />
    </View>
  );
}

function ChartCard({
  title,
  labels,
  data,
}) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 18,
        paddingVertical: 16,
        marginBottom: 18,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          marginLeft: 16,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>

      <ScrollView horizontal>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data,
              },
            ],
          }}
          width={Math.max(
            screenWidth - 30,
            labels.length * 65
          )}
          height={230}
          bezier
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",

            decimalPlaces: 1,

            color: () => colors.primary,

            labelColor: () => "#475569",

            propsForDots: {
              r: "4",
            },
          }}
          style={{
            borderRadius: 16,
          }}
        />
      </ScrollView>
    </View>
  );
}