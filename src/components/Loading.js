import gsap from 'gsap';
import React, { useRef, useEffect } from 'react';
import '../App.css';

const quotes = [
  'Zombies putting on their costume...Please wait',
  'Sharpening the knives...Please wait',
  'Loading the shotgun...Please wait',
  'Praying that the game works...Err..I mean..Loading Awesomeness',
  'Adding finishing touches...Please wait',
];

function randomQuote(quotes) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default function Loading() {
  const loadingRef = useRef();

  useEffect(function () {
    gsap.to(loadingRef.current, {
      width: '99%',
      duration: 4,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div className="loadingContainer">
      <h1>BOB'S A WUSS</h1>
      <div className="loadingOutline">
        <div ref={loadingRef} className="loadingBar"></div>
      </div>
      <p>{randomQuote(quotes)}</p>
    </div>
  );
}
