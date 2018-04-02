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
function addBranch (target, hutimeObj) {   // Add tree branch
    // target: li element to add added branch
    // hutimeObj: Object of HuTime (PanelCollection, Panel, Layer, Recordset)

    var li = document.createElement("li");
    li.hutime = {};
    li.hutimeObj = hutimeObj;

    var i;

    var knobImg = document.createElement("img");
    knobImg.src = "img/expand.png";
    knobImg.className = "knob";
    knobImg.alt = "knob";
    if (hutimeObj)


    li.appendChild(knobImg);

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "treeCheckBox";
    li.appendChild(checkbox);

    var icon = document.createElement("img");
    icon.src = "img/tilePanel.png";
    icon.className = "treeIcon";
    icon.alt = "Panel Collection";
    li.appendChild(icon);

    li.appendChild(document.createTextNode(hutimeObj.name));
    li.appendChild(document.createElement("ul"));

    var ul;
    for (i = 0; target.childNodes.length; ++i) {
        if (target.childNodes[i].nodeName == "UL") {
            ul = target.childNodes[i];
            break;
        }
    }
    ul.appendChild(li);
}

var selectedBranch = null;
function clickBranch (ev) {
    if (ev.target.getAttribute("class") == "knob") {
        operateBranch (ev);
        ev.stopPropagation();
        return;
    }


    // /* test for addBranch
    addBranch(ev.target, "ぼよん");
    ev.stopPropagation();
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
            });
}

