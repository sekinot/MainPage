// **** ダイアログ関係（共通） ****

// デバッグ用
///*
const dCrSourceURLDefault =
//    "http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/kyotoNoHead.csv";
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
    let bodyElement = dialogElement.querySelector("div.dialogBody");

    let resizeDirection = dialogElement.querySelector("div.dialogResizeHandle").style.cursor;
    if (resizeDirection !== "ew-resize" && resizeDirection !== "ns-resize")
        resizeDirection = "se-resize";
    let newWidth = parseInt(dialogElement.style.width) - dialogElement.originX + ev.pageX;
    let newHeight = parseInt(dialogElement.style.height) - dialogElement.originY + ev.pageY;
    if (newWidth > dialogElement.minWidth && resizeDirection !== "ns-resize")
        dialogElement.style.width = newWidth + "px";
    if (newHeight > dialogElement.minHeight && resizeDirection !== "ew-resize") {
        dialogElement.style.height = newHeight + "px";
        if (bodyElement.style.height)
            bodyElement.style.height =
                (parseInt(bodyElement.style.height) - dialogElement.originY + ev.pageY) + "px";
    }
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

// **** Createダイアログ (dialogCreate => dCr) ****
let dCrRecordset;    // ロードしたデータ

// *** Layer 関係 ***
function dCrChangeLayerType (ev) {       // レイヤタイプ変更に伴う処理
    if (ev)
        ev.stopPropagation();
    let selectedType = document.getElementById("dCrLayerType").value
    dCrSwitchSourceDisabled(selectedType === "Plain");
    dCrSwitchItemDisabled(selectedType === "Plain");
    dCrUpdateItemRoleMenu();
}
/*
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
// */

// *** Source 関係 ***
function dCrSwitchSourceLocationType () {
    if (document.getElementById("dCrSourceRemoteType").checked) {
        document.getElementById("dCrSourceRemoteFile").style.display = "block";
        document.getElementById("dCrSourceLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dCrSourceRemoteFile").style.display = "none";
        document.getElementById("dCrSourceLocalFile").style.display = "block";
    }
}
function dCrLoadSource (ev) {    // ソースデータを読み込み、Item Listに反映
    ev.stopPropagation();
    let operation = function (data) {
        dCrRecordset = data.split(/\r\n|\r|\n/);
        let record = dCrRecordset[0].split(",");

        if (!document.getElementById("dCrSourceHeading").checked) {
            for (let i = 0; i < record.length; ++i) {
                record[i] = i.toString();
            }
        }
        dCrResetItemList();
        for (let i = 0; i < record.length; ++i) {
            let tr = dCrAppendItem(record[i]);
            tr.listOrder = i
        }
        document.getElementById("dCrSourcePreview").disabled = false;
    }
    if (document.getElementById("dCrSourceRemoteFile").style.display === "block")
        loadRemoteData(document.getElementById("dCrSourceURL").value, operation);
    else
        loadLocalData(document.getElementById("dCrSourceFile").files[0], operation);
}
function dCrSwitchSourceDisabled (disabled) {    // Source全設定項目の利用可否設定
    document.getElementById("dCrSource").querySelectorAll("input,textarea,select").forEach(e => {
        e.disabled = disabled;
    });
    let container = document.getElementById("dCrSource");
    if (disabled)
        container.className = (container.className + " dialogContainerDisabled").trim();
    else
        container.className = container.className.replace("dialogContainerDisabled", "").trim();
}

// *** Item 関係 ***
function dCrSwitchItemDisabled (disabled) {  // Item全設定項目の利用可否設定
    document.getElementById("createItem").querySelectorAll("input,textarea,select").forEach(e => {
        if (e.id !== "dCrSourcePreview")
            e.disabled = disabled;
    });
    let container = document.getElementById("createItem");
    if (disabled)
        container.className = (container.className + " dialogContainerDisabled").trim();
    else
        container.className = container.className.replace("dialogContainerDisabled", "").trim();
}
function dCrUpdateItemRoleMenu () {     // Itemの役割選択メニューをLayer Typeに応じて更新
    if (document.getElementById("dCrLayerType").value === "TimeLine") {
        let li = document.getElementById("dCrItemRoleMenu").querySelector("li[value='value']");
        if (li) {
            li.setAttribute("value", "label");
            li.innerHTML = "Label";
        }
    }
    else {
        let li = document.getElementById("dCrItemRoleMenu").querySelector("li[value='label']");
        if (li) {
            li.setAttribute("value", "value");
            li.innerHTML = "Value";
        }
    }
}
function dCrResetItemList () {  // Item選択リストのリセット
    // Listのクリア
    document.getElementById("dCrItemsInSource").querySelectorAll("tr").forEach(e => {
           e.remove();
        });
    document.getElementById("dCrItemsInRecordset").querySelectorAll("tr").forEach(e => {
           e.remove();
        });

    // 役割メニューの初期化
    document.getElementById("dCrItemRoleMenu").querySelectorAll("li").forEach(e => {
       e.style.display = "block";
    });
    document.getElementById("dCrSourcePreview").disabled = true;
}
function dCrAppendItem (name) {     // Sourceにitemを追加
    let table = document.getElementById("dCrItemsInSource").querySelector("table");
    let div = document.createElement("div");
    div.appendChild(document.createTextNode(name));
    let td = document.createElement("td");
    td.className = "itemName";
    let tr = document.createElement("tr");
    tr.addEventListener("click", dCrSelectItem);
    table.appendChild(tr).appendChild(td).appendChild(div);
    return tr;
}
function dCrSelectItem (ev) {          // 項目選択
    if (document.getElementById("dCrItemRoleMenu").style.display === "block")
        dCrSelectItemRole (ev);   // 役割メニュー選択時はメニューを閉じる
    ev.stopPropagation();
    let prevSelItem = ev.target.closest("div.dialogContainer").querySelector("tr.selectedItem");
    let targetItem = ev.target.closest("tr");
    if (prevSelItem)
        prevSelItem.className = prevSelItem.className.replace("selectedItem", "").trim();
    if (prevSelItem !== targetItem)
        targetItem.className = (targetItem.className + " selectedItem").trim();
}
function dCrMoveItemToRecordset (ev) {   // 項目をレコードセットに移動（右矢印）
    ev.stopPropagation();
    // 役割選択メニュを表示
    let itemRoleMenu = document.getElementById("dCrItemRoleMenu");
    itemRoleMenu.style.left = (ev.target.offsetLeft + 60) + "px";
    itemRoleMenu.style.top = (ev.target.offsetTop - 10) + "px";
    document.getElementById("dCrItemRoleMenu").style.display = "block";
    document.getElementById("body").addEventListener("click", dCrSelectItemRole);
}
function dCrSelectItemRole (ev, role) {    // 項目の役割を選択
    ev.stopPropagation();
    document.getElementById("dCrItemRoleMenu").style.display = "none";
    document.getElementById("body").removeEventListener("click", dCrSelectItemRole);
    if (!ev.target.closest("div.itemRoleMenu"))   // メニュー以外の領域をクリック
        return;

    let selectedItem =
        document.getElementById("dCrItemsInSource").querySelector("tr.selectedItem");
    selectedItem.className = selectedItem.className.replace("selectedItem", "").trim();
    let recordsetTable = document.getElementById("dCrItemsInRecordset").querySelector("table");
    let icon = document.createElement("td");
    icon.className = "itemIcon";
    let span = document.createElement("span");
    switch (role) {
        case "from":
        case "to":
        case "from/to":
            span.className = "itemIconTime";
            break;
        case "value":
        case "label":
            span.className = "itemIconValue";
            break;
        default:
            span.className = "itemIconOther";
    }
    icon.appendChild(span).appendChild(document.createTextNode(role));
    selectedItem.appendChild(icon);
    recordsetTable.appendChild(selectedItem);

    // 項目のソート（時間、値・ラベル、その他の順）
    let recordsetItems = Array.from(recordsetTable.querySelectorAll("tr"));
    recordsetItems.sort(function (a, b) {
        let aIcon = a.querySelector("span").className;
        let bIcon = b.querySelector("span").className;
        const cnTime = "itemIconTime";
        const cnValue = "itemIconValue";

        if (aIcon === bIcon) {
            if (a.querySelector("span").innerText === "from")
                return -1;
            if (a.querySelector("span").innerText === "to")
                return 1;
            return 0;
        }
        if (aIcon === cnTime)
            return -1;
        if (bIcon === cnTime)
            return 1;
        if (aIcon === cnValue)
            return -1;
        if (bIcon === cnValue)
            return 1;
    });
    for (let i = 0; i < recordsetItems.length; ++i) {
        recordsetTable.appendChild(recordsetItems[i]);
    }

    // 選択数が限定だれている役割を役割メニューから抜く
    switch (role) {
        case "from":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from/to']").
                style.display = "none";
            break;
        case "to":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='to']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from/to']").
                style.display = "none";
            break;
        case "from/to":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='to']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from/to']").
                style.display = "none";
            break;
        case "label":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='label']").
                style.display = "none";
            break;
    }
}
function dCrMoveItemToSource (ev) {      // 項目をソースに戻す（左矢印）
    ev.stopPropagation();
    let selectedItem = document.getElementById("dCrItemsInRecordset")
        .querySelector("tr.selectedItem");
    selectedItem.className
        = selectedItem.className.replace("selectedItem", "").trim();

    // 役割メニューの更新
    let role = selectedItem.querySelector("td.itemIcon span").innerText;
    function existIcon (role) {
        let icons = document.getElementById("dCrItemsInRecordset").
            querySelectorAll("td.itemIcon span");
        for (let i = 0; i < icons.length; ++i) {
            if (icons[i].innerText === role)
                return true;
        }
        return false;
    }
    switch (role) {
        case "from":
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='from']").style.display = "block";
            if (!existIcon("to"))
                document.getElementById("dCrItemRoleMenu").
                    querySelector("li[value='from/to']").style.display = "block";
            break;
        case "to":
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='to']").style.display = "block";
            if (!existIcon("from"))
                document.getElementById("dCrItemRoleMenu").
                    querySelector("li[value='from/to']").style.display = "block";
            break;
        case "from/to":
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='from']").style.display = "block";
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='to']").style.display = "block";
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='from/to']").style.display = "block";
            break;
        case "label":
            document.getElementById("dCrItemRoleMenu").
                querySelector("li[value='label']").style.display = "block";
            break;
    }
    selectedItem.querySelector("td.itemIcon").remove();
    let sourceTable = document.getElementById("dCrItemsInSource").querySelector("table");
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
function dCrSourcePreview (ev) {
    ev.stopPropagation();
    if (!dCrRecordset || dCrRecordset.length < 1)
        return;

    let table = document.getElementById("dialogSourcePreview").querySelector("table");
    table.querySelectorAll("tr").forEach(tr => {
        tr.remove();
    });
    if (!document.getElementById("dCrSourceHeading").checked) {
        let tr = document.createElement("tr");
        let dataLength = dCrRecordset[0].split(",").length;
        for (let j = 0; j < dataLength && j < 50; ++j) {
            tr.appendChild(document.createElement("td")).
                appendChild(document.createTextNode(j.toString()));
        }
        table.appendChild(tr);
    }
    for (let i = 0; i < 5 && i < dCrRecordset.length; ++i) {
        let data = dCrRecordset[i].split(",");
        let tr = document.createElement("tr");
        for (let j = 0; j < data.length && j < 50; ++j) {
            tr.appendChild(document.createElement("td")).
                appendChild(document.createTextNode(data[j]));
        }
        table.appendChild(tr);
    }
    showDialog("dialogSourcePreview")
}

// *** 実行操作関係 ***
function dCrCreate (ev) {  // Layer生成
    ev.stopPropagation();
    let layerType = document.getElementById("dCrLayerType").value;

    // Plain Layerは先に別途処理
    if (layerType === "Plain") {
        let panel =  new HuTime.TilePanel(NewLayerVBreadth);
        let plainLayer = new HuTime.Layer();
        panel.appendLayer(plainLayer);
        addTimeScale(plainLayer, panel);
        hutime.panelCollections[0].appendPanel(panel);
        hutime.redraw();
        addBranch(document.getElementById("treeRoot"), panel);
        dCrResetItemList();
        closeDialog("dialogCreate");
        return;
    }

    // 以下、Data Layerの処理
    // source
    let source, sourceName;
    if (document.getElementById("dCrSourceRemoteType").checked) {
        let url = document.getElementById("dCrSourceURL").value;
        source = new HuTime.CsvReader(url, true);
        sourceName = url.substr(url.lastIndexOf("/") + 1);
    }
    else {
        source = new HuTime.CsvReader(
            document.getElementById("dCrSourceFile").files[0], true);
        sourceName = source.source.name;
    }

    // item設定
    let from, to, label;
    let values = [];
    let others = [];
    let itemName;
    let icons = document.getElementById("dCrItemsInRecordset").
        querySelectorAll("td.itemIcon span");
    for (let i = 0; i < icons.length; ++i) {
        switch (icons[i].innerText) {
            case "from/to":
                from = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                to = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                break;
            case "from":
                from = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                break;
            case "to":
                to = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                break;
            case "value":
                values.push(icons[i].closest("tr").querySelector("td.itemName div").innerText);
                itemName = values[0];
                break;
            case "label":
                label = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                itemName = label;
                break;
            default:
                others.push(icons[i].closest("tr").querySelector("td.itemName div").innerText);
                break;
        }
    }
    if (!from || !to || (layerType !== "TimeLine" && values.length === 0) ||
        (layerType === "TimeLine" && !label)) {     // item指定のエラー
        document.getElementById("statusBar").innerText = "Error: Required items are not specified.";
        dCrClose();
        return;
    }

    // Recordset
    let plotColor = [ "#ff6633", "#99ff00", "#3399ff", "#ffff66", "#cc99ff" ];
    let rs;
    let calendarOfSource = document.getElementById("calendarOfSource").value;
    if (layerType === "TimeLine")
        if (calendarOfSource === "1.1")
            rs = new HuTime.TLineRecordset(source, from, to, label);
        else
            rs = new HuTime.CalendarTLineRecordset(source, from, to, label, calendarOfSource);
    else
        if (calendarOfSource === "1.1")
            rs = new HuTime.ChartRecordset(source, from, to, values[0],
                new HuTime.FigureStyle(plotColor[0], plotColor[0], 0));
        else
            rs = new HuTime.CalendarChartRecordset(source, from, to, values[0], calendarOfSource,
                new HuTime.FigureStyle(plotColor[0], plotColor[0], 0));
    rs.name = sourceName;
    for (let i = 1; i < values.length; ++i) {   // values[0]はコンストラクタで指定済み
        rs.recordSettings.appendDataSetting(new HuTime.RecordDataSetting(values[i]));
        rs.selectValueItem(values[i],
            new HuTime.FigureStyle(plotColor[i % 5], plotColor[i % 5], 0),
            new HuTime.FigureStyle(null, "black", 1), i);
    }
   for (let i = 0; i < others.length; ++i) {       // Otherの処理
        rs.recordSettings.appendDataSetting(new HuTime.RecordDataSetting(others[i]));
   }

    // Data Layer
    let dataLayer;
    switch (layerType) {
        case "TimeLine" :
            dataLayer = new HuTime.TLineLayer(rs);
            break;
        case "LineChart" :
            dataLayer = new HuTime.LineChartLayer(rs);
            break;
        case "BarChart" :
            rs.plotWidthType = 1;   // 可能範囲（pBegin - pEnd）で描画
            dataLayer = new HuTime.BarChartLayer(rs);
            break;
        case "PlotChart" :
            dataLayer = new HuTime.PlotChartLayer(rs);
            break;
        default :
            return;
    }
    dataLayer.name = sourceName + "_" + itemName

    // Panel
    let panel = new HuTime.TilePanel(NewLayerVBreadth);
    panel.name = sourceName + "_" + itemName
    panel.appendLayer(dataLayer);
    //addTimeScale(dataLayer, panel);

    // 最初のパネルの場合は、時間範囲を取得してから描画
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
            hutime.panelCollections[0].appendPanel(panel);
            hutime.redraw(tMin, tMax);
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;
        };
    }
    else {
        hutime.panelCollections[0].appendPanel(panel);
        hutime.redraw();
    }
    addBranch(document.getElementById("treeRoot"), panel);
    dCrClose();

    // 時間軸目盛りの追加
    function addTimeScale (layer, panel) {
        if (document.getElementById("createLayerAddScale").checked) {
            layer.vMarginBottom = NewLayerScaleVBreadth;
            let scaleLayer;
            let calendarId = document.getElementById("createLayerCalendarOfScale").value;
            if (calendarId === "1.1")
                scaleLayer = new HuTime.TickScaleLayer(NewLayerVBreadth, null, 0);
            else
                scaleLayer = new HuTime.CalendarScaleLayer(NewLayerVBreadth, null, 0,
                    document.getElementById("createLayerCalendarOfScale").value);
            scaleLayer.name = document.getElementById("createLayerCalendarOfScale").
                querySelector("option[value='" + calendarId + "']").innerText;
            panel.vBreadth += NewLayerScaleVBreadth;
            panel.appendLayer(scaleLayer);
        }
    }
}
function dCrClose () {
    dCrResetItemList();
    closeDialog("dialogCreate");
    dSpClose();
}

// **** Preview ダイアログ (dialogSourcePreview => dSp) ****
function dSpClose () {
    let table = document.getElementById("dialogSourcePreview").querySelector("table").
        querySelectorAll("tr").forEach(e => {
            e.remove();
    })
    closeDialog("dialogSourcePreview");
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

