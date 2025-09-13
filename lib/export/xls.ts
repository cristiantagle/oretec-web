// lib/export/xls.ts
export function toXLS<T extends Record<string, any>>(rows: T[], headers?: string[], sheetName = 'Hoja1'): string {
  if (!rows || rows.length === 0) {
    const cols = headers && headers.length ? headers : ['Datos'];
    rows = [] as any;
    headers = cols;
  }
  const cols = headers ?? Object.keys(rows[0] ?? {});
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const headerRow =
    '<Row>' + cols.map(c => `<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('') + '</Row>';
  const bodyRows = (rows as T[]).map(r =>
    '<Row>' + cols.map(c => {
      const v = (r as any)[c];
      if (v == null || v === '') return '<Cell><Data ss:Type="String"></Data></Cell>';
      const isNum = typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v));
      return isNum
        ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
        : `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`;
    }).join('') + '</Row>'
  ).join('');

  const xml =
`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Worksheet ss:Name="${esc(sheetName)}">
    <Table>
      ${headerRow}
      ${bodyRows}
    </Table>
  </Worksheet>
</Workbook>`;
  return xml;
}
export function downloadXLS(filename: string, xml: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
