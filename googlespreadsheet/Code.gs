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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const lastRow = sheet.getLastRow();

    // If no data (only header or empty)
    if (lastRow < 2) return [];

    // Get all data from A2 to D(lastRow)
    const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

    // Map to objects
    return data.map(row => ({
        kanji: row[0],
        romaji: row[1],
        correct: Number(row[2]) || 0,
        wrong: Number(row[3]) || 0
    }));
}

function addKanjiItem(kanji, romaji) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

    // Check duplicates
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === kanji) throw new Error('Kanji already exists');
    }

    // Append row: Kanji, Romaji, Correct(0), Wrong(0), Date
    sheet.appendRow([kanji, romaji, 0, 0, new Date()]);
    return getKanjiData(); // Return updated list
}

function deleteKanjiItem(kanji) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === kanji) {
            sheet.deleteRow(i + 1); // +1 because array is 0-indexed but rows are 1-indexed
            break;
        }
    }
    return getKanjiData();
}

function updateStats(kanji, isCorrect) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === kanji) {
            const rowNum = i + 1;
            const currentCorrect = Number(data[i][2]) || 0;
            const currentWrong = Number(data[i][3]) || 0;

            if (isCorrect) {
                sheet.getRange(rowNum, 3).setValue(currentCorrect + 1);
            } else {
                sheet.getRange(rowNum, 4).setValue(currentWrong + 1);
            }
            return true;
        }
    }
}

function saveRomajiEdit(kanji, newRomaji) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === kanji) {
            sheet.getRange(i + 1, 2).setValue(newRomaji);
            return true;
        }
    }
}