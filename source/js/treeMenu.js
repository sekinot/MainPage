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

