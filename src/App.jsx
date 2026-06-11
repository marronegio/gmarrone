import React from "react";
import {
  Nav, HeroV1, HeroV2, HeroV3,
  Problem, Solution, Types, Proof, About, FAQ, CTA, Footer
} from "./sections.jsx";
import {
  useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakColor, TweakRadio
} from "./tweaks-panel.jsx";

const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#4d9bff",
  "dark": true,
  "density": "regular",
  "heroVariant": "v2"
}/*EDITMODE-END */;

// Map accent → matching glow + ink (contrast)
const ACCENT_PRESETS = {
  "#4d9bff": { glow: "rgba(77,155,255,0.22)",  ink: "#02112e" },  // azure (logo)
  "#3b82f6": { glow: "rgba(59,130,246,0.22)",  ink: "#031033" },  // royal blue
  "#60a5fa": { glow: "rgba(96,165,250,0.22)",  ink: "#031538" },  // soft sky
  "#818cf8": { glow: "rgba(129,140,248,0.22)", ink: "#0a0a3a" },  // indigo
};

// Light-mode accent darken (preserving hue mood)
const LIGHT_ACCENT = {
  "#4d9bff": "#1d6fe0",
  "#3b82f6": "#1e40af",
  "#60a5fa": "#1e6dd9",
  "#818cf8": "#4f46e5",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme + accent to root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-density", t.density);

    const accentDark = t.accent;
    const accentLight = LIGHT_ACCENT[t.accent] || t.accent;
    const preset = ACCENT_PRESETS[t.accent] || ACCENT_PRESETS["#3fe5a8"];

    if (t.dark) {
      root.style.setProperty("--accent", accentDark);
      root.style.setProperty("--accent-ink", preset.ink);
      root.style.setProperty("--accent-glow", preset.glow);
    } else {
      root.style.setProperty("--accent", accentLight);
      root.style.setProperty("--accent-ink", "#ffffff");
      root.style.setProperty("--accent-glow", preset.glow);
    }
  }, [t.dark, t.density, t.accent]);

  const Hero = t.heroVariant === "v2" ? HeroV2 : t.heroVariant === "v3" ? HeroV3 : HeroV1;

  return (
    <>
      <Nav />
      <main>
        <Hero key={t.heroVariant} />
        <Problem />
        <Solution />
        <Types />
        <Proof />
        <About />
        <FAQ />
        <CTA />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakToggle
          label="Modo escuro"
          value={t.dark}
          onChange={(v) => setTweak("dark", v)}
        />
        <TweakColor
          label="Cor accent"
          value={t.accent}
          options={["#4d9bff", "#3b82f6", "#60a5fa", "#818cf8"]}
          onChange={(v) => setTweak("accent", v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Densidade"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />

        <TweakSection label="Hero" />
        <TweakRadio
          label="Variante"
          value={t.heroVariant}
          options={["v1", "v2", "v3"]}
          onChange={(v) => setTweak("heroVariant", v)}
        />
        <div style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 10.5,
          color: "rgba(41,38,27,.55)",
          lineHeight: 1.5,
          padding: "4px 2px 0",
        }}>
          <b style={{ color: "rgba(41,38,27,.8)" }}>v1</b> editorial · tipografia centrada<br />
          <b style={{ color: "rgba(41,38,27,.8)" }}>v2</b> split editorial · sem mockup<br />
          <b style={{ color: "rgba(41,38,27,.8)" }}>v3</b> centrado · cards flutuantes
        </div>
      </TweaksPanel>
    </>
  );
}

export default App;
