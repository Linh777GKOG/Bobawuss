import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

import backBtn from './images/back_btn.svg';
import aboutBtn from './images/about_btn.svg';
import select from './sounds/select.mp3';

import About from './About';
import TermsAndConditions from './TermsAndConditions';

function ToggleSwitch() {
  return (
    <>
      <label className="switch">
        <input type="checkbox" />
        <span className="slider round"></span>
      </label>
    </>
  );
}

export default function Settings({ handleBackPress }) {
  let selectSound = new Audio(select);

  const settingsRef = useRef(null);

  const [toggleBtn, setToggleBtn] = useState({
    about: false,
    conditions: false,
  });

  useEffect(function () {
    gsap.to(settingsRef.current, {
      scale: 1,
      duration: 1.5,
      ease: 'elastic.out(1, 0.3)',
    });
  }, []);

  return (
    <>
      <div ref={settingsRef} className="settingsContainer">
        <div className="settingsTopBar">
          <img
            src={backBtn}
            alt="Back Button"
            onClick={() => handleBackPress(settingsRef)}
          />
          <img src={aboutBtn} alt="About Button" onClick={handleAboutPress} />
        </div>
        <div className="settingsMiddleBar">
          <h1>Mute</h1>
          <ToggleSwitch />
        </div>
        <div className="settingsMiddleBar">
          <h2>Turn off blood</h2>
          <ToggleSwitch />
        </div>
        <button
          className="termsAndCondtionsBtn"
          onClick={handleConditionsPress}
        >
          Terms & Conditions
        </button>
      </div>
      {toggleBtn.about && <About handleClose={handleAboutClose} />}
      {toggleBtn.conditions && (
        <TermsAndConditions handleClose={handleConditionsClose} />
      )}
    </>
  );

  function handleAboutPress() {
    selectSound.play();
    setToggleBtn({ about: true, conditions: false });
  }

  function handleConditionsPress() {
    selectSound.play();
    setToggleBtn({ about: false, conditions: true });
  }

  function handleConditionsClose(conditionsRef) {
    selectSound.play();
    gsap.to(conditionsRef.current, {
      scale: 0,
      duration: 0.2,
      ease: 'Circ.easeOut',
    });

    setTimeout(function () {
      setToggleBtn({ ...toggleBtn, conditions: false });
    }, 200);
  }

  function handleAboutClose() {
    selectSound.play();
    setToggleBtn({ ...toggleBtn, about: false });
  }
}
