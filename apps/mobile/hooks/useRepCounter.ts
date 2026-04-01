import { useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { ExerciseType } from '../lib/supabase'
import { EXERCISE_CONFIGS, calculateAngle } from '../lib/ai/exercises'

type Keypoint = {
  x: number
  y: number
  visibility: number
}

/**
 * Hook che riceve i keypoints MediaPipe per ogni frame
 * e aggiorna lo stato della sessione (rep counter).
 * Usato da CameraScreen quando AI Vision sarà integrata.
 */
export function useRepCounter(exerciseType: ExerciseType) {
  const { repState, updateRepState, incrementRep } = useSessionStore()
  const stateRef = useRef(repState)
  stateRef.current = repState

  const processFrame = useCallback(
    (keypoints: Keypoint[]) => {
      const config = EXERCISE_CONFIGS[exerciseType]
      if (!config) return

      const jA = keypoints[config.jointA]
      const jB = keypoints[config.jointB]
      const jC = keypoints[config.jointC]

      if (
        !jA || !jB || !jC ||
        jA.visibility < config.minVisibility ||
        jB.visibility < config.minVisibility ||
        jC.visibility < config.minVisibility
      ) {
        return
      }

      const angle = calculateAngle(jA, jB, jC)
      const current = stateRef.current

      if (angle < config.downThreshold && current === 'UP') {
        updateRepState('DOWN')
      } else if (angle > config.upThreshold && current === 'DOWN') {
        incrementRep()
      } else if (current === 'IDLE' && angle > config.upThreshold) {
        updateRepState('UP')
      }
    },
    [exerciseType, updateRepState, incrementRep]
  )

  return { processFrame }
}
