import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

import { radius, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  maxLength?: number;
  icon?: IconName;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  counter?: { value: number; max: number };
  right?: React.ReactNode;
  onFocusChange?: (focused: boolean) => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  icon,
  secure,
  maxLength,
  multiline,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  counter,
  right,
  onFocusChange,
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.accent : focused ? colors.ink : colors.paper3;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="label" color="ink3">
          {label.toUpperCase()}
        </AppText>
        {counter ? (
          <AppText variant="meta" color="ink3">
            {counter.value} / {counter.max}
          </AppText>
        ) : null}
      </View>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: focused ? colors.paper : colors.paper2,
            borderColor,
            borderWidth: focused || error ? 2 : 1.4,
            borderRadius: radius.input,
            minHeight: multiline ? 118 : 50,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {icon ? (
          <View style={styles.iconSlot}>
            <Icon name={icon} size={20} color={focused ? colors.ink : colors.ink3} strokeWidth={1.9} />
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ink3}
          secureTextEntry={secure}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={() => {
            setFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setFocused(false);
            onFocusChange?.(false);
          }}
          selectionColor={colors.ink}
          cursorColor={colors.ink}
          style={[
            styles.input,
            { color: colors.ink },
            multiline ? styles.multiline : null,
          ]}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {right ? <View style={styles.rightSlot}>{right}</View> : null}
      </View>
      {error ? (
        <AppText variant="bodySmall" color="accent" style={styles.message}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="bodySmall" color="ink3" style={styles.message}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  inputWrap: { flexDirection: 'row', paddingHorizontal: 0, overflow: 'hidden' },
  iconSlot: { width: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  input: {
    flex: 1,
    ...typeScale.body,
    fontSize: 14.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiline: { minHeight: 100, paddingTop: 14, lineHeight: 21 },
  rightSlot: { paddingRight: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  message: { paddingHorizontal: 2 },
});
