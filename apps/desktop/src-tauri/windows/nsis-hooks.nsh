!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; The generated Tauri confirmation checkbox is deliberately repurposed to the
; bounded preferences/recovery class. Never allow its broad template cleanup.
Var ChatterboxDataCheckbox
Var ChatterboxDataCheckboxState
Var RemoveChatterboxData
Var RemovePreferencesAndRecovery

; Tauri includes hooks before MUI_LANGUAGE defines LANG_ENGLISH/LANG_SPANISH.
; Bind these strings to the actual language IDs even at that early boundary.
LangString chatterboxDataPageTitle 1033 "Chatterbox data"
LangString chatterboxDataPageSubtitle 1033 "Choose whether to remove the optional local package before uninstalling VoxLeaf."
LangString chatterboxDataPageText 1033 "Chatterbox optional data was found. Removing it reclaims the storage used by all retained Chatterbox versions. Keeping it means that, after reinstalling this same VoxLeaf product identity, you can manage it with Remove Chatterbox."
LangString chatterboxDataCheckbox 1033 "Remove Chatterbox optional data (reacquisition is required to use it again)"
LangString chatterboxDataPageTitle 1034 "Datos de Chatterbox"
LangString chatterboxDataPageSubtitle 1034 "Elija si desea quitar el paquete local opcional antes de desinstalar VoxLeaf."
LangString chatterboxDataPageText 1034 "Se encontraron datos opcionales de Chatterbox. Al quitarlos se recupera el espacio de todas las versiones conservadas de Chatterbox. Si los conserva, después de reinstalar esta misma identidad de VoxLeaf podrá gestionarlos con Quitar Chatterbox."
LangString chatterboxDataCheckbox 1034 "Quitar datos opcionales de Chatterbox (deberá adquirirlos de nuevo para usarlo)"

UninstPage custom un.ChatterboxDataPageCreate un.ChatterboxDataPageLeave

Function un.ExactDirectoryExists
  System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
  StrCmp $R1 -1 exact_directory_absent
  IntOp $R1 $R1 & 0x10
  StrCmp $R1 0 exact_directory_absent
  StrCpy $R0 "1"
  Return
  exact_directory_absent:
    StrCpy $R0 "0"
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
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\.previous"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\7"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\6"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\5"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\3"
  Call un.ExactDirectoryExists
  StrCmp $R0 "1" optional_data_exists
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

; Only missing-file/path errors establish absence. Existing files, unsafe roots
; and failed inspection all keep the aggregate optional-data failure flag.
!macro CheckOptionalDataAbsent RELATIVE LABEL
  System::Call 'kernel32::GetFileAttributesW(w "$LOCALAPPDATA\com.voxleaf.desktop\${RELATIVE}") i .R1 ?e'
  Pop $R2
  StrCmp $R1 -1 ${LABEL}_missing ${LABEL}_retained
  ${LABEL}_missing:
    StrCmp $R2 2 ${LABEL}_checked
    StrCmp $R2 3 ${LABEL}_checked
  ${LABEL}_retained:
    StrCpy $R3 "1"
  ${LABEL}_checked:
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  StrCmp $RemoveChatterboxData "1" 0 chatterbox_data_done
  ; Promotion residue is cleanup-only. Validate every ancestor and child.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_current
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_current
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_current
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\.previous"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_current
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\.previous"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_current:
  ; cb/7: product identity, tts, cb, and the exact root must all be real dirs.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v6
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v6
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v6
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\7"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_retained_v6
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\7"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_retained_v6:
  ; cb/6: product identity, tts, cb, and the exact root must all be real dirs.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v5
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v5
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v5
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\6"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_retained_v5
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\6"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_retained_v5:
  ; cb/5: product identity, tts, cb, and the exact root must all be real dirs.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v3
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v3
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v3
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\5"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_retained_v3
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\5"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_retained_v3:
  ; cb/3: product identity, tts, cb, and the exact root must all be real dirs.
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v2
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v2
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"
  Call un.IsSafeOwnedDirectory
  StrCmp $R0 "1" 0 chatterbox_retained_v2
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\3"
  Call un.IsSafeOwnedTree
  StrCmp $R0 "1" 0 chatterbox_retained_v2
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb\3"
  RMDir "$LOCALAPPDATA\com.voxleaf.desktop\tts\cb"

  chatterbox_retained_v2:
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

  ; Report one aggregate failure while preserving independent preference cleanup.
  StrCmp $RemoveChatterboxData "1" 0 optional_cleanup_checked
  StrCpy $R3 "0"
  !insertmacro CheckOptionalDataAbsent "tts\cb\.previous" optional_previous
  !insertmacro CheckOptionalDataAbsent "tts\cb\7" optional_current
  !insertmacro CheckOptionalDataAbsent "tts\cb\6" optional_retained_v6
  !insertmacro CheckOptionalDataAbsent "tts\cb\5" optional_v5
  !insertmacro CheckOptionalDataAbsent "tts\cb\3" optional_v3
  !insertmacro CheckOptionalDataAbsent "tts\cb\2" optional_v2
  !insertmacro CheckOptionalDataAbsent "tts\cb\cache" optional_cache
  !insertmacro CheckOptionalDataAbsent "tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2" optional_profile
  !insertmacro CheckOptionalDataAbsent "tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4" optional_staging
  StrCmp $R3 "0" optional_cleanup_checked
    SetErrorLevel 1
    DetailPrint "Some Chatterbox optional data was retained because safe cleanup could not complete."
    IfSilent optional_cleanup_checked
    MessageBox MB_OK|MB_ICONEXCLAMATION "Some Chatterbox optional data could not be removed safely. Reinstall VoxLeaf to retry Remove Chatterbox after resolving the file lock, access restriction or unsafe directory."
  optional_cleanup_checked:

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
