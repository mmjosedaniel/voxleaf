param(
  [Parameter(Mandatory=$true)][ValidateSet('verification','cleanup')][string]$Mode,
  [Parameter(Mandatory=$true)][string]$Path
)
$ErrorActionPreference = 'Stop'
try {
  if ($Mode -eq 'cleanup') {
    $stream = [IO.File]::Open($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::ReadWrite,[IO.FileShare]::ReadWrite)
    try {
      [Console]::WriteLine('ready')
      [Console]::Out.Flush()
      $null = [Console]::ReadLine()
    } finally { $stream.Dispose() }
  } else {
    Add-Type @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading;
public static class VoxLeafVerificationBarrier {
  [StructLayout(LayoutKind.Sequential)]
  struct Overlapped { public UIntPtr Internal, InternalHigh; public uint Offset, OffsetHigh; public IntPtr Event; }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  static extern IntPtr CreateFileW(string name,uint access,uint share,IntPtr security,uint creation,uint flags,IntPtr template);
  [DllImport("kernel32.dll", SetLastError=true)]
  static extern bool DeviceIoControl(IntPtr file,uint code,IntPtr input,uint inputSize,IntPtr output,uint outputSize,out uint returned,IntPtr overlapped);
  [DllImport("kernel32.dll", SetLastError=true)]
  static extern bool CloseHandle(IntPtr handle);
  [DllImport("kernel32.dll", SetLastError=true)]
  static extern bool CancelIoEx(IntPtr handle,IntPtr overlapped);
  public static void Run(string path) {
    using (var signal = new EventWaitHandle(false,EventResetMode.ManualReset)) {
      IntPtr file = CreateFileW(path,0x80000000,7,IntPtr.Zero,3,0x40000000,IntPtr.Zero);
      if (file == new IntPtr(-1)) throw new Win32Exception(Marshal.GetLastWin32Error());
      IntPtr pending = Marshal.AllocHGlobal(Marshal.SizeOf(typeof(Overlapped)));
      bool requested = false;
      try {
        Marshal.StructureToPtr(new Overlapped { Event=signal.SafeWaitHandle.DangerousGetHandle() },pending,false);
        uint returned;
        bool completed = DeviceIoControl(file,0x00090000,IntPtr.Zero,0,IntPtr.Zero,0,out returned,pending);
        if (completed || Marshal.GetLastWin32Error()!=997) throw new InvalidOperationException("oplock-not-granted");
        requested = true;
        Console.WriteLine("ready"); Console.Out.Flush();
        if (!signal.WaitOne(TimeSpan.FromMinutes(5))) throw new TimeoutException("oplock-not-reached");
        Console.WriteLine("reached"); Console.Out.Flush();
        Console.ReadLine();
      } finally {
        // Closing the owning handle acknowledges the break and releases the
        // blocked production read. No package bytes or timestamps are changed.
        if (requested && !signal.WaitOne(0)) {
          CancelIoEx(file,pending);
          signal.WaitOne();
        }
        CloseHandle(file);
        Marshal.FreeHGlobal(pending);
      }
    }
  }
}
'@
    [VoxLeafVerificationBarrier]::Run($Path)
  }
  exit 0
} catch {
  [Console]::Error.WriteLine('acquisition-file-barrier-failed')
  exit 1
}
