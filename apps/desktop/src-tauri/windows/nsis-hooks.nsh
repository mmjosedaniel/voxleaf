!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; The generated Tauri confirmation checkbox is deliberately repurposed to the
; bounded preferences/recovery class. Never allow its broad template cleanup.
Var ChatterboxDataCheckbox
Var ChatterboxDataCheckboxState
Var RemoveChatterboxData
Var RemovePreferencesAndRecovery

LangString chatterboxDataPageTitle ${LANG_ENGLISH} "Chatterbox data"
LangString chatterboxDataPageSubtitle ${LANG_ENGLISH} "Choose whether to remove the optional local package before uninstalling VoxLeaf."
LangString chatterboxDataPageText ${LANG_ENGLISH} "Chatterbox optional data was found. Removing it reclaims about 8.23 GB. Keeping it means that, after reinstalling this same VoxLeaf product identity, you can manage it with Remove Chatterbox."
LangString chatterboxDataCheckbox ${LANG_ENGLISH} "Remove Chatterbox optional data (about 8.23 GB; reacquisition is required to use it again)"
LangString chatterboxDataPageTitle ${LANG_SPANISH} "Datos de Chatterbox"
LangString chatterboxDataPageSubtitle ${LANG_SPANISH} "Elija si desea quitar el paquete local opcional antes de desinstalar VoxLeaf."
LangString chatterboxDataPageText ${LANG_SPANISH} "Se encontraron datos opcionales de Chatterbox. Al quitarlos se recuperan unos 8.23 GB. Si los conserva, después de reinstalar esta misma identidad de VoxLeaf podrá gestionarlos con Quitar Chatterbox."
LangString chatterboxDataCheckbox ${LANG_SPANISH} "Quitar datos opcionales de Chatterbox (unos 8.23 GB; deberá adquirirlos de nuevo para usarlo)"

UninstPage custom un.ChatterboxDataPageCreate un.ChatterboxDataPageLeave

Function un.ExactDirectoryExists
  System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
  StrCmp $R1 -1 0 +2
    StrCpy $R0 "0"
    Return
  IntOp $R1 $R1 & 0x10
  StrCmp $R1 0 0 +2
    StrCpy $R0 "0"
    Return
  StrCpy $R0 "1"
FunctionEnd

; $R0 is a literal directory. A missing path and every reparse point fail
; closed. Callers validate each literal ancestor before recursive removal.
Function un.IsSafeOwnedDirectory
  System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
  StrCmp $R1 -1 unsafe_owned_directory
  IntOp $R2 $R1 & 0x10
  StrCmp $R2 0 unsafe_owned_directory
  IntOp $R2 $R1 & 0x400
  StrCmp $R2 0 safe_owned_directory
  unsafe_owned_directory:
    StrCpy $R0 "0"
    Return
  safe_owned_directory:
    StrCpy $R0 "1"
FunctionEnd

; Recursively reject every nested file or directory reparse point before the
; exact owned root is passed to RMDir /r. The same-user race after this scan is
; outside the accepted MVP threat model; every observed unsafe tree is retained.
Function un.IsSafeOwnedTree
  Push $R3
  Push $R4
  Push $R5
  StrCpy $R3 $R0
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 safe_tree_root_failed
  ClearErrors
  FindFirst $R4 $R5 "$R3\*.*"
  IfErrors safe_tree_root_failed
  safe_tree_loop:
    StrCmp $R5 "." safe_tree_next
    StrCmp $R5 ".." safe_tree_next
    StrCpy $R0 "$R3\$R5"
    System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
    StrCmp $R1 -1 safe_tree_close_failed
    IntOp $R2 $R1 & 0x400
    StrCmp $R2 0 0 safe_tree_close_failed
    IntOp $R2 $R1 & 0x10
    StrCmp $R2 0 safe_tree_next
    Call un.IsSafeOwnedTree
    StrCmp $R0 "1" 0 safe_tree_close_failed
  safe_tree_next:
    ClearErrors
    FindNext $R4 $R5
    IfErrors safe_tree_close_passed
    Goto safe_tree_loop
  safe_tree_close_failed:
    FindClose $R4
  safe_tree_root_failed:
    StrCpy $R0 "0"
    Goto safe_tree_done
  safe_tree_close_passed:
    FindClose $R4
    StrCpy $R0 "1"
  safe_tree_done:
    Pop $R5
    Pop $R4
    Pop $R3
FunctionEnd

Function un.OptionalChatterboxDataExists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\2"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\cache"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "0"
  Return
  optional_data_exists:
    StrCpy $R0 "1"
FunctionEnd

Function un.ChatterboxDataPageCreate
  IfSilent chatterbox_page_skip
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/P" $R1
  IfErrors chatterbox_page_check_update
  Goto chatterbox_page_skip
  chatterbox_page_check_update:
  ClearErrors
  ${GetOptions} $R0 "/UPDATE" $R1
  IfErrors chatterbox_page_check_data
  Goto chatterbox_page_skip
  chatterbox_page_check_data:
  Call un.OptionalChatterboxDataExists
  StrCmp $R0 "1" 0 chatterbox_page_skip
  nsDialogs::Create 1018
  Pop $R0
  StrCmp $R0 error chatterbox_page_skip
  !insertmacro MUI_HEADER_TEXT "$(chatterboxDataPageTitle)" "$(chatterboxDataPageSubtitle)"
  ${NSD_CreateLabel} 0 0 100% 34u "$(chatterboxDataPageText)"
  Pop $R0
  ${NSD_CreateCheckbox} 0 42u 100% 18u "$(chatterboxDataCheckbox)"
  Pop $ChatterboxDataCheckbox
  StrCmp $ChatterboxDataCheckboxState "" 0 chatterbox_page_restore_state
    StrCpy $ChatterboxDataCheckboxState "1"
  chatterbox_page_restore_state:
  StrCmp $ChatterboxDataCheckboxState "1" 0 +2
    ${NSD_Check} $ChatterboxDataCheckbox
  nsDialogs::Show
  Return
  chatterbox_page_skip:
    Abort
FunctionEnd

Function un.ChatterboxDataPageLeave
  StrCmp $ChatterboxDataCheckbox "" chatterbox_page_leave_done
  ${NSD_GetState} $ChatterboxDataCheckbox $ChatterboxDataCheckboxState
  chatterbox_page_leave_done:
FunctionEnd

!macro NSIS_HOOK_PREUNINSTALL
  StrCpy $RemoveChatterboxData "0"
  StrCpy $RemovePreferencesAndRecovery "0"
  ${GetParameters} $R0
  StrCpy $R1 ""
  ${GetOptions} $R0 "/REMOVE_CHATTERBOX_DATA=" $R1
  StrCmp $R1 "1" 0 +2
    StrCpy $RemoveChatterboxData "1"
  StrCpy $R1 ""
  ${GetOptions} $R0 "/REMOVE_PREFERENCES_AND_RECOVERY=" $R1
  StrCmp $R1 "1" 0 +2
    StrCpy $RemovePreferencesAndRecovery "1"
  StrCpy $R1 ""
  ${GetOptions} $R0 "/REMOVE_APP_DATA=" $R1
  StrCmp $R1 "1" 0 +3
    StrCpy $RemoveChatterboxData "1"
    StrCpy $RemovePreferencesAndRecovery "1"

  ; Repair/replacement uninstall never removes retained data, even if an
  ; unrelated caller appends a removal option to the update command.
  StrCpy $R1 ""
  ${GetOptions} $R0 "/UPDATE" $R1
  IfErrors uninstall_data_mode_selected
    StrCpy $RemoveChatterboxData "0"
    StrCpy $RemovePreferencesAndRecovery "0"
    Goto suppress_tauri_broad_cleanup
  uninstall_data_mode_selected:

  ; Silent uninstall is non-destructive unless one of the exact flags above
  ; was present. The template checkbox state is never an authority in silent.
  IfSilent suppress_tauri_broad_cleanup

  ; Explicit flags compose with the interactive choices. The built-in Tauri
  ; checkbox is unchecked by default and now means preferences/recovery only.
  StrCmp $RemovePreferencesAndRecovery "1" interactive_preferences_done
  StrCpy $RemovePreferencesAndRecovery $DeleteAppDataCheckboxState
  interactive_preferences_done:
  StrCmp $RemoveChatterboxData "1" interactive_chatterbox_done
  StrCpy $RemoveChatterboxData $ChatterboxDataCheckboxState
  interactive_chatterbox_done:

  suppress_tauri_broad_cleanup:
  StrCpy $DeleteAppDataCheckboxState "0"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  StrCmp $RemoveChatterboxData "1" 0 chatterbox_data_done
  ; cb/2: product identity, tts, cb, and the exact root must all be real dirs.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_cb_cache
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_cb_cache
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_cb_cache
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\2"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_cb_cache
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\2"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_cb_cache:
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_profile
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_profile
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_profile
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\cache"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_profile
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\cache"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_profile:
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_staging
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_staging
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_staging
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_staging
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_staging
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4"

  chatterbox_staging:
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\staging"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_data_done
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\staging"
  chatterbox_data_done:

  StrCmp $RemovePreferencesAndRecovery "1" 0 preferences_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 preferences_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 preferences_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView\Default"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 preferences_data_done
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView\Default\Local Storage"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 preferences_data_done
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView\Default\Local Storage"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView\Default"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\EBWebView"
  preferences_data_done:
!macroend
