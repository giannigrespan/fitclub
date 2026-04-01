import { ExerciseType } from '../../supabase'
export { calculateAngle } from '../poseDetector'

// Indici MediaPipe Pose (33 keypoints)
export const PoseLandmark = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const

export type ExerciseConfig = {
  jointA: number
  jointB: number // vertice dell'angolo
  jointC: number
  downThreshold: number
  upThreshold: number
  minVisibility: number
  label: string
  instruction: string
}

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  pushup: {
    jointA: PoseLandmark.LEFT_SHOULDER,
    jointB: PoseLandmark.LEFT_ELBOW,
    jointC: PoseLandmark.LEFT_WRIST,
    downThreshold: 90,
    upThreshold: 160,
    minVisibility: 0.6,
    label: 'Push-up',
    instruction: 'Posizionati di fianco alla camera',
  },
  squat: {
    jointA: PoseLandmark.LEFT_HIP,
    jointB: PoseLandmark.LEFT_KNEE,
    jointC: PoseLandmark.LEFT_ANKLE,
    downThreshold: 100,
    upThreshold: 165,
    minVisibility: 0.6,
    label: 'Squat',
    instruction: 'Tieni la camera di fronte a te',
  },
  situp: {
    jointA: PoseLandmark.LEFT_SHOULDER,
    jointB: PoseLandmark.LEFT_HIP,
    jointC: PoseLandmark.LEFT_KNEE,
    downThreshold: 50,
    upThreshold: 120,
    minVisibility: 0.5,
    label: 'Sit-up',
    instruction: 'Posiziona la camera lateralmente',
  },
  jumpingjack: {
    jointA: PoseLandmark.LEFT_HIP,
    jointB: PoseLandmark.LEFT_SHOULDER,
    jointC: PoseLandmark.LEFT_WRIST,
    downThreshold: 20,
    upThreshold: 150,
    minVisibility: 0.6,
    label: 'Jumping Jack',
    instruction: 'Tieni la camera di fronte a te, corpo intero visibile',
  },
  burpee: {
    // Burpee è multi-fase, qui usiamo l'angolo ginocchio come proxy per il salto
    jointA: PoseLandmark.LEFT_HIP,
    jointB: PoseLandmark.LEFT_KNEE,
    jointC: PoseLandmark.LEFT_ANKLE,
    downThreshold: 90,
    upThreshold: 160,
    minVisibility: 0.5,
    label: 'Burpee',
    instruction: 'Posiziona la camera lateralmente, corpo intero visibile',
  },
}
