
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