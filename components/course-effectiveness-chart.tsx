"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@venore/plugin-sdk/ui";

export type LessonScoreStatus = "passed" | "failed" | "not_attempted";

export type LessonScoreDatum = {
  position: number;
  label: string;
  score: number;
  status: LessonScoreStatus;
};

// Cor aqui é status (aprovado/reprovado/não realizado), não identidade de série — por isso usa os
// tokens fixos de status do tema (--success/--destructive/--muted-foreground) em vez de rodar o
// validador de paleta categórica (skill dataviz, color-formula.md: "status é fixo, nunca segue o
// tema"). Sempre acompanhado de legenda com ícone+rótulo abaixo do gráfico — nunca só a cor da
// barra — e a tabela de aulas na página serve de view tabular equivalente.
const STATUS_LABEL: Record<LessonScoreStatus, string> = {
  passed: "Aprovado",
  failed: "Reprovado",
  not_attempted: "Não realizado",
};

const STATUS_COLOR: Record<LessonScoreStatus, string> = {
  passed: "var(--success)",
  failed: "var(--destructive)",
  not_attempted: "var(--muted-foreground)",
};

const chartConfig: ChartConfig = {
  score: { label: "Nota do quiz" },
};

export function CourseEffectivenessChart({ data }: { data: LessonScoreDatum[] }) {
  return (
    <div className="space-y-3">
      <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data} barCategoryGap="24%">
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.position} fill={STATUS_COLOR[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {(Object.keys(STATUS_LABEL) as LessonScoreStatus[]).map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
            {STATUS_LABEL[status]}
          </li>
        ))}
      </ul>
    </div>
  );
}
