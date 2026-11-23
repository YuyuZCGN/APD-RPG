"use strict";

/* ==========================================================
   REGRAS DO SISTEMA
   ========================================================== */

const TOTAL_POINTS = 4;
const ATTRS = ["corpo", "mente", "persona", "espirito"];

// Cada estatística derivada recebe os atributos { corpo, mente, persona, espirito }
const DERIVED = {
  defesa:  a => Math.ceil(2 + a.corpo * 1.5),
  esquiva: a => Math.ceil(2 + a.mente * 2),
  pv:      a => 14 + a.corpo * 6,
  pa:      a => a.corpo * 12,
  ve:      a => 2 + a.mente * 2,
  desloc:  a => 5 + a.corpo * 1.5, // em metros
};

// Mapeia cada estatística ao elemento que mostra o valor
const OUTPUT_IDS = {
  defesa: "out-defesa",
  esquiva: "out-esquiva",
  pv: "out-pv",
  pa: "out-pa",
  ve: "out-ve",
  desloc: "out-desloc",
};

/* DOM */

const STORAGE_KEY = "rpg-ficha-atributos";

const attrs = { corpo: 0, mente: 0, persona: 0, espirito: 0 };

const el = id => document.getElementById(id);
const sum = () => ATTRS.reduce((s, k) => s + attrs[k], 0);
const pointsLeft = () => TOTAL_POINTS - sum();

const fmt = n => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

function pulse(node) {
  node.classList.remove("pulse");
  void node.offsetWidth; // reinicia a animação
  node.classList.add("pulse");
}

function setText(node, text) {
  if (node.textContent !== text) {
    node.textContent = text;
    pulse(node);
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(attrs)); } catch (e) { /* ignore */ }
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data) return;
    let total = 0;
    const next = {};
    for (const k of ATTRS) {
      const v = Math.floor(Number(data[k]));
      if (!Number.isFinite(v) || v < 0) return;
      next[k] = v;
      total += v;
    }
    if (total > TOTAL_POINTS) return;
    Object.assign(attrs, next);
  } catch (e) { /* ignore */ }
}

function render() {
  const left = pointsLeft();

  // Atributos e botões
  for (const k of ATTRS) {
    setText(el("val-" + k), String(attrs[k]));
    document.querySelector(`.step[data-attr="${k}"][data-dir="-1"]`).disabled = attrs[k] <= 0;
    document.querySelector(`.step[data-attr="${k}"][data-dir="1"]`).disabled = left <= 0;
  }

  // Pontos restantes
  setText(el("pointsLeft"), String(left));
  el("points").classList.toggle("empty", left === 0);

  // Estatísticas derivadas
  for (const key of Object.keys(DERIVED)) {
    setText(el(OUTPUT_IDS[key]), fmt(DERIVED[key](attrs)));
  }
}

function change(attr, dir) {
  const next = attrs[attr] + dir;
  if (next < 0) return;
  if (dir > 0 && pointsLeft() <= 0) return;
  attrs[attr] = next;
  save();
  render();
}

document.querySelectorAll(".step").forEach(btn => {
  btn.addEventListener("click", () => change(btn.dataset.attr, Number(btn.dataset.dir)));
});

el("reset").addEventListener("click", () => {
  ATTRS.forEach(k => { attrs[k] = 0; });
  save();
  render();
});

load();
render();
