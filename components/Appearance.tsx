"use client";
import { useEffect, useState } from "react";
const illustrations = ["orbit", "grove", "lunar", "coast"];
type Preferences = { mode: "off" | "brand" | "game"; dim: number };
export default function Appearance({ brand }: { brand: "rommayo" | "emulatormayo" }) {
 const [preferences, setPreferences] = useState<Preferences>({ mode: "brand", dim: 72 });
 const [illustration, setIllustration] = useState("orbit");
 const [ready, setReady] = useState(false);
 const key = `mayo.site.appearance.v1.${brand}`;
 useEffect(() => {
  try { const raw = localStorage.getItem(key); if (raw && raw.length < 256) { const value = JSON.parse(raw); if (["off", "brand", "game"].includes(value.mode) && Number.isInteger(value.dim) && value.dim >= 40 && value.dim <= 95) setPreferences({ mode: value.mode, dim: value.dim }); } } catch {}
  setReady(true);
  const highlight = (event: Event) => { const art = (event as CustomEvent).detail; if (typeof art === "string" && illustrations.includes(art)) setIllustration(art); };
  window.addEventListener("mayo-illustration", highlight);
  return () => window.removeEventListener("mayo-illustration", highlight);
 }, [key]);
 useEffect(() => { if (ready) try { localStorage.setItem(key, JSON.stringify(preferences)); } catch {} }, [key, preferences, ready]);
 return <>
  <div className="site-backdrop" aria-hidden="true" data-mode={preferences.mode}>{preferences.mode !== "off" && <img src={preferences.mode === "game" ? `/art/${illustration}.svg` : `/art/${brand}-backdrop.svg`} alt="" style={{ opacity: (100 - preferences.dim) / 100 }} />}</div>
  <details className="appearance-control"><summary>◈ <span>Appearance</span></summary><div className="appearance-popover"><strong>Make it yours</strong><p>Original artwork, kept subtle behind every page.</p><label>Background<select aria-label="Background" value={preferences.mode} onChange={event => setPreferences({ ...preferences, mode: event.target.value as Preferences["mode"] })}><option value="off">Off</option><option value="brand">Brand artwork</option><option value="game">Page illustration</option></select></label><label>Dimming: {preferences.dim}%<input aria-label="Dimming" type="range" min="40" max="95" value={preferences.dim} onChange={event => setPreferences({ ...preferences, dim: Number(event.target.value) })}/></label><p>Page illustration follows the fictional game preview. No personal library images are loaded.</p></div></details>
 </>;
}
