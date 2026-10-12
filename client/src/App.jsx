import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib';
import { Landing } from './pages/Landing';
import Auth from './pages/Auth';
import Account from './pages/Account';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/nosotros" element={<Landing about />} />
          <Route path="/login" element={<Auth key="login" mode="login" />} />
          <Route path="/registro" element={<Auth key="registro" mode="registro" />} />
          <Route path="/cuenta" element={<Account />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
