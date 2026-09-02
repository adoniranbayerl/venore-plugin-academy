// Ofensiva de prática — função pura. "Dia de prática" é qualquer ação real de progresso do aluno
// (ver shared/progress-hooks.ts::onProgressAdvanced, que grava um registro por dia via
// practice-streak-store). Aqui só transformamos a lista de dias ("YYYY-MM-DD", crescente) no
// número que aparece no painel: `🔥 N dias`.
//
// Regra "perdoadora": faltar UM dia não quebra a ofensiva. Em dias de calendário isso é um
// intervalo <= 2 entre dois dias de prática consecutivos (hoje e anteontem: gap 2, mantém;
// hoje e 3 dias atrás: gap 3, quebrou). O contador conta dias de prática de verdade — o dia
// pulado não entra na conta, só não zera a sequência.

export type PracticeStreak = {
  // Sequência atual (0 se a ofensiva já esfriou — último dia de prática há mais de 2 dias).
  current: number;
  // Maior sequência já alcançada no histórico carregado.
  longest: number;
  practicedToday: boolean;
  lastDay: string | null;
};

const MAX_GAP_DAYS = 2;

function toUtcDays(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function computePracticeStreak(days: string[], today: string): PracticeStreak {
  const unique = Array.from(new Set(days)).sort();
  if (unique.length === 0) {
    return { current: 0, longest: 0, practicedToday: false, lastDay: null };
  }

  const nums = unique.map(toUtcDays);
  const todayNum = toUtcDays(today);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    const gap = nums[i] - nums[i - 1];
    run = gap <= MAX_GAP_DAYS ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const lastDay = unique[unique.length - 1];
  const lastNum = nums[nums.length - 1];

  // Ofensiva atual: só vale se o último dia de prática ainda está dentro da janela perdoadora
  // em relação a hoje. Fora disso, esfriou -> 0.
  let current = 0;
  if (todayNum - lastNum <= MAX_GAP_DAYS && todayNum - lastNum >= 0) {
    current = 1;
    for (let i = nums.length - 1; i > 0; i--) {
      if (nums[i] - nums[i - 1] <= MAX_GAP_DAYS) current++;
      else break;
    }
  }

  return { current, longest, practicedToday: unique.includes(today), lastDay };
}
