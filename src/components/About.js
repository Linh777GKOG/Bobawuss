import React from 'react';
import '../App.css';

export default function About({ handleClose }) {
  return (
    <div className="aboutContainer">
      <h2>About Me</h2>
      <p>
        I'm an evil scientist, who specializes in{' '}
        <span style={{ fontWeight: 'bold' }}>Zombology</span>
        <span style={{ fontStyle: 'italic' }}> (study of zombies)</span> and
        scheming to take over the world. In my free time, I love writing comedy,
        designing games, sketching and spending time with my dog -{' '}
        <span style={{ fontWeight: 'bold' }}>Randy</span>.
      </p>
      <button className="aboutClose" onClick={handleClose}>
        CLOSE
      </button>
    </div>
  );
}
