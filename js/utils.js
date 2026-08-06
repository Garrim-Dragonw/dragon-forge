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