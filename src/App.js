import React, { useState, useEffect } from 'react';
import './App.css';

import Loading from './components/Loading';
import Menu from './components/Menu';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDialogBox, setShowDialogBox] = useState(false);

  useEffect(function () {
    setTimeout(function () {
      setIsLoaded(true);
    }, 4000);
  }, []);

  return <div className="App">{isLoaded ? <Menu /> : <Loading />}</div>;
}

export default App;
