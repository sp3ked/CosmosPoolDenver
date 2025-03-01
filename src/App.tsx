import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Analytics from "./pages/Analytics";
import { connectWallet, getContract } from "./utils/contract";
import { NotificationProvider } from './context/NotificationContext';

function App() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [contractData, setContractData] = useState<any | null>(null);

    const handleConnectWallet = async () => {
        const wallet = await connectWallet();
        if (wallet) {
            setWalletAddress(wallet.address);
        }
    };

    useEffect(() => {
        async function fetchData() {
            const data = await getContract();
            setContractData(data);
        }
        fetchData();
    }, []);

    return (
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
    );
}

export default App;