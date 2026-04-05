// ============================================================
// SCRIPT DE GOOGLE SHEETS — SISTEMA CONVERTIR
// Pega este código en: Extensiones → Apps Script → Pegar → Guardar → Implementar
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Determinar qué pestaña usar
    const sheetNames = {
      'autoevaluacion': 'Autoevaluaciones',
      'evaluacion_convertir': 'Eval_CONVERTIR',
      'evaluacion_ventas': 'Eval_Ventas'
    };
    
    const sheetName = sheetNames[data.tipo] || 'General';
    let sheet = ss.getSheetByName(sheetName);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Agregar encabezados según el tipo
      if (data.tipo === 'autoevaluacion') {
        sheet.appendRow(['Timestamp','Nombre','Regional','PDV','Fecha','%_Blandas','%_Duras','%_General','Perfil','Preguntas_Respondidas',
          'Escucha_Activa','Empatia_Comercial','Comunicacion_Adaptativa','Pensamiento_Critico','Generacion_Confianza',
          'Resiliencia_Comercial','Influencia_Etica','Autoconciencia','Gestion_Situaciones','Construccion_Relacion',
          'Conocimiento_Producto','Diagnostico_Necesidades','Argumentacion_Valor','Manejo_Objeciones','Cierre_Consultivo',
          'Ejecucion_PDV','Comparacion_Competitiva','Venta_Complementaria','Proceso_CONVERTIR','Testificacion']);
      } else if (data.tipo === 'evaluacion_convertir') {
        sheet.appendRow(['Timestamp','Nombre','Regional','PDV','Fecha','%_Final','Nivel','Correctas','Total_Respondidas',
          'Bloque1_Fundamentos','Bloque2_Diagnostico','Bloque3_Objeciones','Bloque4_Cierre']);
      } else if (data.tipo === 'evaluacion_ventas') {
        sheet.appendRow(['Timestamp','Nombre','Regional','PDV','Fecha','%_Final','Nivel','Correctas','Total_Respondidas',
          'Bloque1_Producto','Bloque2_Cliente','Bloque3_Proceso','Bloque4_Cierre']);
      }
      // Formatear encabezados
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#534AB7').setFontColor('#FFFFFF');
    }
    
    // Agregar fila de datos
    sheet.appendRow(data.datos);
    
    // Respuesta CORS
    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok', sheet: sheetName}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tipo = e.parameter.tipo || 'autoevaluacion';
    const regional = e.parameter.regional || '';
    const password = e.parameter.password || '';
    
    // Contraseñas por regional
    const passwords = {
      'Antioquia': 'coord_ant_2026',
      'Centro': 'coord_cen_2026',
      'Eje Cafetero': 'coord_eje_2026',
      'Norte': 'coord_nor_2026',
      'Occidente': 'coord_occ_2026',
      'Oriente': 'coord_ori_2026'
    };
    
    // Validar contraseña
    if (regional && passwords[regional] !== password) {
      return ContentService
        .createTextOutput(JSON.stringify({status: 'error', message: 'Contraseña incorrecta'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheetNames = {
      'autoevaluacion': 'Autoevaluaciones',
      'evaluacion_convertir': 'Eval_CONVERTIR',
      'evaluacion_ventas': 'Eval_Ventas'
    };
    
    const sheet = ss.getSheetByName(sheetNames[tipo]);
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({status: 'ok', datos: [], headers: []}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    let rows = values.slice(1);
    
    // Filtrar por regional si se especifica
    if (regional) {
      const regIdx = headers.indexOf('Regional');
      if (regIdx >= 0) {
        rows = rows.filter(r => r[regIdx] === regional);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok', headers: headers, datos: rows}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
