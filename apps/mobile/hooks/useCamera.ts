import { useRef, useState } from 'react'

// Placeholder per Sprint 3-4 — integrazione Expo Camera + MediaPipe
export function useCamera() {
  const cameraRef = useRef(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isReady, setIsReady] = useState(false)

  async function requestPermission() {
    // TODO Sprint 3-4: expo-camera requestCameraPermissionsAsync()
    setHasPermission(false)
  }

  return {
    cameraRef,
    hasPermission,
    isReady,
    setIsReady,
    requestPermission,
  }
}
