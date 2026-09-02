"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@venore/plugin-sdk/ui";

export type CourseDashboardChartDatum = {
  position: number;
  label: string;
  value: number;
  state: "completed" | "available" | "locked";
};

// ChartContainer/BarChart precisam ser client (medem o container via ResponsiveContainer) — o
// bloco em si (course-dashboard-chart-block.tsx) é server e só passa dado já resolvido, mesmo
// papel que rich-text-field.tsx/media-field.tsx cumprem para outros campos client.
const chartConfig: ChartConfig = {
  value: { label: "Progresso" },
  completed: { label: "Concluída", color: "var(--chart-1)" },
  available: { label: "Disponível", color: "var(--chart-2)" },
  locked: { label: "Bloqueada", color: "var(--chart-3)" },
};

const STATE_COLORS: Record<CourseDashboardChartDatum["state"], string> = {
  completed: "var(--chart-1)",
  available: "var(--chart-2)",
  locked: "var(--chart-3)",
};

export function CourseDashboardChart({ data }: { data: CourseDashboardChartDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.position} fill={STATE_COLORS[entry.state]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
