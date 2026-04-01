// Placeholder Sprint 3-4 — Setup MediaPipe Pose
// In Sprint 3-4 si integrerà @mediapipe/tasks-vision o react-native-mediapipe

export const MEDIAPIPE_CONFIG = {
  modelPath: 'pose_landmarker_lite.task',
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  outputSegmentationMasks: false,
}
