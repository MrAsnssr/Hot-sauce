import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import LocalSetupPage from './pages/LocalSetupPage';
import LocalGamePage from './pages/LocalGamePage';
import OnlineCreatePage from './pages/OnlineCreatePage';
import OnlineJoinPage from './pages/OnlineJoinPage';
import OnlineWaitingPage from './pages/OnlineWaitingPage';
import OnlineGamePage from './pages/OnlineGamePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Main */}
        <Route path="/" element={<HomePage />} />
        
        {/* Local Game */}
        <Route path="/local/setup" element={<LocalSetupPage />} />
        <Route path="/local/game" element={<LocalGamePage />} />
        
        {/* Online Game */}
        <Route path="/online/create" element={<OnlineCreatePage />} />
        <Route path="/online/lobby/:roomCode" element={<OnlineCreatePage />} />
        <Route path="/online/join" element={<OnlineJoinPage />} />
        <Route path="/online/join/:roomCode" element={<OnlineJoinPage />} />
        <Route path="/online/waiting" element={<OnlineWaitingPage />} />
        <Route path="/online/game/:roomCode" element={<OnlineGamePage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
