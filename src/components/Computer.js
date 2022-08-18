import React, { useState } from 'react';
import Dialog from './Dialog';

import pizzaZombie from './images/Pizza-delivery-zombie.png';
import vanillaZombie from './images/Plain-old-vanilla-zombie.png';
import hoboZombie from './images/Hobo-zombie.png';
import backButton from './images/back_btn_computer.svg';
import rightArrow from './images/right_arrow_btn.svg';
import leftArrow from './images/left_arrow_btn.svg';

const zombies = [
  {
    name: 'Pizza Delivery Zombie',
    src: pizzaZombie,
  },
  {
    name: 'Plain-old-vanilla Zombie',
    src: vanillaZombie,
  },
  {
    name: 'Hobo Zombie',
    src: hoboZombie,
  },
];

function PizzaDeliveryZombie() {
  return (
    <>
      <p>
        Steve worked at the{' '}
        <span style={{ fontStyle: 'italic' }}>Wendy's </span>
        before the virus hit. Now he works part time delivering food whilst
        eating the people he's delivering food to.
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Loves: </span>Macaroni pizza with a
        topping of slowly rotting brain.
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Quirks: </span>10 min delivery
        assured.
      </p>
    </>
  );
}

function PlainOldVanillaZombie() {
  return (
    <>
      <p>
        Your everyday zombie that got his brain melted from stress at the
        office. Wreaks havoc between 9 to 5 before returning back to his wife
        and kids.
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Favourite music album: </span>
        <span style={{ fontStyle: 'italic' }}>
          "It's time to <span style={{ fontWeight: 'bold' }}>ZOMBIE!</span>"{' '}
        </span>
        by <span style={{ fontWeight: 'bold' }}>The Zombies</span>
      </p>
    </>
  );
}

function HoboZombie() {
  return (
    <>
      <p>
        Lives in his mom's basement playing{' '}
        <span style={{ fontStyle: 'italic' }}>
          Call of Duty: World at War - Zombies{' '}
        </span>
        with his friends.
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Skills: </span> Graffiti art.
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Hates: </span> Paying the rent.
      </p>
    </>
  );
}

function Description(zombieType) {
  switch (zombieType.zombieType) {
    case 0:
      return <PizzaDeliveryZombie />;

    case 1:
      return <PlainOldVanillaZombie />;

    case 2:
      return <HoboZombie />;
  }
}

export default function Computer({ handleBackPress }) {
  const [zombieCount, setZombieCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className="computerContainer">
        <h1 onClick={handleTitleClick}>Zombiepedia</h1>
        <div className="computerMidPanel">
          {zombieCount !== 0 && (
            <img
              id="leftArrow"
              src={leftArrow}
              alt="Left"
              onClick={() => {
                setZombieCount(zombieCount - 1);
              }}
            />
          )}
          <div className="card">
            <img
              id="zombie"
              src={zombies[zombieCount].src}
              alt={zombies[zombieCount].name}
            />
            <h2>{zombies[zombieCount].name}</h2>
            <div className="description">
              <Description zombieType={zombieCount} />
            </div>
          </div>
          {zombieCount !== zombies.length - 1 && (
            <img
              id="rightArrow"
              src={rightArrow}
              alt="Right"
              onClick={() => {
                setZombieCount(zombieCount + 1);
              }}
            />
          )}
        </div>
        <img
          id="computerBackBtn"
          src={backButton}
          alt="Back"
          onClick={handleBackPress}
        />
      </div>
      {showDialog && (
        <Dialog
          message={
            'Zombiepedia is a secure database containing all the vital information required to survive the apocalypse.'
          }
          buttonText={'Understood'}
          handleClick={handleDialogClose}
          handleClose={handleDialogClose}
        />
      )}
    </>
  );

  function handleTitleClick() {
    setShowDialog(true);
  }

  function handleDialogClose() {
    setShowDialog(false);
  }
}
