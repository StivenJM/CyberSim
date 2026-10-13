import type { IContextModeManager } from "../../domain/repositories/IContextModeManager.js";
import type { GameContext } from "../../domain/models/Message.js";

export interface ContextModeCallbacks {
  onActivate?: () => void;
  onDeactivate?: () => void;
  onContextSelected: (context: GameContext) => void;
}

export class ToggleContextModeUseCase {
  constructor(private readonly contextModeManager: IContextModeManager) {}

  execute(callbacks: ContextModeCallbacks): void {
    const isCurrentlyActive = this.contextModeManager.isActive();

    if (isCurrentlyActive) {
      this.contextModeManager.deactivate();
      callbacks.onDeactivate?.();
    } else {
      this.contextModeManager.activate(callbacks.onContextSelected);
      callbacks.onActivate?.();
    }
  }

  isActive(): boolean {
    return this.contextModeManager.isActive();
  }
  forceDeactivate(): void {
    this.contextModeManager.deactivate();
  }
}
