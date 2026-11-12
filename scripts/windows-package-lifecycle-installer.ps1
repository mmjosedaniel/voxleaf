function Initialize-LifecycleInstallerJob {
  if ("VoxLeaf.LifecycleInstallerJob" -as [type]) { return }
  Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace VoxLeaf {
    public sealed class LifecycleInstallerJob : IDisposable {
        const uint CreateSuspended = 0x00000004, CreateNoWindow = 0x08000000;
        const uint UseShowWindow = 1, KillOnJobClose = 0x00002000;
        const uint WaitSignalled = 0, WaitTimeout = 0x102;
        IntPtr job, process, thread;
        uint processId;
        bool assigned;

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        struct StartupInfo {
            public uint Size;
            public string Reserved, Desktop, Title;
            public uint X, Y, XSize, YSize, XCountChars, YCountChars, FillAttribute, Flags;
            public ushort ShowWindow, ReservedSize;
            public IntPtr ReservedPointer, Input, Output, Error;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct ProcessInformation {
            public IntPtr Process, Thread;
            public uint ProcessId, ThreadId;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct BasicLimits {
            public long ProcessUserTime, JobUserTime;
            public uint Flags;
            public UIntPtr MinimumWorkingSet, MaximumWorkingSet;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint Priority, Scheduling;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct ExtendedLimits {
            public BasicLimits Basic;
            public ulong ReadOps, WriteOps, OtherOps, ReadBytes, WriteBytes, OtherBytes;
            public UIntPtr ProcessMemory, JobMemory, PeakProcessMemory, PeakJobMemory;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct Accounting {
            public long UserTime, KernelTime, PeriodUserTime, PeriodKernelTime;
            public uint PageFaults, TotalProcesses, ActiveProcesses, TerminatedProcesses;
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern IntPtr CreateJobObject(IntPtr attributes, string name);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool SetInformationJobObject(IntPtr job, int kind, ref ExtendedLimits value, int size);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool QueryInformationJobObject(IntPtr job, int kind, out Accounting value, int size, IntPtr returned);
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern bool CreateProcess(string application, StringBuilder commandLine,
            IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags,
            IntPtr environment, string workingDirectory, ref StartupInfo startup, out ProcessInformation created);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool GetProcessTimes(IntPtr process, out long start, out long exit, out long kernel, out long user);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern uint ResumeThread(IntPtr thread);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool TerminateJobObject(IntPtr job, uint exitCode);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool TerminateProcess(IntPtr process, uint exitCode);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool GetExitCodeProcess(IntPtr process, out uint exitCode);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool CloseHandle(IntPtr handle);

        static Win32Exception NativeFailure(string operation) {
            return new Win32Exception(Marshal.GetLastWin32Error(), "windows-release-lifecycle-installer-" + operation);
        }

        public static LifecycleInstallerJob Create(string installer) {
            var owner = new LifecycleInstallerJob();
            owner.job = CreateJobObject(IntPtr.Zero, null);
            if (owner.job == IntPtr.Zero) throw NativeFailure("job-create");
            try {
                var limits = new ExtendedLimits();
                // Only kill-on-close is enabled. Descendants cannot break away.
                limits.Basic.Flags = KillOnJobClose;
                if (!SetInformationJobObject(owner.job, 9, ref limits, Marshal.SizeOf(limits)))
                    throw NativeFailure("job-limits");
                var startup = new StartupInfo();
                startup.Size = (uint)Marshal.SizeOf(startup);
                startup.Flags = UseShowWindow;
                ProcessInformation created;
                var command = new StringBuilder("\"" + installer + "\" /S");
                if (!CreateProcess(installer, command, IntPtr.Zero, IntPtr.Zero, false,
                    CreateSuspended | CreateNoWindow, IntPtr.Zero, null, ref startup, out created))
                    throw NativeFailure("create");
                owner.process = created.Process;
                owner.thread = created.Thread;
                owner.processId = created.ProcessId;
                return owner;
            } catch {
                // No process is owned until CreateProcess succeeds and returns its handles.
                CloseHandle(owner.job);
                throw;
            }
        }

        public uint ProcessId { get { return processId; } }
        public DateTime StartedUtc {
            get {
                long start, exit, kernel, user;
                if (!GetProcessTimes(process, out start, out exit, out kernel, out user))
                    throw NativeFailure("identity");
                return DateTime.FromFileTimeUtc(start);
            }
        }

        public void Assign() {
            if (!AssignProcessToJobObject(job, process)) throw NativeFailure("job-assign");
            assigned = true;
        }

        public void Resume() {
            uint previousCount = ResumeThread(thread);
            if (previousCount == UInt32.MaxValue) throw NativeFailure("resume");
            if (previousCount != 1) throw new InvalidOperationException("windows-release-lifecycle-installer-suspension-invalid");
        }

        bool RootSignalled(uint wait) {
            uint result = WaitForSingleObject(process, wait);
            if (result == WaitSignalled) return true;
            if (result == WaitTimeout) return false;
            throw NativeFailure("process-wait");
        }

        uint ActiveProcesses() {
            Accounting accounting;
            if (!QueryInformationJobObject(job, 1, out accounting, Marshal.SizeOf(typeof(Accounting)), IntPtr.Zero))
                throw NativeFailure("job-accounting");
            return accounting.ActiveProcesses;
        }

        public bool WaitForEmpty(Stopwatch clock, int budget) {
            while (clock.ElapsedMilliseconds < budget) {
                if (ActiveProcesses() == 0 && RootSignalled(0))
                    return clock.ElapsedMilliseconds < budget;
                long remaining = budget - clock.ElapsedMilliseconds;
                if (remaining > 0) Thread.Sleep((int)Math.Min(25, remaining));
            }
            return false;
        }

        public uint ExitCode() {
            uint exitCode;
            if (!GetExitCodeProcess(process, out exitCode)) throw NativeFailure("exit-code");
            return exitCode;
        }

        public void TerminateAndReap(int budget) {
            var clock = Stopwatch.StartNew();
            bool verified;
            if (assigned) {
                if (!TerminateJobObject(job, 1)) throw NativeFailure("job-terminate");
                verified = WaitForEmpty(clock, budget);
            } else {
                if (!RootSignalled(0) && !TerminateProcess(process, 1)) throw NativeFailure("terminate");
                long remaining = budget - clock.ElapsedMilliseconds;
                verified = remaining > 0 && RootSignalled((uint)remaining) && clock.ElapsedMilliseconds < budget;
            }
            if (!verified) throw new InvalidOperationException("windows-release-lifecycle-installer-reap-unverified");
        }

        static void Close(ref IntPtr handle, ref Win32Exception failure) {
            if (handle == IntPtr.Zero) return;
            if (!CloseHandle(handle) && failure == null) failure = NativeFailure("handle-close");
            handle = IntPtr.Zero;
        }

        public void Dispose() {
            Win32Exception failure = null;
            Close(ref job, ref failure);
            Close(ref thread, ref failure);
            Close(ref process, ref failure);
            if (failure != null) throw failure;
        }
    }
}
'@
}

function Get-LifecycleInstallerBudgetMilliseconds { 120000 }

function Stop-LifecycleInstallerJob {
  param($Job)
  $Job.TerminateAndReap(10000)
}

function Invoke-LifecycleInstallerJob {
  param(
    [string]$InstallerPath,
    [scriptblock]$RecordRoot,
    [scriptblock]$Journal,
    [scriptblock]$CleanupFailed
  )
  Initialize-LifecycleInstallerJob
  $budget = Get-LifecycleInstallerBudgetMilliseconds
  $clock = [Diagnostics.Stopwatch]::StartNew()
  $job = [VoxLeaf.LifecycleInstallerJob]::Create($InstallerPath)
  $failure = $null
  $exitCode = $null
  try {
    & $RecordRoot $job.ProcessId ($job.StartedUtc.ToString("o"))
    $job.Assign()
    & $Journal
    if ($clock.ElapsedMilliseconds -ge $budget) { throw "windows-release-lifecycle-installer-timeout" }
    $job.Resume()
    if (-not $job.WaitForEmpty($clock, $budget)) { throw "windows-release-lifecycle-installer-timeout" }
    $exitCode = $job.ExitCode()
  } catch {
    $failure = $_
    try { Stop-LifecycleInstallerJob $job } catch { & $CleanupFailed $_ }
  } finally {
    try { $job.Dispose() } catch {
      & $CleanupFailed $_
      if ($null -eq $failure) { $failure = $_ }
    }
  }
  if ($null -ne $failure) { throw $failure }
  return $exitCode
}
