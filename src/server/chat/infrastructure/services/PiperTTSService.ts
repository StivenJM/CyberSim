export interface ITTSService {
  synthesize(text: string): Promise<string | null>;
}

export class PiperTTSService implements ITTSService {
  private readonly apiUrl: string;
  private readonly baseUrl: string;
  private readonly voice: string;

  constructor(voice: string = "female") {
    this.voice = voice;
    const apiUrl = process.env.PIPER_TTS_API_URL;
    const baseUrl = process.env.PIPER_TTS_BASE_URL;

    if (!apiUrl || !baseUrl) {
      throw new Error("Las variables PIPER_TTS_API_URL y PIPER_TTS_BASE_URL deben estar definidas en el .env");
    }

    this.apiUrl = apiUrl;
    this.baseUrl = baseUrl;
  }

  async synthesize(text: string): Promise<string | null> {
    const cleanText = text && text.trim().replace(/"/g, "");
    if (!cleanText) return null;

    try {
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW' + Date.now().toString();
      let body = '';
      body += `--${boundary}\r\nContent-Disposition: form-data; name="text"\r\n\r\n${cleanText}\r\n`;
      body += `--${boundary}\r\nContent-Disposition: form-data; name="voice"\r\n\r\n${this.voice}\r\n`;
      body += `--${boundary}--\r\n`;

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      });

      if (!response.ok) {
        console.error("Piper TTS error:", response.status, await response.text());
        return null;
      }

      // tts.php devuelve un JSON con la URL del audio generado o audio_base64
      const data = await response.json();

      if (data.audio_base64) {
        return `data:audio/wav;base64,${data.audio_base64}`;
      }

      if (data.error || !data.url) {
        console.error("Piper TTS error en JSON:", data.error || "No se recibió URL ni base64");
        return null;
      }

      // Descargamos el audio WAV generado
      const audioUrl = this.baseUrl + data.url;
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        console.error("Piper TTS error descargando el WAV:", audioResponse.status);
        return null;
      }

      const arrayBuffer = await audioResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Audio = buffer.toString('base64');

      return `data:audio/wav;base64,${base64Audio}`;
    } catch (error) {
      console.error("Piper TTS error:", error);
      return null;
    }
  }
}
