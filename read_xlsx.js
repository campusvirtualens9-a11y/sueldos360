const XLSX = require('xlsx');
const path = 'C:\\Users\\juanj\\OneDrive\\Desktop\\rrhh 360\\base_referencia_sueldos_cct.xlsx';
const wb = XLSX.readFile(path);
console.log('HOJAS:', JSON.stringify(wb.SheetNames));
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log('\n========== HOJA: ' + name + ' ==========');
  data.forEach((row, i) => {
    if (row.some(c => String(c).trim() !== '')) {
      console.log((i + 1) + '\t' + row.map(c => String(c)).join('\t'));
    }
  });
});
