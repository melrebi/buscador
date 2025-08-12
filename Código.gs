function doGet(e) {
  const ss = SpreadsheetApp.openById("TU_ID_DE_HOJA");
  const hoja = ss.getSheetByName("BDINS");
  const datos = hoja.getDataRange().getValues();

  const expedienteParam = e.parameter.expediente ? e.parameter.expediente.toLowerCase() : "";

  if (expedienteParam) {
    const filtrados = datos.filter((fila, index) => {
      if (index === 0) return false; // Omitir encabezados
      return String(fila[0]).toLowerCase().includes(expedienteParam);
    });
    return ContentService.createTextOutput(JSON.stringify(filtrados))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify([]))
    .setMimeType(ContentService.MimeType.JSON);
}
