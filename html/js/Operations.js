// **** 個別の操作 ****
// リモートのJSONデータ
function importRemoteJsonContainer (url) {
    let loadJson =
        HuTime.JSON.load(url,
            function () {
                importObject(loadJson.parsedObject);
            });
}

// ローカルのJSONデータ
function importLocalJsonContainer(file) {
    let result = file.files[0];
    let reader = new FileReader();
    reader.readAsText(result);
    reader.addEventListener( 'load', function() {
        importObject(HuTime.JSON.parse(reader.result));
    });
}

// オブジェクトのインポート
function importObject (obj) {
    if (obj instanceof HuTime.PanelBase) {
        mainPanelCollection.appendPanel(obj);
        addBranch(document.getElementById("treeRoot"), obj);
    }
    // レイヤの追加
    else if (obj instanceof HuTime.Layer) {
        if (selectedObject instanceof HuTime.PanelBase) {   // パネルが指定された場合
            selectedObject.appendLayer(obj);
            addBranch(selectedBranch, obj);
        }
        else {                                              // パネル以外が指定された場合
            let panel = new HuTime.TilePanel();             // 仮のパネルを追加
            if (obj.vBreadth)
                panel.vBreadth = obj.vBreadth;
            panel.appendLayer(obj);
            mainPanelCollection.appendPanel(panel);
            addBranch(document.getElementById("treeRoot"), panel);
        }
    }
    hutime.redraw(2457200.5, 2457238.5);
}

// **** 個別のダイアログ操作 ****
// リモートデータのインポート
function dialogImportRemote_Import () {    // リモートインポート
    closeDialog("dialogImportRemote");
    importRemoteJsonContainer (document.forms["dialogImportRemoteForm"].url.value);
}

// ローカルデータのインポート
function dialogImportLocal_Import () {      // ローカルインポート
    closeDialog("dialogImportLocal");
    importLocalJsonContainer (document.forms["dialogImportLocalForm"].file);
}

// **** HuTime構成要素のPreferences ****
function showPanelPreferences () {
    let panel = hutime.panelCollections[0].panels[0];

    showDialog("dialogPreferences");

    document.getElementById("panelNameText").value = panel.name;
    document.getElementById("panelHeight").value = panel.vBreadth;

    document.getElementById("panelBackgroundColor").value = panel.style.backgroundColor;
    document.getElementById("panelTRatio").value = panel.tRatio;
}




