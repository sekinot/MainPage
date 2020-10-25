// *** dialog OLObject
function dOLOSwitchXT () {
    if (document.getElementById("dOLOUseX").checked) {
        document.getElementById("dOLOXTValueBox").style.display = "none";
        document.getElementById("dOLOTCalendarLabel").style.color = DisabledLabelColor;
        document.getElementById("dOLOTCalendar").disabled = true;
        document.getElementById("dOLOYVValueBox").style.display = "none";
    }
    else {
        document.getElementById("dOLOXTValueBox").style.display = "inline-block";
        document.getElementById("dOLOTCalendarLabel").style.color = "black";
        document.getElementById("dOLOTCalendar").disabled = false;
        document.getElementById("dOLOYVValueBox").style.display = "inline-block";
    }
}
function dOLOSwitchShapeType () {
    document.getElementById("statusBar").innerText =
        document.getElementById("dOLOShapeType").value;
    switch (document.getElementById("dOLOShapeType").value) {
        case "Circle":
            document.getElementById("dOLOShapeRotateLabel").style.color = DisabledLabelColor;
            document.getElementById("dOLOShapeRotate").disabled = true;
            document.getElementById("dOLOShapeRotateUnit").style.color = DisabledLabelColor;
            break;

        case "Square":
            document.getElementById("dOLOShapeRotateLabel").style.color = "#000000";
            document.getElementById("dOLOShapeRotate").disabled = false;
            document.getElementById("dOLOShapeRotateUnit").style.color = "#000000";
            break;

        case "Triangle":
            document.getElementById("dOLOShapeRotateLabel").style.color = "#000000";
            document.getElementById("dOLOShapeRotate").disabled = false;
            document.getElementById("dOLOShapeRotateUnit").style.color = "#000000";
            break;
    }
}
function dOLOSwitchSourceLocationType () {
    if (document.getElementById("dOLOImageRemoteType").checked) {
        document.getElementById("dOLOImageRemoteFile").style.display = "block";
        document.getElementById("dOLOImageLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dOLOImageRemoteFile").style.display = "none";
        document.getElementById("dOLOImageLocalFile").style.display = "block";
    }
}

function dCrOLOOpen (type) {
    document.getElementById("dialogOLObject").type = type;
    document.getElementById("dialogOLObject").operation = "Create";
    document.getElementById("dOLOApply").style.display = "none";
    document.getElementById("dOLOOK").value = "Create";
    switch (type) {
        case "Shape" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer Shape";
            document.getElementById("dOLOShape").style.display = "block";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "none";
            dOLOSwitchXT ();
            dOLOSwitchShapeType ();
            break;

        case "String" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer String";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "block";
            document.getElementById("dOLOImage").style.display = "none";
            break;

        case "Image" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer Image";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "block";
            //dOLOSwitchSourceLocationType();
            break;
    }
    showDialog("dialogOLObject");
}
function dOLOApply () {
    if (document.getElementById("dialogOLObject").operation !== "Create")
        return;

    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    let obj, position, size, rotate, style;
    if (document.getElementById("dOLOUseT").checked) {
        position = new HuTime.RelativeXYPosition(
            new HuTime.TVPosition(
                parseFloat(document.getElementById("dOLOTValue").value),
                parseFloat(document.getElementById("dOLOVValue").value)),
            parseFloat(document.getElementById("dOLOXValue").value),
            parseFloat(document.getElementById("dOLOYValue").value));
    }
    else {
        position = new HuTime.XYPosition(
            parseFloat(document.getElementById("dOLOXValue").value),
            parseFloat(document.getElementById("dOLOYValue").value));
    }

    switch (document.getElementById("dialogOLObject").type) {
        case "Shape" :
            style = new HuTime.FigureStyle(
                document.getElementById("dOLOFillColor").value,
                document.getElementById("dOLOEdgeColor").value,
                parseFloat(document.getElementById("dOLOEdgeWidth").value));
            size = parseFloat(document.getElementById("dOLOShapeSize").value);
            rotate = parseFloat(document.getElementById("dOLOShapeRotate").value);
            switch (document.getElementById("dOLOShapeType").value) {
                case "Circle" :
                    obj = new HuTime.Circle(style, position, size);
                    break;

                case "Square" :
                    obj = new HuTime.Square(style, position, size, rotate);
                    break;

                case "Triangle" :
                    obj = new HuTime.Triangle(style, position, size, rotate);
                    break;
            }
            break;

        case "String" :
            style = new HuTime.StringStyle();
            style.fontFamily = document.getElementById("dOLOStringFont").value;
            let fontStyle = document.getElementById("dOLOStringStyle").value;
            style.fontStyle = "normal";
            style.fontWeight = 400;
            if (fontStyle.indexOf("italic") >= 0)
                style.fontStyle = "italic";
            if (fontStyle.indexOf("bold") >= 0)
                style.fontWeight = 700;
            style.fillColor = document.getElementById("dOLOStringColor").value;
            style.fontSize = parseFloat(document.getElementById("dOLOStringSize").value);

            obj = new HuTime.String(style, position, 
                document.getElementById("dOLOStringText").value,
                parseFloat(document.getElementById("dOLOStringRotate").value));
            break;

        case "Image" :
            style = new HuTime.FigureStyle(null,
                document.getElementById("dOLOImageEdgeColor").value,
                parseFloat(document.getElementById("dOLOImageEdgeWidth").value));
            let width = parseFloat(document.getElementById("dOLOImageWidth").value);
            width = width && width > 0 ? width : null;
            let height = parseFloat(document.getElementById("dOLOImageHeight").value);
            height = height && height > 0 ? height : null;
            obj = new HuTime.Image(style, position,
                document.getElementById("dOLOImageURL").value,
                width, height,
                parseFloat(document.getElementById("dOLOImageRotate").value));
            break;
    }
    obj.name = document.getElementById("dOLOName").value;
    addBranch(document.getElementById("treeContextMenu").treeBranch, obj);
    layer.appendObject(obj);
    layer.redraw();
}
function dOLOClose () {
    dOLOApply();
    closeDialog("dialogOLObject");
}

// *** Preferences of Record Item (dialogPreferencesRecordItem => dPRI)
/*
function dPOLOOpen () {
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
function dPOLOApply () {
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
function dPOLOClose () {
    dPRIApply();
    closeDialog("dialogPreferencesRecordItem");
    deselectBranch();
}
// */

