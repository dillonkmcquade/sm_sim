import { ResponsivePie } from "@nivo/pie";
import { getUniques } from "../utils/utils";
import { User } from "../types";

export default function PieChart({ data }: {data: User}) {
  //Format data to satisfy nivo
  const formatted = (data: User) => {
    const uniques = getUniques(data.holdings);
    const newData = [ ...uniques ].map((key) => {
      return {
        id: key[0],
        value: key[1],
        label: key[0],
        color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255,
        )}, ${Math.floor(Math.random() * 255)})`,
      };
    });

    return newData;
  };
  return (
    <ResponsivePie
      data={formatted(data)}
      margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#999"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: "AAPL",
          },
          id: "dots",
        },
        {
          match: {
            id: "TSLA",
          },
          id: "lines",
        },
        {
          match: {
            id: "BITC",
          },
          id: "dots",
        },
        {
          match: {
            id: "GME",
          },
          id: "lines",
        },
      ]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 36,
          itemsSpacing: 0,
          itemWidth: 80,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 12,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#ffffff",
              },
            },
          ],
        },
      ]}
    />
  );
}
