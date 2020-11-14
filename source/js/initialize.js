// ****************
// Web HuTime Main Page
// Copyright (c) Tatsuki Sekino 2018-2020. All rights reserved.
// ****************

// **** 各種設定 ****
let hutime;
let mainPanelCollection;

let opStatus = 0;       // 現在の操作状態
const opNull = 0;       // 操作なし
const opMenuBar = 1;    // メニューバー操作中
const opTreeMenu = 2;   // レイヤツリーのコンテキストメニュ操作中
//const opDialog = 4;     // ダイアログ操作中

let mouseXOrigin = -1;          // マウス操作用の汎用変数（操作開始時の座標）
let mouseYOrigin = -1;

const selectedBranchColor = "#ffffcc";     // 選択中のツリー項目の色
const minLayerTreeWidth = 100;  // ツリーの最小幅
const minHuTimeMainWidth = 150; // メインパネルの最小幅
const minHuTimeMainHeight = 50; // メインパネルの最小幅
const HuTimeBackgroundColor = "#cccccc";    // メインパネルの背景色
const InitialRootName = "HuTime Root";     // パネルコレクションの名前の初期値

const NewLayerVBreadth = 150;           // 新規作成レイヤの既定の高さ
const PanelTitleVBreadth = 20;          // パネルタイトルの高さ
//const NewLayerScaleVBreadth = 50;    // 新規作成レイヤのスケールの既定の高さ

const DisabledLabelColor = "#cccccc";   // 無効化された要素のラベルの色

function initialize () {    // 全体の初期化
    hutime = new HuTime("hutimeMain");
    mainPanelCollection = new HuTime.PanelCollection(document.getElementById("hutimeMain").clientHeight);
    mainPanelCollection.style.backgroundColor = HuTimeBackgroundColor;
    hutime.appendPanelCollection(mainPanelCollection);
    hutime.redraw();

    initMenu();
    initTree();
    initTreeMenu();
    document.getElementById("borderStatusBar").addEventListener("mousedown", borderStatusMouseDown);
    document.getElementById("borderTree").addEventListener("mousedown", borderTreeMouseDown);
    initDialog();


    hutime.addEventListener("porderchanged", changePanelIconOrder);

    // URLクエリの処理
    function getUrlQueries () {
        let queries = {};
        let queryStr = window.location.search.slice(1);
        if (!queries)
            return queries;

        queryStr.split("&").forEach(function (queryStr) {
            let queryItem = queryStr.split("=");
            queries[queryItem[0]] = queryItem[1];
        });
        return queries;
    }
    let urlQueries = getUrlQueries ();

    // データリストの先読み
    if (urlQueries["dataList"]) {
        document.getElementById("dImDLLocationRemoteType").checked = true;
        document.getElementById("dImDLLocationLocalType").checked = false;
        document.getElementById("dImDLLocationURL").value = urlQueries["dataList"];
        dImDLImport();
    }

    // load先読み
    if (urlQueries["load"]) {
        document.getElementById("dLdLocationRemoteType").checked = true;
        document.getElementById("dLdLocationLocalType").checked = false;
        document.getElementById("dLdLocationURL").value = urlQueries["load"];
        dLdLoad();
        return;
    }

    // デフォルト（時間軸目盛りを現在の前後1年で表示）
    appendTimeScale("101.1");
    let begin = new Date(Date.now());
    begin.setFullYear(begin.getFullYear() - 1);
    let end = new Date(Date.now());
    end.setFullYear(end.getFullYear() + 1);
    hutime.redraw(HuTime.isoToJd(begin.toISOString()), HuTime.isoToJd(end.toISOString()));

    // debug関係
    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/TLinePanel.json");
    importRemoteJsonContainer("http://localhost:63342/WebHuTimeIDE/MainPage/debug/sample/LineChartPanel.json");

//    showDialog("dialogPreferencesChartLayer");
//    dPOLOOpen("Shape");


}

