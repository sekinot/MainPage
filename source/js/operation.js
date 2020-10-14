
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

// パネルの移動
function startMoveBranch (ev) {
    let branchElement = ev.target.closest("li");
    branchElement.branchDragging = true;
    branchElement.originX = ev.pageX;
    branchElement.originY = ev.pageY;
    if (!branchElement.style.left)
        branchElement.style.left = "0";
    if (!branchElement.style.top)
        branchElement.style.top = "0";
    document.branchElement = branchElement;
    document.selectedBranchElement = null;
    document.addEventListener("mousemove", moveBranch, true);
    document.addEventListener("mouseup", stopMoveBranch, true);

    branchElement.style.zIndex = "1000";
    branchElement.style.pointerEvents = "none";

    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function moveBranch (ev) {
    if (!document.branchElement)
        return;

    let branchElement = document.branchElement;
    branchElement.style.left =
        (parseInt(branchElement.style.left) - branchElement.originX + ev.pageX) + "px";
    branchElement.style.top =
        (parseInt(branchElement.style.top) - branchElement.originY + ev.pageY) + "px";

    branchElement.originX = ev.pageX;
    branchElement.originY = ev.pageY;

    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopMoveBranch (ev) {
    let branchElement = document.branchElement;
    branchElement.style.left = "0";
    branchElement.style.top = "0";
    branchElement.style.zIndex = undefined;
    branchElement.style.pointerEvents = "auto";

    if (document.selectedBranchElement) {
        document.selectedBranchElement.querySelector("span.branchSpan").
            style.backgroundColor = null;
        document.selectedBranchElement.querySelector("span.branchSpan").
            style.borderTop = null;

        let hutimeObject = document.branchElement.hutimeObject;
        let parent = hutimeObject.parent;
        let selectedHutimeObject = document.selectedBranchElement.hutimeObject;
        let selectedParent = selectedHutimeObject.parent;

        if (hutimeObject instanceof HuTime.Layer) {
            if (selectedHutimeObject instanceof HuTime.Layer) {
                parent.removeLayer(hutimeObject);
                parent.redraw();

                let layers = [];
                for (let i = 0; i < selectedParent.layers.length; ++i) {
                    if (!(selectedParent.layers[i] instanceof HuTime.PanelBorder))
                       layers.push(selectedParent.layers[i]);
                }
                for (let i = 0; i < layers.length; ++i) {
                    selectedParent.removeLayer(layers[i]);
                }
                for (let i = 0; i < layers.length; ++i) {
                    selectedParent.appendLayer(layers[i])
                    selectedParent.redraw();    // まとめてredrawすると順番が変わることがあるため（今後修正）
                    if (layers[i] === selectedHutimeObject) {
                        selectedParent.appendLayer(hutimeObject);
                        selectedParent.redraw();
                    }
                }
                removeBranch(document.branchElement);
                addBranch(document.selectedBranchElement.parentNode.closest("li"),
                    hutimeObject, undefined, undefined, undefined,
                    document.selectedBranchElement);
            }
            else if (selectedHutimeObject instanceof HuTime.PanelBase) {
                selectedHutimeObject.appendLayer(hutimeObject);
                parent.removeLayer(hutimeObject);
                selectedHutimeObject.redraw();
                parent.redraw();
                removeBranch(document.branchElement);
                addBranch(document.selectedBranchElement,
                    hutimeObject, undefined, undefined, undefined,
                    document.selectedBranchElement.querySelector("ul").querySelector("li"));
            }
        }
        else if (hutimeObject instanceof HuTime.TilePanel) {
            hutime.panelCollections[0].changePanelOrder(hutimeObject, selectedHutimeObject);
            removeBranch(document.branchElement);
            addBranch(document.selectedBranchElement.parentNode.closest("li"),
                hutimeObject, undefined, undefined, undefined,
                document.selectedBranchElement);
        }
    }
    document.branchElement.branchDragging = false;
    document.removeEventListener("mousemove", moveBranch, true);
    document.removeEventListener("mouseup", stopMoveBranch, true);
    document.branchElement = null;
    document.selectedBranchElement = null;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function selectMoveBranch (ev) {
    if (!document.branchElement)
        return;

    let li = ev.target.closest("li");

    if (ev.type === "mouseover") {
        if (document.branchElement.hutimeObject instanceof HuTime.Layer) {
            if (li.hutimeObject instanceof HuTime.Layer)
                li.querySelector("span.branchSpan").style.borderTop = "solid 3px pink";
            else if (li.hutimeObject instanceof HuTime.PanelBase)
                li.querySelector("span.branchSpan").style.backgroundColor = "pink";
        }
        else if (document.branchElement.hutimeObject instanceof HuTime.PanelBase) {
            if (li.hutimeObject instanceof HuTime.PanelBase)
                li.querySelector("span.branchSpan").style.borderTop = "solid 3px pink";
        }
        document.selectedBranchElement = li;
    }
    else {
        li.querySelector("span.branchSpan").style.borderTop = null;
        li.querySelector("span.branchSpan").style.backgroundColor = null;
        document.selectedBranchElement = null;
    }
}
function changePanelIconOrder (ev) {
    // evにsourceとtargetのパネルの情報が含まれてから実装
    // HuTime.PanelCollection.changePanelOrderの改修必要
}



