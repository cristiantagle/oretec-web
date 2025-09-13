// lib/export/csv.ts
export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]): string {
  if (!rows || rows.length === 0) {
    const cols = headers && headers.length ? headers : ['Datos'];
    return cols.join(',') + '\n';
  }
  const cols = headers ?? Object.keys(rows[0] ?? {});
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v);
    // Escapar comillas y encapsular si hay coma/salto de línea
    const needsQuote = /[",\n\r]/.test(s);
    const body = s.replace(/"/g, '""');
    return needsQuote ? `"${body}"` : body;
  };
  const head = cols.map(esc).join(',');
  const body = rows.map(r => cols.map(c => esc((r as any)[c])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}
export function downloadCSV(filename: string, csv: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
