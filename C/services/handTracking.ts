import { HandData } from '../types';
// Import the entire module as a namespace to handle variable export structures (Default vs Named) on CDNs
// @ts-ignore
import * as mpHands from '@mediapipe/hands';

// Resolve the Hands class from the imported module
// esm.sh or other CDNs often bundle CJS modules as a default export
const HandsClass = (mpHands as any).Hands || (mpHands as any).default?.Hands || (window as any).Hands;

// Define local interfaces since we can't reliably import types if the named export fails at runtime
interface MediaPipeResults {
  multiHandLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
  image: any;
}

export class HandTrackingService {
  private hands: any | null = null; // Use any to avoid type import issues
  private videoElement: HTMLVideoElement | null = null;
  private onResultsCallback: (data: HandData) => void;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  constructor(onResults: (data: HandData) => void) {
    this.onResultsCallback = onResults;
  }

  public async initialize(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;

    if (!HandsClass) {
      console.error("MediaPipe Hands class failed to load. Please check your internet connection or CDN configuration.");
      return;
    }

    // Initialize MediaPipe Hands
    this.hands = new HandsClass({
      locateFile: (file: string) => {
        return `/mediapipe/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults(this.processResults.bind(this));

    // Initialize Camera manually using getUserMedia
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false,
      });

      this.videoElement.srcObject = this.stream;
      
      // Ensure video plays (critical for mobile)
      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play().then(() => resolve()).catch(e => console.error("Play error", e));
        };
      });

      this.startLoop();

    } catch (error) {
      console.error("Camera initialization failed:", error);
    }
  }

  private startLoop() {
    const loop = async () => {
      // Check if component is still mounted/active
      if (this.hands && this.videoElement && this.videoElement.readyState >= 2) {
        await this.hands.send({ image: this.videoElement });
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private processResults(results: MediaPipeResults) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Calculate "Openness"
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      
      const thumbDist = getDist(wrist, thumbTip);
      const indexDist = getDist(wrist, indexTip);
      const middleDist = getDist(wrist, middleTip);
      const ringDist = getDist(wrist, ringTip);
      const pinkyDist = getDist(wrist, pinkyTip);

      const avgDist = (thumbDist + indexDist + middleDist + ringDist + pinkyDist) / 5;
      
      // Thresholds based on normalized coords (0-1)
      const minClosed = 0.2;
      const maxOpen = 0.45;
      
      let openness = (avgDist - minClosed) / (maxOpen - minClosed);
      openness = Math.max(0, Math.min(1, openness)); // Clamp 0-1

      const isOpen = openness > 0.5;

      // Rotation approximation
      const rotationX = (wrist.x - 0.5) * 2; // -1 to 1
      const rotationY = (wrist.y - 0.5) * 2;

      this.onResultsCallback({
        isOpen,
        openness,
        rotationX,
        rotationY,
        isDetected: true,
      });
    } else {
      this.onResultsCallback({
        isOpen: true,
        openness: 0.5, // Default drift
        rotationX: 0,
        rotationY: 0,
        isDetected: false,
      });
    }
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
  }
}
