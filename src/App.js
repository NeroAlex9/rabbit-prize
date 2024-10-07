import Game from "./pages/Game/Game";
import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home";


function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/" element = {<Home/>} />
                <Route path="/game" element = {<Game/>} />
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
