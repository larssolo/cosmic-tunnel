
import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp';

export const useSound = () => {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    shoot: null,
    explosion: null,
    gameOver: null,
    start: null,
    speedUp: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound
    audioRefs.current.shoot = new Audio('data:audio/wav;base64,UklGRoADAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVwDAACA/4D/gP+A/4X/hv+H/4D/e/94/3z/hf+T/6D/qP+c/4T/af9W/1f/aP+I/7H/4f8NAB4ACgDa/5L/SP8y/z//h/+7/woASAB+AHoAUgAEAI//Qf8X/wn/GP9W/6v//v9hAKYAtwCHAC0AtP9D/+3+x/7X/vr+Xf/c/10AuQDgALoARwDE/1D/3/6l/o3+nf7h/kr/xv8/ALsA4wDGAG4ABwCn/0D/5v6q/pX+q/79/m3/2/87AJkAvQClAFQA6P9//yP/0/6a/oz+pf7g/iP/gf/m/0MAhQCOAHUAOgD1/5r/Qv/w/qr+l/6n/tj+Gf9g/7T/BgBLAGgAgABnADkA+P+l/0z/+/6z/qP+s/7n/ir/d//T/ycAgQCnAJsAcwA9APn/rP9T//z+t/6p/r/++P46/4r/4f89AJgAwQCzAIUASAD6/6f/Sf/u/qr+of67/v3+RP+X/+z/RgChAMsAvwCHAD0A7v+Z/z7/5v6l/qL+wP4F/07/pP/7/1YAqQDRAMQAjAA9AO3/lv87/+T+o/6j/sP+DP9Y/6//DQBmALYA2QDJAJAAOwDp/5H/N//e/qD+pP7I/hL/X/+3/xYAbwDBAOAA0gCSADcA4v+J/y//2f6e/qX+y/4X/2j/wf8gAHkAywDoANcAkwA0AN//gf8n/9T+nP6n/s/+HP9w/8j/KACCANQAzAE7ym4AwQCaAC0A2/98/yL/z/6b/qr+1f4k/3z/1f81AIwA2gD9AOYAnAAwANb/df8c/8r+mv6s/tv+Kv+E/97/PgCVAOMA/wDpAJ0AKwDR/3D/Fv/H/pz+sP7j/jL/i//n/0cAngDsAAEB7gCdACgAzf9s/xL/w/6a/rL+5v43/5D/7f9LAKEAAgHgAA==');
    audioRefs.current.explosion = new Audio('data:audio/wav;base64,UklGRqQIAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYAIAACkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSsq6yrq6uqqqqpqamoqKinp6empqakpKSjpKSkpKSkpKSkpKSkpKSkpKSjpKOkoqOioqGhoaChoKCfn5+enp+fn5+fn5+goKGhoqKio6OipKWlpaanp6ipqaqrrKytrq6vsLGxsrKztLS1tra3uLi5urq7vLy9vr/Av8DAwMDAwcHBwcDAwL+/vr69vby7ury7u7q5ubi3trW0s7KysLCvrq2sq6qqqaemoL+6trOxr62rqainpqakpKSjo6OioqGhoKCfn5+enp2dnJybm5uam5qbm5ydnp+goKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eHi4+Tl5ufo6enq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6erp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAAP/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAv6usq6yrq6qqqampqKmpqKinp6eoqKioqaipqausrKytrq6vr7CxsbKys7S0tba2t7i4uLm6uru7vLy9vb2+vr6/v7+/v7+/v7++vr69vby7u7q5ubm4t7a2tbW0s7OysrGwsK+urq2sq6uqqamoqKenpqalpKSjo6KioaCgn5+enp2dnJycm5ubmpqam5ubm5ycnZ2enp+foKChoqKjpKSlpaanp6ipqaqrq6ysra6urq+wsbGys7O0tba2t7i4ubi5uru7vLy9vr6+v8DBwcLCw8TFxcbHx8jJysvLzM3Nzs/P0NHS0tPU1dbW19jY2drb29zd3d7f3+Dh4eLj4+Tl5ubn6Ojp6uvr7O3t7u/w8PHy8vP09fb29/j4+fr7+/z9/v4AAQICAwQEBQYHCAgJCgsMDA0ODxARERITFBUVFhcYGRoaGxwdHh8fICEiIyQkJSYnKCkpKissLS4uLzAxMjIzNDU2Nzg4OTo7PD0+Pj9AQUJCQsHCw8TFxsfIycrLzM3Oz9DR0tPU1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6enq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKSkpKSkpKSkpKSkpA==');
    audioRefs.current.gameOver = new Audio('data:audio/wav;base64,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');
    
    // New sounds
    audioRefs.current.start = new Audio('data:audio/wav;base64,UklGRqQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYAEAACBgYKBgoGDgoOChIKEg4WDhYSGhIaFh4WHhoiGiIeJh4mIiomKiYuJi4qMioyLjYuNjI6Mjo2PjY+OkI6QjpGPkZCSkJKRk5GTkpSSlJOVk5WUlpSWlZeVl5aYlpiXmZeZmJqYmpmbmZuam5qcm5ybnZudnJ6cn52fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=');
    audioRefs.current.speedUp = new Audio('data:audio/wav;base64,UklGRpQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXADAAAAgICAgICAfn59fXx8e3t6enl5eHh3d3Z2dXV0dHNzc3JycXFwcG9vbm5tbWxsaGhiYl1dWVlVVVJST09MTElJRkZDQz8/PDw5OTY2MzMwMCUlEBDt7bm5kJBoaEBAICAQEAAAAODgwMCgoICAYGBAQICAwMCAgEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQECAgMDBAPCQkVFRwcHh4gICIiJCQmJigoKioqKisrLCwsLC0tLS0uLi4uLi4uLi8vLy8vLy8vLy8vLy8vb29vb29vb29vb2+vr6+vr6+vr6+vr6+vr6+vr+/v7+/v7+/v7+/v7+/v7+/v8DAwMDAwMDAwMDAwMDAwMDAwMDAwMDBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsPDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXFxcXGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLzMzMzMzMzMzMzA==');

    // Clean up function to release audio resources
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio) {
      // Reset and play
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.log(`Error playing ${type} sound:`, err);
      });
    }
  }, []);

  return { playSound };
};
