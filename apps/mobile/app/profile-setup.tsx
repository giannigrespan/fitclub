import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Ionicons } from '@expo/vector-icons'

const AVATAR_COLORS = ['#FF3B30', '#FF9500', '#34C759', '#007AFF', '#AF52DE', '#FF2D55']

export default function ProfileSetupScreen() {
  const router = useRouter()
  const { user, updateProfile, refreshProfile } = useAuthStore()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; displayName?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!username.trim()) {
      e.username = 'Scegli un username'
    } else if (username.length < 3) {
      e.username = 'Minimo 3 caratteri'
    } else if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      e.username = 'Solo lettere, numeri e _'
    }
    if (!displayName.trim()) e.displayName = 'Inserisci il tuo nome'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate() || !user) return
    setIsLoading(true)

    // Controlla unicità username
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .neq('id', user.id)
      .maybeSingle()

    if (existing) {
      setErrors((e) => ({ ...e, username: 'Username già in uso' }))
      setIsLoading(false)
      return
    }

    // Crea il profilo (upsert perché il trigger Supabase potrebbe averlo già creato)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: username.toLowerCase().trim(),
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      avatar_url: null, // placeholder colore generativo
      is_public: true,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      Alert.alert('Errore', error.message)
    } else {
      await refreshProfile()
      router.replace('/(tabs)/')
    }

    setIsLoading(false)
  }

  const initials = (displayName || username || '?').charAt(0).toUpperCase()

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
        <View style={styles.header}>
          <Text style={styles.title}>Crea il tuo profilo</Text>
          <Text style={styles.subtitle}>Come vuoi farti chiamare?</Text>
        </View>

        {/* Avatar generativo con colore */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: selectedColor }]}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
          <View style={styles.colorPicker}>
            {AVATAR_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="es. matteo_powerlifter"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase())}
            error={errors.username}
          />
          <Input
            label="Nome visualizzato"
            placeholder="Il tuo nome"
            value={displayName}
            onChangeText={setDisplayName}
            error={errors.displayName}
          />
          <Input
            label="Bio (opzionale)"
            placeholder="Raccontati in poche parole..."
            multiline
            numberOfLines={3}
            value={bio}
            onChangeText={setBio}
            style={{ height: 80, paddingTop: 8, textAlignVertical: 'top' }}
          />
        </View>

        <Button label="Inizia a sfidare" onPress={handleSave} loading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 56,
    gap: 28,
  },
  header: { gap: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 15, color: '#888' },
  avatarSection: { alignItems: 'center', gap: 16 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: '#fff' },
  colorPicker: { flexDirection: 'row', gap: 10 },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  form: { gap: 16 },
})
