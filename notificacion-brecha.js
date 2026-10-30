const form = document.querySelector('#notification-form');
const steps = [...form.querySelectorAll('.notification-step')];
const progressItems = [...document.querySelectorAll('#notification-progress li')];
const progressTrack = document.querySelector('.notification-progress-track');
const progressFill = document.querySelector('#notification-progress-fill');
const nextButton = document.querySelector('#notification-next');
const previousButton = document.querySelector('#notification-previous');
const stepError = document.querySelector('#notification-step-error');
const successPanel = document.querySelector('#notification-success');
const generatedCard = document.querySelector('#notification-generated-card');
const output = document.querySelector('#notification-document');
let activeStep = 0;

const field = (name) => form.elements.namedItem(name);
const value = (name) => String(field(name)?.value || '').trim();
const checkedValues = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
const selected = (name) => checkedValues(name)[0] || '';
const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const display = (text) => text ? esc(text).replace(/\n/g, '<br>') : '';
const documentRow = (label, content) => content ? `<div class="notification-doc-row"><dt>${esc(label)}</dt><dd>${content}</dd></div>` : '';
const textRow = (label, name) => documentRow(label, display(value(name)));

function updateProgress() {
  progressItems.forEach((item, index) => {
    item.toggleAttribute('aria-current', index === activeStep);
    if (index === activeStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    item.classList.toggle('is-complete', index < activeStep);
  });
  progressTrack.setAttribute('aria-valuenow', String(activeStep + 1));
  progressTrack.setAttribute('aria-valuetext', `Paso ${activeStep + 1} de ${steps.length}`);
  progressFill.style.width = `${((activeStep + 1) / steps.length) * 100}%`;
  previousButton.disabled = activeStep === 0;
  nextButton.textContent = activeStep === steps.length - 1 ? 'Generar notificación' : 'Siguiente →';
}

function showStep(index) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== activeStep; });
  stepError.hidden = true;
  updateProgress();
  steps[activeStep].querySelector('h2')?.focus({ preventScroll: true });
  steps[activeStep].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function setError(id, control, message) {
  const error = document.getElementById(id);
  if (!error) return;
  if (message) error.textContent = message;
  error.hidden = false;
  control?.setAttribute('aria-invalid', 'true');
  if (control) invalid.push(control);
}

let invalid = [];
function validateStep() {
  invalid = [];
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  form.querySelectorAll('.notification-error').forEach((error) => { error.hidden = true; });
  stepError.hidden = true;

  if (activeStep === 0) {
    if (!value('company')) setError('notification-company-error', field('company'));
    if (value('rut') && !window.FolioxRut.isComplete(value('rut'))) setError('notification-rut-error', field('rut'));
    const email = field('email');
    if (value('email') && !email.validity.valid) setError('notification-email-error', email);
  } else if (activeStep === 1) {
    if (!value('detected')) setError('notification-detected-error', field('detected'));
  } else if (activeStep === 2) {
    for (const [name, errorId, unavailableName] of [
      ['people', 'notification-people-error', 'peopleUnavailable'],
      ['records', 'notification-records-error', 'recordsUnavailable'],
    ]) {
      const input = field(name);
      if (field(unavailableName).checked) continue;
      if (input.validity.badInput || input.validity.stepMismatch || input.validity.rangeUnderflow) {
        setError(errorId, input);
        continue;
      }
      if (input.value === '') continue;
      const n = Number(input.value);
      if (!Number.isSafeInteger(n) || n < 0) setError(errorId, input);
    }
  }

  if (invalid.length) {
    stepError.hidden = false;
    invalid[0].focus();
    return false;
  }
  return true;
}

function toggleUnavailable(inputId, checkboxId) {
  const input = document.getElementById(inputId);
  const checkbox = document.getElementById(checkboxId);
  checkbox.addEventListener('change', () => {
    input.disabled = checkbox.checked;
    if (checkbox.checked) input.value = '';
    input.removeAttribute('aria-invalid');
    document.getElementById(`${inputId}-error`)?.setAttribute('hidden', '');
  });
}

toggleUnavailable('notification-people', 'notification-people-unavailable');
toggleUnavailable('notification-records', 'notification-records-unavailable');

function formatDate(raw) {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(date);
}

function countValue(name, unavailableId) {
  if (document.getElementById(unavailableId).checked) return 'No disponible';
  return value(name) ? esc(value(name)) : '';
}

function buildDocument() {
  const categories = checkedValues('categories');
  const categoryList = categories.length ? `<h3>Categorías</h3><ul>${categories.map((category) => `<li>${esc(category)}</li>`).join('')}</ul>` : '';
  const date = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date());
  const under14 = selected('under14');
  const status = selected('status');
  const notify = selected('notifyPeople');
  const cause = value('cause') ? esc(field('cause').selectedOptions[0].textContent) : '';
  const people = countValue('people', 'notification-people-unavailable');
  const records = countValue('records', 'notification-records-unavailable');
  const detected = display(formatDate(value('detected')));
  const occurred = display(formatDate(value('occurred')));
  const consequences = textRow('Posibles consecuencias declaradas', 'consequences');
  const measures = textRow('Medidas adoptadas declaradas', 'measures');
  const planned = textRow('Medidas adicionales planificadas', 'planned');
  const timing = textRow('Estimación de tiempo para comunicar a titulares', 'timing');
  const identityRows = [
    documentRow('Razón social', display(value('company'))), textRow('RUT', 'rut'),
    textRow('Domicilio', 'address'), textRow('Sector / industria', 'sector'),
    textRow('DPO o representante', 'representative'), textRow('Cargo', 'role'),
    textRow('Email', 'email'), textRow('Teléfono', 'phone'),
  ].join('');
  const incidentRows = [
    documentRow('Fecha y hora de detección', detected),
    documentRow('Fecha y hora estimada de ocurrencia', occurred),
    documentRow('Estado actual declarado', display(status)),
  ].join('');
  const dataRows = [
    documentRow('Titulares afectados (estimación)', people),
    documentRow('Registros comprometidos (estimación)', records),
    documentRow('Datos de niños o niñas menores de 14 años', display(under14)),
  ].join('');
  const natureContent = `${documentRow('Causa probable declarada', cause)}<p class="notification-doc-definition">El artículo 14 sexies describe estas vulneraciones como destrucción, filtración, pérdida o alteración accidental o ilícita de datos, o comunicación o acceso no autorizados. Esta descripción legal no determina por sí sola que el incidente informado cumpla las condiciones para reportarlo.</p>`;
  const measureRows = [measures, planned].join('');
  const communicationRows = [
    documentRow('Decisión declarada de comunicar a las personas afectadas', display(notify)),
    timing,
  ].join('');
  const legalContent = `
      <p>El artículo 14 sexies de la Ley 21.719 dispone que el responsable comunique a la Agencia, por los medios más expeditos posibles y sin dilaciones indebidas, las vulneraciones que generen un riesgo razonable para los derechos y libertades de las personas. La norma no establece un plazo general de 72 horas. El reporte debe describir, entre otros antecedentes, la naturaleza de la vulneración, sus efectos, las categorías y el número aproximado de titulares afectados y las medidas adoptadas para gestionarla y prevenir nuevos incidentes.</p>
      <p>La misma disposición contempla comunicación a las personas afectadas en los supuestos que señala, incluidos datos sensibles, datos relativos a niños, niñas o adolescentes y datos económicos, financieros, bancarios o comerciales relativos a obligaciones. La evaluación concreta depende de los hechos, la fecha y el régimen aplicable.</p>
      <p>La Ley 21.719 entra en vigor el 1 de diciembre de 2026 conforme a su disposición transitoria primera. Este borrador no evalúa las reglas aplicables a hechos anteriores, no concluye que exista una vulneración reportable ni determina si procede informar a titulares.</p>
      <p><a href="https://www.bcn.cl/leychile/navegar?idNorma=1209272">Ley 21.719 en Ley Chile · texto oficial consultado el 27 de octubre de 2026</a>.</p>`;
  const documentSections = [
    { title: 'Identificación del responsable', content: identityRows ? `<dl>${identityRows}</dl>` : '', always: true },
    { title: 'Identificación de la vulneración', content: incidentRows ? `<dl>${incidentRows}</dl>` : '', always: true },
    { title: 'Naturaleza de la vulneración', content: natureContent, always: true },
    { title: 'Categorías de datos y volumen aproximado', content: `${categoryList}${dataRows ? `<dl>${dataRows}</dl>` : ''}` },
    { title: 'Posibles consecuencias para los titulares', content: consequences ? `<dl>${consequences}</dl>` : '' },
    { title: 'Medidas técnicas y organizativas', content: measureRows ? `<dl>${measureRows}</dl>` : '' },
    { title: 'Comunicación a las personas afectadas', content: communicationRows ? `<dl>${communicationRows}</dl>` : '' },
    { title: 'Referencia normativa y alcance del borrador', content: legalContent, always: true },
  ].filter((section) => section.always || section.content.trim());
  const sectionsMarkup = documentSections.map((section, index) => `<section class="notification-doc-section"><h2>${index + 1}. ${section.title}</h2>${section.content}</section>`).join('');

  output.innerHTML = `
    <header class="notification-doc-header">
      <div class="notification-doc-brand-row">
        <img class="notification-doc-logo" src="img/Logotipo%20moderno%20FOLIOX%20Studio.png" alt="">
        <div class="notification-doc-brand"><strong>FOLIOX Studio</strong><span>Borrador para revisión</span></div>
      </div>
      <h1>Notificación de vulneración a las medidas de seguridad</h1>
      <p class="notification-doc-subtitle">Antecedentes para revisar una eventual comunicación a la Agencia de Protección de Datos Personales</p>
      <div class="notification-doc-meta-grid"><div><span>Responsable</span><strong>${display(value('company'))}</strong></div><div><span>Fecha de generación</span><strong>${esc(date)}</strong></div></div>
    </header>
    <p class="notification-doc-note"><strong>Documento para revisión.</strong> Se construyó con información ingresada por el usuario, sin verificación independiente. No se ha enviado a la Agencia ni a las personas afectadas.</p>
    <p><strong>Destinatario de referencia:</strong> Agencia de Protección de Datos Personales. La identificación como destinatario no implica que se haya determinado que el reporte proceda.</p>
    ${sectionsMarkup}
    <p class="notification-doc-footer">Verifica la exactitud de los antecedentes, el régimen aplicable y el canal oficial antes de utilizar este borrador.</p>`;
}

function generate() {
  buildDocument();
  form.hidden = true;
  document.querySelector('#notification-step-actions').hidden = true;
  successPanel.hidden = false;
  generatedCard.hidden = false;
  document.querySelector('#notification-success-title').focus({ preventScroll: true });
  successPanel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

form.addEventListener('input', (event) => {
  const error = event.target.closest('.notification-field')?.querySelector('.notification-error');
  if (error) error.hidden = true;
  event.target.removeAttribute('aria-invalid');
});
form.addEventListener('change', (event) => {
  const error = event.target.closest('.notification-field')?.querySelector('.notification-error');
  if (error) error.hidden = true;
  event.target.removeAttribute('aria-invalid');
});
nextButton.addEventListener('click', () => {
  if (!validateStep()) return;
  if (activeStep === steps.length - 1) generate();
  else showStep(activeStep + 1);
});
form.addEventListener('submit', (event) => { event.preventDefault(); nextButton.click(); });
previousButton.addEventListener('click', () => { if (activeStep > 0) showStep(activeStep - 1); });
document.querySelector('#notification-print').addEventListener('click', () => window.print());
document.querySelector('#notification-edit').addEventListener('click', () => {
  successPanel.hidden = true;
  generatedCard.hidden = true;
  form.hidden = false;
  document.querySelector('#notification-step-actions').hidden = false;
  showStep(3);
});
document.querySelector('#notification-new').addEventListener('click', () => {
  if (!window.confirm('Se borrarán las respuestas de esta notificación en esta sesión. ¿Quieres comenzar una nueva?')) return;
  form.reset();
  document.querySelector('#notification-people').disabled = false;
  document.querySelector('#notification-records').disabled = false;
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  form.querySelectorAll('.notification-error').forEach((error) => { error.hidden = true; });
  output.replaceChildren();
  successPanel.hidden = true;
  generatedCard.hidden = true;
  form.hidden = false;
  document.querySelector('#notification-step-actions').hidden = false;
  showStep(0);
});

updateProgress();
