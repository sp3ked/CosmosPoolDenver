import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Holdings from './pages/Holdings';
import Analytics from './pages/Analytics';
import { NotificationProvider } from './context/NotificationContext';
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <NotificationProvider>
      <WalletProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Router>
      </WalletProvider>
    </NotificationProvider>
  );
}

export default App;