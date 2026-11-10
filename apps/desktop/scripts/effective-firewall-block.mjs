import { Buffer } from "node:buffer";
import path from "node:path";

// Keep this query aligned with WindowsFirewallNetworkProbe.active in the
// benchmark preflight. It reads effective policy and never changes rules.
export function effectiveFirewallBlockScript(executable) {
  const target = Buffer.from(path.resolve(executable), "utf16le").toString(
    "base64",
  );
  return `
$ErrorActionPreference='Stop'
$target=[Text.Encoding]::Unicode.GetString([Convert]::FromBase64String('${target}'))
$profiles=@(Get-NetFirewallProfile -PolicyStore ActiveStore)
if ($profiles.Count -ne 3 -or @($profiles | Where-Object {$_.Enabled -ne 'True'}).Count -or
    (@($profiles.Name | Sort-Object) -join ',') -ne 'Domain,Private,Public' -or
    (Get-Service MpsSvc).Status -ne 'Running') { 'false'; exit }
$rules=Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline' -PolicyStore ActiveStore -ErrorAction Stop |
  Where-Object {$_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' -and
    $_.Action -eq 'Block' -and $_.Profile -eq 'Any' -and $_.PrimaryStatus -eq 'OK'}
$matches=@($rules | Where-Object {
  $apps=@($_ | Get-NetFirewallApplicationFilter)
  $apps.Count -eq 1 -and [String]::Equals($apps[0].Program,$target,[StringComparison]::OrdinalIgnoreCase)
})
if ($matches.Count -ne 1) { 'false'; exit }
$address=@($matches[0] | Get-NetFirewallAddressFilter)
$port=@($matches[0] | Get-NetFirewallPortFilter)
$service=@($matches[0] | Get-NetFirewallServiceFilter)
$interface=@($matches[0] | Get-NetFirewallInterfaceFilter)
$type=@($matches[0] | Get-NetFirewallInterfaceTypeFilter)
if ($address.Count -eq 1 -and $port.Count -eq 1 -and $service.Count -eq 1 -and
    $interface.Count -eq 1 -and $type.Count -eq 1 -and
    ($address[0].LocalAddress -join ',') -eq 'Any' -and
    ($address[0].RemoteAddress -join ',') -eq 'Any' -and
    $port[0].Protocol -eq 'Any' -and ($port[0].LocalPort -join ',') -eq 'Any' -and
    ($port[0].RemotePort -join ',') -eq 'Any' -and $service[0].Service -eq 'Any' -and
    ($interface[0].InterfaceAlias -join ',') -eq 'Any' -and
    $type[0].InterfaceType -eq 'Any') { 'true' } else { 'false' }
`;
}
