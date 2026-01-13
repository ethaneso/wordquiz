function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Kanji Pronunciation Game')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- API FUNCTIONS CALLED BY FRONTEND ---

function getKanjiData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet "Sheet1" not found');

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  // A2:E (kanji, romaji, explanation, correct, wrong)
  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();

  return data.map(row => ({
    kanji: row[0],
    romaji: row[1],
    explanation: row[2] || '',
    correct: Number(row[3]) || 0,
    wrong: Number(row[4]) || 0,
  }));
}

function addKanjiItem(kanji, romaji, explanation) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet "Sheet1" not found'); 

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kanji) {
      throw new Error('Kanji already exists');
    }
  }

  sheet.appendRow([kanji, romaji, explanation || '', 0, 0, new Date()]);
  return getKanjiData();
}

function deleteKanjiItem(kanji) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet "Sheet1" not found'); 

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kanji) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getKanjiData();
}

function updateStats(kanji, isCorrect) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet "Sheet1" not found'); 

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kanji) {
      const rowNum = i + 1;
      const currentCorrect = Number(data[i][3]) || 0;
      const currentWrong = Number(data[i][4]) || 0;

      if (isCorrect) {
        sheet.getRange(rowNum, 4).setValue(currentCorrect + 1);
      } else {
        sheet.getRange(rowNum, 5).setValue(currentWrong + 1);
      }
      return true;
    }
  }
  return false;
}

function saveRomajiEdit(kanji, newRomaji, newExplanation) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) throw new Error('Sheet "Sheet1" not found');

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === kanji) {
      sheet.getRange(i + 1, 2).setValue(newRomaji);            // B: Romaji
      sheet.getRange(i + 1, 3).setValue(newExplanation || ''); // C: Explanation
      return true;
    }
  }
  return false;
}
