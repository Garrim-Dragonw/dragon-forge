export const $ = id => document.getElementById(id);

export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const esc = s =>
  String(s ?? "").replace(
    /[&<>"']/g,
    m =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m]
  );

  /* =========================================
   DATA PARSING
========================================= */

export function parseRows(exercises){
  return String(exercises || "")
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|").map(value => value.trim());

      return {
        name: parts[0] || line,
        sets: parts[1] || "",
        reps: parts[2] || "",
        load: parts[3] || "",
        setsDone: parts[4] || ""
      };
    });
}