import React, { useState } from 'react';
import { Lock, Menu } from 'lucide-react';
import ClientView from './views/Client/ClientView';
import AdminView from './views/Admin/AdminView';
import logo from './assets/logorf.png';


function App() {
  const [view, setView] = useState('client');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="bg-neutral-900 shadow-lg border-b border-neutral-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('client')}>
            <div className="w-10 h-10"><img src={logo} alt="Logo" className="w-full h-full object-contain" /></div>
            <div>
              <h1 className="text-lg font-serif text-white leading-tight">Rayane Figueira</h1>
              <span className="text-neutral-500 text-[10px] uppercase tracking-widest block font-bold">Lash Designer</span>
            </div>
          </div>
          <button 
            onClick={() => setView(view === 'client' ? 'admin' : 'client')} 
            className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-full transition-colors"
          >
            {view === 'client' ? <Lock size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'client' ? (
          <ClientView onNavigateAdmin={() => setView('admin')} />
        ) : (
          <AdminView onLogout={() => setView('client')} />
        )}
      </main>

      <footer className="text-center py-10 text-neutral-600 text-[10px] uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Rayane Figueira • Todos os direitos reservados</p>
        <p>Developed By FIGU3IR4</p>
      </footer>
    </div>
  );
}

export default App;