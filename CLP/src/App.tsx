import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Analytics from "./pages/Analytics";
import { NotificationProvider } from './context/NotificationContext';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </WalletProvider>
  );
}

export default App;