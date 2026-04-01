import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Ionicons } from '@expo/vector-icons'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle, isLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Inserisci la tua email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email non valida'
    if (!password) e.password = 'Inserisci la password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin() {
    if (!validate()) return
    const { error } = await signInWithEmail(email.trim().toLowerCase(), password)
    if (error) {
      Alert.alert('Accesso fallito', error)
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle()
    if (error) Alert.alert('Errore Google', error)
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>FitDuel</Text>
          <Text style={styles.tagline}>Fai la tua serie. Sfida il mondo.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureToggle
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          <Button label="Accedi" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>oppure</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth */}
        <View style={styles.oauth}>
          <Button
            label="Continua con Google"
            onPress={handleGoogle}
            variant="secondary"
            icon={<Ionicons name="logo-google" size={20} color="#fff" />}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Non hai un account? </Text>
          <Link href="/(auth)/register" asChild>
            <Text style={styles.footerLink}>Registrati</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 24,
  },
  header: { alignItems: 'center', gap: 8 },
  logo: { fontSize: 40, fontWeight: '800', color: '#FF3B30', letterSpacing: -1 },
  tagline: { fontSize: 15, color: '#888', textAlign: 'center' },
  form: { gap: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#666', fontSize: 13 },
  oauth: { gap: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
})
