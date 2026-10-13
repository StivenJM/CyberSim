/**
 * Para gestionar la lógica de selección de contexto en el DOM
 */
import type {
  IContextModeManager,
  ContextModeState,
  ContextSelectedCallback,
} from "../../domain/repositories/IContextModeManager.js";
import type { GameContext } from "../../domain/models/Message.js";

const CONTEXT_SELECTOR = "[data-context]" as const;
const CONTEXT_MODE_CLASS = "context-mode-active" as const;
const BLOCKED_EVENT_TYPES = [
  "mousedown",
  "mouseup",
  "dblclick",
  "contextmenu",
  "submit",
] as const;

export class ContextModeManager implements IContextModeManager {
  private state: ContextModeState = {
    isActive: false,
    selectedContext: null,
  };

  private onContextSelectedCallback?: ContextSelectedCallback;
  private boundHandleClick?: (event: MouseEvent) => void;
  private boundBlockActions?: (event: Event) => void;

  activate(onContextSelected: ContextSelectedCallback): void {
    if (this.state.isActive) return;

    this.onContextSelectedCallback = onContextSelected;
    this.state.isActive = true;
    this.state.selectedContext = null;
    this.addEventListeners();
    document.body.classList.add(CONTEXT_MODE_CLASS);
  }

  deactivate(): void {
    if (!this.state.isActive) return;

    this.state.isActive = false;
    this.state.selectedContext = null;
    this.removeEventListeners();
    document.body.classList.remove(CONTEXT_MODE_CLASS);
  }

  toggle(onContextSelected?: ContextSelectedCallback): void {
    if (this.state.isActive) {
      this.deactivate();
    } else if (onContextSelected) {
      this.activate(onContextSelected);
    }
  }

  getState(): ContextModeState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Maneja el click en elementos con contexto
   */
  private handleObjectClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const elementWithContext = target.closest(CONTEXT_SELECTOR) as HTMLElement;

    if (!elementWithContext) return;

    this.preventEventPropagation(event);

    const context = this.extractContextFromElement(elementWithContext);

    this.deactivate();

    this.onContextSelectedCallback?.(context); // notificar selección
  };

  private blockElementActions = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target.closest(CONTEXT_SELECTOR)) {
      this.preventEventPropagation(event);
    }
  };

  private preventEventPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  /**
   * Función para extraer el contexto de un elemento HTML
   */
  private extractContextFromElement(element: HTMLElement): GameContext {
    const contextId = element.getAttribute("data-context") || "";
    const displayText = element.textContent?.trim() || contextId;
    const ariaLabel = element.getAttribute("aria-label") || undefined;
    const objectName =
      element.getAttribute("data-object-name") || element.tagName;
    const imageUrl =
      element instanceof HTMLImageElement ? element.src : undefined;

    return {
      objectName,
      contextId,
      displayText,
      ariaLabel,
      imageUrl,
    };
  }

  private addEventListeners(): void {
    this.boundHandleClick = this.handleObjectClick.bind(this);
    this.boundBlockActions = this.blockElementActions.bind(this);

    document.addEventListener("click", this.boundHandleClick, true);

    BLOCKED_EVENT_TYPES.forEach((eventType) => {
      document.addEventListener(eventType, this.boundBlockActions!, true);
    });
  }

  private removeEventListeners(): void {
    if (this.boundHandleClick) {
      document.removeEventListener("click", this.boundHandleClick, true);
    }

    if (this.boundBlockActions) {
      BLOCKED_EVENT_TYPES.forEach((eventType) => {
        document.removeEventListener(eventType, this.boundBlockActions!, true);
      });
    }
  }
}
