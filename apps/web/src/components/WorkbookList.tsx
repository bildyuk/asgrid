import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

type Workbook = { id: string; name: string };
type Sheet = { id: string; name: string };

type Props = {
  onSelectSheet: (sheetId: string, workbookId: string, name: string) => void;
};

export function WorkbookList({ onSelectSheet }: Props) {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [sheets, setSheets] = useState<Record<string, Sheet[]>>({});
  const [newWbName, setNewWbName] = useState('');

  const loadWorkbooks = async () => {
    const data = await apiFetch<Workbook[]>('/workbooks');
    setWorkbooks(data);
  };

  useEffect(() => {
    loadWorkbooks();
  }, []);

  const handleCreateWb = async () => {
    if (!newWbName.trim()) return;
    await apiFetch('/workbooks', {
      method: 'POST',
      body: JSON.stringify({ name: newWbName }),
    });
    setNewWbName('');
    loadWorkbooks();
  };

  const loadSheets = async (wbId: string) => {
    const data = await apiFetch<Sheet[]>(`/workbooks/${wbId}/sheets`);
    setSheets((prev) => ({ ...prev, [wbId]: data }));
  };

  const handleCreateSheet = async (wbId: string) => {
    const name = prompt('Имя листа:');
    if (!name) return;
    await apiFetch(`/workbooks/${wbId}/sheets`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    loadSheets(wbId);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Книги</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          value={newWbName}
          onChange={(e) => setNewWbName(e.target.value)}
          placeholder="Новая книга"
        />
        <button onClick={handleCreateWb}>Создать</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {workbooks.map((wb) => (
          <li key={wb.id} style={{ marginBottom: 10 }}>
            <div
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => loadSheets(wb.id)}
            >
              📁 {wb.name}
            </div>
            {sheets[wb.id] && (
              <ul style={{ paddingLeft: 20 }}>
                {sheets[wb.id].map((sh) => (
                  <li
                    key={sh.id}
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() =>
                      onSelectSheet(sh.id, wb.id, `${wb.name} / ${sh.name}`)
                    }
                  >
                    📄 {sh.name}
                  </li>
                ))}
                <li
                  style={{ cursor: 'pointer', color: 'green' }}
                  onClick={() => handleCreateSheet(wb.id)}
                >
                  + Добавить лист
                </li>
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}