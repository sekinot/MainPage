// **** ダイアログ関係（共通） ****
// デバッグ用
///*
const dCrSourceURLDefault =
//    "http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/kyotoNoHead.csv";
//    "http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/kyoto.csv";
    "";
// */

// *** ダイアログ基本構造 ***
// ダイアログの初期化
function initDialog () {
    let dialogElements = document.querySelectorAll("div.dialog");
    for (let i = 0; i < dialogElements.length; ++i ){
        dialogElements[i].querySelector("div.dialogTitle")
            .addEventListener("mousedown", startMoveDialog);
        dialogElements[i].querySelector("span.dialogCloseButton")
            .addEventListener("click", clickDialogCloseButton);
        let resizeDialogElement = dialogElements[i].querySelector("div.dialogResizeHandle");
        if (resizeDialogElement) {
            resizeDialogElement.addEventListener("mousedown", startResizeDialog);
            dialogElements[i].minWidth = parseFloat(dialogElements[i].style.width);
            dialogElements[i].minHeight = parseFloat(dialogElements[i].style.height);
        }
        dialogElements[i].dialogDragging = false;
    }
}

// ダイアログを開く・閉じる
function showDialog (dialogId) {
    let dialogElement = document.getElementById(dialogId);
    if (!dialogElement.style.left || parseFloat(dialogElement.style.left) < 0)
        dialogElement.style.left = ((window.innerWidth - parseFloat(dialogElement.style.width)) / 2).toString() + "px";
    if (!dialogElement.style.top || parseFloat(dialogElement.style.top) < 0)
        dialogElement.style.top = ((window.innerHeight - parseFloat(dialogElement.style.height)) / 2).toString() + "px";
    dialogElement.style.display = "block";
}
function clickDialogCloseButton (ev) {
    closeDialog(ev.target.closest("div.dialog").id);
}
function closeDialog (dialogId) {
    let dialogElement = document.getElementById(dialogId);
    dialogElement.style.display = "none";
    dialogElement.dialogDragging = false;
}

// ダイアログの移動
function startMoveDialog (ev) {
    let dialogElement = ev.target.closest("div.dialog");
    dialogElement.dialogDragging = true;
    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    document.dialogElement = dialogElement;
    document.addEventListener("mousemove", moveDialog, true);
    document.addEventListener("mouseup", stopMoveDialog, true);
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function moveDialog (ev) {
    if (!document.dialogElement)
        return;
    let dialogElement = document.dialogElement;
    dialogElement.style.left =
        (parseInt(dialogElement.style.left) - dialogElement.originX + ev.pageX) + "px";
    dialogElement.style.top =
        (parseInt(dialogElement.style.top) - dialogElement.originY + ev.pageY) + "px";

    dialogElement.originX = ev.pageX;
    dialogElement.originY = ev.pageY;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopMoveDialog (ev) {
    document.dialogElement.dialogDragging = false;
    document.removeEventListener("mousemove", moveDialog, true);
    document.removeEventListener("mouseup", stopMoveDialog, true);
    document.dialogElement = null;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

// ダイアログのサイズ変更
function startResizeDialog (ev) {
        let dialogElement = ev.target.closest("div.dialog");
        dialogElement.dialogDragging = true;
        dialogElement.originX = ev.pageX;
        dialogElement.originY = ev.pageY;
        document.dialogElement = dialogElement;
        document.addEventListener("mousemove", resizeDialog);
        document.addEventListener("mouseup", stopResizeDialog);
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.target.style.cursor)
            document.body.style.cursor = ev.target.style.cursor;
        else
            document.body.style.cursor = "se-resize";
        return false;
}
function resizeDialog (ev) {
    if (!document.dialogElement)
        return;
    let dialogElement = document.dialogElement;
    let bodyElement = dialogElement.querySelector("div.dialogBody");

    let resizeDirection = dialogElement.querySelector("div.dialogResizeHandle").style.cursor;
    if (resizeDirection !== "ew-resize" && resizeDirection !== "ns-resize")
        resizeDirection = "se-resize";
    let newWidth = parseInt(dialogElement.style.width) - dialogElement.originX + ev.pageX;
    let newHeight = parseInt(dialogElement.style.height) - dialogElement.originY + ev.pageY;

    if (resizeDirection !== "ns-resize") {
        if (newWidth > dialogElement.minWidth) {
            dialogElement.style.width = newWidth + "px";
            dialogElement.originX = ev.pageX;
        }
        else {
            if (newWidth < dialogElement.minWidth - 5)  // -5 は、変更中止の操作バッファ
                stopResizeDialog(ev);   // 既定の大きさ以下になる場合は、サイズ変更を中止
        }
    }
    if (resizeDirection !== "ew-resize") {
        if (newHeight > dialogElement.minHeight) {
            dialogElement.style.height = newHeight + "px";
            if (bodyElement.style.height)
                bodyElement.style.height =
                    (parseInt(bodyElement.style.height) - dialogElement.originY + ev.pageY) + "px";
            dialogElement.originY = ev.pageY;
        }
        else {
            if (newHeight < dialogElement.minHeight - 5)
                stopResizeDialog(ev);
        }
    }

    if (dialogElement.resizeDialog)     // 個別のダイアログに固有の動作
        dialogElement.resizeDialog();

    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function stopResizeDialog (ev) {
    document.dialogElement.dialogDragging = false;
    document.removeEventListener("mousemove", resizeDialog);
    document.removeEventListener("mouseup", resizeDialog);
    document.dialogElement = null;
    document.body.style.cursor = "auto";
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}

