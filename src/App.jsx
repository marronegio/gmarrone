import React from "react";
import {
  Intro, Cursor, Nav, Hero, Projects, Problem, Services,
  Differentials, About, Plans, FAQ, Finale, Footer
} from "./sections.jsx";
import { ContactDialog } from "./contact.jsx";

const { useCallback, useState } = React;

function App() {
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Intro onReveal={reveal} />
      <Cursor />
      <Nav />
      <main>
        <Hero revealed={revealed} />
        <Projects />
        <Problem />
        <Services />
        <Differentials />
        <About />
        <Plans />
        <FAQ />
        <Finale />
      </main>
      <Footer />
      <ContactDialog />
    </>
  );
}

export default App;
