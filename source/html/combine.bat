setlocal
cd /d %~dp0
set sourceDir=.\
set targetFile=..\..\html\index.html

copy /y %sourceDir%beginningOfHtml.html %targetFile% > nul

type %sourceDir%beginningOfContainer.html >> %targetFile%
type %sourceDir%header.html >> %targetFile%
type %sourceDir%mainPanel.html >> %targetFile%
type %sourceDir%footer.html >> %targetFile%
type %sourceDir%endOfContainer.html >> %targetFile%

type %sourceDir%beginningOfDialogs.html >> %targetFile%
type %sourceDir%dialogPreferences.html >> %targetFile%
type %sourceDir%dialogCreate.html >> %targetFile%
type %sourceDir%dialogSaveLoad.html >> %targetFile%

type %sourceDir%endOfHtml.html >> %targetFile%

endlocal
