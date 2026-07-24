$logPath = "C:\Users\DESKTOPLM4-MD\.gemini\antigravity\brain\3af791fd-af92-4180-95b4-81006dc0f833\.system_generated\logs\transcript.jsonl"
$filePath = "c:\Users\DESKTOPLM4-MD\Documents\MTO APP\MTORIMEC\fsm-support-suite\src\components\AdminPortal.tsx"

# All successful replacement steps in chronological order
$targetSteps = @(
    102, 111, 117, 125, 129, 200, 278, 304, 322, 332, 364, 370, 412, 424, 432, 438, 442, 446, 468, 474, 
    508, 520, 542, 552, 570, 580, 588, 628, 640, 646, 654, 660, 666, 672, 678, 688, 710, 730, 732, 746, 
    750, 765, 769, 775, 789, 807, 809, 811, 822, 829, 843, 861, 883, 887, 891
)

function Decode-RawJsonString($str) {
    if ($str.StartsWith('"') -and $str.EndsWith('"')) {
        $str = $str.Substring(1, $str.Length - 2)
    }
    # Unescape common JSON characters
    $str = $str.Replace('\"', '"')
    $str = $str.Replace('\n', "`n")
    $str = $str.Replace('\t', "`t")
    $str = $str.Replace('\\', '\')
    return $str
}

function Fix-Accents($str) {
    # Fix standard corrupted Spanish characters from log
    $str = $str.Replace("da", "día")
    $str = $str.Replace("das", "días")
    $str = $str.Replace("tcnico", "técnico")
    $str = $str.Replace("Tcnico", "Técnico")
    $str = $str.Replace("antigedad", "antigüedad")
    $str = $str.Replace("duracin", "duración")
    $str = $str.Replace("revisin", "revisión")
    $str = $str.Replace("Compensacin", "Compensación")
    $str = $str.Replace("coleccin", "colección")
    $str = $str.Replace("clculo", "cálculo")
    $str = $str.Replace("dinmico", "dinámico")
    $str = $str.Replace("Administracin", "Administración")
    $str = $str.Replace("Auditora", "Auditoría")
    $str = $str.Replace("Exito!", "¡Éxito!")
    return $str
}

$lines = Get-Content $logPath -Encoding UTF8
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8).Replace("`r`n", "`n")

foreach ($stepId in $targetSteps) {
    Write-Host "Applying step $stepId..."
    $stepFound = $false
    foreach ($line in $lines) {
        if ($line.Trim() -ne "") {
            $obj = $line | ConvertFrom-Json
            if ($obj.step_index -eq $stepId -and $obj.tool_calls) {
                $stepFound = $true
                foreach ($call in $obj.tool_calls) {
                    if ($call.name -eq "replace_file_content" -and $call.args.TargetFile -like "*AdminPortal.tsx*") {
                        $target = Decode-RawJsonString $call.args.TargetContent
                        $target = Fix-Accents $target
                        $target = $target.Replace("`r`n", "`n")
                        
                        $repl = Decode-RawJsonString $call.args.ReplacementContent
                        $repl = Fix-Accents $repl
                        $repl = $repl.Replace("`r`n", "`n")
                        
                        if ($content.Contains($target)) {
                            $content = $content.Replace($target, $repl)
                            Write-Host "  Successfully replaced."
                        } else {
                            # Match first non-empty line
                            $targetLines = $target.Split("`n") | Where-Object { $_.Trim() -ne "" }
                            if ($targetLines.Count -gt 0) {
                                $firstLine = $targetLines[0]
                                if ($content.Contains($firstLine)) {
                                    Write-Host "  WARNING: Target not found but first line exists. Index offset mismatch?" -ForegroundColor Yellow
                                } else {
                                    Write-Host "  WARNING: Target first line not found: '$firstLine'" -ForegroundColor Yellow
                                }
                            } else {
                                Write-Host "  WARNING: Target is empty." -ForegroundColor Yellow
                            }
                        }
                    }
                }
            }
        }
    }
    if (-not $stepFound) {
        Write-Host "  WARNING: Step $stepId not found in logs." -ForegroundColor DarkYellow
    }
}

$content = $content.Replace("`n", "`r`n")
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Finished re-applying edits." -ForegroundColor Green
