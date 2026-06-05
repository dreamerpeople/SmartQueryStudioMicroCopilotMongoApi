param (
    [string]$to,
    [string]$subject,
    [string]$body,
    [string]$attachment
)

try {
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.To = $to
    $mail.Subject = $subject
    $mail.HTMLBody = $body
    if ($attachment) {
        $mail.Attachments.Add($attachment) | Out-Null
    }
    $mail.Send()
    Write-Output "Mail sent successfully via Outlook Desktop"
} catch {
    Write-Error "Failed to send mail: $($_.Exception.Message)"
    exit 1
}
