/**
 * @OnlyCurrentDoc Limits the script to only accessing the current sheet.
 */

/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Clean sheets', functionName: 'clear_sheet'},
    {name: 'Generate new links', functionName: 'generate_dynamic_link'}
  ];
  spreadsheet.addMenu('Dynamic links builder', menuItems);
}


/**
 * A function that adds headers and some initial data to the spreadsheet.
 */
function clear_sheet() {
  var sheet = SpreadsheetApp.getActiveSheet().setName('Settings');
  var headers = [
    'site_url (without utms)',
    'source',
    'medium',
    'campaign',
    'content',
    'short link',
    'full link'
  ];
  var numRows = sheet.getLastRow()

  sheet.getRange('A1:G1').setValues([headers]).setFontWeight('bold');
  if (numRows > 1) {
    sheet.deleteRows(2, numRows-1)
    sheet.insertRows(2, numRows-1);
    sheet.setFrozenRows(1);
  }
  sheet.getRange('A2').setValue('https://test.com/'); // need to replace
  sheet.getRange('B2').setValue('facebook');
  sheet.getRange('C2').setValue('cpc');
  sheet.getRange('D2').setValue('summer_time');
  sheet.getRange('E2').setValue('pic_300x300');


  sheet.autoResizeColumns(1, 5);
}


function generate_dynamic_link() {

  var spreadsheet = SpreadsheetApp.getActive();
  var settingsSheet = spreadsheet.getSheetByName('Settings');
  settingsSheet.activate();

  var firebase_url = 'https://link.raketaapp.com'  // need to replace

//  for (var i =0; i< sheet.getLastRow(); i++) {
  var all_links = settingsSheet.getRange(2,1,settingsSheet.getLastRow()-1, 5).getValues()
  for (var i =0; i< settingsSheet.getLastRow()-1; i++) {
    if (all_links[i][0] != '') {
      if (all_links[i][0].indexOf('?') != '-1' || all_links[i][0].indexOf('&') != '-1') {
        var url = encodeURIComponent(all_links[i][0]+'&utm_source='+all_links[i][1]+'&utm_medium='+all_links[i][2]+'&utm_campaign='+all_links[i][3]+'|'+all_links[i][4])
        } else {
          var url = encodeURIComponent(all_links[i][0]+'?utm_source='+all_links[i][1]+'&utm_medium='+all_links[i][2]+'&utm_campaign='+all_links[i][3]+'|'+all_links[i][4])
          }

      if (all_links[i][4] == '') {
        utm_campaign = all_links[i][3]
      } else {
        utm_campaign = all_links[i][3]+'|'+all_links[i][4]
      }

      var params = {
        'apn':'ua.test.app',  // need to replace
        'afl' : 'https://play.google.com/store/apps/details?id=ua.test.app', // need to replace
        'ibi': 'ua.test.app', // need to replace
        'ifl': 'https://itunes.apple.com/us/app/id111111', // need to replace
        'utm_source' : all_links[i][1],
        'utm_medium':all_links[i][2],
        'utm_campaign' : utm_campaign,
        'efr' : '1'
      }

      var full_url = (firebase_url+'?link='+url+'&'+serializeQuery(params))

      longDynamicLink = {
        "longDynamicLink": full_url
      }

      api_key = 'xxx' // need to replace
      firebase_shorter = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + api_key


      var payload = JSON.stringify(longDynamicLink);
      var options = {
        "method" : "POST",
        "contentType" : "application/json",
        "payload" : payload
      };


      var response = UrlFetchApp.fetch(firebase_shorter, options);
      var resp = JSON.parse(response.getContentText());
      var short_url = resp.shortLink

      settingsSheet.getRange(i+2, 6).setValue(short_url);
      settingsSheet.getRange(i+2, 7).setValue(full_url);

    }
    settingsSheet.autoResizeColumns(2, 5);
  }

}


function serializeQuery(params, prefix) {
  const query = Object.keys(params).map((key) => {
    const value  = params[key];

    if (params.constructor === Array)
      key = `${prefix}[]`;
    else if (params.constructor === Object)
      key = (prefix ? `${prefix}[${key}]` : key);

    if (typeof value === 'object')
      return serializeQuery(value, key);
    else
      return `${key}=${encodeURIComponent(value)}`;
  });

  return [].concat.apply([], query).join('&');
}
