$logPath = "C:\Users\DESKTOPLM4-MD\.gemini\antigravity\brain\3af791fd-af92-4180-95b4-81006dc0f833\.system_generated\logs\transcript.jsonl"

$lines = Get-Content $logPath -Encoding UTF8
foreach ($line in $lines) {
    if ($line.Trim() -ne "") {
        $obj = $line | ConvertFrom-Json
        if ($obj.step_index -eq 552) {
            foreach ($call in $obj.tool_calls) {
                if ($call.name -eq "replace_file_content") {
                    $target = $call.args.TargetContent
                    Write-Host "Target length: $($target.Length)"
                    Write-Host "Starts with quote: $($target.StartsWith('"'))"
                    Write-Host "Ends with quote: $($target.EndsWith('"'))"
                    
                    Write-Host "First char code: $([int]$target[0])"
                    Write-Host "Last char code:  $([int]$target[$target.Length - 1])"
                    
                    # Print last 5 characters
                    Write-Host "Last 5 chars:"
                    for ($i = 5; $i -ge 1; $i--) {
                        $char = $target[$target.Length - $i]
                        Write-Host "  Code: $([int]$char) ('$char')"
                    }
                }
            }
        }
    }
}
