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
function addBranch (targetElement, hutimeObj, name, check, id, siblingElement) {
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
    if (id)
        li.id = id;
    li.objType = hutimeObjSettings[hutimeObjType].menuType;

    if (siblingElement)
        targetElement.querySelector("ul").insertBefore(li, siblingElement);
    else
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
    if (hutimeObjType === "string")
        knobImg.style.visibility = "hidden";
    if (hutimeObjType === "image")
        knobImg.style.visibility = "hidden";
    if (hutimeObjType === "shape")
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

    selectSpan.addEventListener("mousedown", startMoveBranch);

    selectSpan.addEventListener("mouseover", selectMoveBranch);
    selectSpan.addEventListener("mouseout", selectMoveBranch);

    //selectSpan.addEventListener("mouseup", stopMoveBranch);

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
            childObj = hutimeObj.contents;
            break;

        case "tilePanel":
        case "overlayPanel":    // レイヤは逆順
            childObj = hutimeObj.contents.reverse();
            break;
    }
    if (knobImg.style.visibility === "hidden")
        return;     // treeの末尾の場合は子要素は無し
    li.appendChild(document.createElement("ul"));
    for (let i = 0; i < childObj.length; ++i) {
        addBranch(li, childObj[i])
    }
}

// ツリーの項目を削除
function removeBranch (targetElement) {
    targetElement.remove();
}

// ツリーの項目を更新（展開していたブランチは閉じる）
function updateBranch () {
    let targetElement =  document.getElementById("treeContextMenu").treeBranch;
    addBranch(targetElement.parentNode.closest("li"),
        targetElement.hutimeObject, undefined, undefined, undefined, targetElement);
    targetElement.remove();
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
            let recordset;
            let parentBranch = li;
            while (parentBranch) {
                if (parentBranch.objType === "Recordset") {
                    recordset = parentBranch.hutimeObject;
                    break;
                }
                if (parentBranch.parentNode instanceof HTMLElement)
                    parentBranch = parentBranch.parentNode.closest("li")
            }
            if (recordset instanceof HuTime.ChartRecordset) {
                recordset.setItemShowPlot(li.hutimeObject.itemName, false);
                recordset.setItemShowLine(li.hutimeObject.itemName, false);
            }
            else if (recordset instanceof HuTime.TLineRecordset) {
                recordset.showRecordset = false;    // TLineはItem別での実装がないので、Recordset全体を設定
            }
        }
        else if (li.hutimeObject instanceof HuTime.TLineRecordset)
            li.hutimeObject.showRecordset = false;
        else
            li.hutimeObject.visible = false;
    }
    else {
        ev.target.src
            = ev.target.src.substr(0, ev.target.src.lastIndexOf("/") + 1) + "check.png";
        ev.target.value = true;

        let li = ev.target.closest("li");
        if (li.objType === "RecordItem" && getObjType(li.hutimeObject, li) === "recordDataItem") {
            let recordset;
            let parentBranch = li;
            while (parentBranch) {
                if (parentBranch.objType === "Recordset") {
                    recordset = parentBranch.hutimeObject;
                    break;
                }
                if (parentBranch.parentNode instanceof HTMLElement)
                    parentBranch = parentBranch.parentNode.closest("li")
            }
            if (recordset instanceof HuTime.ChartRecordset) {
                recordset.setItemShowPlot(li.hutimeObject.itemName, true);
                recordset.setItemShowLine(li.hutimeObject.itemName, true);
            }
            else if (recordset instanceof HuTime.TLineRecordset) {
                recordset.showRecordset = true;    // TLineはItem別での実装がないので、Recordset全体を設定
            }
        }
        else if (li.hutimeObject instanceof HuTime.TLineRecordset)
            li.hutimeObject.showRecordset = true;
        else
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
    ev.target.closest("li").style.zIndex = "";

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

