// ****************
// Web HuTime Main Page
// Copyright (c) Tatsuki Sekino 2018. All rights reserved.
// ****************

// **** 各種設定 ****
const selectedBranchColor = "aqua";     // 選択中のツリー項目の色


var hutime;
var mainPanelCollection;

function initialize () {
    hutime = new HuTime("mainPanels");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("mainPanels").clientHeight);
    mainPanelCollection.style.backgroundColor = "#cccccc";
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();
    document.getElementById("treeRoot").hutimeObj = mainPanelCollection;


    initMenu();
    initDialog("dialogImportRemote");
    initDialog("dialogImportLocal");
}

// **** メニュー操作 ****
let openedMenus = [];       // ユーザによって開かれたメニュー
let isMenuActive = false;   // メニュー操作中のフラグ

// メニュー初期化
function initMenu () {
    let top = document.getElementById("menuTop");
    openedMenus.push(top);

    let initMenuItem = function initMenuItem (element) {
        for (let i = 0; i < element.childNodes.length; ++i) {
            if (element.childNodes[i].nodeName === "LI") {
                element.childNodes[i].addEventListener("mouseover", operateMenu);
                element.childNodes[i].addEventListener("click", clickMenu);

                for (let j = 0; j < element.childNodes[i].childNodes.length; ++j) {
                    if (element.childNodes[i].childNodes[j].nodeName === "UL") {
                        initMenuItem(element.childNodes[i].childNodes[j]);  // 再帰による子メニューの初期化
                        break;
                    }
                }
            }
        }
    }(top);
}

// clickでの動作
let clickMenu = function clickMenu (ev) {
    ev.stopPropagation();

    if (!isMenuActive) {
        isMenuActive = true;
        document.getElementById("body").addEventListener("click", clickMenu);
        operateMenu(ev);
        return;
    }

    let parentElement = ev.target.parentNode;
    while (parentElement.id !== "body") {
        if (parentElement.nodeName === "UL" && parentElement.id !== "menuTop") {
            let targetElement = ev.target;
            for (let i = 0; i < targetElement.childNodes.length; ++i) {
                if (targetElement.childNodes[i].nodeName === "UL")
                    return;     // 子メニューのある項目のクリック
            }
        }
        parentElement = parentElement.parentNode;
    }

    // inactivate menu (トップメニュー、body、または、子メニューの無い項目のクリック)
    for (let i = openedMenus.length - 1; i > 0; --i) {
        openedMenus.pop().style.display = "none";
    }
    document.getElementById("body").removeEventListener("click", clickMenu);
    isMenuActive = false;
};

// mouseOverでの動作
let operateMenu = function operateMenu (ev) {
    ev.stopPropagation();
    if (!isMenuActive)
        return;

    let targetMenu = ev.target.parentNode;
    for (let i = openedMenus.length - 1; i >= 0; --i) {
        let openedMenu = openedMenus[i];
        while (openedMenu.id !== "menuBar") {
            if (targetMenu.nodeName === "UL" && openedMenus[i] === targetMenu) {
                for (let j = 0; j < ev.target.childNodes.length; ++j) {
                    if (ev.target.childNodes[j].nodeName === "UL") {
                        ev.target.childNodes[j].style.display = "block";
                        openedMenus.push(ev.target.childNodes[j]);
                        return;
                    }
                }
                return;     // 下位メニューがない場合
            }
            while (true) {
                openedMenu = openedMenu.parentNode;
                if (openedMenu.nodeName === "UL" || openedMenu.id === "menuBar")
                    break;
            }
        }
        if (openedMenus.length > 1)     // Top Menuでなければ閉じる
            openedMenus.pop().style.display = "none";
    }
};




// **** ツリーメニューの操作 ****
// ツリーの開閉
function operateBranch (ev) {
    let targetElements = ev.target.parentNode.parentNode.childNodes;
    for (let i = 0; i < targetElements.length; ++i) {
        if (targetElements[i].nodeName === "UL") {
            if (targetElements[i].style.display === "block") {
                targetElements[i].style.display = "none";
                ev.target.src = "img/expand.png";
                return;
            }
            else {
                targetElements[i].style.display = "block";
                ev.target.src = "img/collapse.png";
                return;
            }
        }
    }
    ev.stopPropagation();
}

// ツリーの項目を追加
function addBranch (targetElement, hutimeObj) {
    // targetElement: 追加する先のli要素
    // hutimeObj: HuTimeオブジェクト (PanelCollection, Panel, Layer, Recordset)

    if (hutimeObj instanceof HuTime.PanelBorder)    // パネル境界は対象にしない
        return;

    // li要素の追加
    let li = document.createElement("li");
    li.hutimeObject = hutimeObj;
    let ul;
    for (let i = 0; i < targetElement.childNodes.length; ++i) {
        if (targetElement.childNodes[i].nodeName === "UL") {
            ul = targetElement.childNodes[i];
            ul.appendChild(li);
            break;
        }
    }

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
    checkbox.src = "img/check.png";
    checkbox.className = "branchCheckBox";
    checkbox.alt = "checkbox";
    checkbox.addEventListener("click", operateBranch);
    branchSpan.appendChild(checkbox);

    // let checkbox = document.createElement("input");
    // checkbox.type = "checkbox";
    // checkbox.className = "branchCheckBox";
    // checkbox.checked = "checked";
    //branchSpan.appendChild(checkbox);

    // 選択範囲用のspan要素の追加
    let selectSpan = branchSpan.appendChild(document.createElement("span"));
    selectSpan.addEventListener("mouseover", fixTreeCursor);
    selectSpan.addEventListener("mousemove", fixTreeCursor);
    selectSpan.addEventListener("mousedown", fixTreeCursor);
    selectSpan.addEventListener("click", selectBranch);

    // アイコンのul要素の追加
    let icon = document.createElement("img");
    icon.className = "branchIcon";
    let childObj = [];
    if (hutimeObj instanceof HuTime.RecordsetBase) {
        icon.src = "img/recordset.png";
        icon.alt = "Recordset";
        icon.title = "Recordset";
        if (hutimeObj instanceof HuTime.ChartRecordset)
            childObj = hutimeObj._valueItems;
        else if (hutimeObj instanceof HuTime.TLineRecordset)
            childObj = [ hutimeObj.labelItem ];
    }
    else if (hutimeObj instanceof HuTime.RecordLayerBase) {
        if (hutimeObj instanceof HuTime.TLineLayer) {
            icon.src = "img/tlineLayer.png";
            icon.alt = "TLine Layer";
            icon.title = "TLine Layer";
        }
        else {
            icon.src = "img/chartLayer.png";
            icon.alt = "Chart Layer";
            icon.title = "Chart Layer";
        }
        childObj = hutimeObj.recordsets;
    }
    else if (hutimeObj instanceof HuTime.Layer) {
        if (hutimeObj instanceof HuTime.TickScaleLayer) {
            icon.src = "img/scaleLayer.png";
            icon.alt = "Tick Scale Layer";
            icon.title = "Tick Scale Layer";
        }
        else {
            icon.src = "img/chartLayer.png";
            icon.alt = "General Layer";
            icon.title = "General Layer";
        }
    }
    else if (hutimeObj instanceof HuTime.ContainerBase) {
        if (hutimeObj instanceof HuTime.PanelCollection) {
            icon.src = "img/panelCollection.png";
            icon.alt = "Panel Collection";
            icon.title = "Panel Collection";
        }
        else if (hutimeObj instanceof HuTime.TilePanel) {
            icon.src = "img/tilePanel.png";
            icon.alt = "Tile Panel";
            icon.title = "Tile Panel";
        }
        else {
            icon.src = "img/tilePanel.png";
            icon.alt = "Other";
            icon.title = "Tile Panel";
        }
        childObj = hutimeObj.contents;
    }
    else {
        icon.src = "img/recorditem.png";    // レコード項目
        icon.alt = "Record Item";
        icon.title = "Record Item";
        childObj = [];
    }
    selectSpan.appendChild(icon);

    // ラベルの追加（span要素を含む）
    let labelSpan = branchSpan.appendChild(document.createElement("span"));
    labelSpan.className = "branchLabelSpan";
    if (!hutimeObj.name) {
        labelSpan.style.fontStyle = "italic";
        labelSpan.appendChild(document.createTextNode("untitled"));
    }
    else {
        labelSpan.appendChild(document.createTextNode(hutimeObj.name));
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

// ツリー上でのカーソル制御
function fixTreeCursor (ev) {
    document.body.style.cursor = "default";
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

// ツリー上のアイテムの選択
let selectedObject = null;      // 選択中の HuTimeオブジェクト
let selectedBranch = null;      // 選択中の枝（li）
let selectedBranchSpan = null;  // 選択中の枝（span）
function selectBranch (ev) {
    let branchSpanElement = ev.target;
    while (branchSpanElement.nodeName !== "UL") {
        if (branchSpanElement.className === "branchSpan")
            break;
        branchSpanElement = branchSpanElement.parentNode;
    }
    let branchLiElement = branchSpanElement;
    while (branchLiElement.nodeName !== "UL") {
        if (branchLiElement.nodeName === "LI")
            break;
        branchLiElement = branchLiElement.parentNode;
    }

    if  (branchLiElement === selectedBranch) {      // 選択中の枝－＞選択解除
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
    branchSpanElement.style.backgroundColor = selectedBranchColor;
    selectedObject = branchLiElement.hutimeObject;
    selectedBranch = branchLiElement;
    selectedBranchSpan = branchSpanElement;

    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

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
function dialogImportRemote_Import (ev) {   // リモートインポート
    closeDialog("dialogImportRemote");
    importRemoteJsonContainer (document.forms.dialogImportRemoteForm.url.value);
}
function dialogImportLocal_Import (ev) {    // ローカルインポート
    closeDialog("dialogImportLocal");
    importLocalJsonContainer (document.forms.dialogImportLocalForm.file);
}

// **** ダイアログ関係（共通） ****
let dialogs = {};       // ダイアログのDOM要素を収容する連想配列（dialogIdがキー）

// ダイアログの初期化
function initDialog (dialogId) {
    let dialogElement = document.getElementById(dialogId);
    dialogs[dialogId] = dialogElement;
    let dialogTitleElement, dialogBodyElement, dialogSizeKnob;
    for (let i = 0; i < dialogElement.childNodes.length; ++i) {
        if (dialogElement.childNodes[i].className === "dialogTitle") {
            dialogTitleElement = dialogElement.childNodes[i];
            break;
        }
    }
        for (let i = 0; i < dialogElement.childNodes.length; ++i) {
        if (dialogElement.childNodes[i].className === "dialogBody") {
            dialogBodyElement = dialogElement.childNodes[i];
            break;
        }
    }
    for (let i = 0; i < dialogElement.childNodes.length; ++i) {
        if (dialogElement.childNodes[i].className === "dialogSizeKnob") {
            dialogSizeKnob = dialogElement.childNodes[i];
            break;
        }
    }

    dialogElement.dialogDragging = false;

    // moving the dialog
    dialogTitleElement.addEventListener("mousedown", function (ev) {
        dialogElement.dialogDragging = true;
        dialogElement.originX = ev.pageX;
        dialogElement.originY = ev.pageY;
        document.dialogElement = dialogElement;
        document.addEventListener("mousemove", moveDialog, true);
        document.addEventListener("mouseup", stopMoveDialog, true);
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });

    // changing size of the dialog
    if (!dialogElement.style.width)
        dialogElement.style.width = dialogElement.clientWidth + "px";
    if (!dialogElement.style.height)
        dialogElement.style.height = dialogElement.clientHeight + "px";
    dialogElement.minWidth = dialogElement.clientWidth;
    dialogElement.minHeight = dialogElement.clientHeight;

    dialogSizeKnob.addEventListener("mousedown", function (ev) {
        dialogElement.dialogDragging = true;
        dialogElement.originX = ev.pageX;
        dialogElement.originY = ev.pageY;
        document.dialogElement = dialogElement;
        document.addEventListener("mousemove", changeDialogSize);
        document.addEventListener("mouseup", stopChangeDialogSize);
        ev.preventDefault();
        ev.stopPropagation();
        document.body.style.cursor = "se-resize";
        return false;
    });
}

// ダイアログを開く・閉じる
function showDialog (dialogId) {
    let element = dialogs[dialogId];
    element.style.left = ((window.innerWidth - element.clientWidth) / 2).toString() + "px";
    element.style.top = ((window.innerHeight - element.clientHeight) / 2).toString() + "px";
    element.style.visibility = "visible"
}
function closeDialog (dialogId) {
    dialogs[dialogId].style.visibility = "hidden";
    dialogs[dialogId].dialogDragging = false;
}

// ダイアログの移動
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
function changeDialogSize (ev) {
    if (!document.dialogElement)
        return;

    let dialogElement = document.dialogElement;
    let newWidth = parseInt(dialogElement.style.width) - dialogElement.originX + ev.pageX;
    let newHeight = parseInt(dialogElement.style.height) - dialogElement.originY + ev.pageY;
    if (newWidth > dialogElement.minWidth)
        dialogElement.style.width = newWidth + "px";
    if (newHeight > dialogElement.minHeight)
        dialogElement.style.height = newHeight + "px";
    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopChangeDialogSize (ev) {
    document.dialogElement.dialogDragging = false;
    document.removeEventListener("mousemove", changeDialogSize);
    document.removeEventListener("mouseup", changeDialogSize);
    document.dialogElement = null;
    document.body.style.cursor = "auto";
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

