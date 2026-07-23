import type { ChangeEvent, ReactElement } from "react";

import type {
  ReaderPreferenceName,
  ReaderPreferencesV1,
} from "./reader-preferences";

interface ReaderPreferenceOption {
  readonly label: string;
  readonly value: string;
}

const TEXT_SCALE_OPTIONS: readonly ReaderPreferenceOption[] = Object.freeze([
  Object.freeze({ value: "small", label: "Small" }),
  Object.freeze({ value: "standard", label: "Standard" }),
  Object.freeze({ value: "large", label: "Large" }),
  Object.freeze({ value: "extra-large", label: "Extra large" }),
]);
const LINE_SPACING_OPTIONS: readonly ReaderPreferenceOption[] = Object.freeze([
  Object.freeze({ value: "compact", label: "Compact" }),
  Object.freeze({ value: "comfortable", label: "Comfortable" }),
  Object.freeze({ value: "spacious", label: "Spacious" }),
]);
const CONTENT_WIDTH_OPTIONS: readonly ReaderPreferenceOption[] = Object.freeze([
  Object.freeze({ value: "narrow", label: "Narrow" }),
  Object.freeze({ value: "standard", label: "Standard" }),
  Object.freeze({ value: "wide", label: "Wide" }),
]);
const THEME_OPTIONS: readonly ReaderPreferenceOption[] = Object.freeze([
  Object.freeze({ value: "system", label: "Use system theme" }),
  Object.freeze({ value: "light", label: "Light" }),
  Object.freeze({ value: "dark", label: "Dark" }),
]);

export interface ReaderPreferencesControlsProps {
  readonly preferences: ReaderPreferencesV1;
  readonly onChange: (preference: ReaderPreferenceName, value: string) => void;
}

interface PreferenceSelectProps {
  readonly label: string;
  readonly name: ReaderPreferenceName;
  readonly options: readonly ReaderPreferenceOption[];
  readonly value: string;
  readonly onChange: (preference: ReaderPreferenceName, value: string) => void;
}

function PreferenceSelect({
  label,
  name,
  options,
  value,
  onChange,
}: PreferenceSelectProps): ReactElement {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    onChange(name, event.currentTarget.value);
  };

  return (
    <label className="reader-preference">
      <span>{label}</span>
      <select name={name} value={value} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ReaderPreferencesControls({
  preferences,
  onChange,
}: ReaderPreferencesControlsProps): ReactElement {
  return (
    <fieldset className="reader-preferences">
      <legend>Reader appearance</legend>
      <p>
        Adjust the current continuous-scrolling view. These settings stay in
        memory for now.
      </p>
      <div className="reader-preference-grid">
        <PreferenceSelect
          label="Text size"
          name="textScale"
          options={TEXT_SCALE_OPTIONS}
          value={preferences.textScale}
          onChange={onChange}
        />
        <PreferenceSelect
          label="Line spacing"
          name="lineSpacing"
          options={LINE_SPACING_OPTIONS}
          value={preferences.lineSpacing}
          onChange={onChange}
        />
        <PreferenceSelect
          label="Content width"
          name="contentWidth"
          options={CONTENT_WIDTH_OPTIONS}
          value={preferences.contentWidth}
          onChange={onChange}
        />
        <PreferenceSelect
          label="Theme"
          name="theme"
          options={THEME_OPTIONS}
          value={preferences.theme}
          onChange={onChange}
        />
      </div>
    </fieldset>
  );
}
