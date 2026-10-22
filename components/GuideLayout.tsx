import { site } from "../site-data";

export default function GuideLayout({ title, introduction, children }: { title: string; introduction: string; children: React.ReactNode }) {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header"><a className="brand" href="/">{site.name.toLowerCase()}.</a><nav aria-label="Guide navigation"><a href="/">Project home</a><a href={site.repository}>GitHub ↗</a></nav><a className="text-link" href="/">← Home</a></header>
    <main id="main" className="guide wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">{site.name}</a> / <span aria-current="page">Getting started</span></nav>
      <h1>{title}</h1><p className="guide-intro">{introduction}</p><p className="guide-byline">By Quentin Mayo · Free and open source</p>
      {children}
      <section className="guide-section"><h2>Fuel the next save point.</h2><p>I need help affording my AI token usage :) If {site.name} makes your setup a little more fun, <a href={site.supportUrl} rel="noopener noreferrer">buy the developers a coffee</a>. Always optional. Always appreciated.</p></section>
    </main>
    <footer className="footer wrap"><p>{site.name} is an independent project by Quentin Mayo. No games or BIOS files included.</p><div><a href="/">Project home</a><a href={site.repository}>Source & documentation ↗</a><a href={site.sisterUrl}>Explore {site.sisterName} ↗</a></div></footer>
  </>;
}
