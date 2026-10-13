import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { useECSSceneContext } from "../context/ECSSceneContext";
import { useChatContext } from "../../chat/context/ChatContext";
import Button from "../../../common/components/Button";
import s from "../styles/TutorialTour.module.css";

interface TourStep {
  target: string;
  placement: "center" | "top" | "bottom" | "left" | "right";
  title: string;
  content: string;
  route?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

const GAP = 12;
// Margen mínimo entre el tooltip y el borde de la ventana
const VIEWPORT_MARGIN = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function getTooltipPosition(
  rect: DOMRect | null,
  placement: TourStep["placement"],
  size: { width: number; height: number },
): CSSProperties {
  if (!rect || placement === "center") return {};

  let left = 0;
  let top = 0;
  switch (placement) {
    case "top":
      left = rect.left + rect.width / 2 - size.width / 2;
      top = rect.top - GAP - size.height;
      break;
    case "bottom":
      left = rect.left + rect.width / 2 - size.width / 2;
      top = rect.bottom + GAP;
      break;
    case "left":
      left = rect.left - GAP - size.width;
      top = rect.top + rect.height / 2 - size.height / 2;
      break;
    case "right":
      left = rect.right + GAP;
      top = rect.top + rect.height / 2 - size.height / 2;
      break;
  }

  // Acotar al viewport para que el tooltip nunca se salga ni se corte
  const maxLeft = window.innerWidth - size.width - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - size.height - VIEWPORT_MARGIN;
  return {
    left: clamp(left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, maxLeft)),
    top: clamp(top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, maxTop)),
  };
}

export default function TutorialTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pause, resume, isPaused } = useECSSceneContext();
  const { openChat, closeChat } = useChatContext();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // El target de un paso anclado no se pudo localizar (no montó o desapareció,
  // p. ej. el usuario abrió el panel y el botón se desmontó): mostrar centrado.
  const [targetMissing, setTargetMissing] = useState(false);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wasPausedBeforeTour = useRef(false);
  const prevStepRef = useRef(-1);

  const steps: TourStep[] = [
    {
      target: "body",
      placement: "center",
      route: "/",
      title: "Bienvenido a CyberSim",
      content:
        "CyberSim es un simulador para aprender seguridad informática practicando. " +
        "Cada escenario te pone en una situación distinta: a veces proteges los sistemas " +
        "de una empresa, a veces eres tú quien ataca. Te mostramos rápido las herramientas que tienes.",
    },
    {
      target: '[data-tour="escena-3d"]',
      placement: "center",
      route: "/",
      title: "Tu oficina",
      content:
        "Cada escenario ocurre en una oficina 3D. No todos los dispositivos se pueden usar: " +
        "los que sí están en los cuartos con la puerta abierta. Haz clic en ellos para ver sus " +
        "opciones. Cada tipo de dispositivo sirve para algo distinto.",
    },
    {
      target: '[data-tour="dock"]',
      placement: "top",
      route: "/",
      title: "Barra de navegación",
      content:
        "Desde aquí llegas a todo: la oficina, los dispositivos, la red y los objetivos.",
    },
    {
      target: "body",
      placement: "center",
      route: "/redes",
      title: "Vista de Redes",
      content:
        "Aquí ves cómo se conectan los dispositivos. Puedes asignar equipos a redes tras seleccionarlos.",
    },
    {
      target: "body",
      placement: "center",
      route: "/fases-partida",
      title: "Objetivos de la partida",
      content:
        "Aquí están las fases del escenario y lo que debes lograr en cada una. " +
        "Si no sabes qué hacer, revísalo. No puedes completar una fase sin antes haber completado sus objetivos.",
    },
    {
      target: '[data-tour="logs-open"]',
      placement: "left",
      route: "/",
      title: "Panel de eventos",
      content:
        "Los eventos del escenario se registran en este panel. Te ayudarán indicándote en qué enfocarte.",
    },
    {
      target: '[data-tour="dock-tiempo"]',
      placement: "top",
      route: "/",
      title: "El tiempo corre",
      content:
        "La simulación avanza en tiempo real y los retos aparecen en momentos concretos. " +
        "Si necesitas pensar, pausa con el botón de al lado.",
    },
    {
      target: '[data-chat-toggle="true"]',
      placement: "top",
      route: "/",
      title: "Tu asistente IA",
      content:
        "Si te pierdes o algo no queda claro, pregúntale al chatbot. " +
        "Está para ayudarte durante todo el escenario.",
      onEnter: () => openChat(),
      onLeave: () => closeChat(),
    },
    // — Cierre
    {
      target: "body",
      placement: "center",
      route: "/",
      title: "¡Listo!",
      content: "Tu primer reto aparecerá en unos segundos. ¡Buena suerte!",
    },
  ];

  const step = steps[stepIndex];
  const isBodyStep = step.target === "body";
  // Centrado para pasos "body" y como fallback si el target no se localiza.
  const isCentered = isBodyStep || targetMissing;
  // Un paso anclado solo se muestra cuando ya tiene su posición medida (o cuando
  // cae al fallback centrado); así evitamos el flash en la posición anterior.
  const showTooltip = isBodyStep || targetRect !== null || targetMissing;
  const isLast = stepIndex === steps.length - 1;

  const close = useCallback(() => {
    const currentStep = steps[prevStepRef.current];
    if (currentStep?.onLeave) currentStep.onLeave();
    setActive(false);
    if (location.pathname !== "/") navigate("/");
    if (!wasPausedBeforeTour.current) resume();
  }, [resume, navigate, location.pathname]);  

  // Init
  useEffect(() => {
    const slug = localStorage.getItem("slug_escenario_actual");
    if (slug !== "tutorial") return;

    wasPausedBeforeTour.current = isPaused;
    setActive(true);

    // Diferir la pausa: el timer se crea/inicia en el efecto de useECSScene,
    // que corre después de este. El microtask se ejecuta tras ese flush.
    if (!isPaused) queueMicrotask(pause);
  }, []);  

  // Navigate & run side effects when step changes
  useEffect(() => {
    if (!active) return;
    const prev = prevStepRef.current;

    if (prev >= 0 && prev < steps.length && steps[prev].onLeave) {
      steps[prev].onLeave!();
    }

    if (step.route && step.route !== location.pathname) {
      navigate(step.route);
    }

    // Actualizar siempre, también cuando hay onEnter, para que el onLeave del
    // paso actual se dispare al salir (p. ej. cerrar el panel de eventos).
    prevStepRef.current = stepIndex;

    if (step.onEnter) {
      const t = setTimeout(step.onEnter, 100);
      return () => clearTimeout(t);
    }
  }, [stepIndex, active]);  

  // Medir el target del paso actual antes del paint (sin salto). Si el elemento
  // aún no existe (p. ej. la ruta acaba de cambiar) se reintenta en cada frame
  // hasta encontrarlo, en vez de usar un delay fijo.
  useLayoutEffect(() => {
    if (!active) return;

    if (isBodyStep) {
      setTargetRect(null);
      setTargetMissing(false);
      return;
    }

    setTargetMissing(false);
    // Si ya estamos en la ruta del paso, el target debería existir enseguida; si
    // no aparece en pocos frames es que no está (p. ej. el panel se abrió y el
    // botón se desmontó) y caemos a centrado. Si hay que navegar, damos margen
    // para que la nueva ruta monte.
    const needsNav = !!step.route && step.route !== location.pathname;
    const maxAttempts = needsNav ? 120 : 8;

    let raf = 0;
    let attempts = 0;
    const measure = () => {
      const el = document.querySelector(step.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        setTargetMissing(false);
        return;
      }
      // Limpiar el rect previo para que el tooltip no quede en la posición
      // anterior mientras se busca el target.
      setTargetRect(null);
      if (attempts++ < maxAttempts) {
        raf = requestAnimationFrame(measure);
      } else {
        setTargetMissing(true);
      }
    };
    measure();

    const onReflow = () => {
      const el = document.querySelector(step.target);
      setTargetRect(el ? el.getBoundingClientRect() : null);
    };
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [active, isBodyStep, step.target, stepIndex, location.pathname]);

  // Medir el tooltip para poder acotarlo al viewport (antes del paint, sin parpadeo)
  useLayoutEffect(() => {
    if (!active || isCentered) return;
    const el = tooltipRef.current;
    if (!el) return;
    const { offsetWidth, offsetHeight } = el;
    setTooltipSize((prev) =>
      prev.width === offsetWidth && prev.height === offsetHeight
        ? prev
        : { width: offsetWidth, height: offsetHeight },
    );
  }, [active, isCentered, stepIndex, targetRect]);

  if (!active) return null;

  const tooltipClass = isCentered
    ? `${s.tooltip} ${s.tooltipCentered}`
    : s.tooltip;

  return (
    <div className={s.overlay}>
      {targetRect && !isCentered ? (
        <div
          className={s.spotlight}
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      ) : (
        <div className={s.overlayBackground} />
      )}

      {showTooltip && (
        <div
          ref={tooltipRef}
          className={tooltipClass}
          style={
            isCentered
              ? {}
              : getTooltipPosition(targetRect, step.placement, tooltipSize)
          }
        >
          <div className={s.header}>
            <h3 className={s.title}>{step.title}</h3>
            <button
              className={s.closeButton}
              onClick={close}
              aria-label="Cerrar tour"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className={s.body}>{step.content}</div>

          <div className={s.footerRight}>
            <span className={s.progress}>
              {stepIndex + 1} / {steps.length}
            </span>
            <div className={s.footerActions}>
              {stepIndex > 0 && (
                <Button
                  variant="primary"
                  onClick={() => setStepIndex((i) => i - 1)}
                >
                  Anterior
                </Button>
              )}
              <Button
                variant="accent"
                onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
              >
                {isLast ? "¡Empezar!" : "Siguiente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
