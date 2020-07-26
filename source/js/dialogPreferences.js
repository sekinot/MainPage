// **** Preferencesダイアログ ****
// *** Preferences of Chart Layerダイアログ (dialogPreferencesChartLayer => dPCR)

function showPanelPreferences () {

    showDialog("dialogPreferences");

    let panelCollection = hutime.panelCollections[0];
    document.getElementById("rootNameText").value = panelCollection.name;
    document.getElementById("rootBackgroundColor").value = panelCollection.style.backgroundColor;



    let panel = hutime.panelCollections[0].panels[0];
    document.getElementById("panelNameText").value = panel.name;
    document.getElementById("panelHeight").value = panel.vBreadth;

    document.getElementById("panelBackgroundColor").value = panel.style.backgroundColor;
    document.getElementById("panelTRatio").value = panel.tRatio;
}

function applyPreference () {
    let panelCollection = hutime.panelCollections[0];
    panelCollection.style.backgroundColor = document.getElementById("rootBackgroundColor").value;


    let panel = hutime.panelCollections[0].panels[0];
    panel.style.backgroundColor = document.getElementById("panelBackgroundColor").value;
    panel.tRatio = document.getElementById("panelTRatio").value;
    //closeDialog("dialogPreferences");

    hutime.redraw();
}


