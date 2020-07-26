/**** 整理中 ****/
// *** タブ ***
// タブの切り替え
function clickTabLabel (ev) {
    let tabs = ev.target.closest(".tabContainer").querySelectorAll("div.tab");
    for (let i = 0; i < tabs.length; ++i) {
        if (tabs[i].id === ev.target.getAttribute("for"))
            tabs[i].className = "tab tabSelected";
        else
            tabs[i].className = "tab";
    }
    let labels = ev.target.closest(".tabContainer").querySelectorAll("label.tabLabel");
    for (let i = 0; i < labels.length; ++i) {
        if (labels[i] === ev.target)
            labels[i].className = "tabLabel tabLabelSelected";
        else
            labels[i].className = "tabLabel";
    }
}

/*
function partsListContextMenu (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    document.getElementById("statusBar").innerText = ev.target.childNodes[0].textContent;
}

// レイヤタイプの切り替え
function changeLayerType (ev) {
    let layerType = ev.target.value;
    if (layerType === "tScale") {
        document.getElementById("recordsetSettings").style.display = "none";
        document.getElementById("vSettings").style.display = "none";
        document.getElementById("tScaleSettings").style.display = "block";
        document.getElementById("objectSettings").style.display = "none";
        document.getElementById("layerFixed").disabled = true;
        document.getElementById("layerFixedLabel").style.color = "#999999";
    }
    else if (layerType === "plain") {
        document.getElementById("recordsetSettings").style.display = "none";
        document.getElementById("vSettings").style.display = "none";
        document.getElementById("tScaleSettings").style.display = "none";
        document.getElementById("objectSettings").style.display = "block";
        document.getElementById("layerFixed").disabled = false;
        document.getElementById("layerFixedLabel").style.color = "#000000";
    }
    else {
        document.getElementById("recordsetSettings").style.display = "block";
        document.getElementById("vSettings").style.display = "block";
        document.getElementById("tScaleSettings").style.display = "none";
        document.getElementById("objectSettings").style.display = "none";
        document.getElementById("layerFixed").disabled = true;
        document.getElementById("layerFixedLabel").style.color = "#999999";
    }
}
// */

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
