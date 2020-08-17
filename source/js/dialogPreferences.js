// **** Preferencesダイアログ ****
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
    }
    layer.vBreadth = parseFloat(document.getElementById("dPCLHeight").value);
    layer.vMarginTop = parseFloat(document.getElementById("dPCLMarginTop").value);
    layer.vMarginBottom = parseFloat(document.getElementById("dPCLMarginBottom").value);
    layer.vTop = parseFloat(document.getElementById("dPCLVTop").value);
    layer.vBottom = parseFloat(document.getElementById("dPCLVBottom").value);

    layer.style.backgroundColor = document.getElementById("dPCLBackgroundColor").value;
    hutime.redraw();
}
function dPCLClose (ev) {
    dPCLApply(ev);
    closeDialog("dialogPreferencesChartLayer");
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
        document.getElementById("dPRIPeriodColor").value = recordset.rangeStyle.fillColor;
    }
    function getDPRILabel (item) {
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
        recordset.rangeStyle = new HuTime.FigureStyle(
            document.getElementById("dPRIPeriodColor").value, null, null);
    }
    function setDPRILabel (item) {
        let style = recordset.labelStyle;
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

