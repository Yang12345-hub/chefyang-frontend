import { useEffect, useRef } from 'react';
import { motion } from "motion/react";
import Container from "react-bootstrap/Container";

import "./HomePage.css";

const HomePage = ({ user }) => {
  // example images — put these in /public/images/
  const images = [
    "/images/IMG_8910.jpeg",
    "/images/IMG_8912.jpeg",
    "/images/IMG_8913.jpeg",
    "/images/IMG_8914.jpeg",
    "/images/IMG_8915.jpeg",
    "/images/IMG_8916.jpeg",
    "/images/IMG_8917.jpeg",
    "/images/IMG_8918.jpeg",
    "/images/IMG_8919.jpeg",
    "/images/IMG_8920.jpeg",
  ];

  const trackRef = useRef(null);
  const itemRefs = useRef([]);

  // CoverFlow effect: scale + rotate based on distance from viewport center
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const update = () => {
      const viewportCenter = window.innerWidth / 2;
      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dx = (itemCenter - viewportCenter);                 // px from center
        const w = rect.width;                                     // normalize by card width
        const dist = Math.min(Math.abs(dx) / w, 2);               // 0 (center) → 2 (far)
        const scale = 1 - Math.min(0.35 * dist, 0.35);            // max shrink ~35%
        const angle = Math.max(Math.min(dx / w * 25, 45), -45);   // -45°..45°
        const z = Math.round((1 - Math.min(dist, 1)) * 100);      // center on top

        el.style.transform = `perspective(1000px) rotateY(${angle}deg) scale(${scale})`;
        el.style.zIndex = `${z}`;
        el.style.opacity = `${0.85 + (1 - Math.min(dist, 1)) * 0.15}`; // subtler fade on sides
      });
    };

    update();
    const onScroll = () => requestAnimationFrame(update);
    const onResize = () => requestAnimationFrame(update);

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // small kick so the first item animates in
    const t = setTimeout(update, 0);

    return () => {
      clearTimeout(t);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="HomePage">
     <Container fluid className="py-5 px-0">
        <div className="text-center mb-4">
          <h1 className="homepage-title">Chef Yang’s Bistro</h1>
          <p className="homepage-subtitle">Fresh • Authentic • Crafted</p>
        </div>

        {/* Cover Flow */}
        <div className="coverflow-viewport">
          <div className="coverflow-track" ref={trackRef}>
            {images.map((src, i) => (
              <motion.div
                key={src}
                ref={el => (itemRefs.current[i] = el)}
                className="coverflow-card"
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <img src={src} alt={`dish ${i + 1}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;