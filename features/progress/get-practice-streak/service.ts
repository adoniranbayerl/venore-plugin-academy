import { computePracticeStreak } from "../../../shared/practice-streak";
import { findPracticeDays } from "../../../shared/practice-streak-store";
import type { GetPracticeStreakQuery, GetPracticeStreakResult } from "./types";

// Janela de leitura: 60 dias cobrem qualquer ofensiva ativa plausível (a regra perdoadora só
// tolera 1 dia de folga por vez) sem carregar o histórico inteiro do aluno.
const LOOKBACK_DAYS = 60;

function serverToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysBefore(base: string, amount: number): string {
  const [year, month, day] = base.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - amount)).toISOString().slice(0, 10);
}

// Ofensiva de prática do aluno — número puro pro painel (`🔥 N dias`). Nunca falha por
// negócio: sem dias registrados, devolve a ofensiva zerada.
export async function getPracticeStreak(query: GetPracticeStreakQuery): Promise<GetPracticeStreakResult> {
  const today = serverToday();
  const days = await findPracticeDays(query.actorId, isoDaysBefore(today, LOOKBACK_DAYS));
  return { success: true, data: computePracticeStreak(days, today) };
}
