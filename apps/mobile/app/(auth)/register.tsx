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
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Ionicons } from '@expo/vector-icons'

WebBrowser.maybeCompleteAuthSession()

export default function RegisterScreen() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle, isLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Inserisci la tua email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email non valida'
    if (!password) e.password = 'Inserisci una password'
    else if (password.length < 8) e.password = 'Minimo 8 caratteri'
    if (!confirmPassword) e.confirm = 'Conferma la password'
    else if (password !== confirmPassword) e.confirm = 'Le password non coincidono'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleRegister() {
    if (!validate()) return
    const { error } = await signUpWithEmail(email.trim().toLowerCase(), password)
    if (error) {
      Alert.alert('Registrazione fallita', error)
    } else {
      Alert.alert(
        'Verifica email',
        'Abbiamo inviato un link di conferma alla tua email. Controlla la casella di posta.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
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
          <Text style={styles.tagline}>Crea il tuo account e inizia a sfidare.</Text>
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
            placeholder="Min. 8 caratteri"
            secureToggle
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <Input
            label="Conferma password"
            placeholder="Ripeti la password"
            secureToggle
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirm}
          />

          <Button label="Crea account" onPress={handleRegister} loading={isLoading} />
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
            label="Registrati con Google"
            onPress={handleGoogle}
            variant="secondary"
            icon={<Ionicons name="logo-google" size={20} color="#fff" />}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={styles.footerLink}>Accedi</Text>
          </Link>
        </View>

        <Text style={styles.terms}>
          Registrandoti accetti i{' '}
          <Text style={styles.termsLink}>Termini di Servizio</Text> e la{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  footerLink: { color: '#FF3B30', fontSize: 14, fontWeight: '600' },
  terms: { color: '#555', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: '#888', textDecorationLine: 'underline' },
})
