import { useState } from 'react'
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type InputProps = TextInputProps & {
  label?: string
  error?: string
  secureToggle?: boolean
}

export function Input({ label, error, secureToggle, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.containerError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#555"
          selectionColor="#FF3B30"
          secureTextEntry={secureToggle && !showPassword}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eye}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: '#ccc', fontSize: 13, fontWeight: '500' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 52,
  },
  containerError: { borderColor: '#FF3B30' },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  eye: { padding: 4 },
  error: { color: '#FF3B30', fontSize: 12 },
})
