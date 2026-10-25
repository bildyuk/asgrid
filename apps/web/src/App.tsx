import { useState } from 'react';
import { getToken } from './api/client';
import { Login } from './components/Login';
import { WorkbookList } from './components/WorkbookList';
import { SheetGrid } from './components/SheetGrid';
import './App.css';

type SelectedSheet = { id: string; workbookId: string; name: string };

export default function App() {
  const [isAuth, setIsAuth] = useState(!!getToken());
  const [selectedSheet, setSelectedSheet] = useState<SelectedSheet | null>(null);

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          background: '#0070c0',
          color: '#fff',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>ASGRID</h2>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Выйти
        </button>
      </header>
      {selectedSheet ? (
        <SheetGrid
          sheetId={selectedSheet.id}
          workbookId={selectedSheet.workbookId}
          title={selectedSheet.name}
          onBack={() => setSelectedSheet(null)}
        />
      ) : (
        <WorkbookList
          onSelectSheet={(id, wbId, name) =>
            setSelectedSheet({ id, workbookId: wbId, name })
          }
        />
      )}
    </div>
  );
}