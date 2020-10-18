
// *** Export Panelダイアログ (dialogExportPanel => dExP)
function dExPOpen () {
    showDialog("dialogExportPanel");
}
function dExPExport () {
    let panel = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    let embed = document.getElementById("dExPanelDataEmbed").checked;
    for (let i = 0; i < panel.layers.length; ++i) {
        if (!panel.layers[i].recordsets)
            continue;
        for (let j = 0; j <　panel.layers[i].recordsets.length; ++j) {
            panel.layers[i].recordsets[j].useLoadedDataForJSON = embed;
        }
    }
    HuTime.JSON.save(panel);
    closeDialog("dialogExportPanel");
}

