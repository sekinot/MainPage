// **** Preferencesダイアログ ****
// *** Preferences of Chart Layerダイアログ (dialogPreferencesChartLayer => dPCL)
function dPCLOpen (ev) {
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dPCLName").value = layer.name;
    if (layer instanceof HuTime.LineChartLayer)
        document.getElementById("dPCLType").value = "LineChart";
    else if (layer instanceof HuTime.BarChartLayer)
        document.getElementById("dPCLType").value = "BarChart";
    else if (layer instanceof HuTime.PlotChartLayer)
        document.getElementById("dPCLType").value = "PlotChart";
    else
        document.getElementById("dPCLType").value = "";

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
}


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


