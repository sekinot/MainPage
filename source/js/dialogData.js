
// *** Export Panelダイアログ (dialogExportPanel => dExP)
function dExPOpen () {
    showDialog("dialogExportPanel");
}
function dExPExport () {
    let panel = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    let embed = document.getElementById("dExPanelDataEmbed").checked;
    for (let i = 0; i < panel.layers.length; ++i) {
        if (!panel.layers[i].recordsets)
            continue;
        for (let j = 0; j <　panel.layers[i].recordsets.length; ++j) {
            panel.layers[i].recordsets[j].useLoadedDataForJSON = embed;
        }
    }
    HuTime.JSON.save(panel);
    closeDialog("dialogExportPanel");
}

// *** Import Panelダイアログ (dialogImportPanel => dImP)
function dImPSwitchLocationType () {
    if (document.getElementById("dImPLocationRemoteType").checked) {
        document.getElementById("dImPLocationRemoteFile").style.display = "block";
        document.getElementById("dImPLocationLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dImPLocationRemoteFile").style.display = "none";
        document.getElementById("dImPLocationLocalFile").style.display = "block";
    }
}
function dImPOpen () {
    //document.getElementById("dImUseRemoteData").checked = false;
    dImPSwitchLocationType();
    showDialog("dialogImportPanel");
}
function dImPImport () {
    if (document.getElementById("dImPLocationRemoteType").checked) {
        importRemoteJsonContainer(document.getElementById("dImPLocationURL").value);
    }
    else {
        importLocalJsonContainer(document.getElementById("dImPLocationFile").files[0]);
    }
    closeDialog("dialogImportPanel");
}

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
    let result = file;
    let reader = new FileReader();
    reader.readAsText(result);
    reader.addEventListener( 'load', function() {
        importObject(HuTime.JSON.parse(reader.result));
    });
}
//　読み込んだデータの表示
function importObject (panel) {
    if (!(panel instanceof HuTime.PanelBase))
        return;

    // 最初のパネルの場合は、時間範囲を取得してから描画
    function isInitRedraw () {
        // 最初のPanel追加の場合、既存がBlankのみの場合は、Dataの時間範囲でredraw
        let result = true;
        hutime.panelCollections[0].panels.forEach(panel => {
            panel.layers.forEach(layer => {
                if (layer.constructor !== HuTime.Layer &&
                    layer.constructor !== HuTime.PanelBorder &&
                    layer.constructor !== HuTime.CalendarScaleLayer)
                    result = false;     // 時間範囲を持ったデータLayerがあるとき
            });
        });
        return result;
    }
    let rs;
    for (let i = 0; i < panel.layers.length; ++i) {
        if (!panel.layers[i].recordsets || panel.layers[i].recordsets.length === 0)
            continue;
        for (let j = 0; j < panel.layers[i].recordsets.length; ++j) {
            if (panel.layers[i].recordsets[j]) {
                rs = panel.layers[i].recordsets[j];
                break;
            }
        }
        if (rs)
            break;
    }
    if (!rs || !isInitRedraw()) {
        hutime.panelCollections[0].appendPanel(panel);
        addBranch(document.getElementById("treeRoot"), panel);
        hutime.redraw();
    }
    else {
        rs.onloadend = function () {
            let tMin = Number.POSITIVE_INFINITY;
            let tMax = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < rs.records.length; ++i) {
                if (rs.records[i].tRange.pBegin < tMin)
                    tMin = rs.records[i].tRange.pBegin;
                if (rs.records[i].tRange.pEnd > tMax)
                    tMax = rs.records[i].tRange.pEnd;
            }
            hutime.panelCollections[0].appendPanel(panel);
            addBranch(document.getElementById("treeRoot"), panel);
            hutime.redraw(tMin, tMax);
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;　// 元に戻す
        };
    }
}

// *** Import Panelダイアログ (dialogImportPanel => dImP)
dataList = []
function dDLOpen (index) {
    index = 0;
    let list = dataList[index].list;
    let header = dataList[index].items.split(",");
    let table = document.getElementById("dataListTable");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    // ヘッダの出力
    let headerTr = document.createElement("tr");
    headerTr.className = "dataListHeader";
    let th;
    for (let i = 0; i < header.length; ++i) {
        th = document.createElement("th");
        th.innerText = header[i].trim();
        th.className = "dataListHeader";
        headerTr.appendChild(th)
    }
    th = document.createElement("th");
    th.innerHTML = "&nbsp;"
    headerTr.appendChild(th);
    table.appendChild(headerTr);

    // 表本体
    for (let i = 0; i < list.length; ++i) {
        let tr = document.createElement("tr");
        tr.className = "dataList";
        let td;
        for (let j = 0; j < header.length; ++j) {
            td = document.createElement("td");
            if (list[i][header[j]])
                td.innerText = list[i][header[j]];
            else
                td.innerHTML = "&nbsp;";
            td.setAttribute("onclick",
            "openListDataDetail(" + i.toString() + ")");
            td.className = "dataList";
            tr.appendChild(td);
        }
        td = document.createElement("td");
        td.style.width = "70px";
        td.style.textAlign = "center";

        let button = document.createElement("input");
        button.type = "button";
        button.value = "Import";
        button.setAttribute("onclick",
            "importRemoteJsonContainer('" + list[i]["url"] + "')");
        td.appendChild(button);
        tr.appendChild(td);
        document.getElementById("dataListTable").appendChild(tr);
    }
    showDialog("dialogDataList");
}

function openListDataDetail (index) {
    document.getElementById("statusBar").innerText = "detail " + index;
}