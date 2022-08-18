import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../App.css';
import closeBtn from './images/close_btn.svg';

export default function DiaologBox({
  message,
  buttonText,
  handleClick,
  handleClose,
}) {
  const dialogRef = useRef(null);

  useEffect(function () {
    gsap.to(dialogRef.current, {
      scale: 1,
      duration: 0.6,
      ease: 'power1.out',
    });
  }, []);

  return (
    <div ref={dialogRef} className="dialogContainer">
      <img src={closeBtn} alt="Close" onClick={handleClose} />
      <p>{message}</p>
      <button className="dialogClose" onClick={handleClick}>
        {buttonText}
      </button>
    </div>
  );
}
