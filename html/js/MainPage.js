// ****************
// Web HuTime Main Page
// Copyright (c) Tatsuki Sekino 2018. All rights reserved.
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

function initialize () {    // 全体の初期化
    hutime = new HuTime("hutimeMain");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("hutimeMain").clientHeight);
    mainPanelCollection.style.backgroundColor = HuTimeBackgroundColor;
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();
    //document.getElementById("treeRoot").hutimeObj = mainPanelCollection;

    initMenu();
    initTree();
    initTreeMenu();
    document.getElementById("borderStatusBar").addEventListener("mousedown", borderStatusMouseDown);
    document.getElementById("borderTree").addEventListener("mousedown", borderTreeMouseDown);
    initDialog();

    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json");

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

    if (hutimeObj instanceof HuTime.PanelBorder)    // パネル境界は対象にしない
        return;

    // li要素の追加
    let li = document.createElement("li");
    li.hutimeObject = hutimeObj;
    li.id = id;
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
    let iconSettings = {
        recordset: {src: "img/recordset.png", title: "Recordset"},
        tlineLayer: {src: "img/tlineLayer.png", title: "TLine Layer"},
        chartLayer: {src: "img/chartLayer.png", title: "Chart Layer"},
        scaleLayer: {src: "img/scaleLayer.png", title: "Tick Scale Layer"},
        generalLayer: {src: "img/layer.png", title: "General Layer"},
        panelCollection: {src: "img/panelCollection.png", title: "Panel Collection"},
        tilePanel: {src: "img/tilePanel.png", title: "Tile Panel"},
        other: {src: "img/tilePanel.png", title: "Other"},
        recordItem: {src: "img/recordItem.png", title: "Record Item"}
    };
    let setIcon = function setIcon (element, key) {
        element.src = iconSettings[key].src;
        element.alt = iconSettings[key].title;
        element.title = iconSettings[key].title;
    };
    let icon = document.createElement("img");
    icon.className = "branchIcon";
    let childObj = [];

    if (hutimeObj instanceof HuTime.RecordsetBase) {
        setIcon(icon, "recordset");
        if (hutimeObj instanceof HuTime.ChartRecordset)
            childObj = hutimeObj._valueItems;
        else if (hutimeObj instanceof HuTime.TLineRecordset)
            childObj = [ hutimeObj.labelItem ];
    }
    else if (hutimeObj instanceof HuTime.RecordLayerBase) {
        if (hutimeObj instanceof HuTime.TLineLayer)
            setIcon(icon, "tlineLayer");
        else
            setIcon(icon, "chartLayer");
        childObj = hutimeObj.recordsets;
    }
    else if (hutimeObj instanceof HuTime.Layer) {
        if (hutimeObj instanceof HuTime.TickScaleLayer)
            setIcon(icon, "scaleLayer");
        else
            setIcon(icon, "generalLayer");
    }
    else if (hutimeObj instanceof HuTime.ContainerBase) {
        if (hutimeObj instanceof HuTime.PanelCollection)
            setIcon(icon, "panelCollection");
        else if (hutimeObj instanceof HuTime.TilePanel)
            setIcon(icon, "tilePanel");
        else
            setIcon(icon, "other");
        childObj = hutimeObj.contents;
    }
    else {
        setIcon(icon, "recordItem");     // レコード項目
        childObj = [];
    }
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
    else {
        labelSpan.style.fontStyle = "italic";
        labelSpan.appendChild(document.createTextNode("untitled"));
    }
    selectSpan.appendChild(labelSpan);

    // 子要素用のul要素の追加
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
function initTreeMenu () {      // メニュー初期化
    let liElements = document.getElementById("treeMenuTop").getElementsByTagName("li");
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
    let topMenu = document.getElementById("treeMenuTop");
    topMenu.style.display = "block";
    openedTreeMenus.push(topMenu);
}
function clickTreeMenu (ev) {   // clickでの動作/
    ev.preventDefault();
    ev.stopPropagation();
    if ((opStatus & opTreeMenu) === 0)
        return;

    // メニュー操作継続 (操作終了場所以外（子メニューのある項目）のクリック)
    if (ev.target.closest("#treeMenuTop") && ev.target.querySelector("ul"))
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

// ** ツリー境界の操作 **
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

// ** ステータスバー境界の操作 **
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
