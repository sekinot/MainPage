// **** ダイアログ関係（共通） ****

// デバッグ用
///*
const createSourceURLDefault =
    "http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/kyoto.csv";
// */

// *** ダイアログ基本構造 ***
// ダイアログの初期化
function initDialog () {
    let dialogElements = document.querySelectorAll("div.dialog");
    for (let i = 0; i < dialogElements.length; ++i ){
        dialogElements[i].querySelector("div.dialogTitle")
            .addEventListener("mousedown", startMoveDialog);
        dialogElements[i].querySelector("span.dialogCloseButton")
            .addEventListener("click", clockDialogCloseButton);
        let resizeDialogElement = dialogElements[i].querySelector("div.dialogResizeHandle");
        if (resizeDialogElement) {
            resizeDialogElement.addEventListener("mousedown", startResizeDialog);
            dialogElements[i].minWidth = parseFloat(dialogElements[i].style.width);
            dialogElements[i].minHeight = parseFloat(dialogElements[i].style.height);
        }
        dialogElements[i].dialogDragging = false;
    }
}

// ダイアログを開く・閉じる
function showDialog (dialogId) {
    let dialogElement = document.getElementById(dialogId);
    if (!dialogElement.style.left || parseFloat(dialogElement.style.left) < 0)
        dialogElement.style.left = ((window.innerWidth - parseFloat(dialogElement.style.width)) / 2).toString() + "px";
    if (!dialogElement.style.top || parseFloat(dialogElement.style.top) < 0)
        dialogElement.style.top = ((window.innerHeight - parseFloat(dialogElement.style.height)) / 2).toString() + "px";
    dialogElement.style.display = "block";
}
function clockDialogCloseButton (ev) {
    closeDialog(ev.target.closest("div.dialog").id);
}
function closeDialog (dialogId) {
    let dialogElement = document.getElementById(dialogId);
    dialogElement.style.display = "none";
    dialogElement.dialogDragging = false;
}

// ダイアログの移動
function startMoveDialog (ev) {
    let dialogElement = ev.target.closest("div.dialog");
    dialogElement.dialogDragging = true;
    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    document.dialogElement = dialogElement;
    document.addEventListener("mousemove", moveDialog, true);
    document.addEventListener("mouseup", stopMoveDialog, true);
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function moveDialog (ev) {
    if (!document.dialogElement)
        return;
    let dialogElement = document.dialogElement;
    dialogElement.style.left =
        (parseInt(dialogElement.style.left) - dialogElement.originX + ev.pageX) + "px";
    dialogElement.style.top =
        (parseInt(dialogElement.style.top) - dialogElement.originY + ev.pageY) + "px";

    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopMoveDialog (ev) {
    document.dialogElement.dialogDragging = false;
    document.removeEventListener("mousemove", moveDialog, true);
    document.removeEventListener("mouseup", stopMoveDialog, true);
    document.dialogElement = null;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

// ダイアログのサイズ変更
function startResizeDialog (ev) {
        let dialogElement = ev.target.closest("div.dialog");
        dialogElement.dialogDragging = true;
        dialogElement.originX = ev.pageX;
        dialogElement.originY = ev.pageY;
        document.dialogElement = dialogElement;
        document.addEventListener("mousemove", resizeDialog);
        document.addEventListener("mouseup", stopResizeDialog);
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.target.style.cursor)
            document.body.style.cursor = ev.target.style.cursor;
        else
            document.body.style.cursor = "se-resize";
        return false;
}
function resizeDialog (ev) {
    if (!document.dialogElement)
        return;

    let dialogElement = document.dialogElement;
    let resizeDirection = dialogElement.querySelector("div.dialogResizeHandle").style.cursor;
    if (resizeDirection !== "ew-resize" && resizeDirection !== "ns-resize")
        resizeDirection = "se-resize";
    let newWidth = parseInt(dialogElement.style.width) - dialogElement.originX + ev.pageX;
    let newHeight = parseInt(dialogElement.style.height) - dialogElement.originY + ev.pageY;
    if (newWidth > dialogElement.minWidth && resizeDirection !== "ns-resize")
        dialogElement.style.width = newWidth + "px";
    if (newHeight > dialogElement.minHeight && resizeDirection !== "ew-resize")
        dialogElement.style.height = newHeight + "px";
    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopResizeDialog (ev) {
    document.dialogElement.dialogDragging = false;
    document.removeEventListener("mousemove", resizeDialog);
    document.removeEventListener("mouseup", resizeDialog);
    document.dialogElement = null;
    document.body.style.cursor = "auto";
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

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


// **** レイヤ新規作成ダイアログ (dcl:dialogCreateLayer) ****
// *** Layer 関係 ***
function createChangeLayerType (ev) {       // レイヤタイプ変更に伴う処理
    if (ev)
        ev.stopPropagation();
    let selectedType = document.getElementById("createLayerType").value
    createSwitchSourceDisabled(selectedType === "Plain");
    dclSwitchItemDisabled(selectedType === "Plain");
    dclUpdateItemRoleMenu();
}
function createChangeLayerScale(ev) {       // 時間軸目盛りの有無に伴う処理
    if (ev)
        ev.stopPropagation();
    createSwitchScaleCalendarDisabled(!document.getElementById("createLayerAddScale").checked);
}
function createSwitchScaleCalendarDisabled (disabled) {     // Calendar設定の利用可否設定
    let calendarSelect = document.getElementById("createLayerCalendarOfScale");
    calendarSelect.disabled = disabled;
    let container = calendarSelect.closest("div.dialogSubContainer");
    if (disabled)
        container.className = (container.className + " dialogContainerDisabled").trim();
    else
        container.className = container.className.replace("dialogContainerDisabled", "").trim();
}

// *** Source 関係 ***
function createSwitchSourceLocationType () {
    if (document.getElementById("createSourceRemoteType").checked) {
        document.getElementById("createSourceRemoteFile").style.display = "block";
        document.getElementById("createSourceLocalFile").style.display = "none";
    }
    else {
        document.getElementById("createSourceRemoteFile").style.display = "none";
        document.getElementById("createSourceLocalFile").style.display = "block";
    }
}
function createLoadSource (ev) {    // ソースデータを読み込み、Item Listに反映
    ev.stopPropagation();
    let operation = function (data) {
        let recordset = data.split(/\r\n|\r|\n/);
        let record = recordset[0].split(",");
        dclClearItemList();
        for (let i = 0; i < record.length; ++i) {
            let tr = dclAppendItem(record[i]);
            tr.listOrder = i
        }
    }
    if (document.getElementById("createSourceRemoteFile").style.display === "block")
        loadRemoteData(document.getElementById("createSourceURL").value, operation);
    else
        loadLocalData(document.getElementById("createSourceFile").files[0], operation);
}
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
function createSwitchSourceDisabled (disabled) {    // Source全設定項目の利用可否設定
    document.getElementById("createSource").querySelectorAll("input,textarea,select").forEach(e => {
        e.disabled = disabled;
    });
    let container = document.getElementById("createSource");
    if (disabled)
        container.className = (container.className + " dialogContainerDisabled").trim();
    else
        container.className = container.className.replace("dialogContainerDisabled", "").trim();
}

// *** Item 関係 ***
function dclSwitchItemDisabled (disabled) {  // Item全設定項目の利用可否設定
    document.getElementById("createItem").querySelectorAll("input,textarea,select").forEach(e => {
        e.disabled = disabled;
    });
    let container = document.getElementById("createItem");
    if (disabled)
        container.className = (container.className + " dialogContainerDisabled").trim();
    else
        container.className = container.className.replace("dialogContainerDisabled", "").trim();
}
function dclUpdateItemRoleMenu () {     // Itemの役割選択メニューをLayer Typeに応じて更新
    if (document.getElementById("createLayerType").value === "TimeLine") {
        let li = document.getElementById("itemRoleMenu").querySelector("li[value='value']");
        if (li) {
            li.setAttribute("value", "label");
            li.innerHTML = "Label";
        }
    }
    else {
        let li = document.getElementById("itemRoleMenu").querySelector("li[value='label']");
        if (li) {
            li.setAttribute("value", "value");
            li.innerHTML = "Value";
        }
    }
}
function dclClearItemList () {        // Listのクリア
    document.getElementById("createItemsInSource").querySelectorAll("tr").forEach(e => {
           e.remove();
        });
    document.getElementById("createItemsInRecordset").querySelectorAll("tr").forEach(e => {
           e.remove();
        });
}
function dclAppendItem (name) {     // Sourceにitemを追加
    let table = document.getElementById("createItemsInSource").querySelector("table");
    let div = document.createElement("div");
    div.appendChild(document.createTextNode(name));
    let td = document.createElement("td");
    td.className = "itemName";
    let tr = document.createElement("tr");
    tr.addEventListener("click", dclSelectItem);
    table.appendChild(tr).appendChild(td).appendChild(div);
    return tr;
}

function dclSelectItem (ev) {          // 項目選択
    if (document.getElementById("itemRoleMenu").style.display === "block")
        dclSelectItemRole (ev);   // 役割メニュー選択時はメニューを閉じる
    ev.stopPropagation();
    let prevSelItem = ev.target.closest("div.dialogContainer").querySelector("tr.selectedItem");
    let targetItem = ev.target.closest("tr");
    if (prevSelItem)
        prevSelItem.className = prevSelItem.className.replace("selectedItem", "").trim();
    if (prevSelItem !== targetItem)
        targetItem.className = (targetItem.className + " selectedItem").trim();
}
function dclMoveItemToRecordset (ev) {   // 項目をレコードセットに移動（右矢印）
    ev.stopPropagation();
    // 役割選択メニュを表示
    let itemRoleMenu = document.getElementById("itemRoleMenu");
    itemRoleMenu.style.left = (ev.target.offsetLeft + 60) + "px";
    itemRoleMenu.style.top = (ev.target.offsetTop - 30) + "px";
    document.getElementById("itemRoleMenu").style.display = "block";
    document.getElementById("body").addEventListener("click", dclSelectItemRole);
}
function dclSelectItemRole (ev, role) {    // 項目の役割を選択
    ev.stopPropagation();
    document.getElementById("itemRoleMenu").style.display = "none";
    document.getElementById("body").removeEventListener("click", dclSelectItemRole);
    if (!ev.target.closest("div.itemRoleMenu"))   // メニュー以外の領域をクリック
        return;

    let selectedItem =
        document.getElementById("createItemsInSource").querySelector("tr.selectedItem");
    selectedItem.className = selectedItem.className.replace("selectedItem", "").trim();
    let recordsetTable = document.getElementById("createItemsInRecordset").querySelector("table");
    let icon = document.createElement("td");
    icon.className = "itemIcon";

    icon.appendChild(document.createElement("span")).appendChild(document.createTextNode(role));
    selectedItem.appendChild(icon);
    recordsetTable.appendChild(selectedItem);
}
function dclMoveItemToSource (ev) {      // 項目をソースに戻す（左矢印）
    ev.stopPropagation();
    let selectedItem = document.getElementById("createItemsInRecordset")
        .querySelector("tr.selectedItem");
    selectedItem.className
        = selectedItem.className.replace("selectedItem", "").trim();
    selectedItem.querySelector("td.itemIcon").remove();
    let sourceTable = document.getElementById("createItemsInSource").querySelector("table");
    sourceTable.appendChild(selectedItem);

    // 非選択の項目を元のリストの位置に入れる
    let sourceItems = Array.from(sourceTable.querySelectorAll("tr"));
    sourceItems.sort(function (a, b) {
        if (a.listOrder > b.listOrder)
            return 1;
        if (a.listOrder < b.listOrder)
            return -1;
        return 0;
    });
    for (let i = 0; i < sourceItems.length; ++i) {
        sourceTable.appendChild(sourceItems[i]);
    }
}
function dclSourcePreview (ev) {
    ev.stopPropagation();
}

function dclCreateLayer (ev) {
    ev.stopPropagation();

    let layerType = document.getElementById("createLayerType").value;
    let source, sourceName;
    let from, to, value, label;
    let itemName;
    let rs;

    if (layerType !== "Plain") {
        // source
        if (document.getElementById("createSourceRemoteType").checked) {
            source = document.getElementById("createSourceURL").value;
            sourceName = source.substr(source.lastIndexOf("/") + 1);
        }
        else {
            source = new HuTime.CsvReader(
                document.getElementById("createSourceFile").files[0], true);
            sourceName = source.source.name;
        }
        // item設定
        let icons = document.getElementById("createItemsInRecordset").
            querySelectorAll("td.itemIcon span");
        //let others = [];
        for (let i = 0; i < icons.length; ++i) {
            switch (icons[i].innerText) {
                case "from/to":
                    from = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    to = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    break;
                case "from":
                    from = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    break;
                case "to":
                    to = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    break;
                case "value":
                    value = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    itemName = value;
                    break;
                case "label":
                    label = icons[i].closest("tr").querySelector("td.itemName div").innerHTML;
                    itemName = label;
                    break;
                default:
                    //others.push(icons[i].closest("tr").querySelector("td.itemName div").innerHTML);
                    break;
            }
        }

        // Recordset
        let calendarOfSource = document.getElementById("calendarOfSource").value;
        if (layerType === "TimeLine")
            rs = new HuTime.CalendarTLineRecordset(source, from, to, label, calendarOfSource);
        else
            rs = new HuTime.CalendarChartRecordset(source, from, to, value, calendarOfSource);
        rs.name = sourceName;
    }

    // Data Layer
    let dataLayer, dataLayerMarginBottom;
    if (document.getElementById("createLayerAddScale").checked)
        dataLayerMarginBottom = NewLayerScaleVBreadth;
    else
        dataLayerMarginBottom = 0;

    switch (layerType) {
        case "TimeLine" :
            dataLayer = new HuTime.TLineLayer(rs, null, 0, dataLayerMarginBottom);
            break;
        case "LineChart" :
            dataLayer = new HuTime.LineChartLayer(rs, null, 0, dataLayerMarginBottom);
            break;
        case "BarChart" :
            dataLayer = new HuTime.BarChartLayer(rs, null, 0, dataLayerMarginBottom);
            break;
        case "PlotChart" :
            dataLayer = new HuTime.PlotChartLayer(rs, null, 0, dataLayerMarginBottom);
            break;
        default :
            dataLayer = new HuTime.Layer(null, 0, dataLayerMarginBottom);
            break;
    }
    dataLayer.name = sourceName + "_" + itemName

    let panel = new HuTime.TilePanel(NewLayerVBreadth + dataLayerMarginBottom);
    panel.name = sourceName + "_" + itemName
    panel.appendLayer(dataLayer);

    if (document.getElementById("createLayerAddScale").checked) {
        let scaleLayer = new HuTime.CalendarScaleLayer(
            NewLayerVBreadth, null, 0,
            document.getElementById("createLayerCalendarOfScale").value);
        scaleLayer.name = "Time Scale";
        panel.appendLayer(scaleLayer);
    }

    // 最初のパネルの場合は、時間範囲を取得
    if (hutime.panelCollections[0].panels.length === 0) {
        rs.onloadend = function () {
            let tMin, tMax;
            tMin = Number.POSITIVE_INFINITY;
            tMax = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < rs.records.length; ++i) {
                if (rs.records[i].tRange.pBegin < tMin)
                    tMin = rs.records[i].tRange.pBegin;
                if (rs.records[i].tRange.pEnd > tMax)
                    tMax = rs.records[i].tRange.pEnd;
            }
            hutime.redraw(tMin, tMax);
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;
        };
    }
    hutime.panelCollections[0].appendPanel(panel);
    hutime.redraw();
    addBranch(document.getElementById("treeRoot"), panel);
    dclClearItemList();
    closeDialog("dialogCreateLayer");
}




/**** 整理中 ****/
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

