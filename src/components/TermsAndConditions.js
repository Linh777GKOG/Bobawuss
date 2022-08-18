import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../App.css';

export default function TermsAndConditions({ handleClose }) {
  const conditionsRef = useRef(null);

  useEffect(function () {
    gsap.to(conditionsRef.current, {
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div ref={conditionsRef} className="conditionContainer">
      <h2>Blah, Blah, Blah.......nobody ever reads this stuff....Blah!</h2>
      <button
        className="conditionButton"
        onClick={() => handleClose(conditionsRef)}
      >
        AGREE
      </button>
    </div>
  );
}
