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

const NewLayerVBreadth = 150;           // 新規作成レイヤの既定の高さ
const PanelTitleVBreadth = 20;          // パネルタイトルの高さ
//const NewLayerScaleVBreadth = 50;    // 新規作成レイヤのスケールの既定の高さ

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


    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json")
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
        , hutime.panelCollections[0], "HuTime root", -1, "treeRoot");
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
        recordItem: {
            iconSrc: "img/recordItem.png", iconAlt: "Record Item", menuType: "Item"}
    };
    function getObjType (obj) {
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
        return "recordItem";
    }

    let hutimeObjType = getObjType(hutimeObj);
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
    if (check < 0) {
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

    // アイコンのul要素の追加
    let icon = document.createElement("img");
    icon.className = "branchIcon";
    icon.src = hutimeObjSettings[hutimeObjType].iconSrc;
    icon.alt = hutimeObjSettings[hutimeObjType].iconAlt;
    icon.title = hutimeObjSettings[hutimeObjType].iconAlt;
    selectSpan.appendChild(icon);

    // ラベルの追加（span要素を含む）
    let labelSpan = branchSpan.appendChild(document.createElement("span"));
    labelSpan.className = "branchLabelSpan";
    if (name) {
        labelSpan.appendChild(document.createTextNode(name));
    }
    else if (hutimeObj.name) {
        labelSpan.appendChild(document.createTextNode(hutimeObj.name));
    }
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
            if (hutimeObj instanceof HuTime.ChartRecordset)
                childObj = hutimeObj._valueItems;
            else if (hutimeObj instanceof HuTime.TLineRecordset)
                childObj = [ hutimeObj.labelItem ];
            break;
        case "tlineLayer":
        case "chartLayer":
            childObj = hutimeObj.recordsets;
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

// チェックボックスをクリック
function clickBranchCheckBox (ev) {
    ev.stopPropagation();
    if (ev.target.value) {
        ev.target.src
            = ev.target.src.substr(0, ev.target.src.lastIndexOf("/") + 1) + "uncheck.png";
        ev.target.value = false;
        ev.target.closest("li").hutimeObject.visible = false;
    }
    else {
        ev.target.src
            = ev.target.src.substr(0, ev.target.src.lastIndexOf("/") + 1) + "check.png";
        ev.target.value = true;
        ev.target.closest("li").hutimeObject.visible = true;
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
        selectedBranchSpan.style.backgroundColor = "";
        selectedBranch = null;
        selectedBranchSpan = null;
        selectedObject = null;
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
// *** Preferences of Chart Layerダイアログ (dialogPreferencesChartLayer => dPCR)

function showPanelPreferences () {

    showDialog("dialogPreferences");

    let panelCollection = hutime.panelCollections[0];
    document.getElementById("rootNameText").value = panelCollection.name;
    document.getElementById("rootBackgroundColor").value = panelCollection.style.backgroundColor;



    let panel = hutime.panelCollections[0].panels[0];
    document.getElementById("panelNameText").value = panel.name;
    document.getElementById("panelHeight").value = panel.vBreadth;

    document.getElementById("panelBackgroundColor").value = panel.style.backgroundColor;
    document.getElementById("panelTRatio").value = panel.tRatio;
}

function applyPreference () {
    let panelCollection = hutime.panelCollections[0];
    panelCollection.style.backgroundColor = document.getElementById("rootBackgroundColor").value;


    let panel = hutime.panelCollections[0].panels[0];
    panel.style.backgroundColor = document.getElementById("panelBackgroundColor").value;
    panel.tRatio = document.getElementById("panelTRatio").value;
    //closeDialog("dialogPreferences");

    hutime.redraw();
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
            rs.plotWidthType = 1;   // 可能範囲（pBegin - pEnd）で描画
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
