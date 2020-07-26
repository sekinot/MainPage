// **** 共通 ****
function loadRemoteData (url, operation) {      // リモートデータの読み込み
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange  = function () {
        if (request.readyState === 4 && request.status === 200)
            operation(request.response);
    };
    request.send();
}
function loadLocalData (file, operation) {      // ローカルデータの読み込み
    let reader = new FileReader();
    reader.onloadend = function () {
        if (reader.readyState === 2)
            operation(reader.result);
    };
    reader.readAsText(file);
}

// 時間軸目盛り（暦）の追加
const DefaultScaleVBreath = 55;
function appendTimeScale(calendarId) {
    let layer = new HuTime.CalendarScaleLayer(DefaultScaleVBreath, null, null, calendarId);
    layer.name ="Time Scale"
    let panel = new HuTime.TilePanel(DefaultScaleVBreath);
    panel.name = "Time Scale";
    panel.resizable = false;
    panel.appendLayer(layer);
    hutime.panelCollections[0].appendPanel(panel);
    addBranch(document.getElementById("treeRoot"), panel)
}

