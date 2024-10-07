import React from 'react';
import {NavLink} from "react-router-dom";

function Home(props) {
    return (
        <div>
            <NavLink to={'/game'}>
                <button>START GAME</button>
            </NavLink>

        </div>
    );
}

export default Home;