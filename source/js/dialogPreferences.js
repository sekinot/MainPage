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

// *** Preferences of Scale Layerダイアログ (dialogPreferencesScaleLayer => dPSL)
function dPSLGetLabelData (layer) {     // 目盛りラベルの書式データを取得
    let labelLevel = document.getElementById("dPSLLabelLevel").value;
    let labelStyles = layer.scaleStyle.labelStyle;
    if (labelLevel > 0) {
        document.getElementById("dPSLLabelFont").value = labelStyles[labelLevel - 1].fontFamily;
        if (labelStyles[labelLevel - 1].fontWeight.toString().replace("bold", "700") === "700") {
            if (labelStyles[labelLevel - 1].fontStyle === "italic")
                document.getElementById("dPSLLabelStyle").value = "italic bold";
            else
                document.getElementById("dPSLLabelStyle").value = "bold";
        }
        else {
            document.getElementById("dPSLLabelStyle").value = labelStyles[labelLevel - 1].fontStyle;
        }
        document.getElementById("dPSLLabelColor").value = labelStyles[labelLevel - 1].fillColor;
        document.getElementById("dPSLLabelSize").value =
            parseFloat(labelStyles[labelLevel - 1].fontSize);
    }
    else {
        let fontFamily = labelStyles[0].fontFamily;
        let fontStyle = labelStyles[0].fontStyle;
        let fontWeight = labelStyles[0].fontWeight;
        let fillColor = labelStyles[0].fillColor;
        let fontSize = parseFloat(labelStyles[0].fontSize);
        for (let i = 1; i < labelStyles.length; ++i) {
            if (fontFamily !== labelStyles[i].fontFamily)
                fontFamily = null;
            if (fontWeight !== labelStyles[i].fontWeight.toString().replace("bold", "700"))
                fontWeight = null;
            if (fontStyle !== labelStyles[i].fontStyle)
                fontStyle = null;
            if (fillColor !== labelStyles[i].fillColor)
                fillColor = null;
            if (fontSize !== parseFloat(labelStyles[i].fontSize))
                fontSize = null;
        }
        document.getElementById("dPSLLabelFont").value = fontFamily;
        if (!fontStyle || !fontWeight) {
            document.getElementById("dPSLLabelStyle").value = "nochange";
        }
        else if (fontWeight === "700") {
            if (fontStyle === "italic")
                document.getElementById("dPSLLabelStyle").value = "italic bold";
            else
                document.getElementById("dPSLLabelStyle").value = "bold";
        }
        else {
            document.getElementById("dPSLLabelStyle").value = fontFamily;
        }
        document.getElementById("dPSLLabelColor").value = fillColor;
        document.getElementById("dPSLLabelSize").value = fontSize;
    }
}
function dPSLSetLabelData (layer) {     // 目盛りラベルの書式データを反映
    let labelLevel = document.getElementById("dPSLLabelLevel").value;
    let labelStyles = layer.scaleStyle.labelStyle;
    if (labelLevel > 0) {
        labelStyles[labelLevel - 1].fontFamily = document.getElementById("dPSLLabelFont").value;
        if (document.getElementById("dPSLLabelStyle").value.indexOf("bold") >= 0)
            labelStyles[labelLevel - 1].fontWeight = 700;
        else
            labelStyles[labelLevel - 1].fontWeight = 400;
        if (document.getElementById("dPSLLabelStyle").value.indexOf("italic") >= 0)
            labelStyles[labelLevel - 1].fontStyle = "italic";
        else
            labelStyles[labelLevel - 1].fontStyle= "normal";
        labelStyles[labelLevel - 1].fillColor = document.getElementById("dPSLLabelColor").value;
        labelStyles[labelLevel - 1].fontSize =
            parseFloat(document.getElementById("dPSLLabelSize").value) + "px";
    }
    else {
        let fontFamily = document.getElementById("dPSLLabelFont").value;
        let fontStyle = document.getElementById("dPSLLabelStyle").value;
        let fillColor = document.getElementById("dPSLLabelColor").value;
        let fontSize = document.getElementById("dPSLLabelSize").value;
        labelStyles.forEach(style => {
            if (fontFamily)
                style.fontFamily = fontFamily;
            if (fontStyle !== "nochange") {
                if (fontStyle.indexOf("bold") >= 0)
                    style.fontWeight = 700;
                else
                    style.fontWeight = 400;
                if (fontStyle.indexOf("italic") >= 0)
                    style.fontStyle = "italic";
                else
                    style.fontStyle = "normal";
            }
            if (fillColor)
                style.fillColor = fillColor;
            if (fontSize)
                style.fontSize = parseFloat(fontSize) + "px";
        });
    }
}
function dPSLGetTickData (layer) {
    let tickLevel = document.getElementById("dPSLTickLevel").value;
    let tickStyles = layer.scaleStyle.tickStyle;
    if (tickLevel > 0) {
        document.getElementById("dPSLTickColor").value = tickStyles[tickLevel - 1].lineColor;
        document.getElementById("dPSLTickWidth").value = tickStyles[tickLevel - 1].lineWidth;
    }
    else {
        let lineColor = tickStyles[0].lineColor;
        let lineWidth = tickStyles[0].lineWidth;
        for (let i = 1; i < tickStyles.length; ++i) {
            if (lineColor !== tickStyles[i].lineColor)
                lineColor = null;
            if (lineWidth !== tickStyles[i].lineWidth)
                lineWidth = null;
        }
        document.getElementById("dPSLTickColor").value = lineColor;
        document.getElementById("dPSLTickWidth").value = lineWidth;
    }
}
function dPSLSetTickData (layer) {
    let tickLevel = document.getElementById("dPSLTickLevel").value;
    let tickStyles = layer.scaleStyle.tickStyle;
    if (tickLevel > 0) {
        tickStyles[tickLevel - 1].lineColor = document.getElementById("dPSLTickColor").value;
        tickStyles[tickLevel - 1].lineWidth =
            parseFloat(document.getElementById("dPSLTickWidth").value);
    }
    else {
        let lineColor = document.getElementById("dPSLTickColor").value;
        let lineWidth = document.getElementById("dPSLTickWidth").value;
        tickStyles.forEach(style => {
            if (lineColor)
                style.lineColor = lineColor;
            if (lineWidth)
                style.lineWidth = parseFloat(lineWidth);
        });
    }
}
function dPSLOpen () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPSLName").value = layer.name;

    if (layer instanceof HuTime.CalendarScaleLayer)
        document.getElementById("dPSLCalendar").value = layer.scaleDataset.calendarId;
    else
        document.getElementById("dPSLCalendar").value = "1.1";

    document.getElementById("dPSLHeight").value = layer.vBreadth;
    document.getElementById("dPSLMarginTop").value = layer.vMarginTop;
    document.getElementById("dPSLMarginBottom").value = layer.vMarginBottom;

    document.getElementById("dPSLBackgroundColor").value = layer.style.backgroundColor;

    dPSLGetLabelData(layer);
    dPSLGetTickData(layer);

    document.getElementById("dialogPreferencesScaleLayer").hutimeObject = layer;
    showDialog("dialogPreferencesScaleLayer");
}
function dPSLApply () {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    layer.name = document.getElementById("dPSLName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = layer.name;

    if (document.getElementById("dPSLCalendar").value === "1.1" &&
        layer instanceof HuTime.CalendarScaleLayer) {
        let panel = layer.parent;
        let newLayer = new HuTime.TickScaleLayer(
            layer.vBreadth, layer.vMarginTop, layer.vMarginBottom,
            layer.scaleStyle, new HuTime.StandardScaleDataset());
        panel.removeLayer(layer);
        panel.appendLayer(newLayer);
        layer = newLayer;
        document.getElementById("treeContextMenu").treeBranch.hutimeObject = newLayer;
    }
    else if (document.getElementById("dPSLCalendar").value !== "1.1") {
        if (layer instanceof HuTime.CalendarScaleLayer) {
            layer.scaleDataset.calendarId = document.getElementById("dPSLCalendar").value;
        }
        else {
            let panel = layer.parent;
            let newLayer = new HuTime.CalendarScaleLayer(layer.vBreadth, layer.vMarginTop, layer.vMarginBottom,
                document.getElementById("dPSLCalendar").value);
            newLayer.scaleStyle = layer.scaleStyle;
            panel.removeLayer(layer);
            panel.appendLayer(newLayer);
            layer = newLayer;
            document.getElementById("treeContextMenu").treeBranch.hutimeObject = newLayer;
        }
    }

    dPSLSetLabelData(layer);
    dPSLSetTickData(layer);

    layer.vBreadth = parseFloat(document.getElementById("dPSLHeight").value);
    layer.vMarginTop = parseFloat(document.getElementById("dPSLMarginTop").value);
    layer.vMarginBottom = parseFloat(document.getElementById("dPSLMarginBottom").value);

    layer.style.backgroundColor = document.getElementById("dPSLBackgroundColor").value;

    layer.redraw();
}
function dPSLClose (ev) {
    dPSLApply(ev);
    closeDialog("dialogPreferencesScaleLayer");
    deselectBranch();
}

// *** Preferences of Recordset (dialogPreferencesRecordset => dPRS)
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
function dPRSLApply () {
    let recordset = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    recordset.name = document.getElementById("dPRSName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = recordset.name;
}
function dPRSClose() {
    dPRSLApply();
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

