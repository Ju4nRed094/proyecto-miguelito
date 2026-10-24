const form = document.querySelector('#diagnostic-form');
const steps = [...form.querySelectorAll('.form-step')];
const stepLabels = [...document.querySelectorAll('.step-labels li')];
const stepCount = document.querySelector('#step-count');
const stepTopic = document.querySelector('#step-topic');
const progressTrack = document.querySelector('#progress-track');
const progressFill = document.querySelector('#progress-fill');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const stepError = document.querySelector('#step-error');
const resultsPanel = document.querySelector('#results-panel');
const noDataConfirm = document.querySelector('#no-data-confirmation');
const noDataLegend = document.querySelector('#consistency-legend');
const liveScore = document.querySelector('#live-score');
const liveLevel = document.querySelector('#live-level');
const liveDimensions = document.querySelector('#live-dimensions');
const livePending = document.querySelector('#live-pending');
const documentBuilder = document.querySelector('#document-builder');
const documentForm = document.querySelector('#document-form');
const documentPreview = document.querySelector('#document-preview');
const generatedDocument = document.querySelector('#generated-document');
const liveDiagnostic = document.querySelector('.live-diagnostic');
const questionnaireCard = document.querySelector('.questionnaire-card');
const questionnaireHeading = document.querySelector('.questionnaire-heading');

// Los máximos de estas seis dimensiones suman exactamente 100 puntos.
const dimensions = [
  {
    key: 'policy', title: 'Política de privacidad', max: 20,
    points: { current: 20, outdated: 10, none: 0 },
    action: 'Revisa la política que compartes con las personas y compárala con las formas actuales de recopilar y usar información.',
    relatedTool: 'Política de Privacidad · Disponible',
  },
  {
    key: 'consent', title: 'Consentimiento explícito', max: 15,
    points: { always: 15, sometimes: 8, no: 0, unknown: 0 },
    action: 'Identifica en qué procesos usas consentimiento y cómo explicas y registras la decisión cuando corresponde.',
    relatedTool: 'Formulario de Consentimiento · Próximamente',
  },
  {
    key: 'register', title: 'Registro de tratamiento', max: 20,
    points: { yes: 20, no: 0 },
    action: 'Empieza un inventario interno de las categorías de datos, procesos, personas involucradas y herramientas que usas.',
    relatedTool: 'Registro de Tratamiento (RAT) · Próximamente',
  },
  {
    key: 'rights', title: 'Solicitudes de titulares', max: 15,
    points: { yes: 15, no: 0, unknown: 0 },
    action: 'Acuerda quién recibiría una solicitud, cómo se derivaría y dónde se registraría su seguimiento.',
    relatedTool: 'Protocolo ARCOP · Próximamente',
  },
  {
    key: 'training', title: 'Capacitación o responsable', max: 15,
    points: { yes: 15, no: 0 },
    action: 'Designa una persona de referencia o prepara una orientación básica para el equipo sobre sus prácticas internas.',
    relatedTool: 'Recurso DOCFAST asociado · En preparación',
  },
  {
    key: 'incidentPlan', title: 'Plan ante incidentes', max: 15,
    points: { yes: 15, no: 0 },
    action: 'Esboza un plan interno con responsables, canal de aviso y pasos iniciales para revisar un incidente.',
    relatedTool: 'Protocolo de Brechas · Próximamente',
  },
];

let currentStep = 0;
let furthestStep = 0;
const diagnosticNavigationKey = 'docfast.diagnostic-navigation.v1';

function selected(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
}

function scrollTo(elementToScroll) {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  elementToScroll.scrollIntoView({ behavior, block: 'start' });
}

function updateProgress(showingResults = false) {
  const progressPosition = showingResults ? steps.length + 1 : currentStep + 1;
  stepCount.textContent = showingResults ? 'Diagnóstico listo' : `Paso ${currentStep + 1} de ${steps.length}`;
  stepTopic.textContent = showingResults ? 'Resultado' : stepLabels[currentStep].querySelector('b').textContent;
  progressTrack.setAttribute('aria-valuemax', String(stepLabels.length));
  progressTrack.setAttribute('aria-valuenow', String(progressPosition));
  progressFill.style.width = `${(progressPosition / stepLabels.length) * 100}%`;
  stepLabels.forEach((label, index) => {
    if ((showingResults && index === stepLabels.length - 1) || (!showingResults && index === currentStep)) {
      label.setAttribute('aria-current', 'step');
    } else {
      label.removeAttribute('aria-current');
    }
    label.classList.toggle('is-complete', index < currentStep || (showingResults && index < stepLabels.length - 1));
  });
  previousButton.disabled = currentStep === 0 || showingResults;
  nextButton.textContent = '';
  const action = document.createElement('span');
  action.textContent = showingResults ? 'Diagnóstico listo' : currentStep === steps.length - 1 ? 'Ver mi diagnóstico' : 'Siguiente';
  nextButton.append(action);
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  nextButton.append(arrow);
}

function updateNoDataConfirmation() {
  const hasNoData = Boolean(form.querySelector('input[name="dataTypes"][value="none"]:checked'));
  const trackingNeedsReview = ['yes', 'unknown'].includes(selected('tracking'));
  const formsOrTracking = selected('webForms') === 'yes' || trackingNeedsReview;
  const hasConflict = hasNoData && formsOrTracking;
  noDataConfirm.hidden = !hasConflict;
  if (hasConflict) {
    const reasons = [];
    if (selected('webForms') === 'yes') reasons.push('formularios o canales de contacto');
    if (selected('tracking') === 'yes') reasons.push('cookies o herramientas de seguimiento');
    else if (selected('tracking') === 'unknown') reasons.push('herramientas de seguimiento que aún no identificas');
    noDataLegend.textContent = `Marcaste que no recopilas datos, pero también indicaste que usas ${reasons.join(' y ')}.`;
  } else {
    const confirmation = noDataConfirm.querySelector('input');
    confirmation.checked = false;
    confirmation.removeAttribute('aria-invalid');
    noDataConfirm.setAttribute('aria-invalid', 'false');
    noDataConfirm.querySelector('.question-error').hidden = true;
  }
  return hasConflict;
}

function noteUnansweredQuestions() {
  const groups = [...steps[currentStep].querySelectorAll('.question-group:not([hidden])')];
  let missing = 0;

  groups.forEach((group) => {
    const controls = [...group.querySelectorAll('input')];
    const answered = controls.some((control) => control.checked);
    const error = group.querySelector('.question-error');
    error.hidden = true;
    group.setAttribute('aria-invalid', 'false');
    controls.forEach((control) => control.removeAttribute('aria-invalid'));
    if (!answered) missing += 1;
  });

  if (missing) {
    stepError.textContent = `${missing} pregunta${missing === 1 ? '' : 's'} sin responder. Puedes continuar; aparecerán como pendientes y no bloquearán el informe.`;
    stepError.hidden = false;
    return;
  }

  stepError.hidden = true;
  stepError.textContent = '';
  return true;
}

function showStep(index, { focus = true } = {}) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  furthestStep = Math.max(furthestStep, currentStep);
  resultsPanel.hidden = true;
  documentBuilder.hidden = true;
  documentPreview.hidden = true;
  questionnaireCard.classList.remove('document-mode');
  liveDiagnostic.hidden = false;
  questionnaireHeading.hidden = false;
  form.hidden = false;
  stepError.hidden = true;
  steps.forEach((step, stepIndex) => {
    step.hidden = stepIndex !== currentStep;
    step.classList.remove('step-enter');
  });
  updateProgress();
  void steps[currentStep].offsetWidth;
  steps[currentStep].classList.add('step-enter');
  if (focus) steps[currentStep].querySelector('h3').focus({ preventScroll: true });
  scrollTo(document.querySelector('#cuestionario'));
}

function pointsFor(dimension, response) {
  return dimension.points[response] ?? 0;
}

function responseLabel(dimension, response) {
  if (!response) return 'Sin responder';
  const input = form.querySelector(`input[name="${dimension.key}"][value="${CSS.escape(response)}"]`);
  return input?.closest('label')?.querySelector('strong')?.textContent ?? response;
}

function scoreSnapshot() {
  const scored = dimensions.map((dimension) => {
    const response = selected(dimension.key);
    return { ...dimension, response, score: pointsFor(dimension, response) };
  });
  const answered = scored.filter((dimension) => dimension.response).length;
  const points = scored.reduce((sum, dimension) => sum + dimension.score, 0);
  const remaining = dimensions.length - answered;
  return { scored, answered, points, remaining, complete: remaining === 0 };
}

function responseEffect(dimension) {
  if (!dimension.response) return `Sin respuesta · 0/${dimension.max} pts por ahora. ${dimension.action}`;
  const label = responseLabel(dimension, dimension.response);
  if (dimension.response === 'unknown') return `Marcaste “${label}” · 0/${dimension.max} pts; la incertidumbre queda visible. ${dimension.action}`;
  if (dimension.score < dimension.max) return `Marcaste “${label}” · ${dimension.score}/${dimension.max} pts. ${dimension.action}`;
  return `Marcaste “${label}” · ${dimension.score}/${dimension.max} pts. Esta respuesta cubre el máximo de esta dimensión en la autoevaluación.`;
}

function renderLivePanel({ announce = false } = {}) {
  const snapshot = scoreSnapshot();
  const { scored, answered, points, remaining, complete } = snapshot;
  liveScore.textContent = answered ? String(points) : '—';
  document.querySelector('#live-score-suffix').textContent = answered && !complete ? '/ 100 puntos · parcial' : '/ 100 puntos';
  const level = !answered
    ? 'Responde para calcular tu nivel'
    : !complete
      ? `Puntaje parcial · ${remaining} dimensión${remaining === 1 ? '' : 'es'} sin responder`
      : points === 100
        ? 'Preparación completa'
        : points < 40 ? 'Inicio' : points < 70 ? 'En progreso' : 'Preparación declarada';
  liveLevel.textContent = level;
  liveLevel.classList.toggle('is-complete', complete && points === 100);
  document.querySelector('.live-diagnostic').classList.toggle('is-complete', complete && points === 100);
  const meter = document.querySelector('#live-meter');
  meter.setAttribute('aria-valuenow', String(points));
  meter.setAttribute('aria-valuetext', answered ? `${points} de 100 puntos${remaining ? `, ${remaining} dimensiones pendientes` : ''}` : 'Aún no calculado');
  document.querySelector('#live-meter-fill').style.width = `${points}%`;
  document.querySelector('#live-completion').textContent = `${answered} de 6 dimensiones respondidas${remaining ? ` · ${remaining} pendientes` : ''}`;
  liveDimensions.replaceChildren(...scored.map((dimension) => {
    const row = element('article', '', 'live-dimension');
    const top = element('div', '', 'live-dimension-top');
    top.append(element('strong', dimension.title), element('span', `${dimension.score}/${dimension.max}`));
    const state = element('p', responseEffect(dimension));
    row.append(top, state);
    return row;
  }));
  const pending = scored.filter((dimension) => !dimension.response || dimension.score < dimension.max);
  livePending.replaceChildren(...pending.map((dimension) => {
    const item = element('li', '');
    const title = element('strong', dimension.title);
    item.append(title, document.createTextNode(` — ${dimension.action}`));
    return item;
  }));
  document.querySelector('#live-complete-note').hidden = !(complete && points === 100);
  if (announce) {
    const announcement = answered
      ? `Diagnóstico actualizado: ${points} de 100 puntos. ${level}. ${answered} de 6 dimensiones respondidas.`
      : 'La respuesta se actualizó. Aún no hay dimensiones puntuables respondidas.';
    document.querySelector('#live-announcer').textContent = announcement;
  }
  return snapshot;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function createDimensionRow(dimension, score) {
  const row = element('article', '', 'dimension-row');
  const header = element('div', '', 'dimension-row-header');
  header.append(element('h5', dimension.title));
  header.append(element('span', `${score} / ${dimension.max} pts`, 'dimension-points'));
  const meter = element('div', '', 'dimension-meter');
  meter.setAttribute('role', 'progressbar');
  meter.setAttribute('aria-label', `Puntaje en ${dimension.title}`);
  meter.setAttribute('aria-valuemin', '0');
  meter.setAttribute('aria-valuemax', String(dimension.max));
  meter.setAttribute('aria-valuenow', String(score));
  const fill = element('span');
  fill.style.width = `${(score / dimension.max) * 100}%`;
  meter.append(fill);
  row.append(header, meter);
  return row;
}

function getContextActions() {
  const actions = [];
  const noData = Boolean(form.querySelector('input[name="dataTypes"][value="none"]:checked'));
  const confirmedNoDataReview = Boolean(form.querySelector('input[name="noDataConfirm"]:checked'));
  const types = [...form.querySelectorAll('input[name="dataTypes"]:checked')].map((input) => input.value);
  if (noData && (selected('webForms') === 'yes' || ['yes', 'unknown'].includes(selected('tracking')))) {
    actions.push({
      title: confirmedNoDataReview ? 'Contrastar la respuesta con tus canales digitales' : 'Revisar respuestas que parecen contradictorias',
      explanation: confirmedNoDataReview
        ? 'Marcaste que no recopilas datos personales y que revisaste la combinación, junto con el uso de formularios o seguimiento. Comprueba la configuración con quien administra esos canales.'
        : 'Marcaste que no recopilas datos personales y también indicaste formularios o seguimiento. Revisa qué información reciben esos canales antes de concluir.',
      relatedTool: 'Política de Privacidad · Disponible',
    });
  } else if (selected('webForms') === 'yes' || ['yes', 'unknown'].includes(selected('tracking'))) {
    const channels = [];
    if (selected('webForms') === 'yes') channels.push('formularios, WhatsApp Business o integraciones externas');
    if (selected('tracking') === 'yes') channels.push('cookies o herramientas de seguimiento');
    else if (selected('tracking') === 'unknown') channels.push('herramientas de seguimiento que aún no identificas');
    actions.push({
      title: 'Revisar la información de tus canales digitales',
      explanation: `Haz un inventario interno de qué información puede entrar por ${channels.join(' y ')} y qué herramientas la reciben.`,
      relatedTool: 'Registro de Tratamiento (RAT) · Próximamente',
    });
  }
  if (types.includes('Datos de salud')) {
    actions.push({
      title: 'Revisar el proceso que usa datos de salud',
      explanation: 'Limita la conversación al proceso y sus controles internos; no agregues casos ni información de personas al diagnóstico.',
      relatedTool: 'Política de Privacidad · Disponible',
    });
  }
  return actions;
}

function renderResults() {
  const snapshot = scoreSnapshot();
  const scores = snapshot.scored;
  const maximum = dimensions.reduce((total, dimension) => total + dimension.max, 0);
  const total = scores.reduce((sum, dimension) => sum + dimension.score, 0);
  const score = Math.round((total / maximum) * 100);
  const level = snapshot.remaining ? `Pendiente · ${snapshot.remaining} dimensión${snapshot.remaining === 1 ? '' : 'es'}` : score === 100 ? 'Preparación completa' : score < 40 ? 'Inicio' : score < 70 ? 'En progreso' : 'Preparación declarada';
  const levelClass = snapshot.remaining ? 'level-pending' : score < 40 ? 'level-start' : score < 70 ? 'level-progress' : 'level-advanced';
  const heading = snapshot.remaining
    ? 'Este resultado es parcial; puedes completarlo cuando quieras.'
    : score === 100
      ? 'Declaraste todas las prácticas incluidas en esta revisión.'
      : score < 40
    ? 'Hay varias dimensiones que puedes empezar a organizar.'
    : score < 70
      ? 'Tus respuestas muestran avances y aspectos por reforzar.'
      : 'Tus respuestas reflejan varias prácticas declaradas como presentes.';

  document.querySelector('#score-value').textContent = String(score);
  const scoreRing = document.querySelector('#score-ring');
  scoreRing.style.setProperty('--score-angle', `${score * 3.6}deg`);
  scoreRing.dataset.level = score < 40 ? 'start' : score < 70 ? 'progress' : 'advanced';
  const resultLevel = document.querySelector('#result-level');
  resultLevel.className = `result-level ${levelClass}`;
  resultLevel.textContent = level;
  document.querySelector('#score-heading').textContent = heading;
  document.querySelector('#score-explanation').textContent = snapshot.remaining
    ? `Puntaje parcial: ${total} de ${maximum}. Las dimensiones sin respuesta suman 0 por ahora y quedan señaladas como pendientes; no impiden crear el informe.`
    : `Puntaje: ${total} de ${maximum}. Cada respuesta de los pasos 3 y 4 aporta los puntos indicados para su dimensión.`;
  const resultMeter = document.querySelector('#result-meter');
  resultMeter.setAttribute('aria-valuenow', String(score));
  document.querySelector('#result-meter-fill').style.width = `${score}%`;

  const breakdown = document.querySelector('#dimension-breakdown');
  breakdown.replaceChildren(...scores.map((dimension) => createDimensionRow(dimension, dimension.score)));

  const contextSummary = document.querySelector('#context-summary');
  const dataDescription = form.querySelector('input[name="dataTypes"][value="none"]:checked')
    ? 'Marcaste que no recopilas datos personales.'
    : `Categorías marcadas: ${[...form.querySelectorAll('input[name="dataTypes"]:checked')].map((input) => input.value).join(', ')}.`;
  const formContext = selected('webForms') === 'yes' ? 'formularios/canales web: sí' : 'formularios/canales web: no';
  const trackingContext = selected('tracking') === 'yes' ? 'seguimiento: sí' : selected('tracking') === 'no' ? 'seguimiento: no' : 'seguimiento: no sé';
  const contextParts = [];
  if (selected('businessType')) contextParts.push(selected('businessType'));
  if (selected('teamSize')) contextParts.push(`${selected('teamSize')} personas`);
  if (selected('website')) contextParts.push(`sitio web: ${selected('website')}`);
  if (form.querySelector('input[name="dataTypes"]:checked')) contextParts.push(dataDescription);
  if (selected('webForms')) contextParts.push(formContext);
  if (selected('tracking')) contextParts.push(trackingContext);
  contextSummary.textContent = `Contexto (no altera el puntaje): ${contextParts.length ? contextParts.join('; ') : 'sin respuestas de contexto.'}`;

  const gaps = scores.filter((dimension) => dimension.score < dimension.max)
    .sort((a, b) => (a.score / a.max) - (b.score / b.max) || (b.max - b.score) - (a.max - a.score));
  const contextActions = getContextActions();
  const actions = [
    ...gaps.map((dimension) => ({
      title: dimension.title,
      explanation: dimension.action,
      relatedTool: dimension.relatedTool,
    })),
    ...contextActions,
  ];
  const actionList = document.querySelector('#action-list');
  actionList.replaceChildren();
  document.querySelector('#attention-empty').hidden = actions.length > 0;
  document.querySelector('#action-count').textContent = actions.length ? `${actions.length} por revisar` : 'Sin pendientes declarados';
  actions.forEach((action, index) => {
    const item = element('li', '', 'action-item');
    const priority = element('span', `0${index + 1}`, 'action-priority');
    const content = element('div', '', 'action-content');
    content.append(element('h5', action.title), element('p', action.explanation));
    item.append(priority, content);
    actionList.append(item);
  });

  form.hidden = true;
  resultsPanel.hidden = false;
  updateProgress(true);
  renderLivePanel({ announce: true });
  document.querySelector('#results-title').focus({ preventScroll: true });
  scrollTo(resultsPanel);
}

function saveDiagnosticBeforeCatalogNavigation() {
  const answers = {};
  form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
    answers[input.name] ??= [];
    if (input.checked) answers[input.name].push(input.value);
  });
  const selectedDataTypes = [...form.querySelectorAll('input[name="dataTypes"]:checked')].map((input) => input.value);
  const payload = {
    version: 1,
    answers,
    resultsReady: !resultsPanel.hidden,
    policyContext: {
      businessType: selected('businessType') || null,
      website: selected('website') || null,
      dataCategories: selectedDataTypes.filter((value) => value !== 'none'),
      noPersonalDataDeclared: selectedDataTypes.includes('none'),
      webForms: selected('webForms') || null,
      tracking: selected('tracking') || null,
    },
  };
  try {
    sessionStorage.setItem(diagnosticNavigationKey, JSON.stringify(payload));
  } catch {
    const status = document.querySelector('#policy-generator-status');
    status.textContent = 'Este navegador no permitió conservar las respuestas para volver al diagnóstico. La tarjeta del catálogo no recibe datos y el generador aún no está implementado.';
  }
}

function restoreDiagnosticAfterCatalogNavigation(event) {
  try {
    const raw = sessionStorage.getItem(diagnosticNavigationKey);
    if (!raw) return;
    sessionStorage.removeItem(diagnosticNavigationKey);
    if (event.persisted) return;
    const payload = JSON.parse(raw);
    if (payload.version !== 1 || !payload.answers) return;
    form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
      input.checked = payload.answers[input.name]?.includes(input.value) ?? false;
    });
    updateNoDataConfirmation();
    if (payload.resultsReady) {
      currentStep = steps.length - 1;
      furthestStep = Math.max(furthestStep, currentStep);
    }
    renderLivePanel();
    if (payload.resultsReady) renderResults();
  } catch {
    // Storage puede estar deshabilitado; el diagnóstico sigue funcionando en memoria.
  }
}

function answerLabel(name) {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  if (!input) return 'No informado';
  return input.closest('label')?.querySelector('strong')?.textContent.trim() ?? input.value;
}

function appendDocumentSection(title, rows) {
  const section = document.createElement('section');
  section.className = 'generated-document-section';
  section.append(element('h2', title));
  const list = document.createElement('dl');
  rows.forEach(([label, value]) => {
    list.append(element('dt', label), element('dd', value));
  });
  section.append(list);
  generatedDocument.append(section);
}

function buildContextSheet() {
  const date = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date());
  const subject = document.querySelector('#document-subject').value.trim();
  generatedDocument.replaceChildren();
  const header = element('header', '', 'generated-document-header');
  const brandLine = element('div', '', 'document-brandline');
  const brand = element('div', '', 'document-brand');
  const siteMark = document.querySelector('.brand-symbol');
  if (siteMark) brand.append(siteMark.cloneNode(true));
  brand.append(element('span', 'DOCFAST', 'document-brand-name'));
  brandLine.append(brand, element('p', `Generado el ${date}`, 'document-date'));
  header.append(brandLine);
  header.append(element('p', 'BORRADOR ORIENTATIVO', 'document-kicker'));
  header.append(element('h1', 'Ficha de contexto de gestión de datos'));
  header.append(element('p', 'Resumen descriptivo elaborado con la información declarada en el cuestionario. No incorpora el puntaje ni las recomendaciones del diagnóstico.', 'document-lede'));
  generatedDocument.append(header);
  const meta = document.createElement('dl');
  meta.className = 'document-meta';
  meta.append(element('dt', 'Organización o persona'), element('dd', subject));
  generatedDocument.append(meta);

  const selectedData = [...form.querySelectorAll('input[name="dataTypes"]:checked')].map((input) => input.value === 'none' ? 'No recopilo datos personales' : input.value);
  appendDocumentSection('1. Perfil declarado', [
    ['Actividad indicada', answerLabel('businessType')],
    ['Tamaño del equipo', answerLabel('teamSize')],
    ['Sitio web', answerLabel('website')],
  ]);
  appendDocumentSection('2. Categorías y canales declarados', [
    ['Categorías de datos', selectedData.length ? selectedData.join(', ') : 'No informado'],
    ['Formularios o canales web', answerLabel('webForms')],
    ['Cookies o herramientas de seguimiento', answerLabel('tracking')],
  ]);
  const practiceRows = [
    ['policy', 'Política de privacidad'],
    ['consent', 'Gestión del consentimiento'],
    ['register', 'Registro documentado de datos tratados'],
    ['rights', 'Procedimiento para solicitudes de personas'],
    ['training', 'Capacitación o persona responsable'],
    ['incidentPlan', 'Plan interno ante incidentes'],
  ].map(([key, label]) => [label, answerLabel(key)]);
  appendDocumentSection('3. Prácticas internas declaradas', practiceRows);
  generatedDocument.append(element('p', 'Esta ficha ordena las respuestas declaradas; la información no ha sido verificada. Es un borrador descriptivo de uso interno, no una política, registro legal, protocolo, asesoría legal, certificación ni garantía de cumplimiento.', 'document-disclaimer'));
}

function downloadContextSheetPdf() {
  const JsPdf = window.jspdf?.jsPDF;
  const announcer = document.querySelector('#live-announcer');
  if (!JsPdf) {
    announcer.textContent = 'No se pudo cargar el generador local del PDF. Recarga la página e inténtalo de nuevo.';
    return;
  }

  const pdf = new JsPdf({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const contentBottom = 276;
  const labelWidth = 52;
  const valueX = margin + labelWidth + 5;
  const valueWidth = contentWidth - labelWidth - 5;
  const ink = [35, 48, 67];
  const muted = [100, 114, 134];
  const accent = [174, 47, 66];
  const rule = [222, 227, 234];
  let y = 18;
  const date = generatedDocument.querySelector('.document-date')?.textContent.replace(/^Generado el\s*/i, '').trim() || '';

  pdf.setProperties({
    title: generatedDocument.querySelector('h1')?.textContent.trim() || 'Documento DOCFAST',
    subject: 'Documento generado por DOCFAST',
    author: 'DOCFAST',
    creator: 'DOCFAST',
  });
  pdf.setLineHeightFactor(1.25);

  const split = (text, width) => {
    const lines = pdf.splitTextToSize(String(text || 'No informado'), width);
    return Array.isArray(lines) ? lines : [lines];
  };
  const lineHeight = (fontSize) => fontSize * 0.36;
  const drawPageNumber = (page, total) => {
    pdf.setPage(page);
    pdf.setDrawColor(...rule);
    pdf.setLineWidth(0.25);
    pdf.line(margin, 284, pageWidth - margin, 284);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...muted);
    pdf.text(`DOCFAST  ·  ${page} / ${total}`, pageWidth - margin, 290, { align: 'right' });
  };
  const drawBrandLine = () => {
    pdf.setFillColor(...accent);
    pdf.roundedRect(margin, y, 10, 10, 2, 2, 'F');
    pdf.setFillColor(255, 198, 203);
    pdf.rect(margin + 2.2, y + 5.5, 1.2, 2.4, 'F');
    pdf.rect(margin + 4.4, y + 3.1, 1.2, 4.8, 'F');
    pdf.rect(margin + 6.6, y + 4.3, 1.2, 3.6, 'F');
    pdf.setTextColor(...ink);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('DOCFAST', margin + 14, y + 6.7);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...muted);
    pdf.text(date, pageWidth - margin, y + 6.5, { align: 'right' });
  };
  const newPage = () => {
    pdf.addPage();
    y = 18;
    drawBrandLine();
    pdf.setDrawColor(...rule);
    pdf.setLineWidth(0.25);
    pdf.line(margin, 33, pageWidth - margin, 33);
    y = 40;
  };

  // Marca vectorial: conserva el símbolo tipográfico del sitio con bordes nítidos.
  drawBrandLine();
  y = 39;

  const kicker = generatedDocument.querySelector('.document-kicker')?.textContent.trim();
  if (kicker) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...accent);
    pdf.text(kicker.toLocaleUpperCase('es-CL'), margin, y);
    y += 7;
  }

  const title = generatedDocument.querySelector('h1')?.textContent.trim() || 'Documento generado';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(21);
  pdf.setTextColor(...ink);
  const titleLines = split(title, contentWidth);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * lineHeight(21) + 3;

  const lede = generatedDocument.querySelector('.document-lede')?.textContent.trim();
  if (lede) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...muted);
    const ledeLines = split(lede, contentWidth);
    pdf.text(ledeLines, margin, y);
    y += ledeLines.length * lineHeight(9.5) + 5;
  }

  const subjectMeta = generatedDocument.querySelector('.document-meta');
  if (subjectMeta) {
    const label = subjectMeta.querySelector('dt')?.textContent.trim() || 'Organización o persona';
    const value = subjectMeta.querySelector('dd')?.textContent.trim() || 'Pendiente';
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    const valueLines = split(value, contentWidth - 43);
    const boxHeight = Math.max(17, valueLines.length * lineHeight(9.5) + 8);
    pdf.setFillColor(247, 248, 250);
    pdf.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...muted);
    pdf.text(split(label, 40), margin + 4, y + 6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...ink);
    pdf.text(valueLines, margin + 45, y + 6.5);
    y += boxHeight + 6;
  }

  const sections = [...generatedDocument.querySelectorAll('.generated-document-section')];
  sections.forEach((section) => {
    const heading = section.querySelector('h2')?.textContent.trim() || '';
    const rows = [...section.querySelectorAll('dt')].map((label) => {
      const value = label.nextElementSibling;
      return [label.textContent.trim(), value?.textContent.trim() || 'Pendiente'];
    });
    const firstRow = rows[0];
    let firstHeight = 0;
    if (firstRow) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const labelLines = split(firstRow[0], labelWidth);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      const valueLines = split(firstRow[1], valueWidth);
      firstHeight = Math.max(labelLines.length, valueLines.length) * lineHeight(9.5) + 6;
    }
    if (y + 11 + firstHeight > contentBottom) newPage();

    const drawSectionHeading = (continued = false) => {
      const headingText = continued ? `${heading} · continuación` : heading;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(continued ? 9 : 11);
      pdf.setTextColor(...accent);
      const headingLines = split(headingText, contentWidth);
      pdf.text(headingLines, margin, y + 4);
      y += headingLines.length * lineHeight(continued ? 9 : 11) + 3;
      pdf.setDrawColor(...rule);
      pdf.setLineWidth(0.25);
      pdf.line(margin, y, margin + contentWidth, y);
      y += 2;
    };
    drawSectionHeading();

    rows.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const labelLines = split(label, labelWidth);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      const valueLines = split(value, valueWidth);
      const rowHeight = Math.max(labelLines.length * lineHeight(9), valueLines.length * lineHeight(9.5)) + 5.5;
      if (y + rowHeight > contentBottom) {
        newPage();
        drawSectionHeading(true);
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      pdf.text(labelLines, margin, y + 3.7);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(...ink);
      pdf.text(valueLines, valueX, y + 3.7);
      y += rowHeight;
      pdf.setDrawColor(...rule);
      pdf.setLineWidth(0.18);
      pdf.line(margin, y, margin + contentWidth, y);
    });
    y += 4.5;
  });

  const disclaimer = generatedDocument.querySelector('.document-disclaimer')?.textContent.trim();
  if (disclaimer) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    const disclaimerLines = split(disclaimer, contentWidth - 7);
    const boxHeight = disclaimerLines.length * lineHeight(8.5) + 7;
    if (y + boxHeight > contentBottom) newPage();
    pdf.setFillColor(250, 246, 247);
    pdf.rect(margin, y, 1, boxHeight, 'F');
    pdf.setTextColor(...muted);
    pdf.text(disclaimerLines, margin + 4, y + 4.5);
  }

  const pages = pdf.getNumberOfPages();
  if (pages > 1) {
    for (let page = 1; page <= pages; page += 1) drawPageNumber(page, pages);
  }

  const dateSuffix = new Intl.DateTimeFormat('sv-SE').format(new Date());
  const subjectSlug = (document.querySelector('#document-subject').value || 'documento')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42);
  pdf.save(`docfast-${subjectSlug || 'documento'}-${dateSuffix}.pdf`);
  announcer.textContent = 'PDF limpio descargado. Contiene únicamente el documento generado.';
}

function openDocumentBuilder() {
  resultsPanel.hidden = true;
  form.hidden = true;
  documentPreview.hidden = true;
  documentBuilder.hidden = false;
  questionnaireCard.classList.add('document-mode');
  liveDiagnostic.hidden = true;
  questionnaireHeading.hidden = true;
  document.querySelector('#document-builder-title').focus({ preventScroll: true });
  scrollTo(documentBuilder);
}

function showDocumentPreview(event) {
  event.preventDefault();
  const typeSelect = document.querySelector('#document-type');
  const subjectInput = document.querySelector('#document-subject');
  const error = document.querySelector('#document-form-error');
  if (typeSelect.value !== 'context-sheet') {
    error.textContent = 'Elige la ficha disponible para definir la estructura que se generará.';
    error.hidden = false;
    typeSelect.focus();
    return;
  }
  if (!subjectInput.value.trim()) {
    error.textContent = 'Escribe el nombre de la organización o persona. La ficha lo necesita para identificar a quién corresponden estos datos.';
    error.hidden = false;
    subjectInput.focus();
    return;
  }
  error.hidden = true;
  buildContextSheet();
  documentBuilder.hidden = true;
  documentPreview.hidden = false;
  document.querySelector('#document-preview-title').focus({ preventScroll: true });
  scrollTo(documentPreview);
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-document');
});

form.querySelectorAll('input[name="dataTypes"]').forEach((input) => input.addEventListener('change', () => {
  const noData = form.querySelector('input[name="dataTypes"][value="none"]');
  const types = [...form.querySelectorAll('input[name="dataTypes"]')];
  if (input.value === 'none' && input.checked) {
    types.filter((type) => type !== noData).forEach((type) => { type.checked = false; });
  } else if (input.checked) {
    noData.checked = false;
  }
  updateNoDataConfirmation();
}));

form.addEventListener('change', (event) => {
  const group = event.target.closest('.question-group');
  if (group) {
    const answered = [...group.querySelectorAll('input')].some((control) => control.checked);
    if (answered) {
      group.querySelector('.question-error').hidden = true;
      group.setAttribute('aria-invalid', 'false');
      group.querySelectorAll('input').forEach((control) => control.removeAttribute('aria-invalid'));
    }
  }
  if (currentStep === 1 && (event.target.name === 'webForms' || event.target.name === 'tracking')) updateNoDataConfirmation();
  if (!stepError.hidden) {
    stepError.hidden = true;
    stepError.textContent = '';
  }
  renderLivePanel({ announce: true });
});

nextButton.addEventListener('click', () => {
  noteUnansweredQuestions();
  if (currentStep === steps.length - 1) {
    renderResults();
    return;
  }
  showStep(currentStep + 1);
});

previousButton.addEventListener('click', () => showStep(currentStep - 1));
document.querySelector('#review-button').addEventListener('click', () => showStep(0));
document.querySelector('#policy-generator-cta').addEventListener('click', saveDiagnosticBeforeCatalogNavigation);
document.querySelector('#generate-document-button').addEventListener('click', openDocumentBuilder);
documentForm.addEventListener('submit', showDocumentPreview);
document.querySelector('#download-document-button').addEventListener('click', downloadContextSheetPdf);
document.querySelector('#back-to-diagnostic-button').addEventListener('click', () => {
  documentBuilder.hidden = true;
  resultsPanel.hidden = false;
  questionnaireCard.classList.remove('document-mode');
  liveDiagnostic.hidden = false;
  questionnaireHeading.hidden = false;
  document.querySelector('#results-title').focus({ preventScroll: true });
  scrollTo(resultsPanel);
});
document.querySelector('#print-document-button').addEventListener('click', () => {
  document.body.classList.add('printing-document');
  document.querySelector('#live-announcer').textContent = 'Se abrirá la impresión del documento. Para evitar encabezados del navegador, desactiva Encabezados y pies de página en sus opciones.';
  window.print();
});
document.querySelector('#edit-document-button').addEventListener('click', () => {
  documentPreview.hidden = true;
  documentBuilder.hidden = false;
  document.querySelector('#document-builder-title').focus({ preventScroll: true });
  scrollTo(documentBuilder);
});
document.querySelector('#edit-diagnostic-from-document-button').addEventListener('click', () => showStep(0));
document.querySelector('#reset-button').addEventListener('click', () => {
  try { sessionStorage.removeItem(diagnosticNavigationKey); } catch { /* Storage is optional. */ }
  form.reset();
  documentForm.reset();
  generatedDocument.replaceChildren();
  document.querySelector('#document-form-error').hidden = true;
  form.querySelectorAll('[aria-invalid]').forEach((control) => control.removeAttribute('aria-invalid'));
  form.querySelectorAll('.question-error').forEach((error) => { error.hidden = true; });
  stepError.hidden = true;
  stepError.textContent = '';
  currentStep = 0;
  furthestStep = 0;
  updateNoDataConfirmation();
  renderLivePanel({ announce: true });
  showStep(0);
});

window.addEventListener('pageshow', restoreDiagnosticAfterCatalogNavigation);

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
  mainNav.classList.toggle('is-open', !expanded);
});
mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  mainNav.classList.remove('is-open');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    mainNav.classList.remove('is-open');
    menuToggle.focus();
  }
});

updateNoDataConfirmation();
updateProgress();
renderLivePanel();
