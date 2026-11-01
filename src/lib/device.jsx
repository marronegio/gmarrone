import React from "react";
import { clamp } from "./scroll.js";

// A portfolio site in its browser window, with its phone version in front of it. `base` is
// the path from the page to the site root. A project with no public address stays unlinked.
export function DeviceFrame({ project, base = "", className, ...linkProps }) {
  const [width, height] = project.size;
  const [phoneWidth, phoneHeight] = project.sizeMobile;
  const Frame = project.url ? "a" : "div";
  const link = project.url && {
    href: project.url,
    target: "_blank",
    rel: "noreferrer",
    "aria-label": `Abrir o site de ${project.first} ${project.last}`,
    ...linkProps,
  };

  return (
    <Frame className={`${className} device`} {...link}>
      <span className="device-glow" aria-hidden="true" />
      <span className="device-window">
        <span className="device-bar" aria-hidden="true">
          <span className="device-dots"><i /><i /><i /></span>
          <span className="device-url">{project.host}</span>
        </span>
        <span className="device-screen" data-screen>
          <picture>
            <source media="(max-width: 800px)" srcSet={base + project.imgMobile} width={phoneWidth} height={phoneHeight} type="image/webp" />
            <img src={base + project.img} alt={`Site de ${project.first} ${project.last}`}
              width={width} height={height} loading="lazy" decoding="async" />
          </picture>
        </span>
      </span>
      <span className="device-phone" aria-hidden="true">
        <span className="device-screen" data-screen>
          <img src={base + project.imgMobile} alt="" width={phoneWidth} height={phoneHeight} loading="lazy" decoding="async" />
        </span>
      </span>
    </Frame>);

}

// Reads both screens of a Device and returns a function that scrolls them, 0 to 1.
export function deviceScreens(device) {
  const screens = [...device.querySelectorAll("[data-screen]")].map((screen) => {
    const img = screen.querySelector("img");
    return { img, pan: Math.max(img.offsetHeight - screen.offsetHeight, 0) };
  });
  return (travel) => screens.forEach(({ img, pan }) => {
    img.style.transform = `translate3d(0, ${(-travel * pan).toFixed(1)}px, 0)`;
  });
}

// A site holds on its hero until its card is almost centred, then scrolls as the card moves
// on. Works along either axis; `origin` covers a card that starts past the holding point.
export function crossing(position, origin, size, viewport) {
  const start = Math.min(viewport * 0.55 - size / 2, origin);
  return clamp((start - position) / (start + size * 0.85));
}

// Page scroll that moves a track `distance` sideways. A site only scrolls during part of its
// card's crossing, and a phone crosses a card in one swipe: both need room to stay readable.
export const trackLength = (distance) => distance * (window.innerWidth > 800 ? 1.25 : 2.9);
