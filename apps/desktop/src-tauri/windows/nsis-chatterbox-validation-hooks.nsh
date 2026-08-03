!include "FileFunc.nsh"

; This local-only validation package has a distinct identifier and data root.
; Silent uninstall preserves its data. Interactive uninstall can remove only
; the validation build's preferences, staging data, and optional profile.
!macro NSIS_HOOK_PREUNINSTALL
  StrCpy $R9 "0"
  ${GetParameters} $R0
  ${GetOptions} $R0 "/REMOVE_APP_DATA=" $R1
  StrCmp $R1 "1" remove_application_data
  IfSilent preserve_application_data
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Also remove VoxLeaf Chatterbox Validation preferences, staging data, and optional profiles? Your EPUB files are never removed." \
    IDYES remove_application_data IDNO preserve_application_data

  remove_application_data:
    StrCpy $R9 "1"
  preserve_application_data:
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  StrCmp $R9 "1" 0 application_data_done
  RMDir /r "$LOCALAPPDATA\com.voxleaf.desktop.chatterbox-validation"
  application_data_done:
!macroend
