import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#FF3B30'} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, styles[`${variant}Text`], textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: 10 },

  primary: { backgroundColor: '#FF3B30' },
  secondary: { backgroundColor: '#1C1C1E' },
  outline: { borderWidth: 1, borderColor: '#FF3B30', backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },

  disabled: { opacity: 0.4 },

  label: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#fff' },
  secondaryText: { color: '#fff' },
  outlineText: { color: '#FF3B30' },
  ghostText: { color: '#999' },
})
