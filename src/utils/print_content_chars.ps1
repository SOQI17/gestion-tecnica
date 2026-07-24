$filePath = "c:\Users\DESKTOPLM4-MD\Documents\MTO APP\MTORIMEC\fsm-support-suite\src\components\AdminPortal.tsx"
$contentUtf8 = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$tecnico = "T" + [char]233 + "cnico"
$idx = $contentUtf8.IndexOf($tecnico)
if ($idx -ge 0) {
    Write-Host "Found '$tecnico' at index $idx"
    Write-Host "Snippet: '$($contentUtf8.Substring($idx, 15))'"
} else {
    Write-Host "'$tecnico' not found in UTF-8 content."
}
