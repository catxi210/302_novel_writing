import { useAtom } from "jotai"
import { userConfigAtom } from "@/stores"
import { useEffect, useState } from "react"
import { updateWordCountData } from "./indexDB"
import { Card, CardContent } from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
const chartConfig = {
  desktop: {
    label: "wordCount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function LineChartCom(props: { type: 7 | 30 }) {
  const { type } = props;
  const [{ dayTypingLength }] = useAtom(userConfigAtom);

  const [chartData, setChartData] = useState<{ time: string; wordCount: number }[]>([]);

  useEffect(() => {
    updateWordCountData(dayTypingLength, type).then(res => {
      setChartData(res)
    })
  }, [dayTypingLength, type])

  return (
    <Card className="py-2 bg-transparent">
      <CardContent className="py-0 px-6">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              scale="point"
              padding={{ left: 30, right: 30 }}
              interval={chartData.length < 5 ? 0 : 'preserveStartEnd'}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-2 whitespace-nowrap flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--color-desktop)]" />
                      {data.time}
                    </div>
                    <div>{data.wordCount}</div>
                  </div>
                );
              }}
            />
            <Line
              dataKey="wordCount"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
