# Accesibilidad del apartado de ejercicios

Riesgo evaluado: un banco de evaluación operado con teclado puede excluir a estudiantes con discapacidad
visual o motora, y a la vez producir una falsa sensación de cumplimiento si solo se ejecuta un analizador
automático. La decisión afecta a la interfaz del apartado y a las vistas por caso.

## Método

Se partió de la norma y de las guías de práctica del W3C, y se contrastó con documentación de referencia y
con artículos de equipos que auditan accesibilidad a diario. Cuatro fuentes se leyeron completas para tomar
la decisión (marcadas **leída**); el resto se conserva como referencia normativa o de práctica con su
identificador estable. No se sustituye la prueba con personas: el apartado sigue pendiente de revisión con
usuarios, que corresponde a I12.

## Decisiones

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Pestañas con patrón APG: `tablist`/`tab`/`tabpanel`, roving `tabindex`, flechas, Home y End | Enlaces que cambian de ruta | El patrón declara el estado y el control asociado; los enlaces no anuncian selección |
| Las pestañas bloqueadas siguen siendo enfocables con `aria-disabled="true"` | `disabled` HTML | Un elemento `disabled` desaparece del recorrido y el usuario no descubre que existe ni por qué está bloqueado |
| D1 se sella con una acción explícita y las vistas de intervención se habilitan después | Ocultar visualmente los paneles | El orden pedagógico es un requisito del instrumento, no un efecto de estilo |
| El expediente A0 nunca se deshabilita | Bloquearlo tras el diagnóstico | Los materiales originales deben poder consultarse en cualquier fase |
| Elementos nativos (`button`, `table`, `label`) y ARIA solo para lo que no existe en HTML | `div` con `role="button"` | Menos estados que mantener y mejor soporte de lectores de pantalla |
| `:focus-visible` con contorno visible y sin `outline: none` | Indicador propio sutil | El foco debe distinguirse del estado seleccionado |
| Tabla de comprobaciones con `caption` y `th scope="col"` | Rejilla de tarjetas | La relación propiedad/resultado/evidencia se pierde sin encabezados |
| Resultado de la verificación en región `aria-live="polite"` | Solo cambio visual | Un lector de pantalla necesita el anuncio del resultado |
| Sin atajos de teclado propios | Atajos para acelerar | Evita conflictos con navegador, sistema y tecnología de asistencia; el teclado básico ya cubre el flujo |
| Analizador automático como suelo, no como prueba | Certificar con axe | Los analizadores detectan una fracción de los criterios; el recorrido manual sigue siendo obligatorio |

## Fuentes

1. **W3C — WCAG 2.2 (Recomendación)**. https://www.w3.org/TR/WCAG22/
2. **W3C — Understanding SC 2.1.1 Keyboard** (**leída**). https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html
3. W3C — Understanding SC 2.1.2 No Keyboard Trap. https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html
4. W3C — Understanding SC 2.4.3 Focus Order. https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
5. W3C — Understanding SC 2.4.7 Focus Visible. https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
6. W3C — Understanding SC 2.4.11 Focus Not Obscured (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
7. W3C — Understanding SC 4.1.2 Name, Role, Value. https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html
8. W3C — Understanding SC 1.3.1 Info and Relationships. https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
9. W3C — Understanding SC 3.3.1 Error Identification. https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
10. W3C — Understanding SC 3.3.3 Error Suggestion. https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html
11. W3C — Understanding SC 2.2.1 Timing Adjustable. https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html
12. W3C — Understanding SC 2.2.2 Pause, Stop, Hide. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
13. W3C — Understanding SC 1.4.3 Contrast (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
14. W3C — Understanding SC 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
15. **W3C APG — Tabs Pattern** (**leída**). https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
16. **W3C APG — Developing a Keyboard Interface** (**leída**). https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
17. W3C APG — Read Me First. https://www.w3.org/WAI/ARIA/apg/practices/
18. W3C WAI — Tables Tutorial. https://www.w3.org/WAI/tutorials/tables/
19. W3C WAI — Forms Tutorial. https://www.w3.org/WAI/tutorials/forms/
20. W3C — WCAG-EM 1.0 (Evaluation Methodology). https://www.w3.org/TR/WCAG-EM/
21. W3C WAI — Involving Users in Evaluating Web Accessibility. https://www.w3.org/WAI/test-evaluate/involving-users/
22. W3C WAI — Evaluation Tools List. https://www.w3.org/WAI/test-evaluate/tools/list/
23. **WebAIM — Keyboard Accessibility** (**leída**). https://webaim.org/techniques/keyboard/
24. WebAIM — Screen Reader Testing. https://webaim.org/techniques/screenreader/
25. WebAIM — Contrast Checker. https://webaim.org/resources/contrastchecker/
26. Deque — axe-core. https://github.com/dequelabs/axe-core
27. Deque — axe (cobertura y límites de la automatización). https://www.deque.com/axe/
28. GOV.UK Design System — Tabs. https://design-system.service.gov.uk/components/tabs/
29. GOV.UK Service Manual — Testing with assistive technologies. https://www.gov.uk/service-manual/technology/testing-with-assistive-technologies
30. MDN — ARIA `tab` role. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
31. MDN — `tabindex`. https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
32. MDN — ARIA live regions. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
33. ETSI — EN 301 549 (requisitos europeos de accesibilidad TIC). https://www.etsi.org/deliver/etsi_en/301500_301599/301549/
34. Section 508 — ICT Testing Baseline. https://section508coordinators.github.io/ICTTestingBaseline/
35. The A11y Project — Checklist. https://www.a11yproject.com/checklist/

Las fuentes 2, 15, 16 y 23 se leyeron completas antes de decidir. Las demás son referencia normativa o de
práctica; su inclusión no afirma una revisión exhaustiva de cada párrafo.

## Consecuencias

- El apartado declara explícitamente que un resultado verde no acredita conocimiento ni conformidad.
- Queda pendiente probar con lector de pantalla real, teclado físico y usuarios, y registrar los hallazgos.
  Esa prueba pertenece a I12 y no se sustituye con pruebas automáticas.
