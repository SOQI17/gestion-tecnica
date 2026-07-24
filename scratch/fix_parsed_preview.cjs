const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'CapacitacionesPortal.tsx');
let fileContent = fs.readFileSync(filePath, 'utf8');
let lines = fileContent.split(/\r?\n/);

let index = lines.findIndex(l => l.includes("setEditHistFecha"));
if (index !== -1) {
  let insertIndex = index + 2; // Insert after selectedCourseForCompletions
  const statesToInsert = [
    `  const [editCurModality, setEditCurModality] = useState<string>('');`,
    `  const [editCurCosto, setEditCurCosto] = useState<number>(0);`,
    `  const [isEditingCourseMeta, setIsEditingCourseMeta] = useState<boolean>(false);`,
    `  const [rawCsvText, setRawCsvText] = useState<string>(MOCK_CURSOS_GE_FE_CSV);`,
    `  const [parsedPreview, setParsedPreview] = useState<{`,
    `    ingenieros: Engineer[];`,
    `    cursos: Curso[];`,
    `    historial: HistorialEntrenamiento[];`,
    `  } | null>(null);`,
    `  const [importStatusMsg, setImportStatusMsg] = useState<string>('');`
  ];
  lines.splice(insertIndex, 0, ...statesToInsert);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('States inserted successfully!');
} else {
  console.log('Could not find setEditHistFecha line');
}
