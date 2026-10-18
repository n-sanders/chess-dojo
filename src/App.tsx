import { NavLink, Route, Routes } from 'react-router-dom';
import Today from './pages/Today';
import Play from './pages/Play';
import Drill from './pages/Drill';

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">♞ Chess Dojo</span>
        <nav>
          <NavLink to="/" end>
            Today
          </NavLink>
          <NavLink to="/drill">Opening Drill</NavLink>
          <NavLink to="/play">Play</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/drill" element={<Drill />} />
          <Route path="/play" element={<Play />} />
        </Routes>
      </main>
    </div>
  );
}
