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

    // set event handlers
    document.getElementById("body").addEventListener("click", closeMenuItem, false);
    document.getElementById("menuFile").addEventListener("click", openMenuItem, false);
    document.getElementById("menuFileImport").addEventListener("click", openMenuItem, false);
    document.getElementById("menuFileImportJson").addEventListener("click", importContainer, false);
}

// **** Menu Operations ****
var openItemElements = [];
function openMenuItem (ev) {
    if (ev.inCloseProcess)
        return;

    var element = ev.target;
    for (var i = 0; i < element.childNodes.length; ++i) {
        if (element.childNodes[i].tagName && element.childNodes[i].tagName.toLowerCase() == "ul") {
            element.childNodes[i].style.display = "block";
            openItemElements.push(element.childNodes[i]);
            ev.inOpenProcess = true;
            return;
        }
    }
}

function closeMenuItem (ev) {
    if (ev.inOpenProcess)
        return;

    for (var i = 0; i < openItemElements.length; ++i) {
        openItemElements[i].style.display = "none";
    }
    openItemElements = [];
    ev.inCloseProcess = true;
}

// **** Tree Menu Operations ****
function expandBranch (element) {
    var targetElements = element.parentNode.children;

    for (var i = 0; i < targetElements.length; ++i) {
        if (targetElements[i].tagName.toLowerCase() == "ul") {
            if (targetElements[i].style.display == "block") {
                targetElements[i].style.display = "none";
                element.childNodes[0].src = "expand.png";
            }
            else {
                targetElements[i].style.display = "block";
                element.childNodes[0].src = "collapse.png";
            }
        }
    }
}

var selectedBranch = null;
function clickBranch (element) {
    var targetElements = element.parentNode;

    if  (targetElements === selectedBranch) {
        selectedBranch.style.backgroundColor = "";
        selectedBranch = null;
        return;
    }
    if (selectedBranch)
        selectedBranch.style.backgroundColor = "";

    targetElements.style.backgroundColor = "aqua";
    selectedBranch = targetElements;

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

