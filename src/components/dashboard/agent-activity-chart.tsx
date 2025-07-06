"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { agent: "AI Assistant", interactions: 186, month: "Jan" },
  { agent: "AI Assistant", interactions: 305, month: "Feb" },
  { agent: "AI Assistant", interactions: 237, month: "Mar" },
  { agent: "AI Assistant", interactions: 273, month: "Apr" },
  { agent: "AI Assistant", interactions: 209, month: "May" },
  { agent: "AI Assistant", interactions: 214, month: "Jun" },
]

const chartConfig = {
  interactions: {
    label: "Interactions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function AgentActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Agent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="interactions" fill="var(--color-interactions)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
