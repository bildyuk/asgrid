import { useEffect, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { apiFetch } from '../api/client';
import { getSocket } from '../realtime/socket';

type CellData = { value: any; version: number };
type RowData = { row: number; cells: Record<number, CellData>; [key: string]: any };

type Props = {
  sheetId: string;
  workbookId: string;
  title: string;
  onBack: () => void;
};

export function SheetGrid({ sheetId, workbookId, title, onBack }: Props) {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const socket = getSocket();
  const versionsRef = useRef<Record<string, number>>({}); // ключ "row_col", значение version

  const columnDefs: ColDef[] = [
    { field: 'row', headerName: '#', width: 70, editable: false },
    ...['A', 'B', 'C', 'D', 'E'].map((label, i) => ({
      field: `col${i}`,
      headerName: label,
      editable: true,
      flex: 1,
    })),
  ];

  const loadRows = useCallback(async () => {
    const data = await apiFetch<{ rows: RowData[] }>(`/sheets/${sheetId}/rows`);
    const flatRows = data.rows.map((r) => {
      const flat: any = { row: r.row };
      for (let i = 0; i < 5; i++) {
        flat[`col${i}`] = r.cells[i]?.value ?? '';
        versionsRef.current[`${r.row}_${i}`] = r.cells[i]?.version ?? 0;
      }
      return flat;
    });
    setRowData(
      flatRows.length
        ? flatRows
        : [{ row: 0, col0: '', col1: '', col2: '', col3: '', col4: '' }],
    );
  }, [sheetId]);

  useEffect(() => {
    loadRows();

    socket.connect();
    socket.emit('workbook:join', { workbookId });

    const handleCellChanged = (payload: any) => {
      setRowData((prev) => {
        const next = [...prev];
        payload.changes.forEach((c: any) => {
          const rowIndex = next.findIndex((r) => r.row === c.row);
          if (rowIndex >= 0) {
            next[rowIndex] = { ...next[rowIndex], [`col${c.column}`]: c.value };
            versionsRef.current[`${c.row}_${c.column}`] = c.version;
          }
        });
        return next;
      });
    };

    socket.on('cell:changed', handleCellChanged);
    return () => {
      socket.off('cell:changed', handleCellChanged);
    };
  }, [sheetId, workbookId, loadRows, socket]);

  const onCellValueChanged = async (event: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = event;
    if (newValue === oldValue) return;
    const colIndex = parseInt(colDef.field!.replace('col', ''), 10);
    const rowNum = data.row;
    const expectedVersion = versionsRef.current[`${rowNum}_${colIndex}`] || 0;

    const mutationId = crypto.randomUUID();
    try {
      const res = await apiFetch<{ results: any[] }>(`/sheets/${sheetId}/cells`, {
        method: 'PATCH',
        body: JSON.stringify({
          mutationId,
          changes: [{ row: rowNum, column: colIndex, value: newValue, expectedVersion }],
        }),
      });
      versionsRef.current[`${rowNum}_${colIndex}`] = res.results[0].version;
    } catch (err: any) {
      alert('Конфликт! Ячейка была изменена другим пользователем.');
      loadRows();
    }
  };

  const addRow = () => {
    const nextRowNum = rowData.length ? Math.max(...rowData.map((r) => r.row)) + 1 : 0;
    setRowData([
      ...rowData,
      { row: nextRowNum, col0: '', col1: '', col2: '', col3: '', col4: '' },
    ]);
  };

  return (
    <div style={{ padding: 20, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={onBack}>← Назад</button>
        <span style={{ marginLeft: 10, fontWeight: 'bold' }}>{title}</span>
        <button onClick={addRow} style={{ marginLeft: 20 }}>+ Строка</button>
      </div>
      <div className="ag-theme-quartz" style={{ flex: 1, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          getRowId={(params) => params.data.row.toString()}
        />
      </div>
    </div>
  );
}