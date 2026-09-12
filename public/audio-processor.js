// PCM16 오디오 워크렛 프로세서
class PCM16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleCount = 0;
    console.log('🎛️ PCM16Processor constructor called');
  }

  process(inputs, outputs, parameters) {
    this.sampleCount++;

    // 처음 몇 번은 로깅
    if (this.sampleCount <= 5) {
      console.log(`🎛️ Process call #${this.sampleCount}, inputs:`, inputs.length, 'outputs:', outputs.length);
    }

    const input = inputs[0];
    if (this.sampleCount <= 5) {
      console.log(`🎛️ Input[0]:`, input ? `channels: ${input.length}` : 'null');
    }

    if (input && input.length > 0) {
      const inputChannel = input[0]; // mono 채널

      if (this.sampleCount <= 5) {
        console.log(`🎛️ InputChannel:`, inputChannel ? `samples: ${inputChannel.length}` : 'null');
      }

      if (inputChannel && inputChannel.length > 0) {
        // 오디오 레벨 계산 (RMS)
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += inputChannel[i] * inputChannel[i];
        }
        const rms = Math.sqrt(sum / inputChannel.length);
        const level = Math.max(0, Math.min(1, rms));

        // 첫 번째 유의미한 오디오 감지
        if (this.sampleCount <= 10 || (level > 0.001 && this.sampleCount % 50 === 0)) {
          console.log(`🎛️ Audio level in worklet: ${(level * 100).toFixed(2)}%, count: ${this.sampleCount}`);
        }

        // Float32Array를 Int16Array로 변환 (PCM16)
        const pcm16Buffer = new Int16Array(inputChannel.length);
        for (let i = 0; i < inputChannel.length; i++) {
          // Float32 [-1, 1]을 Int16 [-32768, 32767]으로 변환
          const sample = Math.max(-1, Math.min(1, inputChannel[i]));
          pcm16Buffer[i] = sample * 0x7FFF;
        }

        // ArrayBuffer와 오디오 레벨을 메인 스레드로 전송
        this.port.postMessage({
          type: 'audioData',
          buffer: pcm16Buffer.buffer,
          level: level,
          samples: inputChannel.length,
          count: this.sampleCount
        });
      } else if (this.sampleCount <= 10) {
        console.log(`🎛️ No input channel data at count ${this.sampleCount}`);
      }
    } else if (this.sampleCount <= 10) {
      console.log(`🎛️ No input at count ${this.sampleCount}`);
    }

    return true; // 프로세서 계속 실행
  }
}

registerProcessor('pcm16-processor', PCM16Processor);