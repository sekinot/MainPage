// *** dialog OLObject
function dOLOSwitchXT () {
    if (document.getElementById("dOLOUseX").checked) {
        document.getElementById("dOLOXTValueBox").style.display = "none";
        document.getElementById("dOLOTCalendarLabel").style.color = DisabledLabelColor;
        document.getElementById("dOLOTCalendar").disabled = true;
        document.getElementById("dOLOYVValueBox").style.display = "none";
    }
    else {
        document.getElementById("dOLOXTValueBox").style.display = "inline-block";
        document.getElementById("dOLOTCalendarLabel").style.color = "black";
        document.getElementById("dOLOTCalendar").disabled = false;
        document.getElementById("dOLOYVValueBox").style.display = "inline-block";
    }
}
function dOLOSwitchShapeType () {
    switch (document.getElementById("dOLOShapeType").value) {
        case "Circle":
            document.getElementById("dOLOShapeRotateLabel").style.color = DisabledLabelColor;
            document.getElementById("dOLOShapeRotate").disabled = true;
            document.getElementById("dOLOShapeRotateUnit").style.color = DisabledLabelColor;
            break;

        case "Square":
            document.getElementById("dOLOShapeRotateLabel").style.color = "#000000";
            document.getElementById("dOLOShapeRotate").disabled = false;
            document.getElementById("dOLOShapeRotateUnit").style.color = "#000000";
            break;

        case "Triangle":
            document.getElementById("dOLOShapeRotateLabel").style.color = "#000000";
            document.getElementById("dOLOShapeRotate").disabled = false;
            document.getElementById("dOLOShapeRotateUnit").style.color = "#000000";
            break;
    }
}
function dOLOSwitchSourceLocationType () {
    if (document.getElementById("dOLOImageRemoteType").checked) {
        document.getElementById("dOLOImageRemoteFile").style.display = "block";
        document.getElementById("dOLOImageLocalFile").style.display = "none";
    }
    else {
        document.getElementById("dOLOImageRemoteFile").style.display = "none";
        document.getElementById("dOLOImageLocalFile").style.display = "block";
    }
}

function dCrOLOOpen (type) {
    document.getElementById("dialogOLObject").type = type;
    document.getElementById("dialogOLObject").operation = "Create";
    document.getElementById("dOLOApply").style.display = "none";
    document.getElementById("dOLOOK").value = "Create";
    switch (type) {
        case "Shape" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer Shape";
            document.getElementById("dOLOShape").style.display = "block";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "none";
            dOLOSwitchXT ();
            dOLOSwitchShapeType ();
            break;

        case "String" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer String";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "block";
            document.getElementById("dOLOImage").style.display = "none";
            break;

        case "Image" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer Image";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "block";
            //dOLOSwitchSourceLocationType();
            break;
    }
    showDialog("dialogOLObject");
}
function dOLOApply () {
    if (document.getElementById("dialogOLObject").operation === "Create") {
        let position;
        if (document.getElementById("dOLOUseT").checked) {
            getTValue().then(function (responseText) {
                    position = new HuTime.RelativeXYPosition(
                        new HuTime.TVPosition(
                            parseFloat(responseText),
                            parseFloat(document.getElementById("dOLOVValue").value)),
                        parseFloat(document.getElementById("dOLOXValue").value),
                        parseFloat(document.getElementById("dOLOYValue").value));
                    createOLObject(position);
                }).catch(function (error) {
                    document.getElementById("statusBar").innerText =
                        "Error in converting T Value. (" + error.message + ")";
                });
        }
        else {
            position = new HuTime.XYPosition(
                parseFloat(document.getElementById("dOLOXValue").value),
                parseFloat(document.getElementById("dOLOYValue").value));
            createOLObject(position);
        }
    }
}

function createOLObject(position) {
    let obj, size, rotate, style;
    switch (document.getElementById("dialogOLObject").type) {
        case "Shape" :
            style = new HuTime.FigureStyle(
                document.getElementById("dOLOFillColor").value,
                document.getElementById("dOLOEdgeColor").value,
                parseFloat(document.getElementById("dOLOEdgeWidth").value));
            size = parseFloat(document.getElementById("dOLOShapeSize").value);
            rotate = parseFloat(document.getElementById("dOLOShapeRotate").value);
            switch (document.getElementById("dOLOShapeType").value) {
                case "Circle" :
                    obj = new HuTime.Circle(style, position, size);
                    break;

                case "Square" :
                    obj = new HuTime.Square(style, position, size, rotate);
                    break;

                case "Triangle" :
                    obj = new HuTime.Triangle(style, position, size, rotate);
                    break;
            }
            break;

        case "String" :
            style = new HuTime.StringStyle();
            style.fontFamily = document.getElementById("dOLOStringFont").value;
            let fontStyle = document.getElementById("dOLOStringStyle").value;
            style.fontStyle = "normal";
            style.fontWeight = 400;
            if (fontStyle.indexOf("italic") >= 0)
                style.fontStyle = "italic";
            if (fontStyle.indexOf("bold") >= 0)
                style.fontWeight = 700;
            style.fillColor = document.getElementById("dOLOStringColor").value;
            style.fontSize = parseFloat(document.getElementById("dOLOStringSize").value);

            obj = new HuTime.String(style, position,
                document.getElementById("dOLOStringText").value,
                parseFloat(document.getElementById("dOLOStringRotate").value));
            break;

        case "Image" :
            style = new HuTime.FigureStyle(null,
                document.getElementById("dOLOImageEdgeColor").value,
                parseFloat(document.getElementById("dOLOImageEdgeWidth").value));
            let width = parseFloat(document.getElementById("dOLOImageWidth").value);
            width = width && width > 0 ? width : null;
            let height = parseFloat(document.getElementById("dOLOImageHeight").value);
            height = height && height > 0 ? height : null;
            obj = new HuTime.Image(style, position,
                document.getElementById("dOLOImageURL").value,
                width, height,
                parseFloat(document.getElementById("dOLOImageRotate").value));
            break;
    }
    obj.name = document.getElementById("dOLOName").value;
    addBranch(document.getElementById("treeContextMenu").treeBranch, obj);
    let layer = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    layer.appendObject(obj);
    layer.redraw();
}
function getTValue () {
    return new Promise(function (resolve, reject){
        let request = new XMLHttpRequest();
        let apiUrl = "http://ap.hutime.org/cal/?method=conv&ocal=1.1&ical=" +
            document.getElementById("dOLOTCalendar").value + "&ival=" +
            document.getElementById("dOLOTValue").value;
        request.open("GET", apiUrl);
        request.onload = function () {
            if (request.readyState === 4 && request.status === 200)
                resolve(request.responseText);
            else
                reject(new Error(request.statusText));
        };
        request.onerror = function () {
                reject(new Error(request.statusText));
        };
        request.send();
    });
}

function dOLOClose () {
    dOLOApply();
    closeDialog("dialogOLObject");
}

