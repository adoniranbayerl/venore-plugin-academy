import { PitchDetector } from "pitchy";

// Captura de microfone + detecção de afinação (McLeod Pitch Method via pitchy) pro modo "Cantar
// junto" da Academy. Classe imperativa (não hook) porque possui recursos mutáveis do browser
// (MediaStream/AudioContext/AnalyserNode/loop de rAF) cujo ciclo de vida start/stop é mais natural
// como um controller do que estado de closure de hook — src/hooks/use-pitch-listener.ts é o
// wrapper React fino em cima disto.

// Janela maior (4096 ≈ 93 ms) dá mais períodos pra medir notas graves de voz (~110 Hz) sem erro
// de oitava; a latência extra não incomoda em nota sustentada.
const FFT_SIZE = 4096;
// Piso de confiança do McLeod: 0.8 deixa passar nota grave/mais fraca que 0.9 rejeitava (o aluno
// reclamou de "cantei e deu errado"); ainda filtra ruído.
const CLARITY_THRESHOLD = 0.8;
const MIN_VOLUME_DECIBELS = -45;

export type PitchFrame = { frequencyHz: number | null; clarity: number; timestampMs: number };

export type PitchListenerStartResult =
  | { ok: true }
  | { ok: false; reason: "unsupported" | "permission-denied" | "no-mic" | "unknown"; message: string };

export class PitchListener {
  private onFrame: (frame: PitchFrame) => void;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private rafId: number | null = null;

  constructor(onFrame: (frame: PitchFrame) => void) {
    this.onFrame = onFrame;
  }

  async start(): Promise<PitchListenerStartResult> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return { ok: false, reason: "unsupported", message: "Este navegador não suporta captura de microfone." };
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        // echoCancellation LIGADO: quando o aluno pratica no PC sem fone, o metrônomo/modelo sai
        // pela caixa e volta pelo microfone — o cancelamento de eco remove justamente o áudio que
        // o próprio aparelho tocou. noiseSuppression/autoGainControl continuam desligados: são
        // afinados pra voz de chamada e distorcem a fundamental de uma nota sustentada.
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
    } catch (error) {
      return { ok: false, reason: classifyGetUserMediaError(error), message: describeGetUserMediaError(error) };
    }

    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      stream.getTracks().forEach((track) => track.stop());
      return { ok: false, reason: "unsupported", message: "Este navegador não suporta processamento de áudio." };
    }

    const audioContext = new AudioContextCtor();
    const sourceNode = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = FFT_SIZE;
    sourceNode.connect(analyserNode);

    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    detector.minVolumeDecibels = MIN_VOLUME_DECIBELS;
    const buffer = new Float32Array(detector.inputLength);

    this.stream = stream;
    this.audioContext = audioContext;
    this.sourceNode = sourceNode;
    this.analyserNode = analyserNode;

    const tick = () => {
      analyserNode.getFloatTimeDomainData(buffer);
      const [pitchHz, clarity] = detector.findPitch(buffer, audioContext.sampleRate);
      this.onFrame({
        frequencyHz: clarity >= CLARITY_THRESHOLD ? pitchHz : null,
        clarity,
        timestampMs: performance.now(),
      });
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    return { ok: true };
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // Parar as tracks é o que de fato apaga o indicador de "microfone em uso" do navegador —
    // desconectar os nós do Web Audio sozinho não libera o dispositivo.
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.sourceNode?.disconnect();
    this.sourceNode = null;
    this.analyserNode?.disconnect();
    this.analyserNode = null;
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
    }
    this.audioContext = null;
  }
}

function classifyGetUserMediaError(error: unknown): "permission-denied" | "no-mic" | "unknown" {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") return "permission-denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "no-mic";
  return "unknown";
}

function describeGetUserMediaError(error: unknown): string {
  const reason = classifyGetUserMediaError(error);
  if (reason === "permission-denied") return "Permissão de microfone negada.";
  if (reason === "no-mic") return "Nenhum microfone foi encontrado neste dispositivo.";
  return "Não foi possível acessar o microfone.";
}
