import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import ProtectedRoute from './components/routes/ProtectedRoute';
import Home from './pages/home/Home';
import Sobre from './pages/sobre/Sobre';
import Produto from './pages/produto/Produto';
import Login from './pages/login/Login';
import Cadastro from './pages/cadastro/Cadastro';
import Dashboard from './pages/dashboard/Dashboard';
import Perfil from './pages/perfil/Perfil';
import Usuarios from './pages/usuarios/Usuarios';
import Departamentos from './pages/departamentos/Departamentos';
import Funcionarios from './pages/funcionarios/Funcionarios';
import NotFound from './pages/notfound/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-ekoa-paper text-ekoa-navy">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/produto" element={<Produto />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios/me/editar"
                element={
                  <ProtectedRoute>
                    <Usuarios editarUsuarioLogado />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departamentos"
                element={
                  <ProtectedRoute>
                    <Departamentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funcionarios"
                element={
                  <ProtectedRoute>
                    <Funcionarios />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3200} newestOnTop theme="colored" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
