setlocal
cd /d %~dp0
set sourceDir=.\
set targetFile=..\..\html\js\MainPage.js

copy /y %sourceDir%initialize.js %targetFile% > nul

type %sourceDir%mainPanel.js >> %targetFile%
type %sourceDir%treeMenu.js >> %targetFile%

type %sourceDir%common.js >> %targetFile%
type %sourceDir%operation.js >> %targetFile%

type %sourceDir%dialogBase.js >> %targetFile%
type %sourceDir%dialogPreferences.js >> %targetFile%
type %sourceDir%dialogCreate.js >> %targetFile%
type %sourceDir%dialogSaveLoad.js >> %targetFile%
type %sourceDir%dialogSaveLoad.js >> %targetFile%
type %sourceDir%dialogData.js >> %targetFile%

type %sourceDir%_inCorrection.js >> %targetFile%


endlocal
