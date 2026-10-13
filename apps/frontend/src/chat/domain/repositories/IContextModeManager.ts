import type { GameContext } from "../models/Message.js";

export interface ContextModeState {
  isActive: boolean;
  selectedContext: GameContext | null;
}

export type ContextSelectedCallback = (context: GameContext) => void;

export interface IContextModeManager {
  activate(onContextSelected: ContextSelectedCallback): void;
  deactivate(): void;
  toggle(onContextSelected?: ContextSelectedCallback): void;
  getState(): ContextModeState;
  isActive(): boolean;
}
