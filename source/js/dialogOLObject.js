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
/*
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
//*/

function dCrOLOOpen (type) {
    document.getElementById("dialogOLObject").type = type;
    document.getElementById("dialogOLObject").operation = "Create";
    document.getElementById("dOLOApply").style.display = "none";
    document.getElementById("dOLOCreate").style.display = "block";
    document.getElementById("dOLOOk").style.display = "none";
    dOLOSwitchXT ();
    switch (type) {
        case "Shape" :
            document.getElementById("dOLODialogTitle").innerText = "Create an On-Layer Shape";
            document.getElementById("dOLOShape").style.display = "block";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "none";
            document.getElementById("dOLOShapeType").disabled = false;
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
function dOLOCreate () {
    let position;
    if (document.getElementById("dOLOUseT").checked) {
        getTValue().then(function (responseText) {
            if (typeof (responseText) !== "string")
                return;
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
    closeDialog("dialogOLObject");
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
    addBranch(document.getElementById("treeContextMenu").treeBranch, obj, null, null, null,
        document.getElementById("treeContextMenu").treeBranch.
        querySelector("ul").querySelector("li"));
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

function dPOLOOpen (type) {
    let obj = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    document.getElementById("dialogOLObject").type = type;
    document.getElementById("dialogOLObject").operation = "Preference";
    document.getElementById("dOLOApply").style.display = "block";
    document.getElementById("dOLOCreate").style.display = "none";
    document.getElementById("dOLOOk").style.display = "block";

    document.getElementById("dOLOName").value = obj.name;
    if (obj.position instanceof HuTime.RelativeXYPosition) {
        document.getElementById("dOLOUseX").checked = false;
        document.getElementById("dOLOUseT").checked = true;
        document.getElementById("dOLOTCalendar").value = "101.1";
        document.getElementById("dOLOXValue").value = obj.position.ofsX;
        document.getElementById("dOLOYValue").value = obj.position.ofsY;
        let time = HuTime.jdToTime(obj.position.position.t, 1);
        document.getElementById("dOLOTValue").value =
            time.year < 0 ? "-" : "" +
            Math.abs(time.year) > 9999 ? Math.abs(time.year) :
                ("000" + Math.abs(time.year).toString()).slice(-4) + "-" +
                ("0" + time.month.toString()).slice(-2) + "-" +
                ("0" + time.day.toString()).slice(-2);
        //document.getElementById("dOLOTValue").value = obj.position.position.t;
        document.getElementById("dOLOVValue").value = obj.position.position.v;
    }
    else {
        document.getElementById("dOLOUseX").checked = true;
        document.getElementById("dOLOUseT").checked = false;
        document.getElementById("dOLOXValue").value = obj.position.x;
        document.getElementById("dOLOYValue").value = obj.position.y;
    }
    dOLOSwitchXT ();

    switch (type) {
        case "Shape" :
            document.getElementById("dOLODialogTitle").innerText =
                "Preference of an On-Layer Shape";
            document.getElementById("dOLOShape").style.display = "block";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "none";

            if (obj instanceof HuTime.Circle) {
                document.getElementById("dOLOShapeType").value = "Circle";
            }
            else if (obj instanceof HuTime.Square) {
                document.getElementById("dOLOShapeType").value = "Square";
                document.getElementById("dOLOShapeRotate").value = obj.rotate;
            }
            else if (obj instanceof HuTime.Triangle) {
                document.getElementById("dOLOShapeType").value = "Triangle";
                document.getElementById("dOLOShapeRotate").value = obj.rotate;
            }
            else {
                return;
            }
            document.getElementById("dOLOShapeSize").value = obj.width;
            dOLOSwitchShapeType ();
            document.getElementById("dOLOShapeType").disabled = true;   // 種類は変更不可
            document.getElementById("dOLOFillColor").value = obj.style.fillColor;
            document.getElementById("dOLOEdgeColor").value = obj.style.lineColor;
            document.getElementById("dOLOEdgeWidth").value = obj.style.lineWidth;
            break;

        case "String" :
            document.getElementById("dOLODialogTitle").innerText =
                "Preference of an On-Layer String";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "block";
            document.getElementById("dOLOImage").style.display = "none";

            document.getElementById("dOLOStringText").value = obj.text;
            document.getElementById("dOLOStringFont").value = obj.style.fontFamily;
            if (obj.style.fontStyle === "italic") {
                if (obj.style.fontWeight === 700 || obj.style.fontWeight === "bold")
                    document.getElementById("dOLOStringStyle").value = "italic bold";
                else
                    document.getElementById("dOLOStringStyle").value = "italic";
            }
            else {
                if (obj.style.fontWeight === 700 || obj.style.fontWeight === "bold")
                    document.getElementById("dOLOStringStyle").value = "bold";
                else
                    document.getElementById("dOLOStringStyle").value = "normal";
            }
            document.getElementById("dOLOStringColor").value = obj.style.fillColor;
            document.getElementById("dOLOStringSize").value = parseFloat(obj.style.fontSize);
            document.getElementById("dOLOStringRotate").value = obj.rotate;
            break;

        case "Image" :
            document.getElementById("dOLODialogTitle").innerText =
                "Preference of an On-Layer Image";
            document.getElementById("dOLOShape").style.display = "none";
            document.getElementById("dOLOString").style.display = "none";
            document.getElementById("dOLOImage").style.display = "block";
            //dOLOSwitchSourceLocationType();
            document.getElementById("dOLOImageURL").value = obj.src;
            document.getElementById("dOLOImageWidth").value = obj.width;
            document.getElementById("dOLOImageHeight").value = obj.height;
            document.getElementById("dOLOImageRotate").value = obj.rotate;
            document.getElementById("dOLOImageEdgeColor").value = obj.style.lineColor
            document.getElementById("dOLOImageEdgeWidth").value = obj.style.lineWidth;
            break;
    }
    showDialog("dialogOLObject");
}
function dOLOApply () {
    let obj = document.getElementById("treeContextMenu").treeBranch.hutimeObject;
    switch (document.getElementById("dialogOLObject").type) {
        case "Shape" :
            if (obj instanceof HuTime.Square || obj instanceof HuTime.Triangle)
                obj.rotate = parseFloat(document.getElementById("dOLOShapeRotate").value);
            obj.width = parseFloat(document.getElementById("dOLOShapeSize").value);
            obj.style = new HuTime.FigureStyle(
                document.getElementById("dOLOFillColor").value,
                document.getElementById("dOLOEdgeColor").value,
                parseFloat(document.getElementById("dOLOEdgeWidth").value));
            break;

        case "String" :
            obj.text = document.getElementById("dOLOStringText").value;
            let style = new HuTime.StringStyle();
            style.fontFamily = document.getElementById("dOLOStringFont").value;
            let fontStyle = document.getElementById("dOLOStringStyle").value;
            style.fontStyle = "normal";
            style.fontWeight = 400;
            if (fontStyle.indexOf("italic") >= 0)
                style.fontStyle = "italic";
            if (fontStyle.indexOf("bold") >= 0)
                style.fontWeight = 700;
            style.fontSize = document.getElementById("dOLOStringSize").value;
            style.fillColor = document.getElementById("dOLOStringColor").value;
            obj.style = style;
            obj.rotate = parseFloat(document.getElementById("dOLOStringRotate").value);
            break;

        case "Image" :
            obj.src = document.getElementById("dOLOImageURL").value;
            obj.width = parseFloat(document.getElementById("dOLOImageWidth").value);
            obj.height = parseFloat(document.getElementById("dOLOImageHeight").value);
            obj.rotate = parseFloat(document.getElementById("dOLOImageRotate").value);
            obj.style = new HuTime.FigureStyle(null,
                document.getElementById("dOLOImageEdgeColor").value,
                parseFloat(document.getElementById("dOLOImageEdgeWidth").value));
            break;
    }

    if (document.getElementById("dOLOUseT").checked) {
        getTValue().then(function (responseText) {
            if (typeof (responseText) !== "string")
                return;
            obj.position = new HuTime.RelativeXYPosition(
                new HuTime.TVPosition(
                    parseFloat(responseText),
                    parseFloat(document.getElementById("dOLOVValue").value)),
                parseFloat(document.getElementById("dOLOXValue").value),
                parseFloat(document.getElementById("dOLOYValue").value));
            obj.parent.redraw();
        }).catch(function (error) {
            document.getElementById("statusBar").innerText =
                "Error in converting T Value. (" + error.message + ")";
        });
    }
    else {
        obj.position = new HuTime.XYPosition(
            parseFloat(document.getElementById("dOLOXValue").value),
            parseFloat(document.getElementById("dOLOYValue").value));
        obj.parent.redraw();
    }
    obj.name = document.getElementById("dOLOName").value;
    document.getElementById("treeContextMenu").treeBranch.  // treeメニューのラベルを変更
        querySelector("span.branchLabelSpan").innerText = obj.name;
}
function dOLOClose () {
    dOLOApply();
    closeDialog("dialogOLObject");
}

