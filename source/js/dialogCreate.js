// **** Createダイアログ (dialogCreate => dCr) ****
let dCrRecordset;   // ロードしたデータ
let dCrLayerType;   // レイヤタイプ

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

// *** Item 関係 ***
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
        case "afrom":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='afrom']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from/to']").
                style.display = "none";
            break;
        case "ato":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='ato']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from/to']").
                style.display = "none";
            break;
        case "from/to":
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='from']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='to']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='afrom']").
                style.display = "none";
            document.getElementById("dCrItemRoleMenu").querySelector("li[value='ato']").
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
function dCrOpen (type, hutimeObject, treeBranch) {
    if (hutimeObject)
        document.getElementById("dCrDialogTitle").innerText = "New Layer";
    else
        document.getElementById("dCrDialogTitle").innerText = "New Panel";
    document.getElementById("dialogCreate").hutimeObject = hutimeObject;
    document.getElementById("dialogCreate").treeBranch = treeBranch;

    dCrLayerType = type;
    document.getElementById("dCrTypeTLine").style.display = type === "TLine" ? "block" : "none";
    document.getElementById("dCrTypeChart").style.display = type === "Chart" ? "block" : "none";
    //document.getElementById("dCrTypeMask").style.display = type === "Mask" ? "block" : "none";
    document.getElementById("dCrTypeBlank").style.display = type === "Blank" ? "block" : "none";
    document.getElementById("dCrSource").style.display = type !== "Blank" ? "block" : "none";
    document.getElementById("dCrItem").style.display = type !== "Blank" ? "block" : "none";
    if (type !== "Blank") {
        let li = document.getElementById("dCrdCrItemRoleValue");
        li.setAttribute("value", type === "TLine" ? "label" : "value");
        li.innerHTML = type === "TLine" ? "Label" : "Value";
    }
    showDialog("dialogCreate");
}
function dCrClose () {
    document.getElementById("dCrPanelTitle").value = "";
    dCrResetItemList();
    closeDialog("dialogCreate");
    dSpClose();
}
function dCrCreate (ev) {  // Layer生成
    ev.stopPropagation();
    if (dCrLayerType === "Blank") {
        dcCreateBlank();
        return;
    }
    if (dCrLayerType === "Chart")
        dCrLayerType = document.getElementById("dCrLayerType").value;
    let title = document.getElementById("dCrPanelTitle").value;

    // source
    let source, sourceName;
    if (document.getElementById("dCrSourceRemoteType").checked) {
        let url = document.getElementById("dCrSourceURL").value;
        source = new HuTime.CsvReader(url,
            document.getElementById("dCrSourceHeading").checked);
        sourceName = url.substr(url.lastIndexOf("/") + 1);
    }
    else {
        source = new HuTime.CsvReader(
            document.getElementById("dCrSourceFile").files[0],
            document.getElementById("dCrSourceHeading").checked);
        sourceName = source.source.name;
    }

    // item設定
    let from, to, afrom, ato, label;
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
            case "afrom":
                afrom = icons[i].closest("tr").querySelector("td.itemName div").innerText;
                break;
            case "ato":
                ato = icons[i].closest("tr").querySelector("td.itemName div").innerText;
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
    if (!from || !to ||
        ((dCrLayerType === "LineChart" || dCrLayerType === "BarChart" || dCrLayerType === "PlotChart") && values.length === 0) ||
        (dCrLayerType === "TLine" && !label)) {     // item指定のエラー
        document.getElementById("statusBar").innerText = "Error: Required items are not specified.";
        dCrClose();
        return;
    }

    // Recordset
    let plotColor = [ "#ff6633", "#99ff00", "#3399ff", "#ffff66", "#cc99ff" ];
    let rs;
    let calendarOfSource = document.getElementById("calendarOfSource").value;
    if (dCrLayerType === "TLine")
        if (calendarOfSource === "1.1")
            rs = new HuTime.TLineRecordset(source, from, to, label);
        else
            // rs = new HuTime.CalendarTLineRecordset(source, from, to, label, calendarOfSource);
            // TODO: othersの一つ目の要素をグループ分けの元の情報として渡す
            rs = new HuTime.CalendarTLineRecordset(source, from, to, label, calendarOfSource, null, null, others[0]);
    else if (dCrLayerType === "Mask")
        rs = new HuTime.MaskRecordset(source, afrom, from, to, ato, calendarOfSource, null);
    else
        if (calendarOfSource === "1.1")
            rs = new HuTime.ChartRecordset(source, from, to, values[0],
                new HuTime.FigureStyle(plotColor[0], plotColor[0], 0));
        else
            // rs = new HuTime.CalendarChartRecordset(source, from, to, values[0], calendarOfSource,
            //     new HuTime.FigureStyle(plotColor[0], plotColor[0], 0));
            // TODO: othersの一つ目の要素をグループ分けの元の情報として渡す
            rs = new HuTime.CalendarChartRecordset(source, from, to, values[0], calendarOfSource, new HuTime.FigureStyle(plotColor[0], plotColor[0], 0), null, others[0]);
    rs.name = sourceName;
    for (let i = 1; i < values.length; ++i) {   // values[0]はコンストラクタで指定済み
        rs.recordSettings.appendDataSetting(new HuTime.RecordDataSetting(values[i]));
        rs.selectValueItem(values[i],
            new HuTime.FigureStyle(plotColor[i % 5], plotColor[i % 5], 0),
            new HuTime.FigureStyle(null, "black", 1), i);
    }
    // for (let i = 0; i < others.length; ++i) {       // Otherの処理
    for (let i = 1; i < others.length; ++i) {       // othersの一つ目の要素をグループ分けの元の情報としたのでindexは1から
        rs.recordSettings.appendDataSetting(new HuTime.RecordDataSetting(others[i]));
    }

    // Data Layer
    let dataLayer;
    let layerMarginTop = 0;
    /*
    if (document.getElementById("dialogCreate").hutimeObject)
        layerMarginTop = 0;
    else
        layerMarginTop = PanelTitleVBreadth;
    // */

    switch (dCrLayerType) {
        case "TLine" :
            dataLayer = new HuTime.TLineLayer(rs, null, layerMarginTop, null);
            break;
        case "LineChart" :
            dataLayer = new HuTime.LineChartLayer(rs, null, layerMarginTop, null);
            break;
        case "BarChart" :
            // plotWidthType: 可能範囲（pBegin - pEnd）で描画（rBegin - rEndだと、from/toが同じ日付だと逆転する）
            rs.plotWidthType = 1;
            dataLayer = new HuTime.BarChartLayer(rs, null, layerMarginTop, null);
            break;
        case "PlotChart" :
            dataLayer = new HuTime.PlotChartLayer(rs, null, layerMarginTop, null);
            break;
        case "Mask" :
            dataLayer = new HuTime.MaskLayer(rs, null, layerMarginTop, null);
            break;
        default :
            return;
    }
    dataLayer.name = sourceName + "_" + itemName;
    dataLayer.addEventListener("plotclick", dRDOpen);//dRDOpenはdialogData.jsに定義されている。
    dataLayer.useRecodeDetail = true;

    // 既存のパネルにレイヤを追加する場合
    if (document.getElementById("dialogCreate").hutimeObject) {
        // TODO: 追加時にTitleに入力された値がレイヤの名前となるよう追加
        dataLayer.name = title;
        let panel = document.getElementById("dialogCreate").hutimeObject;
        panel.appendLayer(dataLayer);
        addBranch(document.getElementById("dialogCreate").treeBranch, dataLayer,
            // undefined, undefined, undefined,
            // TODO: 追加時にTitleに入力された値がツリーに表示されるよう変更
            title, undefined, undefined,
            document.getElementById("dialogCreate").treeBranch.querySelector("li"));
        panel.redraw();
        dCrClose();
        return;
    }

    // Panel
    let panel = null;
    if (dCrLayerType === "Mask") {
        panel = new HuTime.TilePanel(dataLayer.vBreadth);
        panel.resizable = false;
    } else {
        panel = new HuTime.TilePanel(NewLayerVBreadth + PanelTitleVBreadth);
    }
    panel.name = title;
    panel.appendLayer(dataLayer);

    // Title Layer
    //panel.appendLayer(dCrCreateTitleLayer(title));

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
    if (isInitRedraw()) {
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
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;// 元に戻す
        };
    }
    else {
        hutime.panelCollections[0].appendPanel(panel);
        hutime.redraw();
    }
    addBranch(document.getElementById("treeRoot"), panel);
    dCrClose();
}
function dcCreateBlank () {
    // 既存のパネルにレイヤを追加する場合
    if (document.getElementById("dialogCreate").hutimeObject) {
        let panel = document.getElementById("dialogCreate").hutimeObject;
        let layer = new HuTime.Layer(null, 0, null);
        layer.name = document.getElementById("dCrPanelTitle").value;
        panel.appendLayer(layer);
        addBranch(document.getElementById("dialogCreate").treeBranch, layer,
            undefined, undefined, undefined, document.getElementById("dialogCreate").treeBranch.querySelector("li"));
        panel.redraw();
        dCrClose();
        return;
    }

    let title = document.getElementById("dCrPanelTitle").value;
    let panel = new HuTime.TilePanel(NewLayerVBreadth + PanelTitleVBreadth);
    let plainLayer = new HuTime.Layer(null, PanelTitleVBreadth, null);
    panel.appendLayer(plainLayer);
    panel.appendLayer(dCrCreateTitleLayer(title));
    panel.name = title;
    hutime.panelCollections[0].appendPanel(panel);
    hutime.redraw();
    addBranch(document.getElementById("treeRoot"), panel);
    dCrResetItemList();
    dCrClose();
}
function dCrCreateTitleLayer(title) {
    let titleLayer = new HuTime.Layer(NewLayerVBreadth + PanelTitleVBreadth);
    titleLayer.fixedLayer = true;
    titleLayer.name = "Annotation";
    titleLayer.appendObject(new HuTime.String(
        new HuTime.StringStyle(14, "#000000", "bold"),
        new HuTime.XYPosition(5, 15), title));
    titleLayer.zIndex = 120;
    return titleLayer;
}

// **** Preview ダイアログ (dialogSourcePreview => dSp) ****
function dSpClose () {
    document.getElementById("dialogSourcePreview").querySelector("table").
        querySelectorAll("tr").forEach(tr => {
            tr.remove();
    })
    closeDialog("dialogSourcePreview");
}

// **** Create Blank Panel ダイアログ (dialogNewBlankPanel => dCrBL) ****
function dCrBLOpen () {
    showDialog("dialogNewBlankPanel");
}
function dCrBLCreate () {
    let panel = new HuTime.TilePanel(NewLayerVBreadth + PanelTitleVBreadth);
    panel.name = document.getElementById("dCrBLPanelTitle").value;
    hutime.panelCollections[0].appendPanel(panel);
    hutime.redraw();
    addBranch(document.getElementById("treeRoot"), panel);
    closeDialog("dialogNewBlankPanel");
}

// **** Create Calendar Scale Panel ダイアログ (dialogNewCalendarScalePanel => dCrCS) ****
const DefaultScaleVBreath = 55;
function dCrSCOpen (type) {
    if (type === "layer") {
        document.getElementById("dCrCSDialogTitle").innerText =
            "New Calendar Scale Layer";
    }
    else {
        document.getElementById("dCrCSDialogTitle").innerText =
            "New Calendar Scale Panel";
    }
    document.getElementById("dialogNewCalendarScalePanel").type = type;
    showDialog("dialogNewCalendarScalePanel");
}
function dCrSCCreate () {
    let layer = new HuTime.CalendarScaleLayer(
        DefaultScaleVBreath, null, null,
        document.getElementById("dCrCSCalendar").value);
    layer.name = document.getElementById("dCrCSName").value;

    let panel;
    if (document.getElementById("dialogNewCalendarScalePanel").type === "layer") {
        layer.vMarginBottom = 0;
        panel = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
        panel.appendLayer(layer);
        addBranch(document.getElementById("treeContextMenu").treeBranch, layer,
            undefined, undefined, undefined,
            document.getElementById("treeContextMenu").treeBranch.querySelector("li"));
        panel.redraw();
    }
    else {
        panel = new HuTime.TilePanel(DefaultScaleVBreath);
        panel.name = document.getElementById("dCrCSName").value;
        panel.resizable = false;
        panel.appendLayer(layer);
        hutime.panelCollections[0].appendPanel(panel);
        hutime.redraw();
        addBranch(document.getElementById("treeRoot"), panel);
    }
    closeDialog("dialogNewCalendarScalePanel");
}
