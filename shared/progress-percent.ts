// Único lugar que calcula percentual de progresso — student-course-card, course-card-block,
// course-list-block e a página do curso usavam cada um seu próprio Math.round, podendo divergir
// no arredondamento e sem tratamento consistente de curso sem aulas (divisão por zero).
export function calculateProgressPercent(completedLessons: number, totalLessons: number): number {
  if (totalLessons <= 0) {
    return 0;
  }
  return Math.round((completedLessons / totalLessons) * 100);
}
