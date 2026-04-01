import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'

const BADGE_COLOR = '#FF3B30'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuthStore()

  async function handleSignOut() {
    Alert.alert('Disconnetti', 'Vuoi davvero uscire dal tuo account?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: () => signOut() },
    ])
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Caricamento profilo...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase()

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Profilo</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{profile.display_name ?? profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.levelBadge}>
            <Ionicons name="flash" size={14} color={BADGE_COLOR} />
            <Text style={styles.levelText}>Livello {profile.level}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatBox label="Rep totali" value={profile.total_reps.toLocaleString()} />
          <StatBox label="Vittorie" value={profile.wins} />
          <StatBox label="Sconfitte" value={profile.losses} />
          <StatBox label="Streak" value={`${profile.current_streak}🔥`} />
          <StatBox label="Streak record" value={profile.best_streak} />
          <StatBox label="Win rate" value={
            profile.wins + profile.losses > 0
              ? `${Math.round((profile.wins / (profile.wins + profile.losses)) * 100)}%`
              : '—'
          } />
        </View>

        {/* Impostazioni */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impostazioni</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={20} color="#ccc" />
            <Text style={styles.menuLabel}>Modifica profilo</Text>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color="#ccc" />
            <Text style={styles.menuLabel}>Notifiche</Text>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={20} color="#ccc" />
            <Text style={styles.menuLabel}>Privacy</Text>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>FitDuel v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  signOutBtn: { padding: 4 },

  profileSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarInitial: { fontSize: 34, fontWeight: '800', color: '#fff' },
  displayName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  username: { fontSize: 14, color: '#888' },
  bio: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  levelText: { fontSize: 13, fontWeight: '600', color: '#FF3B30' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: '#666', textAlign: 'center' },

  section: { paddingHorizontal: 20, paddingTop: 28, gap: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  menuLabel: { flex: 1, color: '#fff', fontSize: 15 },

  versionRow: { alignItems: 'center', paddingVertical: 32 },
  versionText: { color: '#444', fontSize: 12 },
})
