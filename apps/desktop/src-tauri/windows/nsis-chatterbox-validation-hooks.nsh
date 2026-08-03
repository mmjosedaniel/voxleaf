!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; This validation product deliberately has no access to the ordinary identity.
Var ChatterboxDataCheckbox
Var ChatterboxDataCheckboxState
Var RemoveChatterboxData
Var RemovePreferencesAndRecovery

LangString chatterboxValidationDataTitle ${LANG_ENGLISH} "Chatterbox data"
LangString chatterboxValidationDataSubtitle ${LANG_ENGLISH} "Choose whether to remove the optional local package before uninstalling this validation build."
LangString chatterboxValidationDataText ${LANG_ENGLISH} "Chatterbox optional data was found. Removing it reclaims about 8.23 GB. Keep it only if you will reinstall this same validation product identity and use Remove Chatterbox."
LangString chatterboxValidationDataCheckbox ${LANG_ENGLISH} "Remove Chatterbox optional data (about 8.23 GB; reacquisition is required)"
LangString chatterboxValidationDataTitle ${LANG_SPANISH} "Datos de Chatterbox"
LangString chatterboxValidationDataSubtitle ${LANG_SPANISH} "Elija si desea quitar el paquete local opcional antes de desinstalar esta compilación de validación."
LangString chatterboxValidationDataText ${LANG_SPANISH} "Se encontraron datos opcionales de Chatterbox. Al quitarlos se recuperan unos 8.23 GB. Consérvelos solo si reinstalará esta misma identidad de validación y usará Quitar Chatterbox."
LangString chatterboxValidationDataCheckbox ${LANG_SPANISH} "Quitar datos opcionales de Chatterbox (unos 8.23 GB; deberá adquirirlos de nuevo)"

UninstPage custom un.ValidationChatterboxPageCreate un.ValidationChatterboxPageLeave

Function un.ValidationSafeDirectory
  System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
  StrCmp $R1 -1 validation_unsafe
  IntOp $R2 $R1 & 0x10
  StrCmp $R2 0 validation_unsafe
  IntOp $R2 $R1 & 0x400
  StrCmp $R2 0 validation_safe
  validation_unsafe:
    StrCpy $R0 "0"
    Return
  validation_safe:
    StrCpy $R0 "1"
FunctionEnd

Function un.ValidationSafeTree
  Push $R3
  Push $R4
  Push $R5
  StrCpy $R3 $R0
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" 0 validation_tree_root_failed
  ClearErrors
  FindFirst $R4 $R5 "$R3\*.*"
  IfErrors validation_tree_root_failed
  validation_tree_loop:
    StrCmp $R5 "." validation_tree_next
    StrCmp $R5 ".." validation_tree_next
    StrCpy $R0 "$R3\$R5"
    System::Call 'kernel32::GetFileAttributesW(w R0) i .R1'
    StrCmp $R1 -1 validation_tree_close_failed
    IntOp $R2 $R1 & 0x400
    StrCmp $R2 0 0 validation_tree_close_failed
    IntOp $R2 $R1 & 0x10
    StrCmp $R2 0 validation_tree_next
    Call un.ValidationSafeTree
    StrCmp $R0 "1" 0 validation_tree_close_failed
  validation_tree_next:
    ClearErrors
    FindNext $R4 $R5
    IfErrors validation_tree_close_passed
    Goto validation_tree_loop
  validation_tree_close_failed:
    FindClose $R4
  validation_tree_root_failed:
    StrCpy $R0 "0"
    Goto validation_tree_done
  validation_tree_close_passed:
    FindClose $R4
    StrCpy $R0 "1"
  validation_tree_done:
    Pop $R5
    Pop $R4
    Pop $R3
FunctionEnd

; Validate the product root and every literal ancestor of a recursive root.
!macro ValidationRemoveExact SUFFIX ROOT ANCESTOR_ONE ANCESTOR_TWO ANCESTOR_THREE
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation"
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" 0 validation_remove_done_${SUFFIX}
  !if "${ANCESTOR_ONE}" != ""
    StrCpy $R0 "${ANCESTOR_ONE}"
    Call un.ValidationSafeDirectory
    StrCmp $R0 "1" 0 validation_remove_done_${SUFFIX}
  !endif
  !if "${ANCESTOR_TWO}" != ""
    StrCpy $R0 "${ANCESTOR_TWO}"
    Call un.ValidationSafeDirectory
    StrCmp $R0 "1" 0 validation_remove_done_${SUFFIX}
  !endif
  !if "${ANCESTOR_THREE}" != ""
    StrCpy $R0 "${ANCESTOR_THREE}"
    Call un.ValidationSafeDirectory
    StrCmp $R0 "1" 0 validation_remove_done_${SUFFIX}
  !endif
  StrCpy $R0 "${ROOT}"
  Call un.ValidationSafeTree
  StrCmp $R0 "1" 0 validation_remove_done_${SUFFIX}
  RMDir /r "${ROOT}"
  validation_remove_done_${SUFFIX}:
!macroend

Function un.ValidationChatterboxPageCreate
  IfSilent validation_page_skip
  ${GetParameters} $R0
  ClearErrors
  ${GetOptions} $R0 "/P" $R1
  IfErrors validation_page_check_update
  Goto validation_page_skip
  validation_page_check_update:
  ClearErrors
  ${GetOptions} $R0 "/UPDATE" $R1
  IfErrors validation_page_check_data
  Goto validation_page_skip
  validation_page_check_data:
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb\2"
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" validation_page_present
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2"
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" validation_page_present
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" validation_page_present
  StrCpy $R0 "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb\cache"
  Call un.ValidationSafeDirectory
  StrCmp $R0 "1" validation_page_present
  Abort
  validation_page_present:
  nsDialogs::Create 1018
  Pop $R0
  StrCmp $R0 error validation_page_skip
  !insertmacro MUI_HEADER_TEXT "$(chatterboxValidationDataTitle)" "$(chatterboxValidationDataSubtitle)"
  ${NSD_CreateLabel} 0 0 100% 34u "$(chatterboxValidationDataText)"
  Pop $R0
  ${NSD_CreateCheckbox} 0 42u 100% 18u "$(chatterboxValidationDataCheckbox)"
  Pop $ChatterboxDataCheckbox
  StrCmp $ChatterboxDataCheckboxState "" 0 validation_page_restore_state
    StrCpy $ChatterboxDataCheckboxState "1"
  validation_page_restore_state:
  StrCmp $ChatterboxDataCheckboxState "1" 0 +2
    ${NSD_Check} $ChatterboxDataCheckbox
  nsDialogs::Show
  Return
  validation_page_skip:
    Abort
FunctionEnd

Function un.ValidationChatterboxPageLeave
  StrCmp $ChatterboxDataCheckbox "" validation_page_leave_done
  ${NSD_GetState} $ChatterboxDataCheckbox $ChatterboxDataCheckboxState
  validation_page_leave_done:
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
  StrCpy $R1 ""
  ${GetOptions} $R0 "/UPDATE" $R1
  IfErrors validation_uninstall_data_mode_selected
    StrCpy $RemoveChatterboxData "0"
    StrCpy $RemovePreferencesAndRecovery "0"
    Goto validation_suppress_broad_cleanup
  validation_uninstall_data_mode_selected:
  IfSilent validation_suppress_broad_cleanup
  StrCmp $RemovePreferencesAndRecovery "1" +2
    StrCpy $RemovePreferencesAndRecovery $DeleteAppDataCheckboxState
  StrCmp $RemoveChatterboxData "1" +2
    StrCpy $RemoveChatterboxData $ChatterboxDataCheckboxState
  validation_suppress_broad_cleanup:
  StrCpy $DeleteAppDataCheckboxState "0"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  StrCmp $RemoveChatterboxData "1" 0 validation_optional_done
  !insertmacro ValidationRemoveExact cb "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb\2" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb" ""
  !insertmacro ValidationRemoveExact legacy "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4\2" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\profiles" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\profiles\chatterbox-multilingual-v3-cuda-bf16-default-v4"
  !insertmacro ValidationRemoveExact staging "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\staging\chatterbox-multilingual-v3-cuda-bf16-default-v4" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\staging" ""
  !insertmacro ValidationRemoveExact cache "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb\cache" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\tts\cb" ""
  validation_optional_done:
  StrCmp $RemovePreferencesAndRecovery "1" 0 validation_preferences_done
  !insertmacro ValidationRemoveExact preferences "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\EBWebView\Default\Local Storage" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\EBWebView" "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation\EBWebView\Default" ""
  validation_preferences_done:
!macroend
