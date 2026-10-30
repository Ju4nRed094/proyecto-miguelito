const toolConfigs = {
  rat: {
    title: 'Registro de Tratamiento (RAT)',
    description: 'Registra cada actividad por separado y revisa el documento completo. Puedes imprimirlo o guardarlo como PDF, descargar sus datos en CSV y volver a editarlo.',
    needs: 'Completa la finalidad, los datos, las personas, los destinatarios o proveedores y la conservación. Si aún necesitas confirmar un dato, indica “No informado”.',
    submit: 'Guardar actividad',
    fields: [
      { name: 'activity', label: 'Nombre de la actividad', required: true, placeholder: 'Ej.: Gestión de clientes' },
      { name: 'purpose', label: 'Finalidad declarada', required: true, multiline: true, placeholder: 'Describe para qué se realiza esta actividad' },
      { name: 'data', label: 'Categorías de datos tratados', required: true, multiline: true, placeholder: 'Una categoría por línea' },
      { name: 'people', label: 'Personas a quienes corresponden los datos', required: true, multiline: true, placeholder: 'Ej.: clientes, trabajadores' },
      { name: 'recipients', label: 'Destinatarios o proveedores', required: true, multiline: true, placeholder: 'Indica destinatarios o “No informado”' },
      { name: 'retention', label: 'Plazo o criterio de conservación', required: true, multiline: true, placeholder: 'Indica el plazo o criterio declarado' },
    ],
  },
  consent: {
    title: 'Formulario de Consentimiento',
    description: 'Prepara un borrador de formulario a partir de la información que declares. FOLIOX Studio no recoge ni almacena las respuestas de consentimiento de terceros.',
    needs: 'Completa los datos de tu formulario y selecciona únicamente los usos que correspondan. El resultado es un borrador para revisar y adaptar.',
    submit: 'Generar consentimiento',
    fields: [
      { name: 'organization', label: 'Empresa u organización', required: true, step: 1, placeholder: 'Nombre de la empresa u organización' },
      { name: 'policyUrl', label: 'URL de la Política de Privacidad (opcional)', type: 'url', step: 1, placeholder: 'https://ejemplo.cl/privacidad' },
      { name: 'formType', label: 'Tipo de formulario', required: true, kind: 'radio', step: 1, options: ['Contacto', 'Cotización', 'Registro o cuenta', 'Newsletter', 'Pedido', 'Postulación laboral', 'Otro'] },
      { name: 'otherFormType', label: 'Describe el otro tipo de formulario', required: true, step: 1, conditionalWhen: { field: 'formType', value: 'Otro' }, placeholder: 'Describe el tipo de formulario' },
      { name: 'dataTypes', label: 'Datos personales solicitados', required: true, kind: 'checkboxes', columns: 2, step: 1, options: ['Nombre completo', 'Correo electrónico', 'Teléfono', 'RUT', 'Dirección', 'Empresa o cargo', 'Fecha de nacimiento', 'Otros datos'] },
      { name: 'otherData', label: 'Describe los otros datos', required: true, step: 1, conditionalWhen: { field: 'dataTypes', value: 'Otros datos' }, placeholder: 'Indica los otros datos personales' },
      { name: 'purposes', label: 'Usos de los datos', required: true, kind: 'checkboxes', columns: 2, step: 2, options: ['Responder tu consulta o solicitud', 'Enviarte el presupuesto o cotización', 'Gestionar el servicio contratado', 'Crear y administrar tu cuenta', 'Enviarte comunicaciones de marketing', 'Cumplir obligaciones legales', 'Otros fines informados'] },
      { name: 'otherPurpose', label: 'Describe los otros fines', required: true, multiline: true, rows: 2, step: 2, conditionalWhen: { field: 'purposes', value: 'Otros fines informados' }, placeholder: 'Describe los fines que informarás' },
      { name: 'thirdParties', label: 'Comunicación de datos a terceros', required: true, kind: 'radio', step: 2, options: ['No compartimos datos con terceros', 'Sí, con proveedores de servicio (hosting, software) bajo contrato', 'Sí, con socios comerciales'] },
    ],
  },
  cookies: {
    title: 'Banner de Cookies',
    description: 'Configura un banner y un fragmento que carga las integraciones opcionales seleccionadas solo cuando la persona acepta su categoría.',
    needs: 'Elige un nombre, plataforma y posición para tu sitio. Selecciona solo los servicios que realmente utiliza.',
    submit: 'Generar banner',
    fields: [
      { name: 'siteName', label: 'Nombre de empresa', required: true, step: 1, placeholder: 'Nombre de empresa' },
      { name: 'policyUrl', label: 'URL de la Política de Privacidad o Cookies (opcional)', type: 'url', step: 1, placeholder: 'https://ejemplo.cl/privacidad' },
      { name: 'platform', label: 'Plataforma', required: true, kind: 'radio', step: 1, options: ['HTML / cualquier sitio', 'WordPress', 'Shopify', 'Wix', 'Webflow', 'Next.js / React', 'Otro'] },
      { name: 'otherPlatform', label: 'Especifica la plataforma', required: true, step: 1, conditionalWhen: { field: 'platform', value: 'Otro' }, placeholder: 'Nombre de la plataforma' },
      { name: 'position', label: 'Posición del banner', required: true, kind: 'radio', step: 1, options: ['Parte inferior', 'Parte superior'] },
      { name: 'message', label: 'Mensaje del aviso', value: 'Este sitio utiliza cookies. Puedes aceptar todas, usar solo las necesarias o configurar tus preferencias.', render: false },
      { name: 'acceptLabel', label: 'Texto para aceptar todas', value: 'Aceptar todas', render: false },
      { name: 'rejectLabel', label: 'Texto para usar solo las necesarias', value: 'Solo necesarias', render: false },
      { name: 'configureLabel', label: 'Texto para abrir la configuración', value: 'Configurar cookies', render: false },
      { name: 'services', label: 'Servicios disponibles', kind: 'checkboxes', step: 2, options: ['Google Analytics 4', 'Google Ads / Conversiones', 'Meta Pixel', 'Hotjar', 'TikTok Pixel', 'Otras cookies propias'] },
      { name: 'ga4Id', label: 'ID de medición de Google Analytics 4', required: true, step: 2, conditionalWhen: { field: 'services', value: 'Google Analytics 4' }, placeholder: 'G-XXXXXXXXXX', example: 'Ejemplo de formato: G-ABC123DEFG. Reemplázalo por el ID real de tu propiedad.' },
      { name: 'googleAdsId', label: 'ID de conversión de Google Ads', required: true, step: 2, conditionalWhen: { field: 'services', value: 'Google Ads / Conversiones' }, placeholder: 'AW-123456789', example: 'Ejemplo de formato: AW-123456789. Usa el ID real de conversión de Google Ads.' },
      { name: 'metaPixelId', label: 'ID de Meta Pixel', required: true, step: 2, conditionalWhen: { field: 'services', value: 'Meta Pixel' }, placeholder: 'Solo el ID numérico', example: 'Ejemplo de formato: 123456789012345. Reemplázalo por el ID real de tu píxel.' },
      { name: 'hotjarSiteId', label: 'ID de sitio de Hotjar', required: true, step: 2, conditionalWhen: { field: 'services', value: 'Hotjar' }, placeholder: 'Solo el ID numérico', example: 'Ejemplo de formato: 1234567. Ingresa el ID real del sitio en Hotjar.' },
      { name: 'tiktokPixelId', label: 'ID de TikTok Pixel', required: true, step: 2, conditionalWhen: { field: 'services', value: 'TikTok Pixel' }, placeholder: 'ID del píxel', example: 'Ejemplo de formato: C1234567890. Usa el ID real de tu píxel de TikTok.' },
      { name: 'otherCookieDescription', label: 'Descripción de otras cookies propias', required: true, multiline: true, rows: 2, step: 2, conditionalWhen: { field: 'services', value: 'Otras cookies propias' }, placeholder: 'Describe su uso según lo que hayas comprobado', example: 'Ej.: cookie de idioma que recuerda la preferencia elegida por la persona.' },
      { name: 'otherCookieCategory', label: 'Categoría de otras cookies propias', value: 'Analítica', render: false },
    ],
  },
};

toolConfigs.rat.fields = [
  { name: 'activity', label: 'Nombre de la actividad', required: true, placeholder: 'Ej.: Gestión de clientes' },
  { name: 'dataCategories', label: 'Categorías de datos tratados', kind: 'checkboxes', columns: 2, options: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)', 'Financieros (pago, cuenta bancaria)', 'Salud y datos médicos', 'Datos biométricos', 'Laborales (cargo, sueldo)', 'Académicos (notas, asistencia)', 'Navegación (cookies, IP)', 'Datos de menores de edad'] },
  { name: 'peopleCategories', label: 'Categorías de titulares', kind: 'checkboxes', columns: 4, options: ['Clientes', 'Empleados', 'Proveedores', 'Usuarios web', 'Pacientes', 'Estudiantes', 'Apoderados', 'Candidatos laborales'] },
  { name: 'purpose', label: 'Finalidad del tratamiento', multiline: true, rows: 2, placeholder: 'Describe la finalidad declarada' },
  { name: 'legalBasis', label: 'Base de legitimidad', kind: 'radio', options: ['Consentimiento del titular', 'Ejecución de contrato', 'Obligación legal', 'Interés legítimo', 'Interés público'] },
  { name: 'recipients', label: 'Destinatarios / encargados', placeholder: 'Indica los destinatarios o encargados' },
  { name: 'internationalTransfer', label: 'Transferencia internacional', kind: 'checkbox', option: 'Se transfieren datos fuera del país' },
  { name: 'internationalCountry', label: 'País de destino', placeholder: 'País', conditional: 'internationalTransfer' },
  { name: 'retention', label: 'Plazo de conservación', placeholder: 'Plazo o criterio de conservación' },
  { name: 'securityMeasures', label: 'Medidas de seguridad', kind: 'checkboxes', columns: 2, options: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas', 'Firewall / protección de red', 'Registro de accesos (logs)', 'Capacitación del personal'] },
];
toolConfigs.rat.needs = 'Completa los campos de esta actividad. Las selecciones se guardan por separado para cada actividad y puedes cambiar o dejar vacíos los valores que aún no estén confirmados.';
const toolType = document.body.dataset.tool;
const config = toolConfigs[toolType];
const form = document.querySelector('#doc-tool-form');
const fieldsRoot = document.querySelector('#tool-fields');
const result = document.querySelector('#tool-result');
const preview = document.querySelector('#tool-preview') || document.querySelector('#cookie-preview-content');
const actions = document.querySelector('#tool-actions');
const status = document.querySelector('#tool-status');
let activities = [];
let cookieSnippet = '';
const cookieServiceDetails = new Map();
let handleCookieSubmit = null;
let saveRatActivity = null;
let handleConsentSubmit = null;
let consentOutputs = null;
let consentCurrentFormat = 'text';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function displayText(value) { return escapeHtml(value).replace(/\r?\n/g, '<br>'); }
function today() { return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date()); }
function announce(message) { status.textContent = message; status.hidden = false; }
function readForm() {
  return Object.fromEntries(config.fields.map((field) => {
    if (toolType === 'cookies' && !form.elements.namedItem(field.name)) return [field.name, field.value || ''];
    if (field.kind === 'checkboxes') return [field.name, [...form.querySelectorAll('input[name="' + field.name + '"]:checked')].map((input) => input.value)];
    if (field.kind === 'radio') return [field.name, form.querySelector('input[name="' + field.name + '"]:checked')?.value || ''];
    if (field.kind === 'checkbox') {
      const checked = Boolean(form.querySelector('input[name="' + field.name + '"]')?.checked);
      if (field.name === 'internationalTransfer' && !checked && form.dataset.transferTouched !== 'true') {
        return [field.name, editingRatActivity === null ? null : activities[editingRatActivity]?.internationalTransfer ?? null];
      }
      return [field.name, checked];
    }
    if (field.name === 'internationalCountry' && !form.querySelector('input[name="internationalTransfer"]')?.checked) return [field.name, ''];
    return [field.name, String(form.elements.namedItem(field.name)?.value || '').trim()];
  }));
}
function consentConditionMatches(condition) {
  if (!condition) return true;
  return [...form.querySelectorAll('input[name="' + condition.field + '"]:checked')].some((input) => input.value === condition.value);
}
function addField(definition) {
  if (definition.render === false) return;
  const controlId = 'field-' + definition.name;
  const stepPrefix = toolType === 'cookies' ? '#cookie-step-' : '#consent-step-';
  const targetRoot = definition.step ? document.querySelector(stepPrefix + definition.step + '-fields') : fieldsRoot;
  if (definition.kind) {
    const group = document.createElement('fieldset');
    group.id = controlId;
    group.className = 'doc-tool-field rat-choice-group rat-choice-' + definition.name + (definition.columns ? ' rat-columns-' + definition.columns : '');
    if (toolType === 'consent') group.classList.add('consent-choice-group');
    if (toolType === 'cookies') group.classList.add('cookie-choice-group');
    if (definition.kind === 'checkbox') group.classList.add('rat-single-choice');
    const legend = document.createElement('legend'); legend.textContent = definition.label;
    group.append(legend);
    const choices = definition.kind === 'checkbox' ? [definition.option] : definition.options;
    if (toolType === 'cookies' && definition.name === 'services') {
      const displayNames = { 'Meta Pixel': 'Meta Pixel (Facebook / Instagram)' };
      const categories = { 'Google Analytics 4': 'ANALÍTICA', 'Google Ads / Conversiones': 'MARKETING', 'Meta Pixel': 'MARKETING', Hotjar: 'ANALÍTICA', 'TikTok Pixel': 'MARKETING', 'Otras cookies propias': 'ANALÍTICA' };
      choices.forEach((choice, index) => {
        const item = document.createElement('div'); item.className = 'cookie-service-item'; item.dataset.cookieService = choice;
        const label = document.createElement('label'); label.className = 'cookie-service-row';
        const input = document.createElement('input'); input.type = 'checkbox'; input.name = definition.name; input.value = choice; input.setAttribute('value', choice); input.id = controlId + '-' + index;
        const text = document.createElement('span'); text.className = 'cookie-service-name'; text.textContent = displayNames[choice] || choice;
        const category = document.createElement('span'); category.className = 'cookie-service-category'; category.textContent = categories[choice];
        label.htmlFor = input.id; label.append(input, text, category);
        const details = document.createElement('div'); details.className = 'cookie-service-details'; details.hidden = true; details.id = 'cookie-service-details-' + index;
        item.append(label, details); group.append(item); cookieServiceDetails.set(choice, details);
      });
      const error = document.createElement('small'); error.className = 'doc-tool-field-error'; error.id = controlId + '-error'; error.hidden = true; error.setAttribute('role', 'alert'); group.append(error);
      group.querySelectorAll('input').forEach((input) => input.setAttribute('aria-describedby', error.id));
      targetRoot.append(group);
      return;
    }
    choices.forEach((choice, index) => {
      const label = document.createElement('label'); label.className = toolType === 'consent' ? 'consent-choice-option' : toolType === 'cookies' ? 'cookie-choice-option' : 'rat-choice-option';
      const input = document.createElement('input');
      input.type = definition.kind === 'radio' ? 'radio' : 'checkbox';
      input.name = definition.name; if (['rat', 'consent', 'cookies'].includes(toolType)) input.setAttribute('value', choice); input.value = choice; input.id = controlId + '-' + index;
      label.htmlFor = input.id;
      const text = document.createElement('span'); text.textContent = choice;
      label.append(input, text); group.append(label);
    });
    if (['consent', 'cookies'].includes(toolType)) {
      const error = document.createElement('small'); error.className = 'doc-tool-field-error'; error.id = controlId + '-error'; error.hidden = true; error.setAttribute('role', 'alert');
      group.append(error);
      group.querySelectorAll('input').forEach((input) => input.setAttribute('aria-describedby', error.id));
    }
    if (definition.conditionalWhen) {
      const groupWrap = document.createElement('div'); groupWrap.id = controlId + '-wrap'; groupWrap.className = 'doc-tool-field'; groupWrap.hidden = !consentConditionMatches(definition.conditionalWhen);
      groupWrap.append(group);
      const conditionalRoot = toolType === 'cookies' && definition.conditionalWhen.field === 'services' ? cookieServiceDetails.get(definition.conditionalWhen.value) : targetRoot;
      conditionalRoot.append(groupWrap);
    } else targetRoot.append(group);
    return;
  }
  const wrap = document.createElement('div');
  wrap.id = controlId + '-wrap';
  wrap.className = 'doc-tool-field' + (definition.multiline ? ' doc-tool-field-full' : '');
  if (definition.conditionalWhen) wrap.hidden = !consentConditionMatches(definition.conditionalWhen);
  else if (definition.conditional) wrap.hidden = !form.querySelector('input[name="' + definition.conditional + '"]:checked')?.checked;
  const label = document.createElement('label'); label.htmlFor = controlId; label.textContent = definition.label + (definition.required ? ' *' : '');
  const control = document.createElement(definition.multiline ? 'textarea' : 'input');
  control.id = controlId; control.name = definition.name; control.placeholder = definition.placeholder || '';
  if (!definition.multiline) control.type = definition.type || 'text';
  if (definition.multiline) control.rows = definition.rows || 3;
  if (definition.required) control.required = true;
  if (definition.value) {
    if (definition.multiline) control.textContent = definition.value;
    else control.setAttribute('value', definition.value);
    control.value = definition.value;
  }
  if (definition.name === 'policyUrl') control.autocomplete = 'url';
  const error = document.createElement('small'); error.className = 'doc-tool-field-error'; error.id = controlId + '-error'; error.hidden = true; error.setAttribute('role', 'alert');
  const describedBy = [];
  if (definition.example) {
    const example = document.createElement('small'); example.className = toolType === 'cookies' ? 'cookie-field-example' : 'doc-tool-field-example'; example.id = controlId + '-example'; example.textContent = definition.example;
    wrap.append(label, control, example); describedBy.push(example.id);
  } else wrap.append(label, control);
  if (definition.required) describedBy.push(error.id);
  if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
  wrap.append(error);
  const conditionalRoot = toolType === 'cookies' && definition.conditionalWhen?.field === 'services' ? cookieServiceDetails.get(definition.conditionalWhen.value) : targetRoot;
  conditionalRoot.append(wrap);
}
function makeButton(label, handler, primary = false) {
  const button = document.createElement('button'); button.type = 'button'; button.className = primary ? 'doc-tool-button' : 'doc-tool-button doc-tool-button-secondary'; button.textContent = label;
  button.addEventListener('click', handler); return button;
}
function downloadFile(name, content, mime = 'text/html;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function standaloneHtml(title, body) {
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(title) + ' — FOLIOX Studio</title><style>' + exportStyles + '</style></head><body>' + body + '</body></html>';
}
const brandLogoPath = 'img/Logotipo moderno FOLIOX Studio.png';
async function logoDataUri() {
  const response = await fetch(new URL(brandLogoPath, document.baseURI));
  if (!response.ok) throw new Error('No se pudo leer el logo de FOLIOX Studio.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}
async function standaloneWithLogo(title, body) {
  const logo = await logoDataUri();
  return standaloneHtml(title, body.split('src="' + brandLogoPath + '"').join('src="' + logo + '"'));
}
const exportStyles = 'body{font:14px/1.6 Arial,sans-serif;color:#263244;max-width:800px;margin:32px auto;padding:0 24px}.generated-doc{padding:26px;border:1px solid #dfe3e9}.generated-brand{color:#9b2639;font-weight:800;letter-spacing:.08em}.generated-brand-logo img{display:block;width:240px;max-width:100%;height:100px;object-fit:contain;object-position:left center}.generated-date{color:#687489;font-size:12px}.generated-section{margin-top:20px;break-inside:avoid}.generated-section h2{font-size:17px;border-bottom:1px solid #e5e8ed;padding-bottom:6px}.generated-row{margin:10px 0}.generated-row strong{display:block;color:#59667a;font-size:12px}.generated-row p{margin:3px 0}.signature-line{height:40px;border-bottom:1px solid #6d7787}.generated-note{color:#687489;font-size:12px}.docfast-cookie-banner{position:fixed;z-index:99999;right:18px;bottom:18px;left:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;border:1px solid #26364d;border-radius:12px;background:#101827;color:#f1f4f8;font:14px/1.5 Arial,sans-serif;box-shadow:0 12px 36px #0005}.docfast-cookie-banner[hidden]{display:none}.docfast-cookie-banner p{margin:0;max-width:720px}.docfast-cookie-banner a{color:#ff9ba0}.docfast-cookie-actions{display:flex;gap:9px}.docfast-cookie-actions button{min-height:40px;padding:0 14px;border:1px solid #ed4053;border-radius:7px;background:#ed4053;color:#fff;font:inherit;cursor:pointer}.docfast-cookie-actions button[data-choice="rejected"]{background:transparent}.cookie-snippet-code{white-space:pre-wrap;overflow-wrap:anywhere}';

function generatedHeader(title) {
  return '<header><div class="generated-brand generated-brand-logo"><img src="' + brandLogoPath + '" alt="FOLIOX Studio"></div><h1>' + escapeHtml(title) + '</h1><p class="generated-date">Borrador generado el ' + escapeHtml(today()) + '</p></header>';
}
function rowsFor(record, labels) {
  return Object.entries(labels).map(([key, label]) => '<div class="generated-row"><strong>' + escapeHtml(label) + '</strong><p>' + (String(record[key] || '').trim() ? displayText(record[key]) : '<span class="rat-pending">Pendiente de completar</span>') + '</p></div>').join('');
}
function renderRat() {
  const org = activities[0].organization;
  const companyData = { organization: org, rut: activities[0].rut || '' };
  const doc = '<article class="generated-doc">' + generatedHeader('Registro de Tratamiento (RAT)') + '<p class="generated-note">Borrador orientativo basado en la información ingresada. Revisa y completa cada actividad antes de utilizar este registro.</p><div class="generated-section"><h2>Organización responsable</h2>' + rowsFor(companyData, { organization: 'Razón social o nombre', rut: 'RUT' }) + '</div>' + activities.map((activity, index) => '<section class="generated-section"><h2>Actividad ' + (index + 1) + ': ' + escapeHtml(activity.activity) + '</h2>' + rowsFor(activity, { purpose: 'Finalidad declarada', data: 'Categorías de datos', people: 'Personas a quienes corresponden', recipients: 'Destinatarios o proveedores', retention: 'Plazo o criterio de conservación' }) + '</section>').join('') + '<p class="generated-note">Este registro refleja las declaraciones ingresadas. No determina por sí solo si el tratamiento cumple requisitos aplicables.</p></article>';
  preview.innerHTML = doc;
  actions.replaceChildren(
    makeButton('Imprimir / Guardar como PDF', () => printResult(), true),
    makeButton('Descargar CSV', downloadRatCsv),
    makeButton('Editar actividades', () => { result.hidden = true; document.querySelector('#rat-activities-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); })
  );
  result.hidden = false;
}
function renderRatTable() {
  const org = activities[0]?.organization || '';
  const rutValue = activities[0]?.rut || '';
  const headers = ['N.º', 'Actividad', 'Datos tratados', 'Titulares', 'Finalidad', 'Base de legitimidad', 'Destinatarios / encargados', 'Transferencia internacional', 'Conservación', 'Medidas de seguridad'];
  const keys = ['activity', 'dataCategories', 'peopleCategories', 'purpose', 'legalBasis', 'recipients', 'internationalTransfer', 'retention', 'securityMeasures'];
  const valueFor = (item, key) => {
    const value = item[key];
    if (key === 'internationalTransfer') return value === true ? 'Sí' + (item.internationalCountry ? ' · ' + item.internationalCountry : '') : value === false ? 'No' : '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value ?? '').trim();
  };
  const rows = activities.map((item, index) => '<tr><th scope="row">' + (index + 1) + '</th>' + keys.map((key) => {
    const value = valueFor(item, key);
    return '<td>' + (value ? displayText(value) : '<span class="rat-pending">Pendiente de completar</span>') + '</td>';
  }).join('') + '</tr>').join('');
  const table = '<article class="generated-doc"><h1 class="rat-document-print-title">Registro de Actividades de Tratamiento</h1><div class="rat-document-meta"><strong>' + escapeHtml(org) + '</strong>' + (rutValue ? '<span>RUT: ' + escapeHtml(rutValue) + '</span>' : '') + '<span>Fecha de actualización: ' + escapeHtml(today()) + '</span></div><div class="rat-document-table-wrap"><table class="rat-document-table"><caption class="visually-hidden">Actividades de tratamiento de ' + escapeHtml(org) + '</caption><thead><tr>' + headers.map((header) => '<th scope="col">' + escapeHtml(header) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div><p class="generated-note">Registro orientativo basado en los datos ingresados. Revisa los valores pendientes y confirma que reflejan las prácticas de la organización antes de utilizarlo.</p></article>';
  const printableTable = table
    .replace('<h1 class="rat-document-print-title">', '<div class="rat-document-brand"><img src="' + brandLogoPath + '" alt="FOLIOX Studio"></div><h1 class="rat-document-print-title">')
    .replace('<div class="rat-document-meta">', '<p class="rat-document-print-reference">Registro generado por FOLIOX Studio a partir de la información declarada por la organización.</p><div class="rat-document-meta">')
    .replace('</article>', '</article>');
  preview.innerHTML = printableTable;
  document.querySelector('#result-description').textContent = org + (rutValue ? ' · RUT: ' + rutValue : '') + ' · Fecha de actualización: ' + today();
  actions.replaceChildren(
    makeButton('Imprimir / Guardar como PDF', () => printResult(), true),
    makeButton('Descargar CSV', downloadRatCsv),
    makeButton('Editar', () => {
      result.hidden = true;
      const panel = document.querySelector('#rat-activities-panel');
      panel.hidden = false;
      panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      document.querySelector('#rat-activities-title').focus({ preventScroll: true });
    })
  );
  result.hidden = false;
}

function downloadRatCsv() {
  const headers = ['Organización responsable', 'RUT', 'Actividad', 'Categorías de datos tratados', 'Categorías de titulares', 'Finalidad', 'Base de legitimidad', 'Destinatarios / encargados', 'Transferencia internacional', 'País de destino', 'Plazo de conservación', 'Medidas de seguridad'];
  const keys = ['organization', 'rut', 'activity', 'dataCategories', 'peopleCategories', 'purpose', 'legalBasis', 'recipients', 'internationalTransfer', 'internationalCountry', 'retention', 'securityMeasures'];
  const quote = (value) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const csv = [headers, ...activities.map((item) => keys.map((key) => {
    const value = item[key];
    if (key === 'internationalTransfer') return value === true ? 'Sí' : value === false ? 'No' : '';
    return Array.isArray(value) ? value.join('; ') : value || '';
  }))].map((row) => row.map(quote).join(',')).join('\r\n');
  downloadFile('registro-tratamiento-foliox-studio.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
}
function consentDataValues(data) {
  return (data.dataTypes || []).map((value) => value === 'Otros datos' && data.otherData ? 'Otros datos: ' + data.otherData : value);
}
function consentPurposeValues(data) {
  return (data.purposes || []).filter((value) => value !== 'Enviarte comunicaciones de marketing').map((value) => value === 'Otros fines informados' && data.otherPurpose ? 'Otros fines informados: ' + data.otherPurpose : value);
}
function consentThirdPartyText(value) {
  if (value === 'Sí, con proveedores de servicio (hosting, software) bajo contrato') return 'Sí, los datos se comparten con proveedores de servicio (hosting, software) bajo contrato.';
  if (value === 'Sí, con socios comerciales') return 'Sí, los datos se comparten con socios comerciales.';
  return 'Según lo declarado, no se comparten datos con terceros.';
}
function consentMainStatement(data) {
  const purposes = consentPurposeValues(data);
  const purposeText = purposes.join('; ');
  return 'He leído la información anterior y autorizo a ' + data.organization + ' a tratar mis datos personales para: ' + purposeText + '.';
}
function consentMarketingStatement(data) {
  return 'Deseo recibir comunicaciones de marketing de ' + data.organization + '. Esta autorización es opcional y separada del consentimiento principal.';
}
function consentPlainText(data) {
  const purposes = consentPurposeValues(data);
  const lines = [
    'FORMULARIO DE CONSENTIMIENTO',
    'Organización: ' + data.organization,
    'Tipo de formulario: ' + (data.formType === 'Otro' ? 'Otro: ' + data.otherFormType : data.formType),
    'Datos personales solicitados: ' + consentDataValues(data).join(', '),
    'Finalidades principales: ' + purposes.join('; '),
    consentThirdPartyText(data.thirdParties),
  ];
  if (data.policyUrl) lines.push('Política de Privacidad: ' + data.policyUrl);
  lines.push('', '[ ] Consentimiento principal (obligatorio): ' + consentMainStatement(data));
  if ((data.purposes || []).includes('Enviarte comunicaciones de marketing')) lines.push('[ ] Consentimiento opcional de marketing: ' + consentMarketingStatement(data));
  lines.push('', 'Borrador para revisión y adaptación por la organización. Esta plantilla no transmite ni almacena la respuesta de quien la complete.');
  return lines.join('\n');
}
function consentHtml(data) {
  const formType = data.formType === 'Otro' ? 'Otro: ' + data.otherFormType : data.formType;
  const dataItems = consentDataValues(data).map((value) => '<li>' + displayText(value) + '</li>').join('');
  const purposes = consentPurposeValues(data);
  const purposeItems = purposes.map((value) => '<li>' + displayText(value) + '</li>').join('');
  const policy = data.policyUrl ? '<p>Política de Privacidad: <a href="' + escapeHtml(data.policyUrl) + '" rel="noopener noreferrer">' + escapeHtml(data.policyUrl) + '</a></p>' : '';
  const marketing = (data.purposes || []).includes('Enviarte comunicaciones de marketing')
    ? '<fieldset class="consent-choice consent-choice-optional"><legend>Consentimiento opcional de marketing</legend><label><input type="checkbox"> ' + escapeHtml(consentMarketingStatement(data)) + '</label></fieldset>'
    : '';
  return '<article class="generated-doc consent-generated">' + generatedHeader('Formulario de Consentimiento') + '<p class="generated-note">Borrador para revisión y adaptación por la organización. Esta plantilla no transmite ni almacena la respuesta de quien la complete.</p><section class="generated-section"><h2>Tu formulario</h2><p><strong>Organización:</strong> ' + escapeHtml(data.organization) + '</p><p><strong>Tipo:</strong> ' + escapeHtml(formType) + '</p><p><strong>Datos personales solicitados:</strong></p><ul>' + dataItems + '</ul></section><section class="generated-section"><h2>Usos y terceros</h2><p><strong>Finalidades principales:</strong></p><ul>' + purposeItems + '</ul>' + ((data.purposes || []).includes('Enviarte comunicaciones de marketing') ? '<p>Las comunicaciones de marketing se solicitan mediante una opción independiente y voluntaria.</p>' : '') + '<p>' + escapeHtml(consentThirdPartyText(data.thirdParties)) + '</p>' + policy + '</section><fieldset class="consent-choice consent-choice-required"><legend>Consentimiento principal <span>(obligatorio)</span></legend><label><input type="checkbox" required> ' + displayText(consentMainStatement(data)) + '</label></fieldset>' + marketing + '</article>';
}
function consentJsx(data) {
  const jsx = (value) => '{' + JSON.stringify(value) + '}';
  const formType = data.formType === 'Otro' ? 'Otro: ' + data.otherFormType : data.formType;
  const dataText = consentDataValues(data).join(', ');
  const purposes = consentPurposeValues(data);
  const purposeText = purposes.join('; ');
  const policyLine = data.policyUrl ? '      <p>Política de Privacidad: <a href={' + JSON.stringify(data.policyUrl) + '} rel="noopener noreferrer">' + jsx(data.policyUrl) + '</a></p>' : '';
  const marketingBlock = (data.purposes || []).includes('Enviarte comunicaciones de marketing')
    ? '      <fieldset className="consent-choice consent-choice-optional">\n        <legend>Consentimiento opcional de marketing</legend>\n        <label><input type="checkbox" /> ' + jsx(consentMarketingStatement(data)) + '</label>\n      </fieldset>'
    : '';
  return [
    'import React from "react";',
    '',
    'function ConsentForm() {',
    '  return (',
    '    <form aria-label={"Formulario de consentimiento"}>',
    '      <h1>{"Formulario de Consentimiento"}</h1>',
    '      <p>{"Borrador para revisión y adaptación por la organización."}</p>',
    '      <p><strong>Organización:</strong> ' + jsx(data.organization) + '</p>',
    '      <p><strong>Tipo:</strong> ' + jsx(formType) + '</p>',
    '      <p><strong>Datos personales solicitados:</strong> ' + jsx(dataText) + '</p>',
    '      <p><strong>Finalidades principales:</strong> ' + jsx(purposeText) + '</p>',
    '      <p>' + jsx(consentThirdPartyText(data.thirdParties)) + '</p>',
    policyLine,
    '      <fieldset className="consent-choice consent-choice-required">',
    '        <legend>Consentimiento principal (obligatorio)</legend>',
    '        <label><input type="checkbox" required /> ' + jsx(consentMainStatement(data)) + '</label>',
    '      </fieldset>',
    marketingBlock,
    '      <p>{"Esta plantilla no transmite ni almacena la respuesta de quien la complete."}</p>',
    '    </form>',
    '  );',
    '}',
    '',
    'export default ConsentForm;',
  ].filter(Boolean).join('\n');
}
function renderConsent(data) {
  consentOutputs = { text: consentPlainText(data), html: consentHtml(data), jsx: consentJsx(data) };
  consentCurrentFormat = 'text';
  document.querySelector('#consent-output-format').value = consentCurrentFormat;
  document.querySelector('#result-description').textContent = data.organization + ' · ' + (data.formType === 'Otro' ? data.otherFormType : data.formType);
  // Render only the document body in the application preview. The standalone
  // HTML includes global body styles intended for downloaded files; injecting
  // that full document here leaks those styles into the FOLIOX interface.
  preview.innerHTML = consentHtml(data);
  const copyButton = makeButton('Copiar texto', copyConsentOutput, true);
  copyButton.dataset.consentCopy = 'true';
  actions.replaceChildren(
    copyButton,
    makeButton('Editar respuestas', () => { result.hidden = true; document.querySelector('#tool-form-panel').hidden = false; showConsentStep(1); document.querySelector('#consent-step-1-title').focus({ preventScroll: true }); }),
    makeButton('Generar nuevo consentimiento', resetConsentWorkflow)
  );
  updateConsentOutput();
  result.hidden = false;
  document.querySelector('#tool-form-panel').hidden = true;
  showConsentProgress(3);
  result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  announce('Borrador generado. Revísalo y adáptalo antes de usarlo.');
}
function updateConsentOutput() {
  if (!consentOutputs) return;
  consentCurrentFormat = document.querySelector('#consent-output-format').value;
  document.querySelector('#consent-output-source').value = consentOutputs[consentCurrentFormat];
  const copyButton = [...actions.querySelectorAll('button')].find((button) => button.dataset.consentCopy === 'true');
  if (copyButton) copyButton.textContent = consentCurrentFormat === 'text' ? 'Copiar texto' : 'Copiar código';
}
function copyConsentOutput() {
  const text = consentOutputs?.[consentCurrentFormat];
  if (!text) return;
  const announceCopy = (copied) => announce(copied ? (consentCurrentFormat === 'text' ? 'Texto copiado.' : 'Código copiado.') : 'No se pudo copiar automáticamente. Selecciona y copia el contenido de la vista previa.');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => announceCopy(true)).catch(() => {
    const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select(); const copied = document.execCommand('copy'); input.remove(); announceCopy(copied);
  });
  else {
    const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select(); const copied = document.execCommand('copy'); input.remove(); announceCopy(copied);
  }
}
function showConsentProgress(step) {
  document.querySelectorAll('[data-consent-progress]').forEach((item) => {
    const itemStep = Number(item.dataset.consentProgress);
    item.classList.toggle('is-current', itemStep === step);
    item.classList.toggle('is-complete', itemStep < step);
    if (itemStep === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
  });
  document.querySelector('#consent-step-number').textContent = String(step);
}
function showConsentStep(step) {
  document.querySelector('#consent-step-1').hidden = step !== 1;
  document.querySelector('#consent-step-2').hidden = step !== 2;
  document.querySelector('#tool-form-title').textContent = step === 1 ? 'Tu formulario' : 'Usos y terceros';
  showConsentProgress(step);
  const heading = document.querySelector('#' + (step === 1 ? 'consent-step-1-title' : 'consent-step-2-title'));
  heading.focus({ preventScroll: true });
}
function setConsentFieldError(name, message = '') {
  const error = document.querySelector('#field-' + name + '-error');
  if (error) { error.textContent = message; error.hidden = !message; }
  const controls = form.querySelectorAll('input[name="' + name + '"], textarea[name="' + name + '"], select[name="' + name + '"]');
  controls.forEach((control) => { if (message) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid'); });
}
function updateConsentConditionals() {
  config.fields.filter((field) => field.conditionalWhen).forEach((field) => {
    const wrap = document.querySelector('#field-' + field.name + '-wrap');
    if (wrap) wrap.hidden = !consentConditionMatches(field.conditionalWhen);
    if (wrap?.hidden) { form.elements.namedItem(field.name).value = ''; setConsentFieldError(field.name); }
  });
}
function validateConsentStep(step) {
  let valid = true;
  config.fields.filter((field) => field.step === step).forEach((field) => {
    const wrap = document.querySelector('#field-' + field.name + '-wrap');
    if (wrap?.hidden) { setConsentFieldError(field.name); return; }
    const controls = [...form.querySelectorAll('input[name="' + field.name + '"]')];
    let value = '';
    let invalid = false;
    if (field.kind === 'radio') { value = form.querySelector('input[name="' + field.name + '"]:checked')?.value || ''; invalid = field.required && !value; }
    else if (field.kind === 'checkboxes') { value = controls.filter((control) => control.checked); invalid = field.required && !value.length; }
    else { value = String(form.elements.namedItem(field.name)?.value || '').trim(); invalid = Boolean(field.required && !value); }
    if (!invalid && field.name === 'policyUrl' && value) {
      try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
      catch { invalid = true; }
    }
    setConsentFieldError(field.name, invalid ? (field.name === 'policyUrl' ? 'Ingresa una URL que comience con http:// o https://.' : field.kind ? 'Selecciona una opción para continuar.' : 'Completa este campo.') : '');
    if (invalid) valid = false;
  });
  if (!valid) form.querySelector('[aria-invalid="true"]')?.focus();
  return valid;
}
function resetConsentWorkflow() {
  form.reset();
  config.fields.forEach((field) => setConsentFieldError(field.name));
  consentOutputs = null;
  document.querySelector('#tool-result').hidden = true;
  document.querySelector('#tool-form-panel').hidden = false;
  updateConsentConditionals();
  showConsentStep(1);
  document.querySelector('#field-organization').focus({ preventScroll: true });
}
function initConsentWorkflow() {
  handleConsentSubmit = () => {
    const step2 = document.querySelector('#consent-step-2');
    if (step2.hidden) {
      if (!validateConsentStep(1)) return;
      showConsentStep(2);
      document.querySelector('#consent-step-2-title').focus({ preventScroll: true });
      return;
    }
    if (!validateConsentStep(2)) return;
    renderConsent(readForm());
  };
  document.querySelector('#consent-next').addEventListener('click', () => {
    if (!validateConsentStep(1)) return;
    showConsentStep(2);
  });
  document.querySelector('#consent-previous').addEventListener('click', () => showConsentStep(1));
  document.querySelector('#consent-output-format').addEventListener('change', updateConsentOutput);
  const updateConsentFieldState = (event) => {
    updateConsentConditionals();
    if (config.fields.some((field) => field.name === event.target.name)) setConsentFieldError(event.target.name);
  };
  form.addEventListener('input', updateConsentFieldState);
  form.addEventListener('change', updateConsentFieldState);
  updateConsentConditionals();
  showConsentStep(1);
}

const cookieServiceDefinitions = {
  'Google Analytics 4': { key: 'ga4', category: 'analytics', field: 'ga4Id' },
  'Google Ads / Conversiones': { key: 'googleAds', category: 'marketing', field: 'googleAdsId' },
  'Meta Pixel': { key: 'metaPixel', category: 'marketing', field: 'metaPixelId' },
  Hotjar: { key: 'hotjar', category: 'analytics', field: 'hotjarSiteId' },
  'TikTok Pixel': { key: 'tiktokPixel', category: 'marketing', field: 'tiktokPixelId' },
};
function cookieServicesFor(data) {
  const selected = data.services || [];
  const services = Object.entries(cookieServiceDefinitions)
    .filter(([name]) => selected.includes(name))
    .map(([name, definition]) => ({ key: definition.key, label: name, category: definition.category, id: data[definition.field] }));
  if (selected.includes('Otras cookies propias')) {
    services.push({ key: 'ownCookies', label: 'Otras cookies propias', category: 'analytics', description: data.otherCookieDescription });
  }
  return services;
}
function scriptSafeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
function cookieMarkup(data) {
  const services = cookieServicesFor(data);
  const serviceConfig = scriptSafeJson(services);
  const link = data.policyUrl ? '<a href="' + escapeHtml(data.policyUrl) + '" target="_blank" rel="noopener noreferrer">Política de privacidad o cookies</a>' : '';
  const positionClass = data.position === 'Parte superior' ? 'foliox-cookie-top' : 'foliox-cookie-bottom';
  const styles = '<style>.foliox-cookie-banner,.foliox-cookie-reopen{z-index:2147483000;font:15px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-sizing:border-box}.foliox-cookie-banner *,.foliox-cookie-reopen{box-sizing:border-box}.foliox-cookie-banner{position:fixed;right:18px;left:18px;max-width:1080px;margin:auto;padding:20px;border:1px solid #d2dce7;border-radius:14px;background:#fff;color:#1e334d;box-shadow:0 16px 48px #10243d30}.foliox-cookie-bottom{bottom:18px}.foliox-cookie-top{top:18px}.foliox-cookie-content{display:flex;align-items:center;justify-content:space-between;gap:20px}.foliox-cookie-copy{min-width:0}.foliox-cookie-copy strong{display:block;margin-bottom:4px;font-size:16px}.foliox-cookie-copy p{margin:0;color:#52647a}.foliox-cookie-copy a{display:inline-block;margin-top:7px;color:#a51f2b;text-decoration:underline}.foliox-cookie-actions,.foliox-cookie-settings-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.foliox-cookie-banner button,.foliox-cookie-reopen{min-height:42px;padding:9px 14px;border:1px solid #c7d2df;border-radius:8px;background:#f6f8fb;color:#263b55;font:inherit;font-size:13px;font-weight:650;cursor:pointer}.foliox-cookie-banner button:focus-visible,.foliox-cookie-reopen:focus-visible{outline:3px solid #a51f2b;outline-offset:3px}.foliox-cookie-banner button[data-foliox-action="accept-all"]{border-color:#b91f2c;background:#b91f2c;color:#fff}.foliox-cookie-settings{margin-top:17px;padding:16px;border:1px solid #e0e6ed;border-radius:10px;background:#f8fafc}.foliox-cookie-settings h2{margin:0 0 8px;font-size:18px}.foliox-cookie-settings>p{margin:0 0 12px;color:#52647a;font-size:13px}.foliox-cookie-settings-note{padding:9px;border-left:3px solid #8798ad;background:#fff;font-size:12px!important}.foliox-cookie-categories{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0 16px}.foliox-cookie-category{display:flex;align-items:flex-start;gap:9px;padding:11px;border:1px solid #d5dee8;border-radius:8px;background:#fff;font-size:13px}.foliox-cookie-category input{width:17px;height:17px;margin:2px 0 0;accent-color:#b91f2c}.foliox-cookie-own-note{grid-column:1/-1;padding:10px;border-left:3px solid #8798ad;background:#fff;color:#52647a;font-size:12px}.foliox-cookie-reopen{position:fixed;right:16px;bottom:16px;box-shadow:0 5px 20px #10243d24}.foliox-cookie-reopen[hidden],.foliox-cookie-banner[hidden],.foliox-cookie-settings[hidden]{display:none!important}@media(max-width:700px){.foliox-cookie-banner{right:10px;left:10px;padding:15px}.foliox-cookie-content{align-items:stretch;flex-direction:column;gap:13px}.foliox-cookie-actions,.foliox-cookie-settings-actions{display:grid;grid-template-columns:1fr}.foliox-cookie-categories{grid-template-columns:1fr}.foliox-cookie-reopen{right:10px;bottom:10px}}</style>';
  const markup = '<div id="foliox-cookie-banner" class="foliox-cookie-banner ' + positionClass + '" role="region" aria-label="Aviso de cookies de ' + escapeHtml(data.siteName) + '"><div class="foliox-cookie-content"><div class="foliox-cookie-copy"><strong>' + escapeHtml(data.siteName) + '</strong><p>' + displayText(data.message) + '</p>' + link + '</div><div class="foliox-cookie-actions"><button type="button" data-foliox-action="accept-all">' + escapeHtml(data.acceptLabel) + '</button><button type="button" data-foliox-action="necessary">' + escapeHtml(data.rejectLabel) + '</button><button type="button" data-foliox-action="configure" aria-expanded="false" aria-controls="foliox-cookie-settings">' + escapeHtml(data.configureLabel) + '</button></div></div><section id="foliox-cookie-settings" class="foliox-cookie-settings" aria-labelledby="foliox-cookie-settings-title" hidden><h2 id="foliox-cookie-settings-title">Configurar cookies</h2><p>Las cookies necesarias para que el sitio funcione siempre están activas. Elige por separado si aceptas analítica o marketing.</p><p class="foliox-cookie-settings-note">Puedes volver a cambiar tu elección. Los scripts ya ejecutados y las solicitudes ya enviadas en esta página no se pueden retirar desde este fragmento; recarga para aplicar una retirada a cargas futuras.</p><div class="foliox-cookie-categories"><div class="foliox-cookie-category"><span aria-hidden="true">✓</span><span><strong>Necesarias</strong><br>Siempre activas</span></div><label class="foliox-cookie-category"><input type="checkbox" data-foliox-category="analytics"><span><strong>Analítica</strong><br>Medición y análisis</span></label><label class="foliox-cookie-category"><input type="checkbox" data-foliox-category="marketing"><span><strong>Marketing</strong><br>Publicidad y píxeles</span></label><p class="foliox-cookie-own-note" id="foliox-cookie-own-note" hidden></p></div><div class="foliox-cookie-settings-actions"><button type="button" data-foliox-action="save">Guardar preferencias</button><button type="button" data-foliox-action="necessary">Solo necesarias</button><button type="button" data-foliox-action="close">Cerrar</button></div></section></div><button type="button" id="foliox-cookie-reopen" class="foliox-cookie-reopen" aria-label="Abrir configuración de cookies">' + escapeHtml(data.configureLabel) + '</button>';
  const script = `<script>(function(){
'use strict';
var storageKey='foliox-cookie-preferences-v1';
var services=${serviceConfig};
var banner=document.getElementById('foliox-cookie-banner');
var settings=document.getElementById('foliox-cookie-settings');
var reopen=document.getElementById('foliox-cookie-reopen');
var ownNote=document.getElementById('foliox-cookie-own-note');
if(!banner||!settings||!reopen)return;
var analyticsInput=banner.querySelector('[data-foliox-category="analytics"]');
var marketingInput=banner.querySelector('[data-foliox-category="marketing"]');
var loaded={google:{},meta:{},hotjar:{},tiktok:{}};
var preferences=null;
var ownCookies=services.filter(function(item){return item.key==='ownCookies';});
if(ownCookies.length){ownNote.textContent='Cookies propias declaradas: '+ownCookies.map(function(item){return item.description+' ('+(item.category==='analytics'?'analítica':item.category==='marketing'?'marketing':'necesarias')+').';}).join(' ' )+' El fragmento no crea ni bloquea automáticamente estas cookies.';ownNote.hidden=false;}
function readPreferences(){try{var value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value&&typeof value==='object')return{necessary:true,analytics:value.analytics===true,marketing:value.marketing===true};}catch(error){}return null;}
function googleTag(ids,prefs){var pending=ids.filter(function(id){return id&&!loaded.google[id];});if(!pending.length){if(window.gtag&&window.__folioxGoogleTagLoader)window.gtag('consent','update',{analytics_storage:prefs.analytics?'granted':'denied',ad_storage:prefs.marketing?'granted':'denied',ad_user_data:prefs.marketing?'granted':'denied',ad_personalization:prefs.marketing?'granted':'denied'});return;}window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};if(!window.__folioxGoogleTagLoader){window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('js',new Date());window.__folioxGoogleTagLoader=true;var tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(pending[0]);document.head.appendChild(tag);}window.gtag('consent','update',{analytics_storage:prefs.analytics?'granted':'denied',ad_storage:prefs.marketing?'granted':'denied',ad_user_data:prefs.marketing?'granted':'denied',ad_personalization:prefs.marketing?'granted':'denied'});pending.forEach(function(id){window.gtag('config',id);loaded.google[id]=true;});}function metaPixel(id){if(!id||loaded.meta[id])return;if(!window.fbq){var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!window._fbq)window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];var script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(script);}window.fbq('init',id);window.fbq('track','PageView');loaded.meta[id]=true;}
function hotjar(id){if(!id||loaded.hotjar[id])return;window.hj=window.hj||function(){(window.hj.q=window.hj.q||[]).push(arguments);};window._hjSettings={hjid:Number(id),hjsv:7};var script=document.createElement('script');script.async=true;script.src='https://static.hotjar.com/c/hotjar-'+encodeURIComponent(id)+'.js?sv=7';document.head.appendChild(script);loaded.hotjar[id]=true;}
function tiktok(id){if(!id||loaded.tiktok[id])return;var ttq=window.ttq=window.ttq||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(target,method){target[method]=function(){target.push([method].concat(Array.prototype.slice.call(arguments,0)));};};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(pixelId){var script=document.createElement('script');script.async=true;script.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+encodeURIComponent(pixelId)+'&lib=ttq';document.head.appendChild(script);};ttq.load(id);ttq.page();loaded.tiktok[id]=true;}
function activate(prefs){if(!prefs)return;var gaIds=services.filter(function(item){return item.category==='analytics'&&item.key==='ga4'&&prefs.analytics;}).map(function(item){return item.id;});var adsIds=services.filter(function(item){return item.category==='marketing'&&item.key==='googleAds'&&prefs.marketing;}).map(function(item){return item.id;});googleTag(gaIds.concat(adsIds),prefs);services.forEach(function(item){if(item.category==='analytics'&&prefs.analytics){if(item.key==='hotjar')hotjar(item.id);}if(item.category==='marketing'&&prefs.marketing){if(item.key==='metaPixel')metaPixel(item.id);if(item.key==='tiktokPixel')tiktok(item.id);}});}
function setControls(value){analyticsInput.checked=Boolean(value&&value.analytics);marketingInput.checked=Boolean(value&&value.marketing);}
function showSettings(){setControls(preferences);banner.hidden=false;settings.hidden=false;banner.querySelectorAll('[data-foliox-action="configure"]').forEach(function(button){button.setAttribute('aria-expanded','true');});reopen.hidden=true;}
function hideSettings(){settings.hidden=true;banner.querySelectorAll('[data-foliox-action="configure"]').forEach(function(button){button.setAttribute('aria-expanded','false');});if(preferences)banner.hidden=true;reopen.hidden=false;}
function save(value){var next={necessary:true,analytics:value.analytics===true,marketing:value.marketing===true};try{localStorage.setItem(storageKey,JSON.stringify(next));}catch(error){}preferences=next;settings.hidden=true;banner.hidden=true;reopen.hidden=false;banner.querySelectorAll('[data-foliox-action="configure"]').forEach(function(button){button.setAttribute('aria-expanded','false');});activate(next);}
banner.addEventListener('click',function(event){var button=event.target.closest('[data-foliox-action]');if(!button)return;var action=button.getAttribute('data-foliox-action');if(action==='accept-all')save({analytics:true,marketing:true});else if(action==='necessary')save({analytics:false,marketing:false});else if(action==='configure')showSettings();else if(action==='save')save({analytics:analyticsInput.checked,marketing:marketingInput.checked});else if(action==='close')hideSettings();});
reopen.addEventListener('click',showSettings);
preferences=readPreferences();if(preferences){banner.hidden=true;reopen.hidden=false;setControls(preferences);activate(preferences);}else{banner.hidden=false;reopen.hidden=true;setControls(null);}
})();</script>`;
  return styles + markup + script;
}
function cookieInstructions(data) {
  const platform = data.platform === 'Otro' ? (data.otherPlatform || 'Otra plataforma') : data.platform;
  const instructions = {
    'HTML / cualquier sitio': ['Incluye el fragmento completo una sola vez, antes de la etiqueta </body> de las páginas donde debe aparecer.', 'Comprueba que los scripts opcionales no estén instalados también por separado antes de la elección.', 'Prueba el banner en una ventana privada: primero sin elegir; luego concede una categoría y revisa las solicitudes de red.'],
    WordPress: ['Añade el fragmento en un espacio del tema o de la integración de código personalizado que se ejecute globalmente al final del body.', 'El nombre de los ajustes depende del tema y de las extensiones instaladas; no dupliques las etiquetas en plugins o gestores de etiquetas.', 'Comprueba en una ventana privada que ningún plugin cargue los servicios opcionales antes de la elección.'],
    Shopify: ['Añade el fragmento una sola vez en la plantilla global del tema, cerca del cierre del body, para que aparezca en las páginas pertinentes.', 'Haz una copia del tema antes de editarlo y revisa el resultado con la vista previa del tema.', 'Comprueba las solicitudes de red antes y después de aceptar cada categoría; revisa también las apps que inyecten sus propias etiquetas.'],
    Wix: ['Configura el fragmento como código personalizado global al final del body y en las páginas pertinentes, según las opciones disponibles para tu sitio.', 'Comprueba que no esté duplicado por otra integración o aplicación.', 'Prueba una sesión sin preferencias y revisa las solicitudes de red antes de aceptar.'],
    Webflow: ['Añade el fragmento en el código personalizado global del footer del sitio para las páginas pertinentes.', 'Verifica el resultado publicado en un entorno de prueba o vista previa admitida por tu proyecto.', 'Revisa que las integraciones externas no carguen sus scripts antes de la elección.'],
  };
  const generic = ['Si la plataforma admite insertar HTML y JavaScript sin modificar, coloca el fragmento una sola vez en el código global al final del body.', 'Si no permite insertar el fragmento sin cambios, pide a una persona desarrolladora que lo adapte al punto de entrada global de tu sitio.', 'Prueba en una ventana privada: sin elegir no deben aparecer solicitudes de los servicios configurados; tras aceptar una categoría, verifica solo las integraciones de esa categoría.'];
  const selected = instructions[platform] || generic;
  const platformNote = platform === 'Next.js / React' || platform === 'Otro'
    ? 'No se ha verificado una integración específica fiable para esta plataforma; sigue las instrucciones genéricas de HTML o solicita una adaptación a desarrollo.'
    : '';
  const caution = 'Este fragmento carga únicamente los servicios que declaraste aquí después de conceder su categoría. No bloquea, detecta ni controla automáticamente scripts añadidos por plugins, aplicaciones, gestores de etiquetas u otro código. Si retiras una preferencia tras cargar un servicio, recarga la página: la elección guardada impedirá que vuelva a cargarse en páginas futuras, pero no deshace solicitudes anteriores. Google Ads queda inicializado; las conversiones requieren que configures los eventos correspondientes en tu sitio.';
  return '<div class="cookie-instructions"><h3>Instalación en ' + escapeHtml(platform) + '</h3>' + (platformNote ? '<p>' + escapeHtml(platformNote) + '</p>' : '') + '<ol>' + selected.map((step) => '<li>' + escapeHtml(step) + '</li>').join('') + '</ol><p>' + escapeHtml(caution) + '</p></div>';
}
function renderCookiePreview(data) {
  const stage = document.createElement('div'); stage.className = 'cookie-preview-stage';
  const mock = document.createElement('div'); mock.className = 'cookie-preview-banner ' + (data.position === 'Parte superior' ? 'is-top' : 'is-bottom');
  const content = document.createElement('div'); content.className = 'cookie-preview-copy';
  const title = document.createElement('strong'); title.textContent = data.siteName;
  const message = document.createElement('p'); message.textContent = data.message;
  content.append(title, message);
  if (data.policyUrl) { const link = document.createElement('a'); link.className = 'cookie-preview-link'; link.href = data.policyUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Política de Privacidad o Cookies'; content.append(link); }
  const buttons = document.createElement('div'); buttons.className = 'cookie-preview-actions';
  const response = document.createElement('p'); response.className = 'cookie-preview-response'; response.setAttribute('role', 'status'); response.setAttribute('aria-live', 'polite'); response.hidden = true;
  const settings = document.createElement('section'); settings.className = 'cookie-preview-settings'; settings.hidden = true;
  const settingsTitle = document.createElement('strong'); settingsTitle.textContent = 'Preferencias de la simulación';
  const settingsNote = document.createElement('p'); settingsNote.textContent = 'Las cookies necesarias permanecen activas. Estas opciones solo cambian el estado visual de esta vista previa.';
  const categories = document.createElement('div'); categories.className = 'cookie-preview-categories';
  const necessary = document.createElement('label'); necessary.className = 'cookie-preview-category';
  const necessaryInput = document.createElement('input'); necessaryInput.type = 'checkbox'; necessaryInput.checked = true; necessaryInput.disabled = true;
  necessary.append(necessaryInput, document.createTextNode('Necesarias · siempre activas'));
  const analyticsLabel = document.createElement('label'); analyticsLabel.className = 'cookie-preview-category';
  const analyticsInput = document.createElement('input'); analyticsInput.type = 'checkbox'; analyticsInput.name = 'cookie-preview-analytics';
  analyticsLabel.append(analyticsInput, document.createTextNode('Analítica'));
  const marketingLabel = document.createElement('label'); marketingLabel.className = 'cookie-preview-category';
  const marketingInput = document.createElement('input'); marketingInput.type = 'checkbox'; marketingInput.name = 'cookie-preview-marketing';
  marketingLabel.append(marketingInput, document.createTextNode('Marketing'));
  categories.append(necessary, analyticsLabel, marketingLabel);
  const settingsActions = document.createElement('div'); settingsActions.className = 'cookie-preview-settings-actions';
  const savePreferences = document.createElement('button'); savePreferences.type = 'button'; savePreferences.textContent = 'Guardar preferencias';
  const closeSettings = document.createElement('button'); closeSettings.type = 'button'; closeSettings.className = 'is-secondary'; closeSettings.textContent = 'Cerrar';
  settingsActions.append(savePreferences, closeSettings); settings.append(settingsTitle, settingsNote, categories, settingsActions);
  const previewButton = (label, action, primary = false) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.dataset.cookiePreviewAction = action;
    if (primary) button.classList.add('is-primary');
    return button;
  };
  const acceptButton = previewButton(data.acceptLabel, 'accept', true);
  const necessaryButton = previewButton(data.rejectLabel, 'necessary');
  const configureButton = previewButton(data.configureLabel, 'configure');
  buttons.append(acceptButton, necessaryButton, configureButton); mock.append(content, buttons); stage.append(mock, settings, response);
  const showResponse = (text) => { settings.hidden = true; response.textContent = text; response.hidden = false; };
  acceptButton.addEventListener('click', () => showResponse('En esta simulación, aceptaste las cookies opcionales. No se guarda ni se envía esta elección.'));
  necessaryButton.addEventListener('click', () => showResponse('En esta simulación, elegiste usar solo las cookies necesarias. No se guarda ni se envía esta elección.'));
  configureButton.addEventListener('click', () => { response.hidden = true; settings.hidden = false; analyticsInput.focus(); });
  savePreferences.addEventListener('click', () => showResponse('Preferencias de simulación: analítica ' + (analyticsInput.checked ? 'aceptada' : 'no aceptada') + ' y marketing ' + (marketingInput.checked ? 'aceptado' : 'no aceptado') + '. No se guarda ni se envía esta elección.'));
  closeSettings.addEventListener('click', () => { settings.hidden = true; configureButton.focus(); });
  const note = document.createElement('p'); note.className = 'cookie-preview-limit'; note.textContent = 'Simulación visual: no carga servicios de analítica ni marketing, no guarda preferencias y no envía datos.';
  preview.replaceChildren(stage, note);
}
function renderCookies(data) {
  cookieSnippet = cookieMarkup(data);
  document.querySelector('#tool-result-title').textContent = 'Tu banner de cookies está listo';
  document.querySelector('#result-description').textContent = 'Vista previa, código e instrucciones para revisar antes de instalar el banner en tu sitio.';
  renderCookiePreview(data);
  document.querySelector('#cookie-generated-code').value = cookieSnippet;
  document.querySelector('#cookie-install-instructions').innerHTML = cookieInstructions(data);
  document.querySelector('#cookie-generation-error').hidden = true;
  document.querySelector('#tool-form-panel').hidden = true;
  result.hidden = false;
  showCookieProgress(3);
  selectCookieTab('preview');
  result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  announce('Banner generado. Comprueba las integraciones y los servicios que tu sitio utiliza realmente.');
}
function copySnippet() {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(cookieSnippet).then(() => announce('Código copiado.')).catch(() => fallbackCopy(cookieSnippet));
  else fallbackCopy(cookieSnippet);
}
function selectCookieTab(name) {
  document.querySelectorAll('[data-cookie-tab]').forEach((tab) => {
    const selected = tab.dataset.cookieTab === name;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('.cookie-result-panel').forEach((panel) => { panel.hidden = panel.id !== 'cookie-panel-' + name; });
}
function showCookieProgress(step) {
  document.querySelectorAll('[data-cookie-progress]').forEach((item) => {
    const itemStep = Number(item.dataset.cookieProgress);
    item.classList.toggle('is-current', itemStep === step); item.classList.toggle('is-complete', itemStep < step);
    if (itemStep === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
  });
  document.querySelector('#cookie-step-number').textContent = String(step);
  document.querySelector('#cookie-result-step-number').textContent = String(step);
}
function showCookieStep(step) {
  document.querySelector('#cookie-step-1').hidden = step !== 1; document.querySelector('#cookie-step-2').hidden = step !== 2;
  document.querySelector('#cookie-generation-error').hidden = true;
  document.querySelector('#tool-form-title').textContent = step === 1 ? 'Tu sitio' : '¿Qué cookies usas?';
  document.querySelector('#tool-needs').textContent = step === 1 ? config.needs : 'Selecciona solo los servicios que utiliza tu sitio. Al marcar una opción, aparecerán debajo los datos necesarios.';
  document.querySelector('#cookie-previous').disabled = step === 1;
  document.querySelector('#cookie-next').hidden = step !== 1;
  document.querySelector('#tool-submit').hidden = step !== 2;
  showCookieProgress(step);
  document.querySelector('#cookie-step-' + step).focus({ preventScroll: true });
}
function setCookieFieldError(name, message = '') {
  const error = document.querySelector('#field-' + name + '-error');
  if (error) { error.textContent = message; error.hidden = !message; }
  form.querySelectorAll('input[name="' + name + '"], textarea[name="' + name + '"]').forEach((control) => { if (message) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid'); });
}
function updateCookieConditionals() {
  config.fields.filter((field) => field.conditionalWhen).forEach((field) => {
    const wrap = document.querySelector('#field-' + field.name + '-wrap');
    if (!wrap) return;
    wrap.hidden = !consentConditionMatches(field.conditionalWhen);
    if (wrap.hidden) {
      // Keep conditional values when a service is temporarily unchecked so
      // selecting it again does not discard the identifier the user entered.
      setCookieFieldError(field.name);
    }
  });
  cookieServiceDetails.forEach((details, service) => {
    const selected = [...form.querySelectorAll('input[name="services"]')].some((input) => input.value === service && input.checked);
    details.hidden = !selected;
  });
}
function validateCookieStep(step) {
  let valid = true;
  const patterns = { ga4Id: /^G-[A-Z0-9]{6,12}$/i, googleAdsId: /^AW-\d{6,}$/i, metaPixelId: /^\d{5,20}$/, hotjarSiteId: /^\d{4,12}$/, tiktokPixelId: /^[A-Za-z0-9-]{6,40}$/ };
  const formatMessages = {
    ga4Id: 'Formato esperado: G- seguido de 6 a 12 letras o números (por ejemplo, G-ABC1234567).',
    googleAdsId: 'Formato esperado: AW- seguido de al menos 6 dígitos (por ejemplo, AW-123456789).',
    metaPixelId: 'Ingresa solo el ID numérico de Meta Pixel, entre 5 y 20 dígitos.',
    hotjarSiteId: 'Ingresa solo el ID numérico de Hotjar, entre 4 y 12 dígitos.',
    tiktokPixelId: 'Ingresa el ID de TikTok Pixel con 6 a 40 letras, números o guiones.',
  };
  config.fields.filter((field) => field.step === step).forEach((field) => {
    const wrap = document.querySelector('#field-' + field.name + '-wrap');
    if (wrap?.hidden) { setCookieFieldError(field.name); return; }
    const controls = [...form.querySelectorAll('input[name="' + field.name + '"]')];
    let value = ''; let invalid = false;
    if (field.kind === 'radio') { value = form.querySelector('input[name="' + field.name + '"]:checked')?.value || ''; invalid = Boolean(field.required && !value); }
    else if (field.kind === 'checkboxes') { value = controls.filter((control) => control.checked); invalid = Boolean(field.required && !value.length); }
    else { value = String(form.elements.namedItem(field.name)?.value || '').trim(); invalid = Boolean(field.required && !value); }
    if (!invalid && field.name === 'policyUrl' && value) { try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); } catch { invalid = true; } }
    if (!invalid && patterns[field.name] && value) invalid = !patterns[field.name].test(value);
    setCookieFieldError(field.name, invalid ? (field.name === 'policyUrl' ? 'Ingresa una URL que comience con http:// o https://.' : patterns[field.name] ? formatMessages[field.name] : field.kind ? 'Selecciona una opción para continuar.' : 'Completa este campo.') : '');
    if (invalid) valid = false;
  });
  if (!valid) form.querySelector('[aria-invalid="true"]')?.focus();
  return valid;
}
function resetCookieWorkflow() {
  form.reset(); config.fields.forEach((field) => setCookieFieldError(field.name));
  cookieSnippet = ''; document.querySelector('#tool-result').hidden = true; document.querySelector('#tool-form-panel').hidden = false;
  document.querySelector('#cookie-generation-error').textContent = ''; document.querySelector('#tool-status').hidden = true; document.querySelector('#tool-status').textContent = '';
  updateCookieConditionals(); showCookieStep(1); document.querySelector('#field-siteName').focus({ preventScroll: true });
}
function initCookieWorkflow() {
  handleCookieSubmit = () => {
    if (!validateCookieStep(2)) return;
    const error = document.querySelector('#cookie-generation-error'); error.hidden = true; error.textContent = '';
    try { renderCookies(readForm()); }
    catch (generationError) {
      console.error('No se pudo generar el banner de cookies.', generationError);
      error.textContent = 'No se pudo generar el banner. Revisa los datos e inténtalo nuevamente.'; error.hidden = false; error.focus({ preventScroll: true });
    }
  };
  document.querySelector('#cookie-next').addEventListener('click', () => { if (validateCookieStep(1)) showCookieStep(2); });
  document.querySelector('#cookie-previous').addEventListener('click', () => showCookieStep(1));
  document.querySelector('#cookie-copy-code').addEventListener('click', copySnippet);
  document.querySelector('#cookie-download-code').addEventListener('click', () => downloadFile('banner-cookies-foliox-studio.html', standaloneHtml('Banner de Cookies', cookieSnippet), 'text/html;charset=utf-8'));
  document.querySelector('#cookie-edit').addEventListener('click', () => { result.hidden = true; document.querySelector('#tool-form-panel').hidden = false; showCookieStep(2); });
  document.querySelector('#cookie-new').addEventListener('click', resetCookieWorkflow);
  document.querySelectorAll('[data-cookie-tab]').forEach((tab) => {
    tab.addEventListener('click', () => selectCookieTab(tab.dataset.cookieTab));
    tab.addEventListener('keydown', (event) => {
      const tabs = [...document.querySelectorAll('[data-cookie-tab]')]; const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? tabs[(index + 1) % tabs.length] : event.key === 'ArrowLeft' ? tabs[(index - 1 + tabs.length) % tabs.length] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : null;
      if (next) { event.preventDefault(); selectCookieTab(next.dataset.cookieTab); next.focus(); }
    });
  });
  const updateCookieFieldState = (event) => { updateCookieConditionals(); if (config.fields.some((field) => field.name === event.target.name)) setCookieFieldError(event.target.name); };
  form.addEventListener('input', updateCookieFieldState); form.addEventListener('change', updateCookieFieldState);
  updateCookieConditionals(); showCookieStep(1);
}

function fallbackCopy(text) {
  const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select();
  const copied = document.execCommand('copy'); input.remove(); announce(copied ? 'Código copiado.' : 'No se pudo copiar automáticamente. Selecciona el código en la vista previa.');
}
function printResult() {
  const openPrintDialog = () => {
    document.body.classList.add('printing-doc-tool');
    window.print();
  };
  const logo = document.querySelector('#tool-preview .rat-document-brand img');
  if (logo && typeof logo.decode === 'function') logo.decode().catch(() => {}).finally(openPrintDialog);
  else openPrintDialog();
}

const ratTemplates = {
  ecommerce: { name: 'E-commerce', activities: ['Gestión de clientes', 'Gestión de pedidos y despacho', 'Comunicaciones comerciales o newsletter', 'Analítica y estadísticas del sitio web', 'Facturación electrónica'] },
  health: { name: 'Clínica / Salud', activities: [
    {
      activity: 'Ficha clínica de pacientes',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)', 'Salud y datos médicos'],
        peopleCategories: ['Pacientes'],
        purpose: 'Ejemplo editable: registrar y consultar información clínica necesaria para la atención y el seguimiento.',
        legalBasis: 'Consentimiento del titular',
        recipients: 'Ejemplo editable: personal clínico autorizado que participa en la atención (confirmar según corresponda).',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: [],
      },
    },
    {
      activity: 'Agendamiento de horas médicas',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Pacientes'],
        purpose: 'Ejemplo editable: coordinar horas y enviar recordatorios relacionados con la atención.',
        legalBasis: 'Ejecución de contrato',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: [],
      },
    },
    {
      activity: 'Historial médico y diagnósticos',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Salud y datos médicos'],
        peopleCategories: ['Pacientes'],
        purpose: 'Ejemplo editable: organizar antecedentes, diagnósticos, tratamientos y evolución clínica.',
        legalBasis: 'Obligación legal',
        recipients: 'Ejemplo editable: profesionales autorizados que participan en la atención, si corresponde.',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: [],
      },
    },
    {
      activity: 'Facturación a pacientes y convenios',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Financieros (pago, cuenta bancaria)'],
        peopleCategories: ['Pacientes'],
        purpose: 'Ejemplo editable: documentar cobros y gestionar la facturación o el convenio informado. Incluye datos de salud solo cuando sean necesarios para este proceso.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: [],
      },
    },
  ] },
  education: { name: 'Colegio / Educación', activities: [
    {
      activity: 'Proceso de matrícula',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)', 'Académicos (notas, asistencia)'],
        peopleCategories: ['Estudiantes', 'Apoderados'],
        purpose: 'Formalizar la matrícula anual, verificar los requisitos de admisión y registrar al estudiante.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Comunicación con apoderados',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Apoderados'],
        purpose: 'Enviar comunicados, citaciones, boletines e información del establecimiento.',
        legalBasis: 'Ejecución de contrato',
        recipients: 'Ejemplo editable: Plataforma de comunicaciones escolares.',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: Mientras se mantenga la relación educativa.',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Registro de calificaciones y evaluaciones',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Académicos (notas, asistencia)'],
        peopleCategories: ['Estudiantes'],
        purpose: 'Registrar y calcular calificaciones, pruebas y promedios por asignatura.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Control de asistencia',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Académicos (notas, asistencia)'],
        peopleCategories: ['Estudiantes'],
        purpose: 'Registrar diariamente la asistencia y apoyar el seguimiento de ausencias.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
  ] },
  restaurant: { name: 'Restaurante', activities: [
    {
      activity: 'Gestión de reservas',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Clientes'],
        purpose: 'Registrar y gestionar reservas de mesa, enviar confirmaciones y recordatorios.',
        legalBasis: 'Ejecución de contrato',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: 1 año',
        securityMeasures: ['Control de acceso por roles', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Delivery y pedidos a domicilio',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)', 'Financieros (pago, cuenta bancaria)'],
        peopleCategories: ['Clientes'],
        purpose: 'Gestionar pedidos, coordinar la entrega y procesar los pagos.',
        legalBasis: 'Ejecución de contrato',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: 2 años',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Newsletter y programa de fidelización',
      values: {
        dataCategories: ['Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Clientes'],
        purpose: 'Comunicar promociones, eventos y beneficios del programa de fidelización.',
        legalBasis: 'Consentimiento del titular',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: Hasta que se retire el consentimiento',
        securityMeasures: ['Control de acceso por roles', 'Política de contraseñas'],
      },
    },
  ] },
  professional: { name: 'Servicio profesional', activities: [
    {
      activity: 'CRM / Base de clientes',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Clientes'],
        purpose: 'Ejemplo editable: Gestionar la relación comercial con clientes: propuestas, proyectos, seguimiento y comunicación.',
        legalBasis: 'Ejecución de contrato',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: Mientras dure la relación comercial y el plazo adicional que la organización confirme',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
    {
      activity: 'Facturación y contabilidad',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Financieros (pago, cuenta bancaria)'],
        peopleCategories: ['Clientes', 'Proveedores'],
        purpose: 'Ejemplo editable: Emitir facturas, gestionar cobros y mantener la contabilidad de la empresa.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas', 'Firewall / protección de red', 'Registro de accesos (logs)'],
      },
    },
    {
      activity: 'Gestión de recursos humanos',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)', 'Financieros (pago, cuenta bancaria)', 'Laborales (cargo, sueldo)'],
        peopleCategories: ['Empleados'],
        purpose: 'Ejemplo editable: Administrar contratos, remuneraciones, vacaciones y documentación laboral.',
        legalBasis: 'Obligación legal',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: '',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas', 'Firewall / protección de red', 'Registro de accesos (logs)'],
      },
    },
    {
      activity: 'Comunicación y gestión de proyectos',
      values: {
        dataCategories: ['Identificación (nombre, RUT, documento)', 'Contacto (email, teléfono, dirección)'],
        peopleCategories: ['Clientes', 'Empleados'],
        purpose: 'Ejemplo editable: Coordinar y documentar el trabajo de proyectos y la comunicación interna y con clientes.',
        legalBasis: 'Ejecución de contrato',
        recipients: '',
        internationalTransfer: null,
        internationalCountry: '',
        retention: 'Ejemplo editable: Mientras dure el proyecto y el plazo adicional que la organización confirme',
        securityMeasures: ['Cifrado de datos', 'Control de acceso por roles', 'Copias de seguridad (backup)', 'Política de contraseñas'],
      },
    },
  ] },
  empty: { name: 'Empezar desde cero', activities: [] },
};
let selectedRatTemplate = null;
  let editingRatActivity = null;

function initRatWorkflow() {
  const companyInput = document.querySelector('#rat-organization');
  if (!companyInput) return;
  const rutInput = document.querySelector('#rat-rut');
  const rutMessage = document.querySelector('#rat-rut-message');
  let currentRutValid = true;
  const templatePanel = document.querySelector('#rat-template-panel');
  const companyPanel = document.querySelector('#rat-company-panel');
  const activitiesPanel = document.querySelector('#rat-activities-panel');
  const templateButtons = [...document.querySelectorAll('.rat-template')];
  const disabledNote = document.querySelector('#rat-template-disabled-note');
  const formPanel = document.querySelector('#tool-form-panel');
  const activityList = document.querySelector('#rat-activity-list');
  const emptyState = document.querySelector('#rat-empty-state');
  const companySummary = document.querySelector('#rat-company-summary');
  const activityCount = document.querySelector('#rat-activity-count');
  const submitButton = document.querySelector('#tool-submit');
  const cancelButton = document.querySelector('#rat-cancel-edit');
  const viewButton = document.querySelector('#rat-view-document');
  const resultHeading = document.querySelector('#tool-result .doc-tool-card-heading');
  resultHeading.classList.add('rat-document-topline');
  const titleGroup = document.createElement('div');
  titleGroup.className = 'rat-document-title-group';
  [...resultHeading.children].forEach((child) => titleGroup.append(child));
  resultHeading.append(titleGroup, actions);
  const activityFields = config.fields.map((field) => field.name);

  function organization() { return companyInput.value.trim(); }
  function rut() { return currentRutValid ? rutInput.value.trim() : ''; }
  function updateRutInput() {
    window.FolioxRut.normalizeCurrent(rutInput);
    currentRutValid = !rutInput.value || window.FolioxRut.isComplete(rutInput.value);

    const message = currentRutValid ? '' : 'Revisa el RUT ingresado.';
    rutMessage.textContent = message;
    rutMessage.hidden = !message;
    rutInput.setAttribute('aria-invalid', String(!currentRutValid));
    return currentRutValid;
  }
  rutInput.addEventListener('input', () => { updateRutInput(); setTemplateButtonsEnabled(); });
  function setTemplateButtonsEnabled() {
    const rutValid = updateRutInput();
    const enabled = organization().length > 0 && rutValid;
    templateButtons.forEach((button) => { button.disabled = !enabled; });
    disabledNote.textContent = organization().length && !rutValid ? 'Revisa el RUT ingresado para continuar.' : 'Primero completa el nombre de la empresa para habilitar las plantillas.';
    disabledNote.hidden = enabled;
    document.querySelector('#rat-company-error').hidden = true;
  }
  function hasUnsavedActivity() {
    const current = readForm();
    if (editingRatActivity !== null) return activityFields.some((name) => JSON.stringify(current[name]) !== JSON.stringify(activities[editingRatActivity]?.[name] ?? (Array.isArray(current[name]) ? [] : current[name] === null ? null : typeof current[name] === 'boolean' ? false : '')));
    return Object.values(current).some((value) => Array.isArray(value) ? value.length > 0 : value === true || typeof value === 'string' && value.trim().length > 0) || form.dataset.transferTouched === 'true';
  }
  function abandonEditorIfNeeded() {
    if (!formPanel.hidden && hasUnsavedActivity() && !window.confirm('Hay datos de una actividad sin guardar. ¿Quieres descartarlos y continuar?')) return false;
    closeEditor();
    return true;
  }
  function closeEditor() {
    form.reset();
    form.dataset.transferTouched = 'false';
    document.querySelector('#field-internationalCountry-wrap').hidden = true;
    form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
    fieldsRoot.querySelectorAll('.doc-tool-field-error').forEach((error) => { error.hidden = true; error.textContent = ''; });
    editingRatActivity = null;
    formPanel.hidden = true;
    cancelButton.hidden = true;
    submitButton.textContent = config.submit;
    document.querySelector('#tool-form-title').textContent = 'Completa los datos de la actividad';
  }
  function openEditor(index = null) {
    if (!abandonEditorIfNeeded()) return;
    result.hidden = true;
    editingRatActivity = index;
    form.reset();
    form.dataset.transferTouched = 'false';
    document.querySelector('#field-internationalCountry-wrap').hidden = true;
    if (index !== null) {
      const saved = activities[index];
      config.fields.forEach((field) => {
        if (field.kind === 'checkboxes') {
          const selected = Array.isArray(saved[field.name]) ? saved[field.name] : [];
          form.querySelectorAll('input[name="' + field.name + '"]').forEach((input) => { input.checked = selected.includes(input.value); });
        } else if (field.kind === 'radio') {
          form.querySelectorAll('input[name="' + field.name + '"]').forEach((input) => { input.checked = input.value === (saved[field.name] || ''); });
        } else if (field.kind === 'checkbox') {
          const input = form.querySelector('input[name="' + field.name + '"]');
          input.checked = saved[field.name] === true;
        } else {
          form.elements.namedItem(field.name).value = saved[field.name] || '';
        }
      });
      document.querySelector('#field-internationalCountry-wrap').hidden = !form.querySelector('input[name="internationalTransfer"]')?.checked;
      submitButton.textContent = 'Guardar cambios';
      cancelButton.hidden = false;
      document.querySelector('#tool-form-title').textContent = 'Editar actividad';
    } else {
      submitButton.textContent = config.submit;
      cancelButton.hidden = false;
      document.querySelector('#tool-form-title').textContent = 'Completa los datos de la actividad';
    }
    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    form.elements.namedItem('activity').focus({ preventScroll: true });
  }
  function addDetail(container, label, value) {
    if (value === undefined) return;
    const item = document.createElement('div'); item.className = 'rat-detail';
    const name = document.createElement('strong'); name.textContent = label;
    const content = document.createElement('span'); content.textContent = String(value || '').trim() || 'Pendiente de completar';
    if (!String(value || '').trim()) content.classList.add('is-pending');
    item.append(name, content); container.append(item);
  }
  function renderActivityList() {
    activityList.replaceChildren();
    activities.forEach((activity, index) => {
      const card = document.createElement('article'); card.className = 'rat-activity-card';
      const heading = document.createElement('div'); heading.className = 'rat-activity-card-heading';
      const number = document.createElement('span'); number.className = 'rat-activity-number'; number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('h3'); title.textContent = activity.activity || 'Actividad sin nombre';
      const buttons = document.createElement('div'); buttons.className = 'rat-card-actions';
      const edit = makeButton('Editar', () => openEditor(index)); edit.classList.add('rat-card-edit');
      const remove = makeButton('Eliminar', () => {
        if (!window.confirm('¿Eliminar “' + (activity.activity || 'esta actividad') + '” del registro?')) return;
        activities.splice(index, 1); renderActivityList(); result.hidden = true; document.querySelector('#rat-add-activity').focus();
      }); remove.classList.add('rat-card-delete');
      buttons.append(edit, remove); heading.append(number, title, buttons);
      const details = document.createElement('div'); details.className = 'rat-activity-details';
      addDetail(details, 'Categorías de datos', Array.isArray(activity.dataCategories) ? activity.dataCategories.join(', ') : activity.data);
      addDetail(details, 'Finalidad declarada', activity.purpose);
      addDetail(details, 'Titulares', Array.isArray(activity.peopleCategories) ? activity.peopleCategories.join(', ') : activity.people);
      addDetail(details, 'Destinatarios / encargados', activity.recipients);
      addDetail(details, 'Plazo de conservación', activity.retention);
      addDetail(details, 'Base de legitimidad', activity.legalBasis);
      addDetail(details, 'Transferencia internacional', activity.internationalTransfer === true ? 'Sí' + (activity.internationalCountry ? ' · ' + activity.internationalCountry : '') : activity.internationalTransfer === false ? 'No' : '');
      addDetail(details, 'Medidas de seguridad', Array.isArray(activity.securityMeasures) ? activity.securityMeasures.join(', ') : '');
      card.append(heading, details); activityList.append(card);
    });
    emptyState.hidden = activities.length > 0;
    activityCount.textContent = activities.length + (activities.length === 1 ? ' actividad en el registro' : ' actividades en el registro');
    companySummary.textContent = organization() + (rut() ? ' · RUT: ' + rut() : '') + ' · ' + activities.length + (activities.length === 1 ? ' actividad' : ' actividades');
    viewButton.disabled = activities.length === 0;
    const suggestions = document.querySelector('#rat-empty-suggestions');
    const suggestionList = document.querySelector('#rat-empty-suggestion-list');
    if (suggestions && suggestionList) {
      suggestionList.replaceChildren();
      const availableSuggestions = selectedRatTemplate === 'empty'
        ? ratTemplates.professional.activities.filter((preset) => !activities.some((activity) => activity.activity === preset.activity))
        : [];
      suggestions.hidden = availableSuggestions.length === 0;
      availableSuggestions.forEach((preset) => {
        const button = makeButton('＋ Agregar ' + preset.activity, () => {
          activities.push(makeBlankActivity(preset));
          renderActivityList();
          activityList.children[activities.length - 1]?.querySelector('.rat-card-edit')?.focus();
        });
        button.classList.add('rat-suggestion-button');
        suggestionList.append(button);
      });
    }
  }
  saveRatActivity = (data) => {
    const record = { organization: organization(), rut: rut(), ...data };
    record.data = (record.dataCategories || []).join(', ');
    record.people = (record.peopleCategories || []).join(', ');
    const wasEditing = editingRatActivity !== null;
    const savedIndex = wasEditing ? editingRatActivity : activities.length;
    if (wasEditing) activities[savedIndex] = record;
    else activities.push(record);
    closeEditor(); result.hidden = true; renderActivityList();
    activityCount.textContent = (wasEditing ? 'Cambios guardados. ' : 'Actividad agregada. ') + activityCount.textContent;
    activityList.children[savedIndex]?.querySelector('.rat-card-edit')?.focus();
  };
  function showActivities() {
    companyPanel.hidden = true; templatePanel.hidden = true; activitiesPanel.hidden = false;
    formPanel.hidden = true; result.hidden = true; renderActivityList();
    activitiesPanel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function makeBlankActivity(definition) {
    const isPreset = typeof definition === 'object' && definition !== null;
    const name = isPreset ? definition.activity : definition;
    const record = { organization: organization(), rut: rut(), activity: name || '' };
    config.fields.forEach((field) => {
      if (field.name === 'activity') return;
      record[field.name] = field.kind === 'checkboxes' ? [] : field.kind === 'checkbox' ? null : '';
    });
    if (isPreset) {
      Object.entries(definition.values || {}).forEach(([field, value]) => {
        record[field] = Array.isArray(value) ? [...value] : value;
      });
    }
    return record;
  }
  function chooseTemplate(id) {
    if (!updateRutInput()) { rutInput.focus(); return; }
    if (!organization()) {
      document.querySelector('#rat-company-error').hidden = false;
      companyInput.focus(); return;
    }
    if (!abandonEditorIfNeeded()) return;
    if (id === selectedRatTemplate) {
      if (activities.length && activities.some((item) => item.organization !== organization() || (item.rut || '') !== rut())) {
        if (!window.confirm('¿Actualizar los datos de empresa en todas las actividades actuales?')) {
          companyInput.value = activities[0].organization;
          rutInput.value = activities[0].rut || '';
          window.FolioxRut.normalizeCurrent(rutInput);
          updateRutInput(); setTemplateButtonsEnabled();
        } else activities.forEach((item) => { item.organization = organization(); item.rut = rut(); });
      }
      showActivities(); return;
    }
    if (activities.length && !window.confirm('Cambiar la plantilla reemplazará las ' + activities.length + ' actividades actuales. ¿Quieres continuar?')) { showActivities(); return; }
    selectedRatTemplate = id;
    activities = ratTemplates[id].activities.map((name) => makeBlankActivity(name));
    templateButtons.forEach((button) => {
      const selected = button.dataset.template === id;
      button.setAttribute('aria-pressed', String(selected));
    });
    const templateNote = id === 'empty'
      ? 'El registro comienza vacío. Agrega las actividades sugeridas una por una; sus valores son ejemplos editables y debes confirmarlos antes de usarlos.'
      : id === 'health'
        ? 'Ejemplos editables para Clínica / Salud. Confirma las categorías y bases sugeridas antes de guardar; agrega datos biométricos solo si se utilizan y datos de salud en facturación solo si son necesarios. Los destinatarios precargados son ejemplos, no datos confirmados. Transferencias, países, plazos y medidas no confirmados quedan vacíos.'
        : id === 'education'
          ? 'Ejemplos editables para Colegio / Educación. Confirma las categorías, bases y medidas sugeridas. La plataforma y el criterio de conservación en comunicaciones son ejemplos editables, no datos confirmados. Destinatarios, transferencias, países y plazos no confirmados quedan vacíos.'
        : id === 'restaurant'
          ? 'Ejemplos editables para Restaurante. Confirma las categorías, bases y medidas antes de usar el registro. Los plazos son valores de ejemplo, no plazos legales. Los destinatarios, transferencias y países no se han precargado: complétalos solo con información confirmada.'
          : id === 'professional'
            ? 'Ejemplos editables para Servicio profesional. Confirma las categorías, bases y medidas antes de usar el registro. Los destinatarios, transferencias, países y plazos sin definir deben completarse solo con información confirmada; los criterios de conservación precargados son sugerencias, no plazos legales.'
        : 'Actividades de referencia para ' + ratTemplates[id].name + '. Revisa y completa cada campo; la plantilla no valida su contenido.';
    const templateNoteSuffix = ['empty', 'health', 'education', 'restaurant', 'professional'].includes(id) ? '' : ' El modelo actual no incluye campos de base jurídica ni de transferencia internacional.';
    document.querySelector('#rat-template-note').textContent = templateNote + templateNoteSuffix;
    showActivities();
  }

  companyInput.addEventListener('input', setTemplateButtonsEnabled);
  updateRutInput();
  templateButtons.forEach((button) => button.addEventListener('click', () => chooseTemplate(button.dataset.template)));
  document.querySelector('#rat-back-company').addEventListener('click', () => {
    if (!abandonEditorIfNeeded()) return;
    activitiesPanel.hidden = true; companyPanel.hidden = false; templatePanel.hidden = false; result.hidden = true;
    companyInput.focus();
  });
  document.querySelector('#rat-change-template').addEventListener('click', () => {
    if (!abandonEditorIfNeeded()) return;
    activitiesPanel.hidden = true; companyPanel.hidden = false; templatePanel.hidden = false; result.hidden = true;
    templateButtons[0].focus();
  });
  document.querySelector('#rat-add-activity').addEventListener('click', () => openEditor());
  form.addEventListener('change', (event) => {
    if (event.target.name !== 'internationalTransfer') return;
    form.dataset.transferTouched = 'true';
    const checked = event.target.checked;
    document.querySelector('#field-internationalCountry-wrap').hidden = !checked;
    if (!checked) form.elements.namedItem('internationalCountry').value = '';
  });
  cancelButton.addEventListener('click', () => { const returnIndex = editingRatActivity; closeEditor(); renderActivityList(); (activityList.children[returnIndex ?? 0]?.querySelector('.rat-card-edit') || document.querySelector('#rat-add-activity')).focus(); });
  viewButton.addEventListener('click', () => {
    if (!activities.length) return;
    if (!formPanel.hidden && !abandonEditorIfNeeded()) return;
    renderRatTable(); activitiesPanel.hidden = true; result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  setTemplateButtonsEnabled();
}

if (config) {
  document.title = config.title + ' — FOLIOX Studio';
  document.querySelector('#tool-title').textContent = config.title;
  document.querySelector('#tool-breadcrumb-current').textContent = config.title;
  document.querySelector('#tool-description').textContent = config.description;
  document.querySelector('#tool-needs').textContent = config.needs;
  document.querySelector('#tool-submit').textContent = config.submit;
  config.fields.forEach(addField);
  if (toolType === 'consent') initConsentWorkflow();
  if (toolType === 'cookies') initCookieWorkflow();
  if (toolType === 'rat') initRatWorkflow();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (toolType === 'consent') { handleConsentSubmit?.(); return; }
    if (toolType === 'cookies') { handleCookieSubmit?.(); return; }
    let valid = true;
    config.fields.forEach((definition) => {
      const controls = [...form.querySelectorAll('[name="' + definition.name + '"]')];
      const control = controls[0] || form.elements.namedItem(definition.name);
      const error = document.querySelector('#field-' + definition.name + '-error');
      const empty = !String(control?.value || '').trim();
      const invalid = Boolean(definition.required && empty) || controls.some((item) => !item.validity.valid);
      if (error) { error.textContent = invalid ? (empty ? 'Completa este campo.' : 'Revisa el formato ingresado.') : ''; error.hidden = !invalid; }
      if (invalid) { control?.setAttribute('aria-invalid', 'true'); valid = false; }
      else controls.forEach((item) => item.removeAttribute('aria-invalid'));
    });
    if (!valid) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    const data = readForm();
    if (toolType === 'rat') {
      saveRatActivity?.(data);
      return;
    } else if (toolType === 'consent') renderConsent(data);
    else {
      if (data.policyUrl) {
        try { const url = new URL(data.policyUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
        catch { document.querySelector('#tool-error').textContent = 'El enlace debe ser una dirección web que comience con http:// o https://.'; document.querySelector('#tool-error').hidden = false; form.elements.namedItem('policyUrl').focus(); return; }
      }
      document.querySelector('#tool-error').hidden = true; renderCookies(data);
    }
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
  form.addEventListener('input', (event) => {
    const control = event.target;
    if (!control.matches('input, textarea')) return;
    const error = document.querySelector('#' + control.id + '-error');
    if (error && (String(control.value).trim() || control.validity.valid)) { error.hidden = true; control.removeAttribute('aria-invalid'); }
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('printing-doc-tool'));
} else {
  document.querySelector('#tool-title').textContent = 'Herramienta no encontrada';
  form.hidden = true;
}
