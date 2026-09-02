import { createHash } from "node:crypto";

// Chave estável de um exercício de "Cantar junto". É o hash do ABC da melodia, normalizado e SEM
// as linhas de cabeçalho voláteis (X: número da peça, Q: andamento) — então:
//  - sobrevive à reimportação do curso (o id do bloco é randomUUID gerado no import; isto não);
//  - o mesmo trecho a 70 e a 80 BPM conta como o MESMO exercício (você pratica a frase, não o BPM);
//  - o mesmo trecho reaproveitado em outra aula/curso conta como o mesmo exercício.
export function singAlongExerciseKey(melodyAbc: string): string {
  const normalized = melodyAbc
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^X:/i.test(line) && !/^Q:/i.test(line))
    .join("\n")
    .replace(/[ \t]+/g, " ");
  return `sing:${createHash("sha1").update(normalized).digest("hex").slice(0, 16)}`;
}
