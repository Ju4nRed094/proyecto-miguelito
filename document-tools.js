const toolConfigs = {
  rat: {
    title: 'Registro de Tratamiento (RAT)',
    description: 'Organiza en un registro las actividades que describas. Puedes añadir varias actividades y descargar un borrador HTML o imprimirlo como PDF.',
    needs: 'Identifica la organización y completa los campos de cada actividad: finalidad, datos, personas, destinatarios y conservación. Usa “No informado” si aún necesitas confirmar un dato.',
    submit: 'Añadir actividad al registro',
    fields: [
      { name: 'organization', label: 'Organización responsable', required: true, placeholder: 'Nombre de la organización' },
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
    description: 'Prepara un formulario imprimible para describir una solicitud de consentimiento con los datos que proporciones. El borrador no recopila ni registra la respuesta de quien lo complete.',
    needs: 'Necesitas indicar quién solicita el consentimiento, un correo de contacto, la finalidad y las categorías de datos involucradas.',
    submit: 'Generar formulario',
    fields: [
      { name: 'organization', label: 'Responsable u organización', required: true, placeholder: 'Nombre de la persona u organización' },
      { name: 'email', label: 'Correo de contacto', required: true, type: 'email', placeholder: 'contacto@ejemplo.cl' },
      { name: 'purpose', label: 'Finalidad específica', required: true, multiline: true, placeholder: 'Describe el propósito para el que se pediría el consentimiento' },
      { name: 'data', label: 'Categorías de datos involucrados', required: true, multiline: true, placeholder: 'Describe las categorías de datos' },
      { name: 'extra', label: 'Información adicional para explicar a la persona (opcional)', multiline: true, placeholder: 'Agrega solo información que hayas confirmado' },
    ],
  },
  cookies: {
    title: 'Banner de Cookies',
    description: 'Personaliza un aviso visual y descarga un fragmento HTML/CSS/JavaScript para integrarlo en tu sitio. El fragmento guarda la elección en el navegador de la persona.',
    needs: 'Indica el nombre del sitio y el mensaje. Puedes personalizar las etiquetas de los botones y añadir un enlace a la política de cookies o privacidad.',
    submit: 'Generar código del banner',
    fields: [
      { name: 'siteName', label: 'Nombre del sitio', required: true, placeholder: 'Ej.: Mi Sitio' },
      { name: 'message', label: 'Mensaje del aviso', required: true, multiline: true, value: 'Este sitio utiliza cookies. Puedes aceptar o rechazar las cookies opcionales.', placeholder: 'Explica el uso de cookies con información verificada' },
      { name: 'acceptLabel', label: 'Texto del botón para aceptar', required: true, value: 'Aceptar', placeholder: 'Aceptar' },
      { name: 'rejectLabel', label: 'Texto del botón para rechazar', required: true, value: 'Rechazar', placeholder: 'Rechazar' },
      { name: 'policyUrl', label: 'Enlace a la política (opcional)', type: 'url', placeholder: 'https://ejemplo.cl/privacidad' },
    ],
  },
};

const toolType = document.body.dataset.tool;
const config = toolConfigs[toolType];
const form = document.querySelector('#doc-tool-form');
const fieldsRoot = document.querySelector('#tool-fields');
const result = document.querySelector('#tool-result');
const preview = document.querySelector('#tool-preview');
const actions = document.querySelector('#tool-actions');
const status = document.querySelector('#tool-status');
let activities = [];
let cookieSnippet = '';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function displayText(value) { return escapeHtml(value).replace(/\r?\n/g, '<br>'); }
function today() { return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date()); }
function announce(message) { status.textContent = message; status.hidden = false; }
function readForm() { return Object.fromEntries(config.fields.map((field) => [field.name, String(form.elements.namedItem(field.name).value).trim()])); }
function addField(definition) {
  const wrap = document.createElement('div');
  wrap.className = 'doc-tool-field' + (definition.multiline ? ' doc-tool-field-full' : '');
  const controlId = 'field-' + definition.name;
  const label = document.createElement('label'); label.htmlFor = controlId; label.textContent = definition.label + (definition.required ? ' *' : '');
  const control = document.createElement(definition.multiline ? 'textarea' : 'input');
  control.id = controlId; control.name = definition.name; control.placeholder = definition.placeholder || '';
  if (!definition.multiline) control.type = definition.type || 'text';
  if (definition.multiline) control.rows = 3;
  if (definition.required) control.required = true;
  if (definition.value) control.value = definition.value;
  if (definition.name === 'policyUrl') control.autocomplete = 'url';
  wrap.append(label, control); fieldsRoot.append(wrap);
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
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(title) + ' — DOCFAST</title><style>' + exportStyles + '</style></head><body>' + body + '</body></html>';
}
const exportStyles = 'body{font:14px/1.6 Arial,sans-serif;color:#263244;max-width:800px;margin:32px auto;padding:0 24px}.generated-doc{padding:26px;border:1px solid #dfe3e9}.generated-brand{color:#9b2639;font-weight:800;letter-spacing:.08em}.generated-date{color:#687489;font-size:12px}.generated-section{margin-top:20px;break-inside:avoid}.generated-section h2{font-size:17px;border-bottom:1px solid #e5e8ed;padding-bottom:6px}.generated-row{margin:10px 0}.generated-row strong{display:block;color:#59667a;font-size:12px}.generated-row p{margin:3px 0}.signature-line{height:40px;border-bottom:1px solid #6d7787}.generated-note{color:#687489;font-size:12px}.docfast-cookie-banner{position:fixed;z-index:99999;right:18px;bottom:18px;left:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;border:1px solid #26364d;border-radius:12px;background:#101827;color:#f1f4f8;font:14px/1.5 Arial,sans-serif;box-shadow:0 12px 36px #0005}.docfast-cookie-banner[hidden]{display:none}.docfast-cookie-banner p{margin:0;max-width:720px}.docfast-cookie-banner a{color:#ff9ba0}.docfast-cookie-actions{display:flex;gap:9px}.docfast-cookie-actions button{min-height:40px;padding:0 14px;border:1px solid #ed4053;border-radius:7px;background:#ed4053;color:#fff;font:inherit;cursor:pointer}.docfast-cookie-actions button[data-choice="rejected"]{background:transparent}.cookie-snippet-code{white-space:pre-wrap;overflow-wrap:anywhere}';

function generatedHeader(title) {
  return '<header><div class="generated-brand">DOCFAST</div><h1>' + escapeHtml(title) + '</h1><p class="generated-date">Borrador generado el ' + escapeHtml(today()) + '</p></header>';
}
function rowsFor(record, labels) {
  return Object.entries(labels).filter(([key]) => String(record[key] || '').trim()).map(([key, label]) => '<div class="generated-row"><strong>' + escapeHtml(label) + '</strong><p>' + displayText(record[key]) + '</p></div>').join('');
}
function renderRat() {
  const org = activities[0].organization;
  const doc = '<article class="generated-doc">' + generatedHeader('Registro de Tratamiento (RAT)') + '<p class="generated-note">Borrador orientativo basado en la información ingresada. Revisa y completa cada actividad antes de utilizar este registro.</p><div class="generated-section"><h2>Organización responsable</h2>' + rowsFor({ organization: org }, { organization: 'Nombre' }) + '</div>' + activities.map((activity, index) => '<section class="generated-section"><h2>Actividad ' + (index + 1) + ': ' + escapeHtml(activity.activity) + '</h2>' + rowsFor(activity, { purpose: 'Finalidad declarada', data: 'Categorías de datos', people: 'Personas a quienes corresponden', recipients: 'Destinatarios o proveedores', retention: 'Plazo o criterio de conservación' }) + '</section>').join('') + '<p class="generated-note">Este registro refleja las declaraciones ingresadas. No determina por sí solo si el tratamiento cumple requisitos aplicables.</p></article>';
  preview.innerHTML = doc;
  actions.replaceChildren(makeButton('Descargar registro como HTML', () => downloadFile('registro-tratamiento-docfast.html', standaloneHtml('Registro de Tratamiento', doc)), true), makeButton('Imprimir / guardar como PDF', () => printResult()));
  result.hidden = false; announce('Actividad añadida. El registro contiene ' + activities.length + (activities.length === 1 ? ' actividad.' : ' actividades.'));
}
function renderConsent(data) {
  const doc = '<article class="generated-doc">' + generatedHeader('Formulario de Consentimiento') + '<p class="generated-note">Borrador para revisión. Explica la solicitud descrita abajo; no registra la decisión ni verifica los requisitos que puedan aplicar.</p><section class="generated-section"><h2>Información de quien solicita el consentimiento</h2>' + rowsFor(data, { organization: 'Responsable u organización', email: 'Correo de contacto' }) + '</section><section class="generated-section"><h2>Información que se presentará a la persona</h2>' + rowsFor(data, { purpose: 'Finalidad específica', data: 'Categorías de datos', extra: 'Información adicional' }) + '</section><section class="generated-section"><h2>Decisión de la persona</h2><p>He revisado la información anterior y manifiesto mi decisión respecto del tratamiento descrito:</p><p>☐ Sí, otorgo mi consentimiento para la finalidad indicada.</p><p>☐ No otorgo mi consentimiento.</p><div class="generated-row"><strong>Nombre de la persona</strong><div class="signature-line"></div></div><div class="generated-row"><strong>Fecha</strong><div class="signature-line"></div></div><div class="generated-row"><strong>Firma</strong><div class="signature-line"></div></div></section></article>';
  preview.innerHTML = doc;
  actions.replaceChildren(makeButton('Descargar formulario como HTML', () => downloadFile('formulario-consentimiento-docfast.html', standaloneHtml('Formulario de Consentimiento', doc)), true), makeButton('Imprimir / guardar como PDF', () => printResult()));
  result.hidden = false; announce('Formulario generado. Revisa el borrador antes de imprimirlo o compartirlo.');
}
function cookieMarkup(data) {
  const link = data.policyUrl ? '<a href="' + escapeHtml(data.policyUrl) + '" target="_blank" rel="noopener noreferrer">Más información</a>' : '';
  return '<div id="docfast-cookie-banner" class="docfast-cookie-banner" role="region" aria-label="Aviso de cookies de ' + escapeHtml(data.siteName) + '"><p><strong>' + escapeHtml(data.siteName) + ':</strong> ' + displayText(data.message) + ' ' + link + '</p><div class="docfast-cookie-actions"><button type="button" data-choice="rejected">' + escapeHtml(data.rejectLabel) + '</button><button type="button" data-choice="accepted">' + escapeHtml(data.acceptLabel) + '</button></div></div><style>.docfast-cookie-banner{position:fixed;z-index:99999;right:18px;bottom:18px;left:18px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;border:1px solid #26364d;border-radius:12px;background:#101827;color:#f1f4f8;font:14px/1.5 Arial,sans-serif;box-shadow:0 12px 36px #0005}.docfast-cookie-banner[hidden]{display:none}.docfast-cookie-banner p{margin:0;max-width:720px}.docfast-cookie-banner a{color:#ff9ba0}.docfast-cookie-actions{display:flex;gap:9px}.docfast-cookie-actions button{min-height:40px;padding:0 14px;border:1px solid #ed4053;border-radius:7px;background:#ed4053;color:#fff;font:inherit;cursor:pointer}.docfast-cookie-actions button[data-choice="rejected"]{background:transparent}@media(max-width:640px){.docfast-cookie-banner{right:10px;bottom:10px;left:10px;align-items:stretch;flex-direction:column}.docfast-cookie-actions{justify-content:flex-end;flex-wrap:wrap}}@media(prefers-reduced-motion:reduce){.docfast-cookie-banner{scroll-behavior:auto}}</style><script>(function(){var banner=document.getElementById("docfast-cookie-banner");if(!banner)return;var key="docfast-cookie-choice";try{if(localStorage.getItem(key)){banner.hidden=true;return}}catch(e){}banner.addEventListener("click",function(event){var button=event.target.closest("button[data-choice]");if(!button)return;try{localStorage.setItem(key,button.dataset.choice)}catch(e){}banner.hidden=true})})();</script>';
}
function renderCookies(data) {
  cookieSnippet = cookieMarkup(data);
  const example = document.createElement('div'); example.className = 'cookie-preview-stage';
  const mock = document.createElement('div'); mock.className = 'cookie-preview-banner';
  const text = document.createElement('p'); text.textContent = data.siteName + ': ' + data.message;
  const buttons = document.createElement('div'); buttons.className = 'cookie-preview-actions';
  [data.rejectLabel, data.acceptLabel].forEach((label) => { const button = document.createElement('span'); button.textContent = label; buttons.append(button); });
  mock.append(text, buttons); example.append(mock);
  const note = document.createElement('p'); note.className = 'generated-note'; note.textContent = 'Vista de diseño. El código descargado guarda la elección en localStorage, pero no bloquea por sí solo otras cookies o scripts.';
  const code = document.createElement('pre'); code.className = 'cookie-snippet-code'; code.textContent = cookieSnippet;
  preview.replaceChildren(example, note, code);
  actions.replaceChildren(makeButton('Copiar código', () => copySnippet(), true), makeButton('Descargar HTML del banner', () => downloadFile('banner-cookies-docfast.html', standaloneHtml('Banner de Cookies', cookieSnippet), 'text/html;charset=utf-8')));
  result.hidden = false; announce('Código del banner generado. Revisa las limitaciones indicadas antes de integrarlo.');
}
function copySnippet() {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(cookieSnippet).then(() => announce('Código copiado.')).catch(() => fallbackCopy(cookieSnippet));
  else fallbackCopy(cookieSnippet);
}
function fallbackCopy(text) {
  const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select();
  const copied = document.execCommand('copy'); input.remove(); announce(copied ? 'Código copiado.' : 'No se pudo copiar automáticamente. Selecciona el código en la vista previa.');
}
function printResult() { document.body.classList.add('printing-doc-tool'); window.print(); }

if (config) {
  document.title = config.title + ' — DOCFAST';
  document.querySelector('#tool-title').textContent = config.title;
  document.querySelector('#tool-breadcrumb-current').textContent = config.title;
  document.querySelector('#tool-description').textContent = config.description;
  document.querySelector('#tool-needs').textContent = config.needs;
  document.querySelector('#tool-submit').textContent = config.submit;
  config.fields.forEach(addField);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = readForm();
    if (toolType === 'rat') {
      activities.push(data);
      renderRat();
      const organization = data.organization;
      form.reset(); form.elements.namedItem('organization').value = organization;
      form.elements.namedItem('activity').focus();
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
  window.addEventListener('afterprint', () => document.body.classList.remove('printing-doc-tool'));
} else {
  document.querySelector('#tool-title').textContent = 'Herramienta no encontrada';
  form.hidden = true;
}
