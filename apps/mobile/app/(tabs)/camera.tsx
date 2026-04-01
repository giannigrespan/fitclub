import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// Placeholder Sprint 1-2 — Implementazione AI Vision in Sprint 3-4
export default function CameraScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Allena</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.previewPlaceholder}>
          <Ionicons name="camera-outline" size={64} color="#333" />
          <Text style={styles.previewText}>Camera AI Vision</Text>
          <Text style={styles.previewSubtext}>Disponibile in Sprint 3-4</Text>
        </View>

        <View style={styles.exerciseRow}>
          {['pushup', 'squat', 'situp', 'jumpingjack', 'burpee'].map((ex) => (
            <TouchableOpacity key={ex} style={styles.exerciseChip}>
              <Text style={styles.exerciseChipText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} disabled>
          <Ionicons name="play" size={28} color="#fff" />
          <Text style={styles.startText}>Inizia sessione</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20, gap: 20, paddingTop: 16 },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderStyle: 'dashed',
    gap: 8,
  },
  previewText: { color: '#555', fontSize: 16, fontWeight: '600' },
  previewSubtext: { color: '#444', fontSize: 13 },
  exerciseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exerciseChip: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exerciseChipText: { color: '#888', fontSize: 13 },
  startButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    opacity: 0.5,
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: '700' },
})
