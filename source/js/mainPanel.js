// **** メニューバーの操作 ****
let openedMenus = [];       // ユーザによって開かれたメニュー
function initMenu () {      // メニュー初期化
    let liElements = document.getElementById("menuTop").getElementsByTagName("li");
    for (let i = 0; i < liElements.length; ++i) {
        liElements[i].addEventListener("mouseover", operateMenu);
        liElements[i].addEventListener("click", clickMenu);
    }
}
function clickMenu (ev) {   // clickでの動作
    ev.stopPropagation();

    // メニュー操作開始
    if (opStatus === opNull) {
        openedMenus = [ document.getElementById("menuTop") ];
        document.getElementById("body").addEventListener("click", clickMenu);
        opStatus |= opMenuBar;
        operateMenu(ev);
        return;
    }

    if ((opStatus & ~opMenuBar) !== 0)      // メニュ以外を操作中は何もしない
        return;

    // メニュー操作継続 (操作終了場所以外（トップ以外の子メニューのある項目）のクリック)
    if (ev.target.closest("#menuTop") && ev.target.parentNode.id !== "menuTop"
        && ev.target.querySelector("ul"))
        return;

    // メニュー操作終了 (トップメニュー、メニューの外、または、子メニューの無い項目のクリック)
    while (openedMenus.length > 1) {    // topMenu（=item[0]）は残すので >1
        openedMenus.pop().style.display = "none";
    }
    openedMenus = [];       // スタックをクリア
    document.getElementById("body").removeEventListener("click", clickMenu);
    opStatus &= ~opMenuBar;
}
function operateMenu (ev) {   // mouseOverでの動作
    ev.stopPropagation();
    if ((opStatus & opMenuBar) === 0)   // メニューバー操作中以外
        return;

    for (let i = openedMenus.length - 1; i >= 0; --i) {     // 開いているメニューを末端から確認
        if (openedMenus[i] === ev.target.parentNode) {      // targetの親ULとスタック末尾を比較
            let childUL = ev.target.querySelector("ul");    // targetの子メニュー
            if (childUL) {                                  // targetに子メニューがあれば、開いて終了
                childUL.style.display = "block";
                openedMenus.push(childUL);
            }
            return;
        }
        if (i > 0)      // i=0のtopMenuは開いたまま
            openedMenus.pop().style.display = "none";   // targetと異なれば閉じて次のスタックデータへ
    }
}

// **** メインパネルのサイズ変更操作 ****
// ** ツリー境界の操作（横幅の変更） **
let layerTreeWidthOrigin = -1;
let hutimeMainWidthOrigin = -1;
function borderTreeMouseDown (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.addEventListener("mousemove", borderTreeMouseMove);
    hutimeElement.addEventListener("mouseup", borderTreeMouseUp);
    hutimeElement.addEventListener("mouseleave", borderTreeMouseUp);
    hutimeElement.style.cursor = "ew-resize";

    mouseXOrigin = ev.clientX;
    layerTreeWidthOrigin = document.getElementById("layerTree").offsetWidth;
    hutimeMainWidthOrigin = document.getElementById("mainPanel").offsetWidth
        - layerTreeWidthOrigin - document.getElementById("borderTree").offsetWidth;
}
function borderTreeMouseMove (ev) {
    ev.stopPropagation();
    let dMouseX = ev.clientX - mouseXOrigin;
    if (layerTreeWidthOrigin + dMouseX < minLayerTreeWidth
        || hutimeMainWidthOrigin - dMouseX < minHuTimeMainWidth)
        return;
    document.getElementById("layerTree").style.width = layerTreeWidthOrigin + dMouseX + "px";
}
function borderTreeMouseUp (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.style.cursor = "default";
    hutimeElement.removeEventListener("mouseleave", borderTreeMouseUp);
    hutimeElement.removeEventListener("mouseup", borderTreeMouseUp);
    hutimeElement.removeEventListener("mousemove", borderTreeMouseMove);

    hutime.redraw();
}

// ** ステータスバー境界の操作（縦幅の変更） **
let mainPanelHeightOrigin = -1;
function borderStatusMouseDown (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.addEventListener("mousemove", borderStatusMouseMove);
    hutimeElement.addEventListener("mouseup", borderStatusMouseUp);
    hutimeElement.addEventListener("mouseleave", borderStatusMouseUp);
    hutimeElement.style.cursor = "ns-resize";

    mouseYOrigin = ev.clientY;
    mainPanelHeightOrigin = document.getElementById("mainPanel").offsetHeight;
}
function borderStatusMouseMove (ev) {
    ev.stopPropagation();
    let dMouseY = ev.clientY - mouseYOrigin;
    if (mainPanelHeightOrigin + dMouseY < minHuTimeMainHeight)
        return;
    document.getElementById("mainPanel").style.height = mainPanelHeightOrigin + dMouseY + "px";
}
function borderStatusMouseUp (ev) {
    ev.stopPropagation();
    let hutimeElement = document.getElementById("hutime");
    hutimeElement.style.cursor = "default";
    hutimeElement.removeEventListener("mouseleave", borderStatusMouseUp);
    hutimeElement.removeEventListener("mouseup", borderStatusMouseUp);
    hutimeElement.removeEventListener("mousemove", borderStatusMouseMove);

    hutime.panelCollections[0].vBreadth = document.getElementById("hutimeMain").clientHeight;
    hutime.redraw();
}

