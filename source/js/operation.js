
// パネルの削除
function removePanel () {
    let panelBranch = document.getElementById("treeContextMenu").treeBranch;
    panelBranch.hutimeObject.parent.removePanel(panelBranch.hutimeObject);
    hutime.redraw();
    removeBranch(panelBranch);
}

// レイヤの削除
function removeLayer () {
    let layerBranch = document.getElementById("treeContextMenu").treeBranch;
    let panel = layerBranch.hutimeObject.parent
    panel.removeLayer(layerBranch.hutimeObject);
    panel.redraw();
    removeBranch(layerBranch);
}



