// ****************
// Web HuTime Main Page
// Copyright (c) Tatsuki Sekino 2018-2020. All rights reserved.
// ****************

// **** 各種設定 ****
let hutime;
let mainPanelCollection;

let opStatus = 0;       // 現在の操作状態
const opNull = 0;       // 操作なし
const opMenuBar = 1;    // メニューバー操作中
const opTreeMenu = 2;   // レイヤツリーのコンテキストメニュ操作中
//const opDialog = 4;     // ダイアログ操作中

let mouseXOrigin = -1;          // マウス操作用の汎用変数（操作開始時の座標）
let mouseYOrigin = -1;

const selectedBranchColor = "#ffffcc";     // 選択中のツリー項目の色
const minLayerTreeWidth = 100;  // ツリーの最小幅
const minHuTimeMainWidth = 150; // メインパネルの最小幅
const minHuTimeMainHeight = 50; // メインパネルの最小幅
const HuTimeBackgroundColor = "#cccccc";    // メインパネルの背景色
const InitialRootName = "HuTime Root";     // パネルコレクションの名前の初期値

const NewLayerVBreadth = 150;           // 新規作成レイヤの既定の高さ
const PanelTitleVBreadth = 20;          // パネルタイトルの高さ
//const NewLayerScaleVBreadth = 50;    // 新規作成レイヤのスケールの既定の高さ

const DisabledLabelColor = "#cccccc";   // 無効化された要素のラベルの色

function initialize () {    // 全体の初期化
    hutime = new HuTime("hutimeMain");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("hutimeMain").clientHeight);
    mainPanelCollection.style.backgroundColor = HuTimeBackgroundColor;
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();

    initMenu();
    initTree();
    initTreeMenu();
    document.getElementById("borderStatusBar").addEventListener("mousedown", borderStatusMouseDown);
    document.getElementById("borderTree").addEventListener("mousedown", borderTreeMouseDown);
    initDialog();

    appendTimeScale("101.1");

    // 現在の前後1年を表示
    let begin = new Date(Date.now());
    begin.setFullYear(begin.getFullYear() - 1);
    let end = new Date(Date.now());
    end.setFullYear(end.getFullYear() + 1);
    hutime.redraw(HuTime.isoToJd(begin.toISOString()), HuTime.isoToJd(end.toISOString()));


    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/TLinePanel.json");
    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json");

    //showDialog("dialogPreferencesRecordset");

}

// **** メニューバーの操作 ****
let openedMenus = [];       // ユーザによって開かれたメニュー
function initMenu () {      // メニュー初期化
    let liElements = document.getElementById("menuTop").getElementsByTagName("li");
    for (let i = 0; i < liElements.length; ++i) {
        liElements[i].addEventListener("mouseover", operateMenu);
        liElements[i].addEventListener("click", clickMenu);
    }
}
function clickMenu (ev) {   // clickでの動作
    ev.stopPropagation();

    // メニュー操作開始
    if (opStatus === opNull) {
        openedMenus = [ document.getElementById("menuTop") ];
        document.getElementById("body").addEventListener("click", clickMenu);
        opStatus |= opMenuBar;
        operateMenu(ev);
        return;
    }

    if ((opStatus & ~opMenuBar) !== 0)      // メニュ以外を操作中は何もしない
        return;

    // メニュー操作継続 (操作終了場所以外（トップ以外の子メニューのある項目）のクリック)
    if (ev.target.closest("#menuTop") && ev.target.parentNode.id !== "menuTop"
        && ev.target.querySelector("ul"))
        return;

    // メニュー操作終了 (トップメニュー、メニューの外、または、子メニューの無い項目のクリック)
    while (openedMenus.length > 1) {    // topMenu（=item[0]）は残すので >1
        openedMenus.pop().style.display = "none";
    }
    openedMenus = [];       // スタックをクリア
    document.getElementById("body").removeEventListener("click", clickMenu);
    opStatus &= ~opMenuBar;
}
function operateMenu (ev) {   // mouseOverでの動作
    ev.stopPropagation();
    if ((opStatus & opMenuBar) === 0)   // メニューバー操作中以外
        return;

    for (let i = openedMenus.length - 1; i >= 0; --i) {     // 開いているメニューを末端から確認
        if (openedMenus[i] === ev.target.parentNode) {      // targetの親ULとスタック末尾を比較
            let childUL = ev.target.querySelector("ul");    // targetの子メニュー
            if (childUL) {                                  // targetに子メニューがあれば、開いて終了
                childUL.style.display = "block";
                openedMenus.push(childUL);
            }
            return;
        }
        if (i > 0)      // i=0のtopMenuは開いたまま
            openedMenus.pop().style.display = "none";   // targetと異なれば閉じて次のスタックデータへ
    }
}

// **** メインパネルのサイズ変更操作 ****
// ** ツリー境界の操作（横幅の変更） **
let layerTreeWidthOrigin = -1;
let hutimeMainWidthOrigin = -1;
function borderTreeMouseDown (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.addEventListener("mousemove", borderTreeMouseMove);
    hutimeElement.addEventListener("mouseup", borderTreeMouseUp);
    hutimeElement.addEventListener("mouseleave", borderTreeMouseUp);
    hutimeElement.style.cursor = "ew-resize";

    mouseXOrigin = ev.clientX;
    layerTreeWidthOrigin = document.getElementById("layerTree").offsetWidth;
    hutimeMainWidthOrigin = document.getElementById("mainPanel").offsetWidth
        - layerTreeWidthOrigin - document.getElementById("borderTree").offsetWidth;
}
function borderTreeMouseMove (ev) {
    ev.stopPropagation();
    let dMouseX = ev.clientX - mouseXOrigin;
    if (layerTreeWidthOrigin + dMouseX < minLayerTreeWidth
        || hutimeMainWidthOrigin - dMouseX < minHuTimeMainWidth)
        return;
    document.getElementById("layerTree").style.width = layerTreeWidthOrigin + dMouseX + "px";
}
function borderTreeMouseUp (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.style.cursor = "default";
    hutimeElement.removeEventListener("mouseleave", borderTreeMouseUp);
    hutimeElement.removeEventListener("mouseup", borderTreeMouseUp);
    hutimeElement.removeEventListener("mousemove", borderTreeMouseMove);

    hutime.redraw();
}

// ** ステータスバー境界の操作（縦幅の変更） **
let mainPanelHeightOrigin = -1;
function borderStatusMouseDown (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.addEventListener("mousemove", borderStatusMouseMove);
    hutimeElement.addEventListener("mouseup", borderStatusMouseUp);
    hutimeElement.addEventListener("mouseleave", borderStatusMouseUp);
    hutimeElement.style.cursor = "ns-resize";

    mouseYOrigin = ev.clientY;
    mainPanelHeightOrigin = document.getElementById("mainPanel").offsetHeight;
}
function borderStatusMouseMove (ev) {
    ev.stopPropagation();
    let dMouseY = ev.clientY - mouseYOrigin;
    if (mainPanelHeightOrigin + dMouseY < minHuTimeMainHeight)
        return;
    document.getElementById("mainPanel").style.height = mainPanelHeightOrigin + dMouseY + "px";
}
function borderStatusMouseUp (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.style.cursor = "default";
    hutimeElement.removeEventListener("mouseleave", borderStatusMouseUp);
    hutimeElement.removeEventListener("mouseup", borderStatusMouseUp);
    hutimeElement.removeEventListener("mousemove", borderStatusMouseMove);

    hutime.panelCollections[0].vBreadth = document.getElementById("hutimeMain").clientHeight;
    hutime.redraw();
}

// **** レイヤーツリーの操作 ****
function initTree () {
    addBranch(document.getElementById("layerTree")
        , hutime.panelCollections[0], InitialRootName, -1, "treeRoot");
    hutime.panelCollections[0].name = InitialRootName;
}

// ツリーの開閉
function operateBranch (ev) {
    ev.stopPropagation();
    let childUL = ev.target.closest("li").querySelector("ul");
    if (childUL.style.display === "block") {
        childUL.style.display = "none";
        ev.target.src = "img/expand.png";
    }
    else {
        childUL.style.display = "block";
        ev.target.src = "img/collapse.png";
    }
}

// オブジェクトのタイプを取得
function getObjType (obj, branch) {
    if (obj instanceof HuTime.PanelCollection)
        return "panelCollection";
    if (obj instanceof HuTime.TilePanel)
        return "tilePanel";
    if (obj instanceof HuTime.OverlayPanel)
        return "overlayPanel";
    if (obj instanceof HuTime.PanelBorder)
        return "panelBorder";

    if (obj instanceof HuTime.TLineLayer)
        return "tlineLayer";
    if (obj instanceof HuTime.RecordLayerBase)
        return "chartLayer";    // TLine以外のRecordLayerBase
    if (obj instanceof HuTime.TickScaleLayer)
        return "scaleLayer";
    if (obj instanceof HuTime.Layer)
        return "blankLayer";    // 上記以外のLayer

    if (obj instanceof HuTime.RecordsetBase)
        return "recordset";
    if (obj instanceof HuTime.String)
        return "string";
    if (obj instanceof HuTime.Image)
        return "image";
    if (obj instanceof HuTime.OnLayerObjectBase)
        return "shape";     // 上記以外のOnLayerObjectBase

    if (obj instanceof HuTime.RecordDataSetting) {
        let recordset;
        let parentBranch = branch;
        while (parentBranch) {
            if (parentBranch.objType === "Recordset") {
                recordset = parentBranch.hutimeObject;
                break;
            }
            parentBranch = parentBranch.parentNode.closest("li")
        }

        // 今後のt値指定の方法の統一に合わせて要改修
        if (recordset._tBeginDataSetting && recordset._tBeginDataSetting.itemName === obj.itemName ||
            recordset._tEndDataSetting && recordset._tEndDataSetting.itemName === obj.itemName)
            return "recordTValueItem";
        else if (recordset.recordSettings && recordset.recordSettings.tSetting &&
            (recordset.recordSettings.tSetting.itemNameBegin === obj.itemName ||
            recordset.recordSettings.tSetting.itemNameEnd === obj.itemName))
            return "recordTValueItem";
        else if ((recordset._valueItems && recordset._valueItems.find(
                valueObj => valueObj.name === obj.itemName)) ||
                recordset.labelItem === obj.itemName)
            return "recordDataItem";
        else
            return "recordItem";
    }
}

// ツリーの項目を追加
function addBranch (targetElement, hutimeObj, name, check, id) {
    // targetElement: 追加する先のli要素
    // hutimeObj: HuTimeオブジェクト (PanelCollection, Panel, Layer, Recordset)

    let hutimeObjSettings = {
        panelCollection: {
            iconSrc: "img/panelCollection.png", iconAlt: "Panel Collection", menuType: "Root"},
        tilePanel: {
            iconSrc: "img/tilePanel.png", iconAlt: "Tile Panel", menuType: "Panel"},
        overlayPanel: {
            iconSrc: "img/other.png", iconAlt: "Overlay Panel", menuType: "Other"},
        panelBorder: {
            iconSrc: "img/other.png", iconAlt: "Panel Border", menuType: "Other"},

        tlineLayer: {
            iconSrc: "img/tlineLayer.png", iconAlt: "TLine Layer", menuType: "TLineLayer"},
        chartLayer: {
            iconSrc: "img/chartLayer.png", iconAlt: "Chart Layer", menuType: "ChartLayer"},
        scaleLayer: {
            iconSrc: "img/scaleLayer.png", iconAlt: "Tick Scale Layer", menuType: "ScaleLayer"},
        blankLayer: {
            iconSrc: "img/blankLayer.png", iconAlt: "Blank Layer", menuType: "BlankLayer"},

        recordset: {
            iconSrc: "img/recordset.png", iconAlt: "Recordset", menuType: "Recordset"},
        string: {
            iconSrc: "img/string.png", iconAlt: "String", menuType: "String"},
        image: {
            iconSrc: "img/image.png", iconAlt: "Image", menuType: "Image"},
        shape: {
            iconSrc: "img/shape.png", iconAlt: "Shape", menuType: "Shape"},
        recordTValueItem: {
            iconSrc: "img/recordItem.png", iconAlt: "Record Item", menuType: "RecordItem"},
        recordDataItem: {
            iconSrc: "img/recordItem.png", iconAlt: "Record Item", menuType: "RecordItem"},
        recordItem: {
            iconSrc: "img/recordItem.png", iconAlt: "Record Item", menuType: "RecordItem"}
    };

    let hutimeObjType = getObjType(hutimeObj, targetElement);
    if (hutimeObjType === "panelBorder")    // パネル境界は対象にしない
        return;

    // li要素の追加
    let li = document.createElement("li");
    li.hutimeObject = hutimeObj;
    li.id = id;
    li.objType = hutimeObjSettings[hutimeObjType].menuType;
    targetElement.querySelector("ul").appendChild(li);

    // ブランチを示すspan要素
    let branchSpan = document.createElement("span");
    branchSpan.className = "branchSpan";
    li.appendChild(branchSpan);

    // 開閉ノブの追加
    let knobImg = document.createElement("img");
    knobImg.src = "img/expand.png";
    knobImg.className = "knob";
    knobImg.alt = "knob";
    knobImg.addEventListener("click", operateBranch);
    branchSpan.appendChild(knobImg);
    if (targetElement.hutimeObject instanceof HuTime.RecordsetBase)
        knobImg.style.visibility = "hidden";

    // チェックボックスの追加
    let checkbox = document.createElement("img");
    if (check < 0 || hutimeObjType === "recordTValueItem") {
        checkbox.src = "img/discheck.png";
    }
    else {
        checkbox.addEventListener("click", clickBranchCheckBox);
        if (check === 0)
            checkbox.src = "img/uncheck.png";
        else
            checkbox.src = "img/check.png";
    }
    checkbox.className = "branchCheckBox";
    checkbox.alt = "checkbox";
    checkbox.value = true;
    branchSpan.appendChild(checkbox);

    // 選択範囲用のspan要素の追加
    let selectSpan = branchSpan.appendChild(document.createElement("span"));
    selectSpan.addEventListener("click", selectBranch);
    selectSpan.addEventListener("contextmenu", treeContextMenu);
    selectSpan.className = "branchSelectSpan";

    // アイコンの追加
    if (hutimeObjType === "recordTValueItem" || hutimeObjType === "recordDataItem" ||
        hutimeObjType === "recordItem") {
        // Record Itemを描画するlayerを取得
        let layer, recordset;
        let parentBranch = li;
        while (parentBranch) {
            if (parentBranch.objType === "Recordset")
                recordset = parentBranch.hutimeObject;
            if (parentBranch.objType === "ChartLayer" || parentBranch.objType === "TLineLayer") {
                layer = parentBranch.hutimeObject;
                break;
            }
            parentBranch = parentBranch.parentNode.closest("li")
        }
        selectSpan.appendChild(getRecordItemIcon(hutimeObj, recordset, layer));
    }
    else {
        // icons for other than record items
        let icon = document.createElement("img");
        icon.className = "branchIcon";
        icon.src = hutimeObjSettings[hutimeObjType].iconSrc;
        icon.alt = hutimeObjSettings[hutimeObjType].iconAlt;
        icon.title = hutimeObjSettings[hutimeObjType].iconAlt;
        selectSpan.appendChild(icon);
    }

    // ラベルの追加（span要素を含む）
    let labelSpan = branchSpan.appendChild(document.createElement("span"));
    labelSpan.className = "branchLabelSpan";
    if (name) {
        labelSpan.appendChild(document.createTextNode(name));
    }
    else if (hutimeObj.name) {
        labelSpan.appendChild(document.createTextNode(hutimeObj.name));
    }
    else if (hutimeObj.itemName)
        labelSpan.appendChild(document.createTextNode(hutimeObj.recordDataName));
    else if ( typeof hutimeObj === "string") {
        labelSpan.appendChild(document.createTextNode(hutimeObj));
    }
    else {
        labelSpan.style.fontStyle = "italic";
        labelSpan.appendChild(document.createTextNode("untitled"));
    }
    selectSpan.appendChild(labelSpan);

    // 子要素用のul要素の追加
    let childObj = [];
    switch (hutimeObjType) {
        case "recordset":
            childObj = hutimeObj.recordSettings.dataSettings.slice();
            // 今後、TLineとChartで異なっているt値の項目の設定を統一のこと
            if (hutimeObj instanceof HuTime.ChartRecordset ||
                hutimeObj instanceof HuTime.TLineRecordset && !hutimeObj.recordSettings.tSetting) {
                childObj.push(hutimeObj._tBeginDataSetting);
                childObj.push(hutimeObj._tEndDataSetting);
            }
            else {
                childObj.push(new HuTime.RecordDataSetting(
                    hutimeObj.recordSettings.tSetting.itemNameBegin, "tBegin"));
                childObj.push(new HuTime.RecordDataSetting(
                    hutimeObj.recordSettings.tSetting.itemNameEnd, "tEnd"));
            }
            break;
        case "tlineLayer":
        case "chartLayer":
            childObj = hutimeObj.recordsets;
            break;
        case "scaleLayer":
            knobImg.style.visibility = "hidden";
            break;
        case "blankLayer":
            childObj = hutimeObj.objects;
            break;
        case "panelCollection":
        case "tilePanel":
        case "overlayPanel":
            childObj = hutimeObj.contents;
            break;
    }
    if (knobImg.style.visibility === "hidden")
        return;     // treeの末尾の場合は子要素は無し
    li.appendChild(document.createElement("ul"));
    for (let i = 0; i < childObj.length; ++i) {
        addBranch(li, childObj[i])
    }
}

// Record Itemアイコンの取得
function getRecordItemIcon (item, recordset, layer) {
    let icon;
    if (recordset._tBeginDataSetting && recordset._tBeginDataSetting.itemName === item.itemName ||
        recordset._tEndDataSetting && recordset._tEndDataSetting.itemName === item.itemName) {
        // 今後のt値指定の方法の統一に合わせて改修
        // t value icon
        icon = document.createElement("img");
        icon.className = "branchIcon";
        if (recordset._tBeginDataSetting.itemName === item.itemName &&
            recordset._tEndDataSetting.itemName === item.itemName)
            icon.src = "img/fromTo.png";
        else if (recordset._tBeginDataSetting.itemName === item.itemName)
            icon.src = "img/from.png";
        else
            icon.src = "img/to.png";
        icon.alt = "Record Item";
        icon.title = "Record Item";
    }
    else if (recordset.recordSettings && recordset.recordSettings.tSetting &&
        (recordset.recordSettings.tSetting.itemNameBegin === item.itemName ||
        recordset.recordSettings.tSetting.itemNameEnd === item.itemName)) {
        // 今後のt値指定の方法の統一に合わせて改修
        // t value icon
        icon = document.createElement("img");
        icon.className = "branchIcon";
        if (recordset.recordSettings.tSetting.itemNameBegin === item.itemName &&
            recordset.recordSettings.tSetting.itemNameEnd === item.itemName)
            icon.src = "img/fromTo.png";
        else if (recordset.recordSettings.tSetting.itemNameBegin === item.itemName)
            icon.src = "img/from.png";
        else
            icon.src = "img/to.png";
        icon.alt = "Record Item";
        icon.title = "Record Item";
    }
    else if ((recordset._valueItems && recordset._valueItems.find(
            valueObj => valueObj.name === item.itemName)) ||
            recordset.labelItem === item.itemName) {
        // value item and label item icon
        icon = getRecordDataItemIcon(item, recordset, layer);
    }
    else {
        // other items icon
        icon = document.createElement("img");
        icon.className = "branchIcon";
        icon.src = "img/recordItem.png";
        icon.alt = "Record Item";
        icon.title = "Record Item";
    }
    return icon;
}
function getRecordDataItemIcon (item, recordset, layer) {
    let canvas = document.createElement("canvas");
    canvas.className = "branchIcon";
    canvas.style.height = "19px";
    canvas.height = 18;
    canvas.width = 24;
    canvas.title = "Record Data Item";
    switch (layer.constructor.name) {
        case "TLineLayer":
            drawIconPeriod(canvas, recordset.rangeStyle, layer);
            drawIconLabel(canvas, recordset.labelStyle);
            break;
        case "LineChartLayer":
            drawIconLine(canvas, recordset.getItemLineStyle(item.itemName));
            drawIconPlot(canvas, recordset.getItemPlotStyle(item.itemName),
                recordset.getItemPlotSymbol(item.itemName),
                recordset.getItemPlotRotate(item.itemName));
            break;
        case "BarChartLayer":
            drawIconBar(canvas, recordset.getItemPlotStyle(item.itemName));
            break;
        case "PlotChartLayer":
            drawIconPlot(canvas, recordset.getItemPlotStyle(item.itemName),
                recordset.getItemPlotSymbol(item.itemName),
                recordset.getItemPlotRotate(item.itemName));
            break;
    }
    return canvas;
    function drawIconPeriod (canvas, style, layer) {
        let ctx = canvas.getContext("2d");
        if (layer.useBandStyle && style.fillColor && style.fillColor !== "") {
            drawBar(ctx);
            ctx.fillStyle = style.fillColor;
            ctx.fill();
        }
        if (style.lineWidth && style.lineColor && style.lineColor !== "") {
            if (layer.useBandStyle)
                drawBar(ctx);
            else
                drawLine(ctx);
            ctx.lineWidth = 2;
            ctx.strokeStyle = style.lineColor;
            ctx.stroke();
        }
        function drawBar (ctx) {
            ctx.beginPath();
            ctx.rect(1, 1, 22, 16);
        }
        function drawLine (ctx) {
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(24, 10);
            ctx.moveTo(1, 5);
            ctx.lineTo(1, 14);
            ctx.moveTo(23, 5);
            ctx.lineTo(23, 14);
        }
    }
    function drawIconLabel (canvas, style) {
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = style.fillColor;
        ctx.font = style.fontWeight + " " + style.fontStyle + " 13px '" + style.fontFamily + "'";
        ctx.fillText("a1", 4, 14, 20);
    }
    function drawIconLine (canvas, style) {
       let ctx = canvas.getContext("2d");
       if (style.lineWidth && style.lineColor && style.lineColor !== "") {
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(24, 10);
            ctx.strokeStyle = style.lineColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    function drawIconPlot (canvas, style, symbol, rotate) {
        let ctx = canvas.getContext("2d");
        ctx.translate(12, 10)
        ctx.rotate(rotate * Math.PI / 180);
        if (style.fillColor && style.fillColor !== "") {
            drawSymbol(ctx, symbol);
            ctx.fillStyle = style.fillColor;
            ctx.fill();
        }
        if (style.lineWidth && style.lineColor && style.lineColor !== "") {
            drawSymbol(ctx, symbol);
            ctx.lineWidth = 2;
            ctx.strokeStyle = style.lineColor;
            ctx.stroke();
        }
        ctx.rotate(-rotate * Math.PI / 180);
        ctx.translate(-12, -10)
        function drawSymbol (ctx, symbol) {
            switch (symbol) {
                case 0:
                    ctx.beginPath();
                    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
                    break;
                case 1:
                    ctx.beginPath();
                    ctx.rect(-5, -5, 10, 10);
                    break;
                case 2:
                    ctx.beginPath();
                    ctx.moveTo(0, -6.928);
                    ctx.lineTo(6, 3.464);
                    ctx.lineTo(-6, 3.464);
                    ctx.closePath();
                    break;
                case 3:
                    ctx.beginPath();
                    ctx.moveTo(0, -6);
                    ctx.lineTo(0, 6);
                    ctx.moveTo(-6, 0);
                    ctx.lineTo(6, 0);
                    break;
            }
        }
    }
    function drawIconBar (canvas, style) {
        let ctx = canvas.getContext("2d");
        if (style.fillColor && style.fillColor !== "") {
            drawBars(ctx);
            ctx.fillStyle = style.fillColor;
            ctx.fill();
        }
        if (style.lineWidth && style.lineColor && style.lineColor !== "") {
            drawBars(ctx);
            ctx.lineWidth = 2;
            ctx.strokeStyle = style.lineColor;
            ctx.stroke();
        }
        function drawBars (ctx) {
            ctx.beginPath();
            ctx.rect(1, 9, 10, 8);
            ctx.rect(11, 1, 10, 16);
        }
    }
}

// チェックボックスをクリック
function clickBranchCheckBox (ev) {
    ev.stopPropagation();
    if (ev.target.value) {
        ev.target.src
            = ev.target.src.substr(0, ev.target.src.lastIndexOf("/") + 1) + "uncheck.png";
        ev.target.value = false;

        let li = ev.target.closest("li");
        if (li.objType === "RecordItem" && getObjType(li.hutimeObject, li) === "recordDataItem") {
            let recordset, layer;
            let parentBranch = li;
            while (parentBranch) {
                if (parentBranch.objType === "Recordset")
                    recordset = parentBranch.hutimeObject;
                if (parentBranch.hutimeObject instanceof HuTime.Layer) {
                    layer = parentBranch.hutimeObject;
                    break;
                }
                parentBranch = parentBranch.parentNode.closest("li")
            }
            if (layer instanceof HuTime.TLineLayer) {
                recordset.showRecordset = false;    // 機能せず
                recordset.showLabel = false;
            }
            else {
                recordset.setItemShowPlot(li.hutimeObject.itemName, false);
                recordset.setItemShowLine(li.hutimeObject.itemName, false);
            }
        }
        li.hutimeObject.visible = false;
    }
    else {
        ev.target.src
            = ev.target.src.substr(0, ev.target.src.lastIndexOf("/") + 1) + "check.png";
        ev.target.value = true;

        let li = ev.target.closest("li");
        if (li.objType === "RecordItem" && getObjType(li.hutimeObject, li) === "recordDataItem") {
            let recordset, layer;
            let parentBranch = li;
            while (parentBranch) {
                if (parentBranch.objType === "Recordset")
                    recordset = parentBranch.hutimeObject;
                if (parentBranch.hutimeObject instanceof HuTime.Layer) {
                    layer = parentBranch.hutimeObject;
                    break;
                }
                parentBranch = parentBranch.parentNode.closest("li")
            }
            if (layer instanceof HuTime.TLineLayer) {
                recordset.showRecordset = true;     // 機能せず
                recordset.showLabel = true;
            }
            else {
                recordset.setItemShowPlot(li.hutimeObject.itemName, true);
                recordset.setItemShowLine(li.hutimeObject.itemName, true);
            }
        }
        li.hutimeObject.visible = true;
    }
    hutime.redraw();
}

// ツリー上のアイテムの選択
let selectedObject = null;      // 選択中の HuTimeオブジェクト
let selectedBranch = null;      // 選択中の枝（li）
let selectedBranchSpan = null;  // 選択中の枝（span）
function selectBranch (ev) {
    let branchSPAN = ev.target.closest("span.branchSpan");
    let branchLI = ev.target.closest("li");

    if  (branchLI === selectedBranch) {      // 選択中の枝－＞選択解除
        deselectBranch();
        return;
    }
    if  (selectedBranch) {     // 他を選択中－＞選択範囲を変更（前の選択を解除）
        selectedBranchSpan.style.backgroundColor = "";
        selectedBranch = null;
        selectedBranchSpan = null;
        selectedObject = null;
    }
    branchSPAN.style.backgroundColor = selectedBranchColor;
    selectedObject = branchLI.hutimeObject;
    selectedBranch = branchLI;
    selectedBranchSpan = branchSPAN;

    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function deselectBranch () {
    selectedBranchSpan.style.backgroundColor = "";
    selectedBranch = null;
    selectedBranchSpan = null;
    selectedObject = null;
}

// ** レイヤツリーの右クリックメニュー操作 **
let openedTreeMenus = [];       // ユーザによって開かれたメニュー
let ContextMenuId = "";
function initTreeMenu () {      // メニュー初期化
    let liElements = document.getElementById("treeContextMenu").getElementsByTagName("li");
    for (let i = 0; i < liElements.length; ++i) {
        liElements[i].addEventListener("mouseover", operateTreeMenu);
        liElements[i].addEventListener("click", clickTreeMenu);
        liElements[i].addEventListener("contextmenu", clickTreeMenu);
    }
}
function treeContextMenu (ev) {     // 右クリックでの動作（開始時）
    ev.stopPropagation();
    ev.preventDefault();

    if (selectedBranch !== ev.target.closest("li"))
        selectBranch(ev);

    // メニュー操作中の場合は左右クリック同じ動作
    if ((opStatus & opTreeMenu) !== 0)
        clickTreeMenu(ev);

    // 他の機能を操作中の場合はそのまま戻る
    if (opStatus !== opNull)
        return;

    // メニュー操作開始
    opStatus |= opTreeMenu;
    document.getElementById("body").addEventListener("click", clickTreeMenu);
    document.getElementById("body").addEventListener("contextmenu", clickTreeMenu);
    let menuContainer = document.getElementById("treeContextMenu");
    let mainPanel = document.getElementById("mainPanel");
    menuContainer.style.left = (ev.clientX - mainPanel.offsetLeft) + "px";
    menuContainer.style.top = (ev.clientY - mainPanel.offsetTop)+ "px";
    menuContainer.style.display = "block";
    menuContainer.treeBranch = ev.target.closest("li");

    // タイプに合わせてメニューを表示
    menuContainer.querySelectorAll("ul.treeMenu").forEach(ul => {
        ul.style.display = "none";      // いったんすべてのメニューを非表示
    })
    let objType = ev.target.closest("li").objType;
    let topMenu = document.getElementById("tCM" + objType);
    topMenu.style.display = "block";
    openedTreeMenus.push(topMenu);

}
function clickTreeMenu (ev) {   // clickでの動作/
    ev.preventDefault();
    ev.stopPropagation();
    if ((opStatus & opTreeMenu) === 0)
        return;

    // メニュー操作継続 (操作終了場所以外（子メニューのある項目）のクリック)
    if (ev.target.closest("#treeContextMenu") && ev.target.querySelector("ul"))
        return;

    // メニュー操作終了 (メニューの外、または、子メニューの無い項目のクリック)
    while (openedTreeMenus.length > 0) {    // topTreeMenu（=item[0]）も含めて閉じる
        openedTreeMenus.pop().style.display = "none";
    }
    document.getElementById("treeContextMenu").style.display = "false";
    document.getElementById("treeContextMenu").style.display = "none";
    document.getElementById("body").removeEventListener("contextmenu", clickTreeMenu);
    document.getElementById("body").removeEventListener("click", clickTreeMenu);
    opStatus &= ~opTreeMenu;
}
function operateTreeMenu (ev) {   // mouseOverでの動作
    ev.preventDefault();
    ev.stopPropagation();
    if ((opStatus & opTreeMenu) === 0)
        return;

    for (let i = openedTreeMenus.length - 1; i >= 0; --i) {
        if (openedTreeMenus[i] === ev.target.parentNode) {
            let childUL = ev.target.querySelector("ul");
            if (childUL) {
                childUL.style.display = "block";
                openedTreeMenus.push(childUL);
            }
            return;
        }
        if (i > 0)     // i=0のtopTreeMenuは開いたまま
            openedTreeMenus.pop().style.display = "none";   // targetと異なれば閉じて次のスタックデータへ
    }
}

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

// **** Preferencesダイアログ ****

// *** Preferences of Panel Collectionダイアログ (dialogPreferencesPanelCollection => dPPC)
function dPPCOpen() {
    let panelCollection = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPPCName").value = panelCollection.name;

    document.getElementById("dPPCBackgroundColor").value = panelCollection.style.backgroundColor;
    document.getElementById("dialogPreferencesPanelCollection").hutimeObject = panelCollection;
    showDialog("dialogPreferencesPanelCollection");
}
function dPPCApply() {
    let panelCollection = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    panelCollection.name = document.getElementById("dPPCName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = panelCollection.name;
    panelCollection.style.backgroundColor = document.getElementById("dPPCBackgroundColor").value;
    hutime.redraw();
}
function dPPCClose() {
    dPPCApply();
    closeDialog("dialogPreferencesPanelCollection");
    deselectBranch();
}

// *** Preferences of Tile Panelダイアログ (dialogPreferencesTilePanel => dPTP)
function dPTPOpen() {
    let panel = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPTPName").value = panel.name;

    document.getElementById("dPTPResizable").checked = panel.resizable;
    document.getElementById("dPTPRepositionable").checked = panel.repositionable;
    if (panel.tRatio === Math.floor(panel.tRatio))
        document.getElementById("dPTPTRatio").value = panel.tRatio.toFixed(1);
    else
        document.getElementById("dPTPTRatio").value = panel.tRatio;

    document.getElementById("dPTPBackgroundColor").value = panel.style.backgroundColor;
    document.getElementById("dialogPreferencesTilePanel").hutimeObject = panel;
    showDialog("dialogPreferencesTilePanel");
}
function dPTPApply() {
    let panel = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    panel.name = document.getElementById("dPTPName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = panel.name;

    panel.resizable = document.getElementById("dPTPResizable").checked;
    panel.repositionable = document.getElementById("dPTPRepositionable").checked;
    panel.tRatio = parseFloat(document.getElementById("dPTPTRatio").value);

    panel.style.backgroundColor = document.getElementById("dPTPBackgroundColor").value;
    hutime.redraw();
}
function dPTPClose() {
    dPTPApply();
    closeDialog("dialogPreferencesTilePanel");
    deselectBranch();
}

// *** Preferences of TLine Layerダイアログ (dialogPreferencesTLineLayer => dPTL)
function dPTLPlotTypeChanged () {
    if (document.getElementById("dPTLTypeLine").checked) {
        document.getElementById("dPTLBandBreadth").disabled = true;
        document.getElementById("dPTLBandBreadthLabel").style.color = DisabledLabelColor;
        document.getElementById("dPTLBandBreadthUnit").style.color = DisabledLabelColor;
    }
    else {
        document.getElementById("dPTLBandBreadth").disabled = false;
        document.getElementById("dPTLBandBreadthLabel").style.color = "#000000";
        document.getElementById("dPTLBandBreadthUnit").style.color = "#000000";
    }
}
function dPTLOpen () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPTLName").value = layer.name;

    document.getElementById("dPTLTypeBand").checked = layer.useBandStyle;
    document.getElementById("dPTLTypeLine").checked = !layer.useBandStyle;
    document.getElementById("dPTLBandBreadth").value = layer.recordsets[0].bandBreadth;
    dPTLPlotTypeChanged();

    document.getElementById("dPTLdrawPAsR").checked = !layer.recordsets[0].drawPRangeAsRRange;
    document.getElementById("dPTLInterval").value = layer.plotInterval;
    document.getElementById("dPTLPadding").value = layer.padding;

    document.getElementById("dPTLHeight").value = layer.vBreadth;
    document.getElementById("dPTLMarginTop").value = layer.vMarginTop;
    document.getElementById("dPTLMarginBottom").value = layer.vMarginBottom;

    document.getElementById("dPTLBackgroundColor").value = layer.style.backgroundColor;
    document.getElementById("dialogPreferencesTLineLayer").hutimeObject = layer;
    showDialog("dialogPreferencesTLineLayer");
}
function dPTLApply () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    layer.name = document.getElementById("dPTLName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = layer.name;

    if (document.getElementById("dPTLTypeBand").checked !== layer.useBandStyle) {
        layer.useBandStyle = document.getElementById("dPTLTypeBand").checked;
        // 前の設定を残しつつ、書式を継承する（帯の色を線の色にするなど）
        if (layer.recordsets[0].rangeStyleOld) {
            let styleTemp = new HuTime.FigureStyle(layer.recordsets[0].rangeStyle.fillColor,
                layer.recordsets[0].rangeStyle.lineColor, layer.recordsets[0].rangeStyle.fillColor);
            layer.recordsets[0].rangeStyle.fillColor = layer.recordsets[0].rangeStyleOld.fillColor;
            layer.recordsets[0].rangeStyle.lineColor = layer.recordsets[0].rangeStyleOld.lineColor;
            layer.recordsets[0].rangeStyle.lineWidth = layer.recordsets[0].rangeStyleOld.lineWidth;
            layer.recordsets[0].rangeStyleOld.fillColor = styleTemp.fillColor;  // 前の設定を保存
            layer.recordsets[0].rangeStyleOld.lineColor = styleTemp.lineColor;
            layer.recordsets[0].rangeStyleOld.lineWidth = styleTemp.lineWidth;
        }
        else {
            layer.recordsets[0].rangeStyleOld = new HuTime.FigureStyle(     // 前の設定を保存
                layer.recordsets[0].rangeStyle.fillColor,
                layer.recordsets[0].rangeStyle.lineColor, layer.recordsets[0].rangeStyle.lineWidth);
            if (layer.useBandStyle) {   // 線->帯
                layer.recordsets[0].rangeStyle.fillColor = layer.recordsets[0].rangeStyle.lineColor;
                layer.recordsets[0].rangeStyle.lineColor = null;
                layer.recordsets[0].rangeStyle.lineWidth = null;
            }
            else    // 帯->線
            {
                layer.recordsets[0].rangeStyle.lineColor = layer.recordsets[0].rangeStyle.fillColor;
                layer.recordsets[0].rangeStyle.fillColor = null;
                layer.recordsets[0].rangeStyle.lineWidth = 2;
            }
        }
        changeDataItemIcon();
    }
    layer.recordsets[0].bandBreadth = parseFloat(document.getElementById("dPTLBandBreadth").value);

    layer.recordsets[0].drawPRangeAsRRange = !document.getElementById("dPTLdrawPAsR").checked;
    layer.plotInterval = parseFloat(document.getElementById("dPTLInterval").value);
    layer.padding = parseFloat(document.getElementById("dPTLPadding").value);

    layer.vBreadth = parseFloat(document.getElementById("dPTLHeight").value);
    layer.vMarginTop = parseFloat(document.getElementById("dPTLMarginTop").value);
    layer.vMarginBottom = parseFloat(document.getElementById("dPTLMarginBottom").value);

    layer.style.backgroundColor = document.getElementById("dPTLBackgroundColor").value;
    hutime.redraw();

    function changeDataItemIcon () {
        let treeChildBranches =
            document.getElementById("treeContextMenu").treeBranch.querySelectorAll("li");
        let recordset;
        let dataSettings;
        for (let i = 0; i < treeChildBranches.length; ++i) {
            if (treeChildBranches[i].objType === "Recordset") {
                recordset = treeChildBranches[i].hutimeObject;
                dataSettings = recordset.recordSettings.dataSettings;
                break;
            }
        }
        let dataItemBranches = [];
        for (let i = 0; i < treeChildBranches.length; ++i) {
            for (let j = 0; j < dataSettings.length; ++j) {
                if (treeChildBranches[i].objType === "RecordItem" &&
                    treeChildBranches[i].hutimeObject.recordDataName === dataSettings[j].recordDataName) {
                    dataItemBranches.push(treeChildBranches[i]);
                    break;
                }
            }
        }
        for (let i = 0; i < dataItemBranches.length; ++i) {
        let canvas = dataItemBranches[0].querySelector("*.branchIcon");
            canvas.parentNode.insertBefore(getRecordDataItemIcon(
                dataItemBranches[0].hutimeObject, recordset, layer), canvas);
            canvas.remove();
        }
    }
}
function dPTLClose (ev) {
    dPTLApply(ev);
    closeDialog("dialogPreferencesTLineLayer");
    deselectBranch();
}

// *** Preferences of Chart Layerダイアログ (dialogPreferencesChartLayer => dPCL)
function dPCLOpen () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPCLName").value = layer.name;
    switch (layer.constructor.name) {
        case "LineChartLayer":
            document.getElementById("dPCLType").value = "LineChart";
            break;
        case "BarChartLayer":
            document.getElementById("dPCLType").value = "BarChart";
            break;
        case "PlotChartLayer":
            document.getElementById("dPCLType").value = "PlotChart";
            break;
        default:
            document.getElementById("dPCLType").value = "";
    }
    document.getElementById("dPCLHeight").value = layer.vBreadth;
    document.getElementById("dPCLMarginTop").value = layer.vMarginTop;
    document.getElementById("dPCLMarginBottom").value = layer.vMarginBottom;
    document.getElementById("dPCLVTop").value = layer.vTop;
    document.getElementById("dPCLVBottom").value = layer.vBottom;

    document.getElementById("dPCLBackgroundColor").value = layer.style.backgroundColor;

    document.getElementById("dialogPreferencesChartLayer").hutimeObject = layer;
    showDialog("dialogPreferencesChartLayer");
}
function dPCLApply () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    layer.name = document.getElementById("dPCLName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = layer.name;

    let type = document.getElementById("dPCLType").value;
    if (type !== layer.constructor.name.replace("Layer", "")) {
        let newLayer;
        switch (type) {
            case "LineChart":
                newLayer = new HuTime.LineChartLayer();
                break;
            case "BarChart":
                newLayer = new HuTime.BarChartLayer();
                break;
            case "PlotChart":
                newLayer = new HuTime.PlotChartLayer();
                break;
        }
        for (let i = 0; i < layer.recordsets.length; ++i) {
            layer.recordsets[i].plotWidthType = 1;   // 可能範囲（pBegin - pEnd）で描画
            newLayer.recordsets.push(layer.recordsets[i]);
        }
        for (let i = 0; i < layer.parent.layers.length; ++i) {
            if (layer.parent.layers[i] === layer) {
                layer.parent.appendLayer(newLayer);
                layer.parent.layers.splice(i, 0, layer.parent.layers.pop());    // 同じ位置へ
                layer.parent.removeLayer(layer);
                break;
            }
        }
        document.getElementById("treeContextMenu").treeBranch.hutimeObject = newLayer;
        layer = newLayer;
        updateTreeIcon(layer, document.getElementById("treeContextMenu").treeBranch);
    }
    layer.vBreadth = parseFloat(document.getElementById("dPCLHeight").value);
    layer.vMarginTop = parseFloat(document.getElementById("dPCLMarginTop").value);
    layer.vMarginBottom = parseFloat(document.getElementById("dPCLMarginBottom").value);
    layer.vTop = parseFloat(document.getElementById("dPCLVTop").value);
    layer.vBottom = parseFloat(document.getElementById("dPCLVBottom").value);

    layer.style.backgroundColor = document.getElementById("dPCLBackgroundColor").value;
    hutime.redraw();

    // ツリーメニューのアイコンを更新
    function updateTreeIcon(layer, layerBranch) {
        let recordsetBranches = layerBranch.querySelectorAll("li");
        for (let i = 0; i < recordsetBranches.length; ++i) {
            if (recordsetBranches[i].hutimeObject instanceof HuTime.RecordsetBase) {
                let itemBranches = recordsetBranches[i].querySelectorAll("li");
                for (let j = 0; j < itemBranches.length; ++j) {
                    if(itemBranches[i].hutimeObject instanceof HuTime.RecordDataSetting) {
                        let newIcon = getRecordItemIcon(itemBranches[j].hutimeObject,
                            recordsetBranches[i].hutimeObject, layer);
                        let oldIcon = itemBranches[j].querySelector("*.branchIcon");
                        oldIcon.parentNode.insertBefore(newIcon, oldIcon);
                        oldIcon.remove();
                    }
                }
            }
        }
    }
}
function dPCLClose (ev) {
    dPCLApply(ev);
    closeDialog("dialogPreferencesChartLayer");
    deselectBranch();
}

function dPRSOpen () {
    let recordset = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPRSName").value = recordset.name;
    if (recordset.reader.source instanceof File)
        document.getElementById("dPRSSource").innerText = recordset.reader.source.name;
    else
        document.getElementById("dPRSSource").innerText = recordset.reader.source;

    document.getElementById("dialogPreferencesRecordset").hutimeObject = recordset;
    showDialog("dialogPreferencesRecordset");
}
function dRSLApply () {
    let recordset = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    recordset.name = document.getElementById("dPRSName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = recordset.name;
}
function dPRSClose() {
    dRSLApply();
    closeDialog("dialogPreferencesRecordset");
    deselectBranch();
}
// *** Preferences of Record Item (dialogPreferencesRecordItem => dPRI)
function dPRIOpen () {
    let item = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    // Record Itemを描画するlayerを取得
    let layer, recordset;
    let parentBranch = document.getElementById("treeContextMenu").treeBranch;
    while (parentBranch) {
        if (parentBranch.objType === "Recordset")
            recordset = parentBranch.hutimeObject;
        if (parentBranch.objType === "ChartLayer" || parentBranch.objType === "TLineLayer") {
            layer = parentBranch.hutimeObject;
            break;
        }
        parentBranch = parentBranch.parentNode.closest("li")
    }
    document.getElementById("dPRIName").value = item.recordDataName;
    document.getElementById("dPRIRecordsetName").value = item.itemName;
    // レイヤの種類に応じた項目の表示と値のセット
    document.getElementById("dPRIPeriod").style.display = "none";
    document.getElementById("dPRILabel").style.display = "none";
    document.getElementById("dPRILine").style.display = "none";
    document.getElementById("dPRIPlot").style.display = "none";
    document.getElementById("dPRIBar").style.display = "none";
    function getDPRIPeriod (item) {
        document.getElementById("dPRIPeriod").style.display = "block";

        if (layer.useBandStyle)
            document.getElementById("dPRIPeriodColor").value = recordset.rangeStyle.fillColor;
        else
            document.getElementById("dPRIPeriodColor").value = recordset.rangeStyle.lineColor;
    }
    function getDPRILabel (item) {
        document.getElementById("dPRILabelShow").checked = recordset.showLabel;

        document.getElementById("dPRILabelTOffset").value = recordset.labelOffsetT;
        document.getElementById("dPRILabelVOffset").value =  recordset.labelOffsetV;
        document.getElementById("dPRILabelRotate").value =  recordset.labelRotate;

        document.getElementById("dPRILabel").style.display = "block";
        let style = recordset.labelStyle;
        document.getElementById("dPRILabelFont").value =  style.fontFamily;
        document.getElementById("dPRILabelStyle").value = style.fontStyle;
        document.getElementById("dPRILabelColor").value = style.fillColor;
        document.getElementById("dPRILabelSize").value = parseFloat(style.fontSize);
    }
    function getDPRILine (item) {
        document.getElementById("dPRILine").style.display = "block";

        let style = recordset.getItemLineStyle(item.itemName);
        document.getElementById("dPRILineColor").value = style.lineColor;
        document.getElementById("dPRILineWidth").value = style.lineWidth;
    }
    function getDPRIPlot (item) {
        document.getElementById("dPRIPlot").style.display = "block";
        document.getElementById("dPRIPlotType").value =
            recordset.getItemPlotSymbol(item.itemName);
        document.getElementById("dPRIPlotSize").value =
            recordset.getItemPlotWidth(item.itemName);
        document.getElementById("dPRIPlotRotate").value =
            recordset.getItemPlotRotate(item.itemName);
        let style = recordset.getItemPlotStyle(item.itemName);
        document.getElementById("dPRIPlotFillColor").value = style.fillColor;
        document.getElementById("dPRIPlotEdgeColor").value = style.lineColor;
        document.getElementById("dPRIPlotEdgeWidth").value = style.lineWidth;
    }
    function getDPRIBar(item) {
        document.getElementById("dPRIBar").style.display = "block";
        let style = recordset.getItemPlotStyle(item.itemName);
        document.getElementById("dPRIBarFillColor").value = style.fillColor;
        document.getElementById("dPRIBarEdgeColor").value = style.lineColor;
        document.getElementById("dPRIBarEdgeWidth").value = style.lineWidth;
    }
    if (recordset._tBeginDataSetting && recordset._tBeginDataSetting.itemName === item.itemName ||
        recordset._tEndDataSetting && recordset._tEndDataSetting.itemName === item.itemName ||
        recordset.recordSettings.tSetting &&
            (recordset.recordSettings.tSetting.itemNameBegin === item.itemName ||
            recordset.recordSettings.tSetting.itemNameBegin === item.itemName)) {
        // Preferences of t value
    }
    else if ((recordset._valueItems && recordset._valueItems.find(
            valueObj => valueObj.name === item.itemName)) ||
            recordset.labelItem === item.itemName) {
        switch (layer.constructor.name) {
            case "TLineLayer":
                getDPRIPeriod(item);
                getDPRILabel(item);
                break;
            case "LineChartLayer":
                getDPRILine(item);
                getDPRIPlot(item);
                break;
            case "BarChartLayer":
                getDPRIBar(item);
                break;
            case "PlotChartLayer":
                getDPRIPlot(item);
                break;
        }
    }
    else {
        // Preferences of other items
    }
    showDialog("dialogPreferencesRecordItem");
}
function dPRIApply () {
    let item = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    // Record Itemを描画するlayerを取得
    let layer, recordset;
    let parentBranch = document.getElementById("treeContextMenu").treeBranch;
    while (parentBranch) {
        if (parentBranch.objType === "Recordset")
            recordset = parentBranch.hutimeObject;
        if (parentBranch.objType === "ChartLayer" || parentBranch.objType === "TLineLayer") {
            layer = parentBranch.hutimeObject;
            break;
        }
        parentBranch = parentBranch.parentNode.closest("li")
    }
    function setDPRIPeriod (item) {
        if (layer.useBandStyle)
            recordset.rangeStyle = new HuTime.FigureStyle(
                document.getElementById("dPRIPeriodColor").value, null, null);
        else
            recordset.rangeStyle = new HuTime.FigureStyle(
                null, document.getElementById("dPRIPeriodColor").value, null);
    }
    function setDPRILabel (item) {
        recordset.showLabel = document.getElementById("dPRILabelShow").checked;

        recordset.labelOffsetT = parseFloat(document.getElementById("dPRILabelTOffset").value);
        recordset.labelOffsetV = parseFloat(document.getElementById("dPRILabelVOffset").value);
        recordset.labelRotate = parseFloat(document.getElementById("dPRILabelRotate").value);

        let style = new HuTime.StringStyle();
        style.fontFamily = document.getElementById("dPRILabelFont").value;
        let fontStyle = document.getElementById("dPRILabelStyle").value;
        style.fontStyle = "normal";
        style.fontWeight = 400;
        if (fontStyle.indexOf("italic") >= 0)
            style.fontStyle = "italic";
        if (fontStyle.indexOf("bold") >= 0)
            style.fontWeight = 700;
        style.fillColor = document.getElementById("dPRILabelColor").value;
        style.fontSize = parseFloat(document.getElementById("dPRILabelSize").value);
        recordset.labelStyle = style;
    }
    function setDPRILine (item) {
        recordset.setItemLineStyle(item.itemName, new HuTime.FigureStyle(
            null,
            document.getElementById("dPRILineColor").value,
            parseFloat(document.getElementById("dPRILineWidth").value)));
    }
    function setDPRIPlot (item) {
        recordset.setItemPlotSymbol(item.itemName,
            parseFloat(document.getElementById("dPRIPlotType").value));
        recordset.setItemPlotWidth(item.itemName,
            parseFloat(document.getElementById("dPRIPlotSize").value));
        recordset.setItemPlotRotate(item.itemName,
            parseFloat(document.getElementById("dPRIPlotRotate").value));
        recordset.setItemPlotStyle(item.itemName, new HuTime.FigureStyle(
            document.getElementById("dPRIPlotFillColor").value,
            document.getElementById("dPRIPlotEdgeColor").value,
            parseFloat(document.getElementById("dPRIPlotEdgeWidth").value)));
    }
    function setDPRIBar (item) {
        recordset.setItemPlotStyle(item.itemName, new HuTime.FigureStyle(
            document.getElementById("dPRIBarFillColor").value,
            document.getElementById("dPRIBarEdgeColor").value,
            parseFloat(document.getElementById("dPRIBarEdgeWidth").value)));
    }

    // ラベル（Name）変更
    item.recordDataName = document.getElementById("dPRIName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = item.recordDataName;

    if (recordset._tBeginDataSetting && recordset._tBeginDataSetting.itemName === item.itemName ||
        recordset._tEndDataSetting && recordset._tEndDataSetting.itemName === item.itemName ||
        recordset.recordSettings.tSetting &&
            (recordset.recordSettings.tSetting.itemNameBegin === item.itemName ||
            recordset.recordSettings.tSetting.itemNameEnd === item.itemName)) {
        // Preferences of t value
    }
    else if ((recordset._valueItems && recordset._valueItems.find(
            valueObj => valueObj.name === item.itemName)) ||
            recordset.labelItem === item.itemName) {
        switch (layer.constructor.name) {
            case "TLineLayer":
                setDPRIPeriod(item);
                setDPRILabel(item);
                break;
            case "LineChartLayer":
                setDPRILine(item);
                setDPRIPlot(item);
                break;
            case "BarChartLayer":
                setDPRIBar(item);
                break;
            case "PlotChartLayer":
                setDPRIPlot(item);
                break;
        }
        let canvas = document.getElementById("treeContextMenu").treeBranch.
            querySelector("*.branchIcon");
        canvas.parentNode.insertBefore(getRecordDataItemIcon(item, recordset, layer), canvas);
        canvas.remove();
    }
    else {
        // Preferences of other items
    }
    hutime.redraw();
}
function dPRIClose () {
    dPRIApply();
    closeDialog("dialogPreferencesRecordItem");
    deselectBranch();
}

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
function dCrOpen (type) {
    dCrLayerType = type;
    document.getElementById("dCrTypeTLine").style.display = type === "TLine" ? "block" : "none";
    document.getElementById("dCrTypeChart").style.display = type === "Chart" ? "block" : "none";
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
    if (!from || !to || (dCrLayerType !== "TLine" && values.length === 0) ||
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
    switch (dCrLayerType) {
        case "TLine" :
            dataLayer = new HuTime.TLineLayer(rs, null, PanelTitleVBreadth, null);
            break;
        case "LineChart" :
            dataLayer = new HuTime.LineChartLayer(rs, null, PanelTitleVBreadth, null);
            break;
        case "BarChart" :
            // plotWidthType: 可能範囲（pBegin - pEnd）で描画（rBegin - rEndだと、from/toが同じ日付だと逆転する）
            rs.plotWidthType = 1;
            dataLayer = new HuTime.BarChartLayer(rs, null, PanelTitleVBreadth, null);
            break;
        case "PlotChart" :
            dataLayer = new HuTime.PlotChartLayer(rs, null, PanelTitleVBreadth, null);
            break;
        default :
            return;
    }
    dataLayer.name = sourceName + "_" + itemName

    // Panel
    let panel = new HuTime.TilePanel(NewLayerVBreadth + PanelTitleVBreadth);
    panel.name = title;
    panel.appendLayer(dataLayer);

    // Title Layer
    panel.appendLayer(dCrCreateTitleLayer(title));

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
            rs.onloadend = HuTime.RecordBase.prototype.onloadend;　// 元に戻す
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

// **** Save ダイアログ（dialogSave => dSv）****

// **** Load ダイアログ（dialogLoad => dLd）****

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
