
var hutime;
var mainPanelCollection;

function initialize () {
    hutime = new HuTime("mainPanels");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("mainPanels").clientHeight);
    mainPanelCollection.style.backgroundColor = "#cccccc";
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();
}

// **** START sample data output ****

var lyr0;
var lyr1;
var pnl0;
function createSample () {
    pnl0 = new HuTime.TilePanel(200);
    mainPanelCollection.appendPanel(pnl0);


    ///*
    lyr0 = new HuTime.LineChartLayer(
        new HuTime.CalendarChartRecordset("sample/kyoto.csv", "日付", "日付", "平均風速"));
    // */
    ///*
    lyr1 = new HuTime.TLineLayer(
        new HuTime.TLineRecordset("sample/gion.csv", "From", "To", "行事"));
    // */

    pnl0.appendLayer(lyr0);
    pnl0.appendLayer(lyr1);
    hutime.redraw(2457200.5, 2457238.5);
    //lyr0.recordsets[0].useLoadedDataForJSON = true;
    //lyr1.recordsets[0].useLoadedDataForJSON = true;

}

function displaySample () {
    document.getElementById("sample").innerText =
        JSON.stringify(pnl0);
}

// **** End sample data output ****

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