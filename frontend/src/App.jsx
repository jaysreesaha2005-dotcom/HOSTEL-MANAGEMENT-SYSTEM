import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom";

import Complaints from "./pages/Complaints";
import Notices from "./pages/Notices";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <header className="header">
          <h2>HostelHub</h2>
          <p>Hostel Management System</p>
        </header>

        <div className="layout">

          <aside className="sidebar">
            <h3>MAIN MENU</h3>

            <NavLink to="/complaints" className="nav-link">
              Complaints
            </NavLink>

            <NavLink to="/notices" className="nav-link">
              Notice Board
            </NavLink>
          </aside>

          <main className="content">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/complaints" replace />}
              />

              <Route
                path="/complaints"
                element={<Complaints />}
              />

              <Route
                path="/notices"
                element={<Notices />}
              />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;