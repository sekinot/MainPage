// ****************
// Web HuTime Main Page
// Copyright (c) Tatsuki Sekino 2018. All rights reserved.
// ****************

var hutime;
var mainPanelCollection;

function initialize () {
    hutime = new HuTime("mainPanels");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("mainPanels").clientHeight);
    mainPanelCollection.style.backgroundColor = "#cccccc";
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();
    document.getElementById("treeRoot").hutimeObj = mainPanelCollection;

    initDialog("dialogImportRemote");

}

// **** Menu Operations ****
var openItemElements = [];      // Elements of menu item opened by a user
function openMenuItem (ev) {    // Open a menu item clicked by a user
    var element = ev.target;
    for (var i = 0; i < element.childNodes.length; ++i) {
        if (element.childNodes[i].nodeName == "UL") {
            element.childNodes[i].style.display = "block";
            openItemElements.push(element.childNodes[i]);
            ev.stopPropagation();
            return;
        }
    }
}
function closeMenuItem (ev) {   // Close all menu items opened
    openItemElements.forEach(function (itemElement) {
        itemElement.style.display = "none";
    });
    openItemElements = [];
    ev.stopPropagation();
}

// **** Tree Menu Operations ****
function operateBranch (ev) {   // Expand and collapse tree branch
    var targetElements = ev.target.parentNode.childNodes;
    for (var i = 0; i < targetElements.length; ++i) {
        if (targetElements[i].nodeName == "UL") {
            if (targetElements[i].style.display == "block") {
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
function addBranch (targetElement, hutimeObj) {   // Add tree branch
    // targetElement: li element to add added branch
    // hutimeObj: Object of HuTime (PanelCollection, Panel, Layer, Recordset)

    if (hutimeObj instanceof HuTime.PanelBorder)
        return;

    var li = document.createElement("li");
    li.hutime = {};
    li.hutimeObj = hutimeObj;

    var knobImg = document.createElement("img");
    knobImg.src = "img/expand.png";
    knobImg.className = "knob";
    knobImg.alt = "knob";
    li.appendChild(knobImg);

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "treeCheckBox";
    li.appendChild(checkbox);

    var icon = document.createElement("img");
    icon.className = "treeIcon";
    li.appendChild(icon);

    var i;
    var childObj = [];



    if (hutimeObj instanceof HuTime.RecordsetBase) {
        icon.src = "img/recordset.png";
        icon.alt = "Recordset";
        if (hutimeObj instanceof HuTime.ChartRecordset)
            childObj = hutimeObj._valueItems;
        else if (hutimeObj instanceof HuTime.TLineRecordset)
            childObj = [ hutimeObj.labelItem ];
        checkbox.checked = hutimeObj.visible;
        li.appendChild(document.createTextNode(hutimeObj.name));
    }
    else if (hutimeObj instanceof HuTime.RecordLayerBase) {
        if (hutimeObj instanceof HuTime.TLineLayer) {
            icon.src = "img/tlineLayer.png";
            icon.alt = "TLine Layer";
        }
        else {
            icon.src = "img/chartLayer.png";
            icon.alt = "Chart Layer";
        }
        childObj = hutimeObj.recordsets;
        checkbox.checked = hutimeObj.visible;
        li.appendChild(document.createTextNode(hutimeObj.name));
    }
    else if (hutimeObj instanceof HuTime.Layer) {
        if (hutimeObj instanceof HuTime.TickScaleLayer) {
            icon.src = "img/scaleLayer.png";
            icon.alt = "Tick Scale Layer";
        }
        else {
            icon.src = "img/chartLayer.png";
            icon.alt = "General Layer";
        }
        checkbox.checked = hutimeObj.visible;
        li.appendChild(document.createTextNode(hutimeObj.name));
    }
    else if (hutimeObj instanceof HuTime.ContainerBase) {
        if (hutimeObj instanceof HuTime.PanelCollection) {
            icon.src = "img/panelCollection.png";
            icon.alt = "Panel Collection";
        }
        else if (hutimeObj instanceof HuTime.TilePanel) {
            icon.src = "img/tilePanel.png";
            icon.alt = "Tile Panel";
        }
        else {
            icon.src = "img/tilePanel.png";
            icon.alt = "Other";
        }
        childObj = hutimeObj.contents;
        checkbox.checked = hutimeObj.visible;
        li.appendChild(document.createTextNode(hutimeObj.name));
    }
    else if (targetElement.hutimeObj instanceof HuTime.RecordsetBase) {
        // in case of item for chart or label for TLine
        icon.src = "img/recorditem.png";
        icon.alt = "Recordset";
        checkbox.checked = true;    // TENTATIVE
        if (targetElement.hutimeObj instanceof HuTime.ChartRecordset)
            li.appendChild(document.createTextNode(hutimeObj.name));
        else if (hutimeObj instanceof HuTime.TLineRecordset)
            li.appendChild(document.createTextNode(hutimeObj));
        knobImg.style.visibility = "hidden";
    }
    else
        return;

    li.appendChild(document.createElement("ul"));
    for (i = 0; i < childObj.length; ++i) {
        addBranch(li, childObj[i])
    }

    var ul;
    for (i = 0; i < targetElement.childNodes.length; ++i) {
        if (targetElement.childNodes[i].nodeName == "UL") {
            ul = targetElement.childNodes[i];
            ul.appendChild(li);
            break;
        }
    }
}

var selectedBranch = null;
function clickBranch (ev) {
    if (ev.target.getAttribute("class") == "knob") {
        operateBranch (ev);
        ev.stopPropagation();
        return;
    }


    // /* test for addBranch
    //addBranch(ev.target, "ぼよん");
    //ev.stopPropagation();
    return;
    // */

    var targetElements = ev.parentNode;

    if  (targetElements === selectedBranch) {
        selectedBranch.style.backgroundColor = "";
        selectedBranch = null;
        return;
    }
    if (selectedBranch)
        selectedBranch.style.backgroundColor = "";

    targetElements.style.backgroundColor = "aqua";
    selectedBranch = targetElements;

    ev.stopPropagation();
    return;
}

// **** Operations ****
function importContainer (ev) {
    closeMenuItem(ev);

    showDialog("dialogImportRemote");
    //return;

    var a =
        HuTime.JSON.load("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json",
            function () {
                mainPanelCollection.appendPanel(a.parsedObject);
                hutime.redraw(2457200.5, 2457238.5);

                addBranch(document.getElementById("treeRoot"), a.parsedObject)

            });
}


// **** Dialog ****
function initDialog (dialogId) {
    var dialogElement = document.getElementById(dialogId);
    var titleElement;
    for (var i = 0; i < dialogElement.childNodes.length; ++i) {
        if (dialogElement.childNodes[i].className == "dialogTitle") {
            titleElement = dialogElement.childNodes[i];
            break;
        }
    }
    dialogElement.dialogDragging = false;
    titleElement.addEventListener("mousedown", function (ev) {
        dialogElement.dialogDragging = true;
        dialogElement.originX = ev.pageX;
        dialogElement.originY = ev.pageY;
        var body = document.getElementById("body");
        body.addEventListener("mousemove", function (ev) {
            if (dialogElement.dialogDragging) {
                dialogElement.style.left =
                    (parseInt(dialogElement.style.left) - dialogElement.originX + ev.pageX) + "px";
                dialogElement.style.top =
                    (parseInt(dialogElement.style.top) - dialogElement.originY + ev.pageY) + "px";
                dialogElement.originX = ev.pageX;
                dialogElement.originY = ev.pageY;
            }
        });
    });
    titleElement.addEventListener("mouseup", function (ev) {
        dialogElement.dialogDragging = false;
        var body = document.getElementById("body");
        body.romoveEventListener("mousemove");
    });
}
function showDialog (dialogId) {
    var element = document.getElementById(dialogId);
    element.style.left = ((window.innerWidth - element.clientWidth) / 2).toString() + "px";
    element.style.top = ((window.innerHeight - element.clientHeight)/ 2).toString() + "px";
    element.style.visibility = "visible"
}
function closeDialog (dialogId) {
    var element = document.getElementById(dialogId);
    element.style.visibility = "hidden";
    element.dialogDragging = false;
}

