$logPath = "C:\Users\DESKTOPLM4-MD\.gemini\antigravity\brain\3af791fd-af92-4180-95b4-81006dc0f833\.system_generated\logs\transcript.jsonl"

function Decode-RawJsonString($str) {
    if ($str.StartsWith('"') -and $str.EndsWith('"')) {
        $str = $str.Substring(1, $str.Length - 2)
    }
    $str = $str.Replace('\"', '"')
    $str = $str.Replace('\n', "`n")
    $str = $str.Replace('\t', "`t")
    $str = $str.Replace('\\', '\')
    return $str
}

$lines = Get-Content $logPath -Encoding UTF8
$targetSteps = @(570)

foreach ($line in $lines) {
    if ($line.Trim() -ne "") {
        $obj = $line | ConvertFrom-Json
        if ($targetSteps -contains $obj.step_index -and $obj.tool_calls) {
            foreach ($call in $obj.tool_calls) {
                if ($call.name -eq "replace_file_content") {
                    Write-Host "=================== STEP $($obj.step_index) ==================="
                    Write-Host "Target:"
                    Write-Host (Decode-RawJsonString $call.args.TargetContent)
                    Write-Host "------------------------------------------------"
                    Write-Host "Replacement:"
                    Write-Host (Decode-RawJsonString $call.args.ReplacementContent)
                    Write-Host "------------------------------------------------"
                }
            }
        }
    }
}
