const form = document.querySelector('#arcop-form');
const steps = [...document.querySelectorAll('.arcop-step')];
const progressItems = [...document.querySelectorAll('#arcop-progress li')];
const progress = document.querySelector('#arcop-progress-track');
const progressFill = document.querySelector('#arcop-progress-fill');
const previousButton = document.querySelector('#arcop-previous');
const nextButton = document.querySelector('#arcop-next');
const stepError = document.querySelector('#arcop-step-error');
const result = document.querySelector('#arcop-result');
const documentOutput = document.querySelector('#arcop-document');
const multiplePicker = document.querySelector('#arcop-multiple-picker');
const channelFields = {
  email: document.querySelector('#arcop-email-wrap'),
  web: document.querySelector('#arcop-web-wrap'),
  inperson: document.querySelector('#arcop-inperson-wrap'),
};
let activeStep = 0;

function value(name) {
  return String(form.elements.namedItem(name)?.value ?? '').trim();
}

function selected(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
}

function checked(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function escapeHtml(input) {
  return String(input ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function updateConditionalFields() {
  const mode = selected('channelMode');
  multiplePicker.hidden = mode !== 'multiple';
  const channels = mode === 'multiple' ? checked('multiChannel') : mode ? [mode] : [];
  Object.entries(channelFields).forEach(([channel, wrapper]) => {
    wrapper.hidden = !channels.includes(channel);
    wrapper.querySelectorAll('input, textarea').forEach((control) => { control.required = channels.includes(channel); });
  });
  const usesSystem = selected('usesSystem');
  const systemWrap = document.querySelector('#arcop-system-wrap');
  const systemInput = document.querySelector('#arcop-system');
  systemWrap.hidden = usesSystem !== 'yes';
  systemInput.required = usesSystem === 'yes';
}

function updateProgress() {
  const position = activeStep + 1;
  progress.setAttribute('aria-valuenow', String(position));
  progress.setAttribute('aria-valuetext', `Paso ${position} de ${steps.length}`);
  progressFill.style.width = `${position * 25}%`;
  progressItems.forEach((item, index) => {
    if (index === activeStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    item.classList.toggle('is-complete', index < activeStep);
  });
  previousButton.disabled = activeStep === 0;
  nextButton.innerHTML = activeStep === steps.length - 1
    ? 'Generar protocolo <span aria-hidden="true">→</span>'
    : 'Siguiente <span aria-hidden="true">→</span>';
}

function showStep(index, focus = true) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== activeStep; });
  form.hidden = false;
  result.hidden = true;
  document.querySelector('#arcop-step-actions').hidden = false;
  stepError.hidden = true;
  updateConditionalFields();
  updateProgress();
  if (focus) {
    const heading = steps[activeStep].querySelector('h2');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }
}

function setError(errorId, control, message) {
  const error = document.querySelector(`#${errorId}`);
  if (!error) return;
  if (message) error.textContent = message;
  error.hidden = false;
  control?.setAttribute('aria-invalid', 'true');
}

function clearErrors() {
  form.querySelectorAll('.arcop-error').forEach((error) => { error.hidden = true; });
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  stepError.hidden = true;
}

function validateStep() {
  clearErrors();
  const invalidControls = [];
  const fail = (id, control, message) => { setError(id, control, message); if (control) invalidControls.push(control); };

  if (activeStep === 0) {
    const organization = document.querySelector('#arcop-organization');
    if (!organization.value.trim()) fail('arcop-organization-error', organization);
    const rutInput = document.querySelector('#arcop-rut');
    if (rutInput.value && !window.FolioxRut.isComplete(rutInput.value)) fail('arcop-rut-error', rutInput);
  }

  if (activeStep === 1) {
    const mode = selected('channelMode');
    if (!mode) fail('arcop-channel-mode-error', form.querySelector('input[name="channelMode"]'));
    if (mode === 'multiple' && checked('multiChannel').length < 2) fail('arcop-multiple-error', form.querySelector('input[name="multiChannel"]'));
    const channels = mode === 'multiple' ? checked('multiChannel') : mode ? [mode] : [];
    channels.forEach((channel) => {
      const control = channelFields[channel].querySelector('input, textarea');
      if (!control.value.trim()) fail(`arcop-${channel}-error`, control);
      else if (channel === 'email' && !control.validity.valid) fail('arcop-email-error', control, 'Ingresa una dirección de correo válida.');
    });
  }

  if (activeStep === 2) {
    const responsible = document.querySelector('#arcop-responsible');
    if (!responsible.value.trim()) fail('arcop-responsible-error', responsible);
    if (!selected('teamSize')) fail('arcop-team-size-error', form.querySelector('input[name="teamSize"]'));
    if (!selected('usesSystem')) fail('arcop-system-choice-error', form.querySelector('input[name="usesSystem"]'));
    const system = document.querySelector('#arcop-system');
    if (selected('usesSystem') === 'yes' && !system.value.trim()) fail('arcop-system-error', system);
  }

  if (activeStep === 3 && !checked('rights').length) fail('arcop-rights-error', form.querySelector('input[name="rights"]'));

  if (invalidControls.length) {
    stepError.hidden = false;
    invalidControls[0].focus();
    return false;
  }
  return true;
}

function channelLabel(key) {
  return ({ email: 'Correo electrónico', web: 'Formulario web', inperson: 'Atención presencial' })[key];
}

function channelDetail(key) {
  if (key === 'email') return value('email');
  if (key === 'web') return value('web');
  return value('inperson');
}

function renderDocument() {
  const org = escapeHtml(value('organization'));
  const rut = escapeHtml(value('rut') || 'No informado');
  const address = escapeHtml(value('address') || 'No informado');
  const mode = selected('channelMode');
  const channels = mode === 'multiple' ? checked('multiChannel') : [mode];
  const channelBlocks = channels.map((channel) => `<p><strong>${escapeHtml(channelLabel(channel))}:</strong> ${escapeHtml(channelDetail(channel))}</p>`).join('');
  const channelSummary = channels.map((channel) => `${channelLabel(channel)}: ${channelDetail(channel)}`).join(' · ');
  const responsible = escapeHtml(value('responsible'));
  const role = escapeHtml(value('role') || 'No informado');
  const teamSize = escapeHtml(selected('teamSize') || 'No informado');
  const systemUsed = selected('usesSystem') === 'yes';
  const systemText = systemUsed ? escapeHtml(value('systemDescription')) : 'La organización declara que la gestión es manual.';
  const rights = checked('rights');
  const rightsDefinitions = [
    ['Acceso', 'Confirmar si se tratan datos de la persona y, cuando corresponda, permitir el acceso a ellos y a la información prevista en la ley.', '¿Qué datos míos tratan y con qué finalidad?'],
    ['Rectificación', 'Solicitar la corrección o complemento de datos inexactos, desactualizados o incompletos.', 'Mi domicilio está desactualizado; solicito corregirlo.'],
    ['Supresión', 'Solicitar la eliminación de datos cuando concurra alguna causal legal.', 'Solicito revisar si corresponde suprimir estos datos.'],
    ['Oposición', 'Solicitar que no se realice un tratamiento determinado cuando se cumplan las causales legales.', 'Solicito revisar mi oposición a este tratamiento.'],
    ['Portabilidad', 'Solicitar una copia en formato electrónico estructurado, genérico y de uso común cuando se cumplan las condiciones legales.', 'Solicito una copia de mis datos en un formato que permita su traslado.'],
  ];
  const rightsRows = rightsDefinitions.map(([right, definition, example]) => `<tr><th scope="row">${escapeHtml(right)}</th><td>${escapeHtml(definition)}</td><td><em>“${escapeHtml(example)}”</em></td></tr>`).join('');
  const templates = {
    Acceso: 'Hemos recibido su solicitud relacionada con el derecho de acceso. Resultado y datos que se entregarán, si corresponde: ______________________________. Observaciones o información pendiente: _____________________.',
    Rectificación: 'Hemos recibido su solicitud de rectificación. Datos cuya corrección se solicita: ____________________. Resultado de la revisión y cambios realizados, si corresponde: ______________________________.',
    Supresión: 'Hemos recibido su solicitud de supresión. Datos o tratamiento indicados: ____________________. Resultado de la revisión y fundamentos que la organización deba comunicar, si corresponde: ______________________________.',
    Oposición: 'Hemos recibido su solicitud de oposición respecto del tratamiento indicado: ____________________. Resultado de la revisión y respuesta de la organización: ______________________________.',
    Portabilidad: 'Hemos recibido su solicitud relacionada con portabilidad. Datos comprendidos y formato de respuesta, si corresponde: ______________________________. Resultado y observaciones: ____________________.',
  };
  const templateSections = rights.map((right) => `<section class="arcop-template"><h3>Plantilla · ${escapeHtml(right)}</h3><p>Estimada/o ________________________:</p><p>${escapeHtml(templates[right])}</p><p>Canal para comunicar la respuesta: ____________________. Fecha de comunicación: ____________.</p><p>Organización: ${org}</p></section>`).join('');
  const generatedDate = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date());

  documentOutput.innerHTML = `
    <header class="arcop-doc-cover">
      <div><div class="arcop-doc-brand"><img src="img/Logotipo%20moderno%20FOLIOX%20Studio.png" alt="Logo FOLIOX Studio"><span>FOLIOX STUDIO · PROTOCOLO ARCOP</span></div><h1>${org}</h1><p>RUT: ${rut}</p><p>Domicilio: ${address}</p></div>
      <div class="arcop-doc-cover-meta"><span>Versión 1.0</span><span>Generado: ${escapeHtml(generatedDate)}</span><span>Responsable: ${responsible}</span></div>
    </header>
    <section><h2>1. Objeto y Alcance</h2>
      <p>Este protocolo describe cómo <strong>${org}</strong> recibe, tramita y revisa las solicitudes de derechos de las personas titulares. Organiza una guía interna para registrar, evaluar y preparar respuestas a solicitudes de acceso, rectificación, supresión, oposición y portabilidad.</p>
      <p class="arcop-doc-note arcop-doc-note-legal"><strong>📋 Referencia legal:</strong> artículos 4 a 11 de la Ley N.º 21.719. Su entrada en vigor general está prevista para el 1 de diciembre de 2026. El artículo 11 establece un plazo de respuesta de 30 días corridos, prorrogable una sola vez hasta por otros 30 días corridos. Revisa la vigencia y las disposiciones transitorias aplicables a cada solicitud.</p>
    </section>

    <section><h2>2. Derechos Reconocidos</h2>
      <table class="arcop-doc-table arcop-rights-table"><thead><tr><th>Derecho</th><th>Definición general</th><th>Ejemplo de solicitud</th></tr></thead><tbody>${rightsRows}</tbody></table>
      <p class="arcop-doc-note">La ley contempla además el bloqueo temporal. La selección de derechos en esta herramienta controla qué plantillas se incluyen más adelante; no determina la procedencia de una solicitud.</p>
    </section>

    <section><h2>3. Canal de Recepción</h2>
      <p>La organización declara los siguientes medios para recibir solicitudes:</p>
      <div class="arcop-doc-note arcop-doc-channel">${channelBlocks}</div>
      <p>Al recibir una solicitud, registra el canal, fecha, derecho o materia indicada y antecedentes necesarios para su revisión. Limita el acceso a quienes participan en la gestión y confirma recepción cuando corresponda.</p>
    </section>

    <section><h2>4. Responsable Interno</h2>
      <table class="arcop-doc-table arcop-doc-responsible-table"><tbody><tr><th>Nombre del encargado</th><td>${responsible}</td></tr><tr><th>Cargo</th><td>${role}</td></tr><tr><th>Canal de contacto declarado</th><td>${escapeHtml(channelSummary || 'No informado')}</td></tr><tr><th>N.º de personas que manejan datos</th><td>${teamSize}</td></tr><tr><th>Sistema de gestión</th><td>${systemText}</td></tr></tbody></table>
    </section>

    <section><h2>5. Flujo de Tramitación</h2>
      <ol class="arcop-doc-flow"><li><strong>Recepción y registro</strong><p>Identifica el canal, registra la fecha y conserva los antecedentes necesarios para gestionar la solicitud.</p></li><li><strong>Verificación y antecedentes</strong><p>Revisa la identidad o representación y solicita antecedentes adicionales cuando sean necesarios para comprender la solicitud.</p></li><li><strong>Evaluación</strong><p>Precisa el derecho o materia indicada, reúne información de las áreas pertinentes y revisa las reglas vigentes y excepciones aplicables.</p></li><li><strong>Preparación de respuesta</strong><p>Prepara una respuesta individualizada, comprueba su exactitud y utiliza la plantilla pertinente como borrador.</p></li><li><strong>Comunicación</strong><p>Comunica la respuesta por el medio que corresponda y conserva constancia de su envío y contenido.</p></li><li><strong>Cierre del registro</strong><p>Actualiza el estado del caso y registra el resultado de la gestión.</p></li></ol>
      <p class="arcop-doc-note arcop-doc-note-deadline"><strong>⚠️ Plazo legal:</strong> cuando resulte aplicable el artículo 11 de la Ley N.º 21.719, el responsable debe pronunciarse en 30 días corridos desde el ingreso; el plazo puede prorrogarse una vez hasta por 30 días corridos. Confirma la fecha de vigencia y las reglas transitorias antes de usarlo.</p>
    </section>

    <section><h2>6. Plantillas de Respuesta</h2>
      <p>Completa las líneas con información verificada antes de comunicar una respuesta. Estas plantillas no anticipan el resultado de la revisión.</p>
      ${templateSections}
    </section>

    <section><h2>7. Registro / Log de Solicitudes</h2>
      <p>Completa una fila por cada solicitud recibida y conserva el registro de forma segura.</p>
      <table class="arcop-doc-table arcop-log-table"><thead><tr><th>N.º</th><th>Fecha recepción</th><th>Nombre titular</th><th>RUT titular</th><th>Derecho ejercido</th><th>Canal</th><th>Resolución</th><th>Fecha respuesta</th></tr></thead><tbody>${Array.from({ length: 5 }, (_, index) => `<tr><td>${index + 1}</td>${Array.from({ length: 7 }, () => '<td>&nbsp;</td>').join('')}</tr>`).join('')}</tbody></table>
    </section>

    <section><h2>8. Denegación de Solicitudes</h2>
      <p>Si se evalúa una denegación total o parcial, documenta los antecedentes y el fundamento legal específico que corresponda. La respuesta debe explicar la decisión y comunicar las vías de reclamación que procedan según la normativa aplicable.</p>
      <p class="arcop-doc-note">Esta plantilla no define un catálogo de causales de denegación ni decide si una solicitud procede. Verifica el artículo 11 y las reglas vigentes para la fecha del caso.</p>
    </section>

    <section><h2>9. Revisión del Protocolo</h2>
      <p>Revisa y actualiza este protocolo:</p><ul><li>Cuando cambie la normativa aplicable.</li><li>Cuando cambien los canales, responsables, sistemas o procesos.</li><li>Después de incidentes, reclamos o cambios relevantes en la gestión de solicitudes.</li></ul>
      <p class="arcop-doc-note arcop-doc-note-footer">Documento generado a partir de la información declarada por la organización. Es una guía editable, no constituye asesoría legal ni garantiza cumplimiento.</p>
      <h3>Referencias oficiales</h3><ul><li><a href="https://www.leychile.cl/N?i=141599&t=2023-05-09" target="_blank" rel="noopener noreferrer">Ley N.º 19.628, texto vigente hasta el 30 de noviembre de 2026.</a></li><li><a href="https://www.leychile.cl/N?i=1209272&t=2026-12-01" target="_blank" rel="noopener noreferrer">Ley N.º 21.719, versión con vigencia diferida al 1 de diciembre de 2026.</a></li></ul>
    </section>`;
}

function generateProtocol() {
  renderDocument();
  form.hidden = true;
  document.querySelector('#arcop-step-actions').hidden = true;
  result.hidden = false;
  updateProgress();
  result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  document.querySelector('#arcop-result-title').focus({ preventScroll: true });
}

document.querySelectorAll('input[name="channelMode"], input[name="multiChannel"], input[name="usesSystem"]').forEach((control) => control.addEventListener('change', () => {
  updateConditionalFields();
  if (control.name === 'channelMode') {
    document.querySelector('#arcop-channel-mode-error').hidden = Boolean(selected('channelMode'));
    form.querySelectorAll('input[name="channelMode"]').forEach((input) => input.removeAttribute('aria-invalid'));
  }
  if (control.name === 'multiChannel' && checked('multiChannel').length >= 2) {
    document.querySelector('#arcop-multiple-error').hidden = true;
    form.querySelectorAll('input[name="multiChannel"]').forEach((input) => input.removeAttribute('aria-invalid'));
  }
  if (control.name === 'usesSystem' && selected('usesSystem')) {
    document.querySelector('#arcop-system-choice-error').hidden = true;
    form.querySelectorAll('input[name="usesSystem"]').forEach((input) => input.removeAttribute('aria-invalid'));
  }
}));
document.querySelectorAll('input[name="teamSize"]').forEach((control) => control.addEventListener('change', () => {
  document.querySelector('#arcop-team-size-error').hidden = true;
  form.querySelectorAll('input[name="teamSize"]').forEach((input) => input.removeAttribute('aria-invalid'));
}));
document.querySelectorAll('input[name="rights"]').forEach((control) => control.addEventListener('change', () => {
  if (!checked('rights').length) return;
  document.querySelector('#arcop-rights-error').hidden = true;
  form.querySelectorAll('input[name="rights"]').forEach((input) => input.removeAttribute('aria-invalid'));
}));
document.querySelectorAll('#arcop-form input, #arcop-form textarea').forEach((control) => {
  control.addEventListener('input', () => {
    control.removeAttribute('aria-invalid');
    const error = control.closest('.arcop-field')?.querySelector('.arcop-error');
    if (error) error.hidden = true;
  });
});

nextButton.addEventListener('click', () => {
  if (!validateStep()) return;
  if (activeStep === steps.length - 1) { generateProtocol(); return; }
  showStep(activeStep + 1);
});
form.addEventListener('submit', (event) => { event.preventDefault(); nextButton.click(); });
previousButton.addEventListener('click', () => { if (activeStep > 0) showStep(activeStep - 1); });
document.querySelector('#arcop-edit').addEventListener('click', () => showStep(steps.length - 1));
document.querySelector('#arcop-print').addEventListener('click', () => window.print());
document.querySelector('#arcop-reset').addEventListener('click', () => {
  if (!window.confirm('¿Quieres borrar las respuestas y empezar un protocolo nuevo?')) return;
  form.reset();
  documentOutput.replaceChildren();
  clearErrors();
  showStep(0);
});

updateConditionalFields();
updateProgress();
