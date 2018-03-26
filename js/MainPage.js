
var hutime;
var mainPanelCollection;

function initialize () {
    hutime = new HuTime("mainPanels");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("mainPanels").clientHeight);
    mainPanelCollection.style.backgroundColor = "#cccccc";
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();
}

function importLayer () {
    alert("ぼよん");
}

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


// **** Menu Operation ****
function closeMenuItem (element) {
    while (element.tagName.toLowerCase() == "ul" || element.tagName.toLowerCase() == "li") {
        if (element.tagName.toLowerCase() == "li" &&
            element.parentNode.parentNode.tagName.toLowerCase() == "li") {
            element.parentNode.style.display = "none";
            element.parentNode.style.display = "";
        }
        element = element.parentNode;
    }
}


function importContainer (element) {
    closeMenuItem(element);

    var a =
        HuTime.JSON.load("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json",
            function () {
                mainPanelCollection.appendPanel(a.parsedObject);
                hutime.redraw(2457200.5, 2457238.5);
            });
}
