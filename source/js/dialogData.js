
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

// *** Data Listダイアログ (dialogDataList => dDL)
dataList = []
function dDLOpen (index) {
    document.getElementById("dataListTitle").innerText =
        dataList[index].title;
    document.getElementById("dialogDataList").dataListIndex = index;

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
            "openListDataDetail(" + index.toString() +
                ", " + i.toString() + ")");
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

// *** About Data Listダイアログ (dialogAboutDataList => dADL)
function dADLOpen (listIndex) {
    let body = document.getElementById("dialogAboutDataList").querySelector("div.dialogBody");
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
    let data = dataList[listIndex];
    //document.getElementById("statusBar").innerText = "";
    for (let item in data) {
        if (item === "list")
            continue;
        let container = document.createElement("div");
        container.className = "dialogContainer";
        let label = document.createElement("div");
        label.className = "dialogContainerLabel";
        label.style.float = "left";
        label.innerText = item + ":";
        container.appendChild(label);
        let content = document.createElement("div");
        content.style.marginLeft = "90px";
        content.innerText = data[item];
        container.appendChild(content);
        body.appendChild(container);
    }
    showDialog("dialogAboutDataList");
}

// *** ListDataDetailダイアログ（dialogListDataDetail => dLDD）
function openListDataDetail (listIndex, dataIndex) {
    let body = document.getElementById("dialogListDataDetail").querySelector("div.dialogBody");
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    let data = dataList[listIndex].list[dataIndex];
    for (let item in data) {
        let container = document.createElement("div");
        container.className = "dialogContainer";
        let label = document.createElement("div");
        label.className = "dialogContainerLabel";
        label.style.float = "left";
        label.innerText = item + ":";
        container.appendChild(label);
        let content = document.createElement("div");
        content.style.marginLeft = "90px";
        content.innerText = data[item];
        container.appendChild(content);
        body.appendChild(container);
    }
    showDialog("dialogListDataDetail");
}

// *** Import Data Listダイアログ（dialogImportDataList => dImDL）
function dImDLSwitchLocationType () {
    if (document.getElementById("dImDLLocationRemoteType").checked) {
        document.getElementById("dImDLLocationRemoteFile").style.display = "block";
        document.getElementById("dImDLLocationLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dImDLLocationRemoteFile").style.display = "none";
        document.getElementById("dImDLLocationLocalFile").style.display = "block";
    }
}
function dImDLOpen () {
    dImDLSwitchLocationType();
    showDialog("dialogImportDataList");
}
function dImDLImport () {
    document.getElementById("statusBar").innerText =　"";
    if (document.getElementById("dImDLLocationRemoteType").checked) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200)
                    getDataList(request.responseText);
                else {
                    dImDLOpen();
                    document.getElementById("statusBar").innerText =
                        "Please enter or confirm URL and your ID / Password.";
                }
            }
        }
        request.open("GET", document.getElementById("dImDLLocationURL").value, true);
        let id = document.getElementById("dImDLLocationId").value.trim();
        let pass = document.getElementById("dImDLLocationPass").value.trim();
        if (id && id.length > 0 && pass && pass.length) {
            let auth = window.btoa(id + ":" + pass);
            request.setRequestHeader("Authorization", "Basic " + auth);
        }
        request.send();
    }
    else {
        let file = document.getElementById("dImDLLocationFile").files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', function () {
            getDataList(reader.result);
        });
    }
    closeDialog("dialogImportDataList");

    function getDataList (jsonData) {
        let dataObj = JSON.parse(jsonData);
        let index = dataList.push(dataObj) - 1;
        let dataMenu = document.getElementById("mainMenuData");
        let li = document.createElement("li");
        li.setAttribute("onclick", "dDLOpen(" + index.toString() + ")");
        li.className = "importedCollection";
        li.innerText = dataObj["title"];
        dataMenu.querySelector("ul").appendChild(li);
    }
}

// *** Saveダイアログ（dialogSave => dSv）
function dSvOpen () {
    showDialog("dialogSave");
}
function dSvSave () {
    let pc = document.getElementById("layerTree").querySelector("li").hutimeObject;

    let embed = document.getElementById("dSvEmbed").checked;
    for (let i = 0; i < pc.panels.length; ++i) {
        for (let j = 0; j < pc.panels[i].layers.length; ++j) {
            if (!pc.panels[i].layers[j].recordsets)
                continue;
            for (let k = 0; k <　pc.panels[i].layers[j].recordsets.length; ++k) {
                pc.panels[i].layers[j].recordsets[k].useLoadedDataForJSON = embed;
            }
        }
    }
    HuTime.JSON.save(pc);
    closeDialog("dialogSave");
}

// *** Loadダイアログ（dialogLoad => dLd）
function dLdSwitchLocationType () {
    if (document.getElementById("dLdLocationRemoteType").checked) {
        document.getElementById("dLdLocationRemoteFile").style.display = "block";
        document.getElementById("dLdLocationLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dLdLocationRemoteFile").style.display = "none";
        document.getElementById("dLdLocationLocalFile").style.display = "block";
    }
}
function dLdOpen () {
    dLdSwitchLocationType();
    showDialog("dialogLoad");
}
function dLdLoad () {
    if (document.getElementById("dLdLocationRemoteType").checked) {
        loadRemoteJsonContainer(document.getElementById("dLdLocationURL").value);
    }
    else {
        loadLocalJsonContainer(document.getElementById("dLdLocationFile").files[0]);
    }
    closeDialog("dialogLoad");
}

// リモートのJSONデータ
function loadRemoteJsonContainer (url) {
    let loadJson =
        HuTime.JSON.load(url,
            function () {
                loadObject(loadJson.parsedObject);
            });
}
// ローカルのJSONデータ
function loadLocalJsonContainer(file) {
    let result = file;
    let reader = new FileReader();
    reader.readAsText(result);
    reader.addEventListener( 'load', function() {
        loadObject(HuTime.JSON.parse(reader.result));
    });
}
//　読み込んだデータの表示
function loadObject (pc) {
    if (!(pc instanceof HuTime.PanelCollection))
        return;
    if (hutime.panelCollections.length > 0) {
        hutime.removePanelCollection(hutime.panelCollections[0]);
        removeBranch(document.getElementById("layerTree").querySelector("li"));
        hutime.redraw();
    }
    let rs;
    for (let i = 0; i < pc.panels.length; ++i) {
        for (let j = 0; j < pc.panels[i].layers.length; ++j) {
            if (!pc.panels[i].layers[j].recordsets ||
                pc.panels[i].layers[j].recordsets.length === 0)
                continue;
            for (let k = 0; k < pc.panels[i].layers[j].recordsets.length; ++k) {
                if (pc.panels[i].layers[j].recordsets[k]) {
                    rs = pc.panels[i].layers[j].recordsets[k];
                    break;
                }
            }
            if (rs)
                break;
        }
    }
    if (!rs) {
        hutime.appendPanelCollection(pc);
        addBranch(document.getElementById("layerTree"), hutime.panelCollections[0]);
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
            hutime.appendPanelCollection(pc);
            addBranch(document.getElementById("layerTree"), hutime.panelCollections[0]);
            hutime.redraw(tMin, tMax);
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;　// 元に戻す
        };
    }
}

// *** Detail of the Record（dialogRecordDetail => dRD）
function dRDOpen (ev) {
    let body = document.getElementById("dialogRecordDetail").querySelector("div.dialogBody");
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
    body.appendChild(createDataRow("Begin", getDateValue(
        ev.records[0].record.tRange.pBegin,
        ev.records[0].record.tRange.rBegin)));
    body.appendChild(createDataRow("End", getDateValue(
        ev.records[0].record.tRange.pEnd,
        ev.records[0].record.tRange.rEnd)));
    function getDateValue(date1, date2) {
    if (Math.abs(date2 - date1) <= 1)
        return jdToISO(date1, 1);
    else
        return jdToISO(date1, 1) + " - " + jdToISO(date2, 1);
    }
    function jdToISO (jd, calendar) {
        let time = HuTime.jdToTime(jd, calendar);
        return time.year < 0 ? "-" : "" +
            Math.abs(time.year) > 9999 ? Math.abs(time.year) :
                ("000" + Math.abs(time.year).toString()).slice(-4) + "-" +
                ("0" + time.month.toString()).slice(-2) + "-" +
                ("0" + time.day.toString()).slice(-2);
    }

    let data = ev.records[0].record.data;
    for (let item in data) {
        body.appendChild(createDataRow(item, data[item].text));
    }
    function createDataRow (item, value) {
        let container = document.createElement("div");
        container.className = "dialogContainer";
        let label = document.createElement("div");
        label.className = "dialogContainerLabel";
        label.style.float = "left";
        label.innerText = item + ":";
        container.appendChild(label);
        let content = document.createElement("div");
        content.style.marginLeft = "90px";
        content.innerText = value;
        container.appendChild(content);
        return container;
    }

    let dialog = document.getElementById("dialogRecordDetail");
    dialog.style.left = (ev.clientX + 10).toString() + "px";
    dialog.style.top = (ev.clientY + 10).toString() + "px";
    showDialog("dialogRecordDetail");
}