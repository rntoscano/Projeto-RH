import { List, SignOut, UserCircle, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/useAuth';

const publicLinks = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/produto', label: 'Plataforma' },
];

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/departamentos', label: 'Departamentos' },
  { to: '/funcionarios', label: 'Funcionários' },
];

function linkClass(isActive: boolean) {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-ekoa-purple-50 text-ekoa-purple-700' : 'text-slate-700 hover:bg-slate-100 hover:text-ekoa-purple-700'
  }`;
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, usuario, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    toast.success('Você saiu com segurança.');
    navigate('/login');
  };

  const links = isAuthenticated ? [...publicLinks, ...privateLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" onClick={closeMenu} className="flex items-center">
          <img src="/images/logo-ekoa.png?v=20260716" alt="Ekoa" className="h-16 w-auto object-contain sm:h-20" />
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/usuarios/me/editar"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-ekoa-purple-200 hover:bg-ekoa-purple-50 hover:text-ekoa-purple-700"
              >
                <UserCircle size={20} aria-hidden="true" />
                {usuario?.nome || 'Perfil'}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-ekoa-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ekoa-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600"
              >
                <SignOut size={18} aria-hidden="true" />
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-ekoa-purple-700"
              >
                Entrar
              </NavLink>
              <NavLink
                to="/cadastro"
                className="rounded-lg bg-ekoa-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-ekoa-purple-200 transition hover:bg-ekoa-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ekoa-purple-600"
              >
                Criar conta
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="Navegação mobile">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={closeMenu} className={({ isActive }) => linkClass(isActive)}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/usuarios/me/editar"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <UserCircle size={20} aria-hidden="true" />
                  Editar meu perfil
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-lg bg-ekoa-navy px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <SignOut size={18} aria-hidden="true" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Entrar
                </NavLink>
                <NavLink
                  to="/cadastro"
                  onClick={closeMenu}
                  className="rounded-lg bg-ekoa-purple-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Criar conta
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
