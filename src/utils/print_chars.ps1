$logPath = "C:\Users\DESKTOPLM4-MD\.gemini\antigravity\brain\3af791fd-af92-4180-95b4-81006dc0f833\.system_generated\logs\transcript.jsonl"

$lines = Get-Content $logPath -Encoding UTF8
foreach ($line in $lines) {
    if ($line.Trim() -ne "") {
        $obj = $line | ConvertFrom-Json
        if ($obj.step_index -eq 322) {
            foreach ($call in $obj.tool_calls) {
                if ($call.name -eq "replace_file_content") {
                    $target = $call.args.TargetContent
                    # Find any char outside ASCII range 32-126
                    for ($i = 0; $i -lt $target.Length; $i++) {
                        $code = [int]$target[$i]
                        if ($code -lt 32 -or $code -gt 126) {
                            if ($code -ne 10 -and $code -ne 13 -and $code -ne 9) {
                                Write-Host "Non-ASCII char code: $code ('$($target[$i])') at index $i"
                            }
                        }
                    }
                }
            }
        }
    }
}
