"use client";
import { useState } from "react";
const games = [
 { title: "Neon Orbit", platform: "16-BIT", art: "orbit", favorite: true, recent: true },
 { title: "Pixel Grove", platform: "HANDHELD", art: "grove", favorite: false, recent: true },
 { title: "Lunar Run", platform: "ARCADE", art: "lunar", favorite: true, recent: false },
 { title: "Coastline 88", platform: "16-BIT", art: "coast", favorite: false, recent: false }
];
export default function Preview({ emulator = false }: {emulator?: boolean}) {
 const [filter, setFilter] = useState("All games");
 const [device, setDevice] = useState("Desktop");
 const visible = games.filter(g => filter === "All games" || (filter === "Recent" ? g.recent : g.favorite));
 return <div className={`product-visual ${emulator ? "emulator-visual" : ""}`}>
  <div className="orbit-label"><span className="live-dot"/> {emulator ? "A SMALL PLAYER. A BIG WORLD." : "ONE LIBRARY. YOUR WAY."}</div>
  <div className={`preview-window device-${device.toLowerCase()}`}>
   <div className="window-top"><div className="window-dots"><i/><i/><i/></div><span>{emulator ? "EMULATORMAYO / PLAYER" : "ROMMAYO / LIBRARY"}</span><span className="window-dot">●</span></div>
   {emulator ? <div className="player-preview"><img src="/art/orbit.svg" alt="Original Neon Orbit illustration"/><div className="player-overlay"><span className="mini-label">YOUR NEXT ADVENTURE</span><div className="play-glyph" aria-hidden="true">▶</div><strong>Bring your own game.</strong><span>EmulatorJS does the playing.</span></div><div className="player-status"><span>LOCAL FILE → EMULATORJS</span><span>YOUR CONTROLS. YOUR SAVES.</span></div></div> : <>
    <div className="library-head"><div><span className="mini-label">GOOD TO SEE YOU</span><h3>Your library</h3></div><span className="library-status">● CONNECTED</span></div>
    <div className="library-tabs" role="tablist" aria-label="Illustrative library filters">{["All games", "Recent", "Favorites"].map(f=><button key={f} role="tab" aria-selected={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>
    <div className="game-grid">{visible.map(g=><div className="game-card" key={g.title}><div className="cover"><img src={`/art/${g.art}.svg`} alt={`${g.title}, an illustrative fictional game`}/>{g.favorite&&<span className="favorite-star">★</span>}<span className="cover-title">{g.title}</span></div><strong>{g.title}</strong><span>{g.platform}</span></div>)}</div>
    <div className="library-bottom"><span>YOUR SERVER. NO MIDDLEMAN.</span><span>↗ PRESS PLAY</span></div>
   </>}
  </div>
  <div className="preview-caption"><span>ILLUSTRATIVE PREVIEW · ORIGINAL FICTIONAL ART</span>{!emulator&&<div role="group" aria-label="Preview device">{["Desktop","Tablet"].map(d=><button key={d} aria-pressed={device===d} onClick={()=>setDevice(d)}>{d}</button>)}</div>}</div>
 </div>;
}
