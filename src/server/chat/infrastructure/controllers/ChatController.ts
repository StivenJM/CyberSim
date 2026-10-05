import { Router, type Request, type Response } from "express";
import { NativeChatRepository } from "../repositories/NativeChatRepository.js";
import { getMemoryManager } from "../services/ConversationMemoryManager.js";
import type { GameContext } from "../../domain/models/Message.js";

interface ChatRequestBody {
  message: string;
  sessionId: string;
  context: GameContext;
}

const EMPTY_GAME_CONTEXT: GameContext = {
  objectName: "",
  contextId: "",
  displayText: "",
  ariaLabel: "",
  imageUrl: ""
};

const router = Router();

const chatRepository = new NativeChatRepository();


router.post("/", async (req: Request<Record<string, unknown>, Record<string, unknown>, ChatRequestBody>, res: Response) => {
  try {

    const { 
      message, 
      sessionId, 
      context = EMPTY_GAME_CONTEXT 
    } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: "sessionId is required" });
      return;
    }


    const response = await chatRepository.sendMessage({
      message: message || "",
      sessionId,
      timestamp: new Date().toISOString(),
      context, 

    });

    res.json({
      message: response.message,
      audio: response.audio || null, 
      hasAudio: !!response.audio,
      sessionId,
      timestamp: new Date().toISOString(),
      success: response.success !== false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ChatController] Error:", errorMessage);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined // Aquí dejamos undefined porque es nativo de Express para omitir la llave en el JSON de respuesta
    });
  }
});

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const isHealthy = await chatRepository.checkHealth();
    const memoryStats = getMemoryManager().getStats();

    res.json({
      status: isHealthy ? "healthy" : "degraded",
      services: { qdrant: isHealthy, gemini: true, tts: true },
      memory: memoryStats,
    });
  } catch (error) {
    console.error("GET /api/chat/health error:", error);
    res.status(500).json({ status: "unhealthy", error: "Service check failed" });
  }
});

router.delete("/session/:sessionId", (req: Request<{ sessionId: string }>, res: Response) => {
  try {
    const { sessionId } = req.params;
    const memoryManager = getMemoryManager();
    
    if (!memoryManager.hasSession(sessionId)) {
      res.status(404).json({ success: false, error: "Session not found" });
      return;
    }

    memoryManager.clearSession(sessionId);
    res.json({ success: true, message: `Session ${sessionId} cleared` });
  } catch (error) {
    console.error("DELETE /api/chat/session error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/stats", (_req: Request, res: Response) => {
  try {
    res.json({ success: true, stats: getMemoryManager().getStats() });
  } catch (error) {
    console.error("GET /api/chat/stats error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
