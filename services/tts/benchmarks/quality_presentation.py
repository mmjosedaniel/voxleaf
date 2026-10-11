"""Deterministic HTML for blinded TTS quality evaluators."""

from __future__ import annotations

import html
import json
from collections.abc import Mapping

from benchmarks.quality_scoring import DIMENSIONS


def _render_evaluator_html(
    evaluator_id: str,
    scorecard: Mapping[str, object],
) -> str:
    safe_id = html.escape(evaluator_id)
    payload = json.dumps(scorecard, ensure_ascii=True, separators=(",", ":"))
    dimensions = json.dumps(DIMENSIONS)
    return f"""<!doctype html>
<html lang="es">
<meta charset="utf-8">
<title>VoxLeaf blinded TTS quality — {safe_id}</title>
<style>
body{{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem}}
article{{border:1px solid #bbb;border-radius:8px;padding:1rem;margin:1rem 0}}
fieldset{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem}}
label{{display:flex;flex-direction:column;gap:.25rem}} button{{font-size:1rem;padding:.7rem}}
</style>
<h1>Evaluación TTS a ciegas</h1>
<p>Escuche cada muestra. Puntúe 1–5 o “No aplica”. No intente identificar el motor.</p>
<main id="samples"></main>
<button id="export">Validar y descargar resultados</button>
<script>
const card={payload};
const dimensions={dimensions};
const labels={{
 intelligibility:"Inteligibilidad",spanishPronunciation:"Pronunciación y acento",
 punctuationDialogue:"Puntuación y diálogo",numericExpressions:"Números y fechas",
 foreignNames:"Nombres extranjeros",naturalness:"Naturalidad y prosodia",
 artifactFreedom:"Sin artefactos, repeticiones ni cortes"
}};
const root=document.querySelector("#samples");
for(const [index,sample] of card.samples.entries()){{
 const article=document.createElement("article");
 article.innerHTML=`<h2>${{index+1}}. ${{sample.caseId}}</h2>
 <audio controls preload="none" src="audio/${{sample.sampleId}}.wav"></audio><fieldset></fieldset>`;
 const fields=article.querySelector("fieldset");
 for(const dimension of dimensions){{
  const label=document.createElement("label"); label.textContent=labels[dimension];
  const select=document.createElement("select"); select.dataset.dimension=dimension;
  select.innerHTML='<option value="">Seleccione</option><option>not-applicable</option>'+
   [1,2,3,4,5].map(value=>`<option>${{value}}</option>`).join("");
  label.append(select); fields.append(label);
 }}
 const defect=document.createElement("label");
 defect.textContent="¿Defecto que cambia significado?";
 const defectSelect=document.createElement("select"); defectSelect.dataset.defect="true";
 defectSelect.innerHTML='<option value="">Seleccione</option>'+
  '<option value="false">No</option><option value="true">Sí</option>';
 defect.append(defectSelect); fields.append(defect); root.append(article);
}}
document.querySelector("#export").addEventListener("click",()=>{{
 const articles=[...document.querySelectorAll("article")];
 for(const [index,article] of articles.entries()){{
  for(const select of article.querySelectorAll("[data-dimension]")){{
   if(!select.value){{alert(`Falta una puntuación en la muestra ${{index+1}}.`);return;}}
   card.samples[index].scores[select.dataset.dimension]=select.value==="not-applicable"?
    "not-applicable":Number(select.value);
  }}
  const defect=article.querySelector("[data-defect]");
  if(!defect.value){{alert(`Falta indicar defectos en la muestra ${{index+1}}.`);return;}}
  card.samples[index].meaningChangingDefect=defect.value==="true";
 }}
 const blob=new Blob([JSON.stringify(card,null,2)+"\\n"],{{type:"application/json"}});
 const link=document.createElement("a"); link.href=URL.createObjectURL(blob);
 link.download="{safe_id}.completed.json"; link.click(); URL.revokeObjectURL(link.href);
}});
</script>
</html>
"""
