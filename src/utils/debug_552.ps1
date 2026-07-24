$logPath = "C:\Users\DESKTOPLM4-MD\.gemini\antigravity\brain\3af791fd-af92-4180-95b4-81006dc0f833\.system_generated\logs\transcript.jsonl"
$filePath = "c:\Users\DESKTOPLM4-MD\Documents\MTO APP\MTORIMEC\fsm-support-suite\src\components\AdminPortal.tsx"

function Decode-RawJsonString($str) {
    $str = $str.Trim()
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

foreach ($line in $lines) {
    if ($line.Trim() -ne "") {
        $obj = $line | ConvertFrom-Json
        if ($obj.step_index -eq 552) {
            foreach ($call in $obj.tool_calls) {
                if ($call.name -eq "replace_file_content") {
                    $target = Decode-RawJsonString $call.args.TargetContent
                    $target = Fix-Accents $target
                    $target = $target.Replace("`r`n", "`n")
                    
                    $targetLines = $target.Split("`n") | Where-Object { $_.Trim() -ne "" }
                    $firstLine = $targetLines[0]
                    $idx = $content.IndexOf($firstLine)
                    if ($idx -ge 0) {
                        Write-Host "First line matches at offset $($idx)!"
                        # Find mismatch character starting from $idx
                        for ($i = 0; $i -lt $target.Length; $i++) {
                            if ($target[$i] -ne $content[$idx + $i]) {
                                Write-Host "Mismatch at target offset $($i):"
                                Write-Host "Target char code:  $([int]$target[$i]) ($($target[$i]))"
                                Write-Host "Content char code: $([int]$content[$idx + $i]) ($($content[$idx + $i]))"
                                Write-Host "Target snippet:    '$($target.Substring([Math]::Max(0, $i - 10), 20))'"
                                Write-Host "Content snippet:   '$($content.Substring([Math]::Max(0, $idx + $i - 10), 20))'"
                                break
                            }
                        }
                    } else {
                        Write-Host "First line not found in content!"
                        Write-Host "Target first line: '$firstLine'"
                    }
                }
            }
        }
    }
}
