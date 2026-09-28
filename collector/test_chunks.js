const fs = require("fs");
const path = require("path");
const wavefile = require("/home/sakhaglobal/Desktop/anything-llm-master/collector/node_modules/wavefile");
const { FFMPEGWrapper } = require("/home/sakhaglobal/Desktop/anything-llm-master/collector/utils/WhisperProviders/ffmpeg");

async function convert(sourcePath) {
  const ffmpeg = new FFMPEGWrapper();
  const outputFile = "/tmp/test_debug.wav";
  await ffmpeg.convertAudioToWav(sourcePath, outputFile);
  const buffer = fs.readFileSync(outputFile);
  fs.rmSync(outputFile);
  const wavFile = new wavefile.WaveFile(buffer);
  wavFile.toBitDepth("32f");
  wavFile.toSampleRate(16000);
  let audioData = wavFile.getSamples();
  if (Array.isArray(audioData)) {
    audioData = audioData[0];
  }
  return audioData;
}

async function main() {
  const { pipeline } = await import("@xenova/transformers");
  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-small", {
    cache_dir: path.resolve("/home/sakhaglobal/Desktop/anything-llm-master/server/storage/models")
  });

  const testFile = "/home/sakhaglobal/.gemini/antigravity-ide/brain/8299e0a2-6f15-455e-afaf-cb0ee6a5136e/scratch/clip70.mp3";
  const audioData = await convert(testFile);
  console.log("Audio samples count:", audioData.length, "Duration:", audioData.length / 16000);

  console.log("\n--- TEST 1: Default AnythingLLM params (chunk_length_s: 30, stride_length_s: 5) ---");
  const res1 = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    chunk_callback: (chunk) => {
      console.log("chunk_callback stride:", chunk.stride, "tokens length:", chunk.tokens?.length);
    }
  });
  console.log("Res1 text:", JSON.stringify(res1.text));
  console.log("Res1 keys:", Object.keys(res1));

  console.log("\n--- TEST 2: With return_timestamps: true ---");
  const res2 = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
  });
  console.log("Res2 text:", JSON.stringify(res2.text));
  console.log("Res2 chunks count:", res2.chunks?.length);
  if (res2.chunks) {
    res2.chunks.forEach((c, idx) => console.log(`  Chunk ${idx} [${c.timestamp}]: "${c.text}"`));
  }
}

main().catch(console.error);
