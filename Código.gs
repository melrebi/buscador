// --- Archivo: Código.gs ---

// Configuración de tu Hoja de Cálculo
const SPREADSHEET_ID = '1Z1GxPCx2QnkwLLtdw452_6iwEPr_U9Z1RJRRH2rBZrw';
// Lista de hojas a consultar
const SHEET_NAMES = ['I25', 'R25', 'D25','T25','V25','I24','R24','D24','T24','V24'];

// Ya no usamos una sola constante para la columna, 
// sino que definimos los tipos de búsqueda disponibles
const SEARCH_TYPES = {
  EXPEDIENTE: {
    columnIndex: 0,  // Columna A → índice 0
    label: 'Número de Expediente'
  },
  NOMBRE: {
    columnIndex: 1,  // Columna B → índice 1
    label: 'Nombre'
  }
};

/**
 * Controlador principal (GET).
 * - Responde JSON o JSONP con resultado de búsqueda si recibe `query`.
 * - Sirve la interfaz HTML si no hay parámetro.
 */
function doGet(e) {
  if (e.parameter.query) {
    // Obtener el tipo de búsqueda (por defecto, expediente)
    const searchType = e.parameter.type || 'EXPEDIENTE';
    
    // Realizar la búsqueda
    const resultado = buscarCatastro(e.parameter.query, searchType);
    const jsonText = JSON.stringify(resultado);
    
    if (e.parameter.callback) {
      return ContentService
        .createTextOutput(`${e.parameter.callback}(${jsonText});`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput(jsonText)
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Redirige POST a GET (útil para fetch con body).
 */
function doPost(e) {
  return doGet(e);
}

/**
 * Busca un valor en la columna especificada de cada hoja listada.
 * Devuelve { results: [ { sheet, headers, row } ], message, error }.
 */
function buscarCatastro(query, searchType = 'EXPEDIENTE') {
  if (!query || query.trim() === '') {
    return { 
      message: `Por favor, ingresa un ${SEARCH_TYPES[searchType].label}.` 
    };
  }
  
  // Validamos que el tipo de búsqueda exista
  if (!SEARCH_TYPES[searchType]) {
    return { 
      error: 'Tipo de búsqueda no válido.' 
    };
  }
  
  const columnIndex = SEARCH_TYPES[searchType].columnIndex;
  const q = query.toString().trim().toLowerCase();
  const results = [];
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    SHEET_NAMES.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      
      if (lastRow <= 1) return; // Skip empty sheets
      
      const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
      const values = sheet.getRange(2, 1, Math.max(lastRow - 1, 0), lastCol).getDisplayValues();
      
      for (let i = 0; i < values.length; i++) {
        const row = values[i];
        const cell = (row[columnIndex] || '').toString().trim().toLowerCase();
        
        // Para expedientes usamos coincidencia exacta
        if (searchType === 'EXPEDIENTE' && cell === q) {
          results.push({ sheet: sheetName, headers: headers, row: row });
          break; // una coincidencia por hoja
        } 
        // Para nombres usamos coincidencia parcial
        else if (searchType === 'NOMBRE' && cell.includes(q)) {
          results.push({ sheet: sheetName, headers: headers, row: row });
          // No hacemos break aquí para permitir múltiples coincidencias por nombre
        }
      }
    });
    
    if (results.length > 0) {
      return { results: results };
    } else {
      return { 
        message: `No se encontraron resultados para ${SEARCH_TYPES[searchType].label}: '${query}'.` 
      };
    }
  } catch (err) {
    return { error: 'Ocurrió un error inesperado: ' + err.message };
  }
}

/**
 * Incluye archivos HTML extra.
 */
function include(filename) {
  return HtmlService.createTemplateFromFile(filename)
    .evaluate()
    .getContent();
}