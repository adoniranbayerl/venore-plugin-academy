// Compartilhado entre create-course (geração automática) e update-course-settings (edição) —
// mesma pasta shared/ já usada por enrollment-store.ts pra lógica cross-feature dentro do plugin.
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
