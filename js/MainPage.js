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
    checkbox.checked = hutimeObj.visible;
    li.appendChild(checkbox);

    var icon = document.createElement("img");
    icon.className = "treeIcon";
    li.appendChild(icon);

    var i;
    var childObj = [];
    if (hutimeObj instanceof HuTime.RecordsetBase) {
        icon.src = "img/recordset.png";
        icon.alt = "Recordset";
        knobImg.style.visibility = "hidden";
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
    }
    li.appendChild(document.createTextNode(hutimeObj.name));
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
    var a =
        HuTime.JSON.load("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json",
            function () {
                mainPanelCollection.appendPanel(a.parsedObject);
                hutime.redraw(2457200.5, 2457238.5);

                addBranch(document.getElementById("treeRoot"), a.parsedObject)

            });
}

