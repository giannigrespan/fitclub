import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useFeedStore } from '../../stores/feedStore'
import { useAuthStore } from '../../stores/authStore'
import { Performance } from '../../lib/supabase'

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push-up',
  squat: 'Squat',
  situp: 'Sit-up',
  jumpingjack: 'Jumping Jack',
  burpee: 'Burpee',
}

function PerformanceCard({ item }: { item: Performance }) {
  const minutes = Math.floor(item.duration_seconds / 60)
  const seconds = item.duration_seconds % 60
  const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.exerciseBadge}>
          <Text style={styles.exerciseLabel}>{EXERCISE_LABELS[item.exercise_type] ?? item.exercise_type}</Text>
        </View>
        <Text style={styles.cardTime}>{new Date(item.created_at).toLocaleDateString('it-IT')}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.repCounter}>
          <Text style={styles.repValue}>{item.reps}</Text>
          <Text style={styles.repLabel}>rep</Text>
        </View>
        <View style={styles.cardStats}>
          <Text style={styles.statItem}><Ionicons name="time-outline" size={13} color="#666" /> {duration}</Text>
          {item.avg_quality != null && (
            <Text style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#666" />
              {' '}{Math.round(item.avg_quality * 100)}% qualità
            </Text>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="heart-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="share-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function FeedScreen() {
  const { items, isLoading, fetchFeed } = useFeedStore()
  const { profile } = useAuthStore()

  useEffect(() => {
    fetchFeed(true)
  }, [])

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.logo}>FitDuel</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <PerformanceCard item={item} />}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchFeed(true)}
            tintColor="#FF3B30"
          />
        }
        onEndReached={() => fetchFeed()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="fitness-outline" size={56} color="#333" />
              <Text style={styles.emptyTitle}>Nessuna performance ancora</Text>
              <Text style={styles.emptySubtitle}>
                Inizia ad allenarti e sfida i tuoi amici!
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: { fontSize: 22, fontWeight: '800', color: '#FF3B30', letterSpacing: -0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 32 },

  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseLabel: { color: '#FF3B30', fontSize: 12, fontWeight: '600' },
  cardTime: { color: '#555', fontSize: 12 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  repCounter: { alignItems: 'center' },
  repValue: { fontSize: 42, fontWeight: '800', color: '#fff', lineHeight: 46 },
  repLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  cardStats: { gap: 4 },
  statItem: { color: '#888', fontSize: 13 },
  cardActions: { flexDirection: 'row', gap: 4, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 10 },
  action: { padding: 6 },
})
