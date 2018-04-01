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
                ev.target.src = "expand.png";
                return;
            }
            else {
                targetElements[i].style.display = "block";
                ev.target.src = "collapse.png";
                return;
            }
        }
    }
    ev.stopPropagation();
}
function addBranch (element, label) {   // Add tree branch
    // element: li element to add added branch
    // label: label displayed on the tree
    var li = document.createElement("li");

    var knobImg = document.createElement("img");
    knobImg.src = "expand.png";
    knobImg.className = "knob";
    knobImg.alt = "knob";

    li.appendChild(knobImg);
    li.appendChild(document.createTextNode(label));
    li.appendChild(document.createElement("ul"));

    var ul;
    for (var i = 0; element.childNodes.length; ++i) {
        if (element.childNodes[i].nodeName == "UL") {
            ul = element.childNodes[i];
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

