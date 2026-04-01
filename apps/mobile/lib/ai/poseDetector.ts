// Placeholder Sprint 3-4 — Integrazione MediaPipe Pose
// Questo file sarà popolato in Sprint 3-4 con il setup MediaPipe

export type PoseKeypoint = {
  x: number
  y: number
  z?: number
  visibility: number
}

export type PoseResult = {
  keypoints: PoseKeypoint[]
  timestamp: number
}

/**
 * Calcola l'angolo in gradi tra tre punti (A-B-C, con B come vertice).
 * Implementazione fedele al PRD §8.
 */
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180) / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}
