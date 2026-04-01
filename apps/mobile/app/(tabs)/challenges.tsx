import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// Placeholder Sprint 1-2 — Implementazione Sfide in Sprint 5-6
export default function ChallengesScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Sfide</Text>
          <TouchableOpacity style={styles.newBtn}>
            <Ionicons name="add" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Tabs placeholder */}
        <View style={styles.tabs}>
          {['1vs1', 'Classifica', 'Challenge'].map((tab, i) => (
            <TouchableOpacity key={tab} style={[styles.tab, i === 0 && styles.tabActive]}>
              <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={56} color="#333" />
          <Text style={styles.emptyTitle}>Nessuna sfida attiva</Text>
          <Text style={styles.emptySubtext}>
            Le sfide 1vs1 e le classifiche arrivano in Sprint 5-6
          </Text>
          <TouchableOpacity style={styles.duelCta} disabled>
            <Text style={styles.duelCtaText}>Sfida un amico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  newBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  tabActive: { backgroundColor: '#FF3B30' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptySubtext: { color: '#666', textAlign: 'center', fontSize: 14, lineHeight: 20 },
  duelCta: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    opacity: 0.4,
  },
  duelCtaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
