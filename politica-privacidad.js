const form = document.querySelector('#policy-form');
const steps = [...document.querySelectorAll('.policy-step')];
const labels = [...document.querySelectorAll('.policy-step-labels li')];
const previousButton = document.querySelector('#policy-previous');
const nextButton = document.querySelector('#policy-next');
const progressFill = document.querySelector('#policy-progress-fill');
const progressTrack = document.querySelector('#policy-progress-track');
const previewPanel = document.querySelector('#policy-preview-panel');
const documentNode = document.querySelector('#policy-document');
const navKey = 'docfast.diagnostic-navigation.v1';
const names = ['Tu negocio', 'Datos personales', 'Finalidades', 'Terceros y almacenamiento'];
let activeStep = 0;

const field = (name) => form.elements.namedItem(name);
const value = (name) => field(name)?.value?.trim() || '';
const selected = (name) => [...form.querySelectorAll('input[name="' + name + '"]:checked')].map((input) => input.value);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function updateConditionals() {
  const set = (id, show) => { document.querySelector('#' + id).hidden = !show; };
  set('business-type-other-wrap', value('businessType') === 'Otro');
  field('businessTypeOther').required = value('businessType') === 'Otro';
  set('data-other-wrap', selected('dataCategories').includes('Otros'));
  field('dataOther').required = selected('dataCategories').includes('Otros');
  set('subjects-other-wrap', selected('dataSubjects').includes('Otros'));
  field('subjectsOther').required = selected('dataSubjects').includes('Otros');
  set('purposes-other-wrap', selected('purposes').includes('Otras'));
  field('purposesOther').required = selected('purposes').includes('Otras');
  const recipients = selected('recipients');
  set('recipients-other-wrap', recipients.includes('Otros'));
  field('recipientsOther').required = recipients.includes('Otros');
  set('international-details-wrap', value('international') === 'yes');
  set('retention-years-wrap', value('retention') === 'years');
  field('retentionYears').required = value('retention') === 'years';
  const noShare = form.querySelector('input[name="recipients"][value="No compartimos datos con terceros"]');
  const conflict = noShare.checked && recipients.length > 1;
  if (conflict) noShare.setAttribute('aria-invalid', 'true');
  else noShare.removeAttribute('aria-invalid');
  const recipientError = document.querySelector('#error-recipients');
  if (conflict) {
    recipientError.textContent = '“No compartimos datos” no se puede combinar con proveedores, socios u otros destinatarios. Corrige la selección.';
    recipientError.hidden = false;
  } else if (recipients.length) {
    recipientError.hidden = true;
  }
}

function updateStepper(final = false) {
  const position = final ? 4 : activeStep + 1;
  document.querySelector('#policy-step-count').textContent = final ? 'Formulario completo' : 'Paso ' + position + ' de 4';
  document.querySelector('#policy-step-name').textContent = final ? 'Vista previa' : names[activeStep];
  progressTrack.setAttribute('aria-valuenow', String(position));
  progressFill.style.width = (position * 25) + '%';
  labels.forEach((item, index) => {
    if ((!final && index === activeStep) || (final && index === 3)) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    item.classList.toggle('is-complete', final || index < activeStep);
  });
  previousButton.disabled = activeStep === 0 || final;
  nextButton.innerHTML = activeStep === 3 ? 'Revisar borrador <span aria-hidden="true">→</span>' : 'Siguiente <span aria-hidden="true">→</span>';
}

function showStep(index) {
  activeStep = Math.max(0, Math.min(index, 3));
  steps.forEach((item, i) => { item.hidden = i !== activeStep; });
  form.hidden = false;
  previewPanel.hidden = true;
  document.querySelector('#policy-step-error').hidden = true;
  updateStepper();
  steps[activeStep].querySelector('h3').focus({ preventScroll: true });
  steps[activeStep].scrollIntoView({ behavior: reduced(), block: 'nearest' });
}

function clearErrors() {
  steps[activeStep].querySelectorAll('.field-error').forEach((error) => { error.hidden = true; });
  steps[activeStep].querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
}
function mark(control, errorId) {
  const error = document.querySelector('#' + errorId);
  const target = control || error?.closest('fieldset')?.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
  target?.setAttribute('aria-invalid', 'true');
  if (error) error.hidden = false;
}

function rutValidation(raw) {
  if (raw === '') return { valid: true, reason: 'empty' };
  return window.FolioxRut.isComplete(raw)
    ? { valid: true, reason: '' }
    : { valid: false, reason: 'format' };
}

function updateRutNotice() {
  const input = field('businessRut');
  const notice = document.querySelector('#error-business-rut');
  const result = rutValidation(input.value);
  if (!input.value) {
    if (input.required) {
      notice.textContent = 'Escribe el RUT con el formato XX.XXX.XXX-X.';
      notice.hidden = false;
    } else notice.hidden = true;
    return result;
  }
  if (result.valid) {
    notice.hidden = true;
    return result;
  }
  notice.textContent = 'Completa el RUT con el formato XX.XXX.XXX-X o déjalo vacío.';
  notice.hidden = false;
  return result;
}

function bindRutValidation() {
  const input = field('businessRut');
  input.addEventListener('blur', updateRutNotice);
  input.addEventListener('input', updateRutNotice);
}

function validateStep() {
  clearErrors();
  const errors = document.querySelector('#policy-step-error');
  errors.hidden = true;
  let valid = true;
  if (activeStep === 0) {
    if (!value('businessName')) { mark(field('businessName'), 'error-business-name'); valid = false; }
    if (!value('contactEmail') || !field('contactEmail').validity.valid) { mark(field('contactEmail'), 'error-contact-email'); valid = false; }
    if (!value('businessType')) { mark(field('businessType'), 'error-business-type'); valid = false; }
    if (value('businessType') === 'Otro' && !value('businessTypeOther')) { mark(field('businessTypeOther'), 'error-business-type-other'); valid = false; }
    const rutResult = updateRutNotice();
    if (value('businessRut') && !rutResult.valid) {
      field('businessRut').setAttribute('aria-invalid', 'true');
      valid = false;
    }
    if (value('businessWebsite') && !field('businessWebsite').validity.valid) { mark(field('businessWebsite'), 'error-business-website'); valid = false; }
  } else if (activeStep === 1) {
    const categories = selected('dataCategories'), subjects = selected('dataSubjects');
    if (!categories.length) { mark(null, 'error-data-categories'); valid = false; }
    if (!subjects.length) { mark(null, 'error-data-subjects'); valid = false; }
    if (categories.includes('Otros') && !value('dataOther')) { mark(field('dataOther'), 'error-data-other'); valid = false; }
    if (subjects.includes('Otros') && !value('subjectsOther')) { mark(field('subjectsOther'), 'error-subjects-other'); valid = false; }
  } else if (activeStep === 2) {
    const purposes = selected('purposes');
    if (!purposes.length) { mark(null, 'error-purposes'); valid = false; }
    if (purposes.includes('Otras') && !value('purposesOther')) { mark(field('purposesOther'), 'error-purposes-other'); valid = false; }
  } else {
    const recipients = selected('recipients');
    const conflict = recipients.includes('No compartimos datos con terceros') && recipients.length > 1;
    if (!recipients.length || conflict) {
      form.querySelectorAll('input[name="recipients"]').forEach((input) => input.setAttribute('aria-invalid', 'true'));
      mark(null, 'error-recipients'); valid = false;
    }
    if (recipients.includes('Otros') && !value('recipientsOther')) { mark(field('recipientsOther'), 'error-recipients-other'); valid = false; }
    if (!form.querySelector('input[name="international"]:checked')) { mark(null, 'error-international'); valid = false; }
    const retention = form.querySelector('input[name="retention"]:checked');
    if (!retention) { mark(null, 'error-retention'); valid = false; }
    if (retention?.value === 'years') {
      const years = Number(value('retentionYears'));
      if (!Number.isInteger(years) || years < 1 || years > 100) { mark(field('retentionYears'), 'error-retention-years'); valid = false; }
    }
  }
  if (!valid) {
    errors.textContent = 'Revisa los campos señalados. Los datos requeridos describen la política y no dependen del puntaje del diagnóstico.';
    errors.hidden = false;
    const first = steps[activeStep].querySelector('[aria-invalid="true"], .field-error:not([hidden])');
    if (first?.matches('input,select,button')) first.focus();
    else first?.scrollIntoView({ block: 'center' });
  }
  return valid;
}

function paragraph(text, cls = '') {
  const p = document.createElement('p'); p.textContent = text; if (cls) p.className = cls; return p;
}
function list(items) {
  const ul = document.createElement('ul');
  items.forEach((text) => { const li = document.createElement('li'); li.textContent = text; ul.append(li); });
  return ul;
}
function pending(text) { return paragraph(text || 'Pendiente de completar', 'policy-pending'); }
function section(title, content) {
  const box = document.createElement('section'); box.className = 'policy-section';
  const h = document.createElement('h2'); h.textContent = title; box.append(h, content); documentNode.append(box);
}
function localDate() { return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date()); }
function businessType() { return value('businessType') === 'Otro' ? value('businessTypeOther') : value('businessType'); }

function generatePolicy() {
  documentNode.replaceChildren();
  const header = document.createElement('header'); header.className = 'policy-document-header';
  const brand = document.createElement('div'); brand.className = 'policy-document-brand';
  const logo = document.createElement('img'); logo.id = 'policy-document-logo'; logo.className = 'policy-document-logo'; logo.src = 'img/Logotipo moderno FOLIOX Studio.png'; logo.alt = 'FOLIOX Studio'; logo.draggable = false; logo.decoding = 'async';
  logo.addEventListener('error', () => announce('No se pudo cargar img/Logotipo moderno FOLIOX Studio.png. Revisa que el archivo exista junto a la página y vuelve a generar la vista previa.'));
  brand.append(logo);
  const title = document.createElement('h1'); title.textContent = 'Política de Privacidad';
  const date = paragraph('Borrador preparado el ' + localDate()); date.className = 'document-generated-date';
  const callout = paragraph('BORRADOR ORIENTATIVO · Revisa cada dato y marcador pendiente, valida las prácticas descritas y adapta el texto a la normativa vigente antes de publicarlo. No constituye asesoría legal ni garantiza cumplimiento.', 'draft-callout');
  header.append(brand, title, date, callout); documentNode.append(header);

  const identity = [
    'Razón social o nombre: ' + value('businessName'),
    'Tipo de negocio: ' + businessType(),
  ];
  const rutProvided = field('businessRut').value;
  if (rutProvided !== '') {
    const rutCheck = rutValidation(rutProvided);
    const rutLabel = rutCheck.valid
      ? 'RUT (dato proporcionado por el usuario): '
      : 'RUT (dato proporcionado por el usuario; pendiente de revisión): ';
    identity.splice(1, 0, rutLabel + rutProvided);
  }
  if (value('businessAddress')) identity.push('Dirección: ' + value('businessAddress'));
  if (value('businessWebsite')) identity.push('Sitio web: ' + value('businessWebsite'));
  section('1. Identificación del responsable', list(identity));

  let categories = selected('dataCategories').filter((x) => x !== 'Otros');
  if (selected('dataCategories').includes('Otros') && value('dataOther')) categories.push(value('dataOther'));
  let subjects = selected('dataSubjects').filter((x) => x !== 'Otros');
  if (selected('dataSubjects').includes('Otros') && value('subjectsOther')) subjects.push(value('subjectsOther'));
  const dataContent = document.createElement('div');
  const categoriesLabel = document.createElement('p'); categoriesLabel.textContent = 'Categorías de datos';
  const subjectsLabel = document.createElement('p'); subjectsLabel.textContent = 'Grupos de personas';
  dataContent.append(categoriesLabel, categories.length ? list(categories) : pending('Selecciona y confirma las categorías antes de publicar.'), subjectsLabel, subjects.length ? list(subjects) : pending('Identifica los grupos de personas afectados.'));
  section('2. Datos personales tratados', dataContent);

  let purposes = selected('purposes').filter((x) => x !== 'Otras');
  if (selected('purposes').includes('Otras') && value('purposesOther')) purposes.push(value('purposesOther'));
  section('3. Finalidades', purposes.length ? list(purposes) : pending('Indica para qué se utilizan los datos.'));
  section('4. Bases de licitud', pending('Pendiente de revisión: determina y documenta el fundamento aplicable a cada finalidad. La selección de un propósito no establece por sí sola una base de licitud.'));

  const chosenRecipients = selected('recipients');
  const recipientList = chosenRecipients.filter((x) => x !== 'Otros');
  if (chosenRecipients.includes('Otros') && value('recipientsOther')) recipientList.push(value('recipientsOther'));
  const recipientContent = document.createElement('div');
  if (recipientList.includes('No compartimos datos con terceros')) recipientContent.append(paragraph('Según lo declarado, no se comparten datos con terceros.'));
  else if (recipientList.length) {
    recipientContent.append(list(recipientList));
    if (recipientList.includes('Proveedores tecnológicos (hosting, software)') || recipientList.includes('Socios comerciales')) {
      recipientContent.append(pending('Indica los proveedores o socios concretos, su función y qué categorías reciben. Este formulario solo registra las categorías seleccionadas.'));
    }
    if (recipientList.includes('Por obligación legal')) recipientContent.append(pending('Identifica los destinatarios y comunicaciones concretas que correspondan.'));
  } else recipientContent.append(pending('Identifica los destinatarios reales, si los hay.'));
  section('5. Destinatarios de los datos', recipientContent);

  const international = value('international');
  let transfer = 'Pendiente de declarar si se utilizan servicios fuera de Chile.';
  if (international === 'no') transfer = 'Declaraste que no utilizas servicios fuera de Chile.';
  if (international === 'yes') transfer = 'Declaraste que sí utilizas servicios fuera de Chile. Proveedor o país: ' + (value('internationalDetails') || 'Pendiente de completar.');
  if (international === 'unsure') transfer = 'Declaraste que no estás seguro/a; revisa proveedores, ubicaciones y flujos antes de publicar.';
  section('6. Transferencias internacionales', paragraph(transfer));

  const retention = value('retention');
  let period = 'Pendiente de definir un período de conservación.';
  if (retention === 'relationship') period = 'Declaraste que conservas los datos mientras dure la relación comercial. Revisa si hay categorías o etapas con otros períodos.';
  if (retention === 'years') period = 'Declaraste ' + value('retentionYears') + ' años adicionales. Completa desde qué hito se cuentan y a qué categorías aplica.';
  if (retention === 'legal') period = 'Declaraste que conservas los datos según una obligación legal. Identifica las categorías, la obligación y el período concreto antes de publicar.';
  section('7. Período de conservación', paragraph(period));

  const rights = document.createElement('div');
  rights.append(paragraph('Las solicitudes relacionadas con datos se pueden enviar a ' + value('contactEmail') + '.'));
  if (new Date() < new Date(2026, 11, 1)) {
    rights.append(paragraph('Como orientación general según la Ley 19.628 vigente al preparar este borrador, las personas pueden solicitar información sobre sus datos y, cuando corresponda, pedir su modificación, eliminación o bloqueo, sujeto a las condiciones y excepciones legales.'));
  } else {
    rights.append(paragraph('Como orientación general, la Ley 21.719 contempla derechos de acceso, rectificación, supresión, oposición, portabilidad y bloqueo, sujetos a sus condiciones y excepciones. Revisa el texto consolidado vigente al publicar.'));
  }
  const rightsSource = document.createElement('p');
  const sourceLink = document.createElement('a');
  sourceLink.href = new Date() < new Date(2026, 11, 1)
    ? 'https://www.bcn.cl/leychile/navegar?i=141599'
    : 'https://www.bcn.cl/leychile/Navegar/imprimir?idNorma=1209272';
  sourceLink.textContent = 'Consultar el texto oficial en Ley Chile';
  sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer';
  rightsSource.append(sourceLink); rights.append(rightsSource);
  rights.append(pending('Completa y verifica los requisitos de identificación, el procedimiento interno y los plazos que correspondan a tus procesos.'));
  section('8. Derechos de las personas y forma de ejercerlos', rights);
  section('9. Medidas de seguridad', pending('Describe únicamente las medidas que efectivamente aplica la organización. Este formulario no las presume.'));
  section('10. Modificaciones de la política', pending('Define quién revisa la política, cómo se comunicarán los cambios y desde cuándo se aplican.'));
  const contact = ['Responsable: ' + value('businessName'), 'Correo para solicitudes: ' + value('contactEmail')];
  if (value('businessAddress')) contact.push('Dirección postal: ' + value('businessAddress'));
  if (value('businessWebsite')) contact.push('Sitio web: ' + value('businessWebsite'));
  section('11. Contacto', list(contact));
  const footer = document.createElement('footer'); footer.className = 'policy-document-footer';
  footer.textContent = 'Borrador generado localmente por FOLIOX Studio. Revisa y completa la información antes de publicar.'; documentNode.append(footer);

  const count = documentNode.querySelectorAll('.policy-pending').length;
  document.querySelector('#pending-summary').textContent = count
    ? 'El borrador contiene ' + count + ' ' + (count === 1 ? 'sección pendiente' : 'secciones pendientes') + '. Completa y verifica cada marcador antes de publicarlo.'
    : 'Revisa que toda la información represente tus prácticas antes de publicarlo.';
}
function finish() {
  if (!validateStep()) return;
  generatePolicy();
  form.hidden = true;
  steps.forEach((step) => { step.hidden = true; });
  previewPanel.hidden = false;
  updateStepper(true);
  document.querySelector('#preview-screen-title').focus({ preventScroll: true });
  previewPanel.scrollIntoView({ behavior: reduced(), block: 'start' });
}

function applyDiagnosticContext() {
  let context = null;
  try {
    const payload = JSON.parse(sessionStorage.getItem(navKey) || 'null');
    if (payload?.version === 1) context = payload.policyContext;
  } catch { /* El formulario se puede completar manualmente. */ }
  if (!context) return;

  const applied = [];
  const map = {
    'E-commerce': 'E-commerce',
    'Servicio profesional': 'Servicio profesional',
    'Salud': 'Salud',
    'Educación': 'Educación',
    'Retail': 'Retail',
    'Restaurante/Gastronomía': 'Restaurante',
    'Inmobiliaria': 'Inmobiliaria',
    'Otro': 'Otro',
  };
  if (map[context.businessType]) {
    field('businessType').value = map[context.businessType];
    applied.push('tipo de negocio: ' + map[context.businessType]);
  } else if (context.businessType) {
    applied.push('tipo “' + context.businessType + '” requiere que selecciones la opción más adecuada');
  }

  const categories = new Set(['Nombre completo', 'RUT', 'Email', 'Teléfono', 'Dirección postal', 'Datos de pago', 'Datos de salud']);
  (context.dataCategories || []).forEach((category) => {
    if (!categories.has(category)) return;
    const input = form.querySelector('input[name="dataCategories"][value="' + CSS.escape(category) + '"]');
    if (input) { input.checked = true; applied.push('categoría: ' + category); }
  });
  const notes = [];
  if (context.website === 'Sí') notes.push('indicaste que tienes sitio web; falta ingresar la URL exacta');
  if (context.webForms === 'yes') notes.push('declaraste formularios web; esa respuesta no determina por sí sola categorías ni grupos de personas');
  if (context.tracking === 'yes') notes.push('declaraste uso de cookies o herramientas de seguimiento; revisa si corresponde marcar datos de navegación, que no se preseleccionaron automáticamente');
  if (context.tracking === 'unknown') notes.push('no se preseleccionó navegación porque no estabas seguro/a del seguimiento');
  if (context.noPersonalDataDeclared) notes.push('declaraste que no recopilas datos personales; no se preseleccionó ninguna categoría');
  notes.push('el diagnóstico no preguntó por grupos de personas, finalidades ni destinatarios; complétalos aquí');
  const status = applied.length ? 'Se trasladaron ' + applied.join('; ') + '. ' : 'No se pudieron preseleccionar respuestas del diagnóstico. ';
  document.querySelector('#diagnostic-context-notice').textContent = status + 'Revisa y edita cada valor. ' + notes.join('. ') + '. El puntaje no limita la creación del borrador.';
  document.querySelector('#diagnostic-context-notice').hidden = false;
  updateConditionals();
}

function announce(message) {
  const status = document.querySelector('#policy-action-status');
  status.textContent = message;
  status.hidden = false;
}
function copyTextFallback(text) {
  const area = document.createElement('textarea'); area.value = text; area.setAttribute('readonly', '');
  area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select();
  const ok = document.execCommand('copy'); area.remove();
  announce(ok ? 'Texto copiado al portapapeles.' : 'No se pudo copiar. Selecciona el texto de la vista previa.');
}
function copyPolicy() {
  const text = documentNode.innerText.trim();
  if (!navigator.clipboard?.writeText) { copyTextFallback(text); return; }
  navigator.clipboard.writeText(text).then(() => announce('Texto copiado al portapapeles.')).catch(() => copyTextFallback(text));
}
async function logoDataUri() {
  const response = await fetch(new URL('img/Logotipo moderno FOLIOX Studio.png', document.baseURI));
  if (!response.ok) throw new Error('No se pudo leer el logo de FOLIOX Studio.');
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return 'data:image/png;base64,' + btoa(binary);
}
async function downloadHtml() {
  let logo;
  try { logo = await logoDataUri(); }
  catch { announce('No se pudo incorporar el logo al HTML. Abre el sitio mediante un servidor local y vuelve a intentarlo.'); return; }
  const exportedDocument = documentNode.cloneNode(true);
  exportedDocument.querySelector('.policy-document-logo').src = logo;
  const styles = 'body{font:14px/1.6 Arial,Helvetica,sans-serif;color:#263244;max-width:780px;margin:40px auto;padding:0 24px}.policy-document-brand{display:flex;justify-content:flex-start;width:100%;margin:0 0 24px}.policy-document-logo{display:block;width:240px;height:100px;margin:0;object-fit:contain;object-position:left center;user-select:none;-webkit-user-drag:none;pointer-events:none}.document-generated-date{color:#687489;font-size:.85rem}.draft-callout{padding:12px;background:#f6f2f3;border-left:3px solid #b83248}.policy-section{margin-top:22px;break-inside:avoid}.policy-section h2{font-size:1.1rem;border-bottom:1px solid #e5e8ed;padding-bottom:6px}.policy-pending{color:#7d3e49;font-style:italic}footer{margin-top:28px;padding-top:10px;border-top:1px solid #ddd;color:#687489;font-size:.8rem}';
  const source = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Política de Privacidad</title><style>' + styles + '</style></head><body>' + exportedDocument.innerHTML + '</body></html>';
  const url = URL.createObjectURL(new Blob([source], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  const slug = (value('businessName') || 'foliox-studio').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  link.href = url; link.download = 'politica-privacidad-' + (slug || 'foliox-studio') + '.html';
  document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Se descargó el archivo HTML de la vista previa con el logo FOLIOX Studio incorporado.');
}

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget, expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  button.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
  document.querySelector('#main-nav').classList.toggle('is-open', !expanded);
});
document.querySelectorAll('#main-nav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  document.querySelector('.menu-toggle').setAttribute('aria-label', 'Abrir menú');
  document.querySelector('#main-nav').classList.remove('is-open');
}));
bindRutValidation();
form.addEventListener('input', (event) => {
  const control = event.target;
  if (control.matches('input,select')) {
    control.removeAttribute('aria-invalid');
    const error = control.closest('.policy-field, .conditional-field')?.querySelector('.field-error');
    if (error) error.hidden = true;
    if (control.name === 'businessRut') document.querySelector('#error-business-rut').hidden = true;
  }
  updateConditionals();
  if (control.name === 'dataCategories' && selected('dataCategories').length) document.querySelector('#error-data-categories').hidden = true;
  if (control.name === 'dataSubjects' && selected('dataSubjects').length) document.querySelector('#error-data-subjects').hidden = true;
  if (control.name === 'purposes' && selected('purposes').length) document.querySelector('#error-purposes').hidden = true;
  if (control.name === 'international' && value('international')) document.querySelector('#error-international').hidden = true;
  if (control.name === 'retention' && value('retention')) document.querySelector('#error-retention').hidden = true;
  if (!steps[activeStep].querySelector('.field-error:not([hidden])')) document.querySelector('#policy-step-error').hidden = true;
});
form.addEventListener('change', updateConditionals);
previousButton.addEventListener('click', () => showStep(activeStep - 1));
nextButton.addEventListener('click', () => { if (validateStep()) activeStep === 3 ? finish() : showStep(activeStep + 1); });
document.querySelector('#edit-policy-responses-button').addEventListener('click', () => showStep(0));
document.querySelector('#new-policy-button').addEventListener('click', () => {
  if (!window.confirm('Esto borrará las respuestas actuales de esta política. ¿Quieres iniciar una nueva?')) return;
  form.reset();
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach((error) => { error.hidden = true; });
  document.querySelector('#error-business-rut').hidden = true;
  documentNode.replaceChildren();
  document.querySelector('#diagnostic-context-notice').hidden = true;
  document.querySelector('#policy-step-error').hidden = true;
  document.querySelector('#policy-action-status').hidden = true;
  updateConditionals();
  showStep(0);
});
document.querySelector('#copy-policy-button').addEventListener('click', copyPolicy);
document.querySelector('#download-policy-html-button').addEventListener('click', downloadHtml);
document.querySelector('#print-policy-button').addEventListener('click', async () => {
  const logo = document.querySelector('#policy-document-logo');
  try { if (logo && !logo.complete) await new Promise((resolve) => { logo.addEventListener('load', resolve, { once: true }); logo.addEventListener('error', resolve, { once: true }); }); await logo?.decode?.(); } catch { /* Continue if image decoding is unavailable. */ }
  if (!logo?.naturalWidth) { announce('No se imprimió porque el logo FOLIOX Studio no está cargado. Revisa la ruta img/Logotipo moderno FOLIOX Studio.png.'); return; }
  document.body.classList.add('printing-policy');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('printing-policy'));
document.addEventListener('keydown', (event) => {
  const button = document.querySelector('.menu-toggle');
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Abrir menú');
    document.querySelector('#main-nav').classList.remove('is-open'); button.focus();
  }
});
applyDiagnosticContext();
updateStepper();
