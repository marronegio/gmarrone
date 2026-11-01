import React from "react";

const { useEffect, useRef, useState } = React;

export function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// "Sites reais, *resultados reais.*" — asterisks mark the serif italic emphasis.
export function Words({ text }) {
  let index = 0;
  const word = (w) => {
    if (!w) return null;
    if (/^\s+$/.test(w)) return " ";
    const i = index++;
    return <span className="w" key={i} style={{ "--i": i }}>{w}</span>;
  };
  return text.split(/(\*[^*]+\*)/).filter(Boolean).map((part, p) =>
    part.startsWith("*")
      ? <em key={`e${p}`}>{part.slice(1, -1).split(/(\s+)/).map(word)}</em>
      : <React.Fragment key={`t${p}`}>{part.split(/(\s+)/).map(word)}</React.Fragment>
  );
}

export function Title({ as: Tag = "h2", text, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`title${inView ? " in" : ""} ${className}`}>
      <Words text={text} />
    </Tag>);

}
