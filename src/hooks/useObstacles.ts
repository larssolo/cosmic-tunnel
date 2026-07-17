
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";
import { getLevelByScore } from "@/config/levels";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback((spawnRateMultiplier: number = 1, existingObstacles: Obstacle[] = []) => {
    const now = Date.now();

    const baseInterval = 1300; // tightened: vertical dodging made the game easier
    const minInterval = 380; // raised — prevents wall of meteors even during storm
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 6, minInterval) / spawnRateMultiplier;

    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      const level = getLevelByScore(scoreRef.current!).level;

      // PATTERN DIRECTOR — once the run is warmed up, occasionally swap the single
      // meteor for a formation so the sky stops feeling like a metronome
      if (scoreRef.current! > 800 && Math.random() < 0.16) {
        // Formations are denser than singles, so push the next spawn out a bit
        lastObstacleTimeRef.current = now + obstacleInterval * 0.7;
        const roll = Math.random();

        if (roll < 0.35) {
          // V-FORMATION — tight wedge diving straight down
          const cx = 20 + Math.random() * 60;
          return [
            { id: now,     x: cx,      y: -4,  size: 7 + Math.random() * 2, seed: Math.random() },
            { id: now + 1, x: cx - 13, y: -13, size: 6 + Math.random() * 2, seed: Math.random() },
            { id: now + 2, x: cx + 13, y: -13, size: 6 + Math.random() * 2, seed: Math.random() },
          ] as Obstacle[];
        }

        if (roll < 0.65) {
          // WALL WITH A GAP — five slots, one missing; thread the needle
          const slots = [15, 32.5, 50, 67.5, 85];
          const gap = Math.floor(Math.random() * slots.length);
          return slots
            .filter((_, i) => i !== gap)
            .map((sx, i) => ({
              id: now + i,
              x: sx + (Math.random() - 0.5) * 4,
              y: -6,
              size: 6 + Math.random() * 1.5,
              seed: Math.random(),
            })) as Obstacle[];
        }

        // SIDE VOLLEY — staggered column drifting hard from one flank
        const fromLeft = Math.random() < 0.5;
        const vxDir = (fromLeft ? 1 : -1) * (0.18 + Math.random() * 0.1);
        const baseX = fromLeft ? 12 : 88;
        return [0, 1, 2].map(i => ({
          id: now + i,
          x: baseX + (fromLeft ? -1 : 1) * i * 6,
          y: -5 - i * 9,
          size: 6 + Math.random() * 2,
          seed: Math.random(),
          vx: vxDir,
        })) as Obstacle[];
      }

      const size = Math.random() * 10 + 5;

      // Pick an x that doesn't overlap with meteors near the top of the screen
      const topObstacles = existingObstacles.filter(o => o.y < 15 && !o.isExploding);
      let x = Math.random() * 80 + 10;
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = Math.random() * 80 + 10;
        const tooClose = topObstacles.some(o => Math.abs(o.x - candidate) < (o.size / 2 + size / 2 + 4));
        if (!tooClose) { x = candidate; break; }
      }

      lastObstacleTimeRef.current = now;
      const vx = level >= 3 && Math.random() < 0.25
        ? (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.10)
        : undefined;
      return { id: now, x, y: -5, size, seed: Math.random(), vx } as Obstacle;
    }

    return null;
  }, [scoreRef]);

  const updateObstacles = useCallback((obstacles: Obstacle[], slowMotionMultiplier: number = 1.0) => {
    const now = Date.now();
    return obstacles
      .map(obstacle => {
        // Comet edge-warning phase: hold it offscreen so the ⚠ chevron can telegraph the entry
        if (obstacle.warnUntil && now < obstacle.warnUntil) return obstacle;
        // Calculate the speed factor based on the game's current score
        // Start even slower and gradually increase speed
        const baseSpeed = 0.3; // Start with a slower base speed
        const speedFactor = Math.min(1 + (scoreRef.current! / 3000), 2.5); // More gradual increase, lower max
        
        // If the obstacle is exploding, move it faster
        if (obstacle.isExploding) {
          // Remove if it's far below the screen
          const explodingNewX = obstacle.x + (obstacle.vx ?? 0) * slowMotionMultiplier;
          if (obstacle.y > 110 || explodingNewX < -10 || explodingNewX > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current! * 1.5 * speedFactor * slowMotionMultiplier, x: explodingNewX };
        }

        // Remove once off the bottom of the screen
        const fallMult = obstacle.kind === 'comet' ? 2.5 : 1;
        const newY = obstacle.y + (baseSpeed + speedRef.current! * speedFactor) * fallMult * slowMotionMultiplier;
        const newX = obstacle.x + (obstacle.vx ?? 0) * slowMotionMultiplier;
        if (newY > 105 || newX < -10 || newX > 110) return null;
        return { ...obstacle, y: newY, x: newX };
      })
      // Filter out null values (removed obstacles)
      .filter(Boolean) as Obstacle[];
  }, [scoreRef, speedRef]);

  const resetObstacleTimer = useCallback(() => {
    lastObstacleTimeRef.current = Date.now();
  }, []);

  return {
    createObstacle,
    updateObstacles,
    resetObstacleTimer
  };
}
