import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
})

function AuthGuard() {
  const { session, isInitialized, profile } = useAuthStore()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      // Non autenticato: manda al login
      router.replace('/(auth)/login')
    } else if (session && !profile && !inAuthGroup) {
      // Autenticato ma profilo non ancora creato
      router.replace('/profile-setup')
    } else if (session && profile && inAuthGroup) {
      // Autenticato con profilo: vai ai tab
      router.replace('/(tabs)/')
    }
  }, [session, isInitialized, profile, segments])

  return null
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile-setup" />
      </Stack>
    </QueryClientProvider>
  )
}
