const form = document.querySelector('#breach-form');
const steps = [...document.querySelectorAll('.breach-step')];
const progressItems = [...document.querySelectorAll('#breach-progress li')];
const progress = document.querySelector('#breach-progress-track');
const progressFill = document.querySelector('#breach-progress-fill');
const previousButton = document.querySelector('#breach-previous');
const nextButton = document.querySelector('#breach-next');
const stepError = document.querySelector('#breach-step-error');
const finalSuccess = document.querySelector('#breach-final-success');
const complementary = document.querySelector('#breach-complementary');
const generatedCard = document.querySelector('#breach-generated-card');
const output = document.querySelector('#breach-document');
const memberList = document.querySelector('#breach-members');
const sectorOtherWrap = document.querySelector('#breach-sector-other-wrap');
const sensitiveCategoriesWrap = document.querySelector('#breach-sensitive-categories-wrap');
let activeStep = 0;
let teamMembers = [];
let summaryDirty = false;

const value = (name) => String(form.elements.namedItem(name)?.value ?? '').trim();
const selected = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);

function escapeHtml(input) {
  return String(input ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function updateConditionalFields() {
  const otherSector = value('sector') === 'Otro';
  sectorOtherWrap.hidden = !otherSector;
  form.elements.namedItem('sectorOther').required = otherSector;
  const sensitive = selected('sensitive') === 'yes';
  sensitiveCategoriesWrap.hidden = !sensitive;
  form.elements.namedItem('sensitiveCategories').required = sensitive;
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
    ? 'Generar Protocolo PDF <span aria-hidden="true">→</span>'
    : 'Siguiente <span aria-hidden="true">→</span>';
}

function updateSummary() {
  const sector = value('sector') === 'Otro' ? value('sectorOther') : value('sector');
  const infrastructure = selected('infrastructure');
  const sensitive = selected('sensitive');
  const categories = sensitive === 'yes' ? value('sensitiveCategories') : sensitive === 'no' ? 'La organización declara que no.' : 'No informado.';
  const team = [
    `${value('leadName') || 'No informado'}${value('leadRole') ? ` · ${value('leadRole')}` : ''}${value('leadContact') ? ` · Contacto urgente: ${value('leadContact')}` : ''}`,
    ...teamMembers.map((member) => `${member.name || 'Miembro sin nombre'}${member.role ? ` · ${member.role}` : ''}${member.contact ? ` · ${member.contact}` : ''}`),
  ];
  const channels = checked('channels');
  const lines = [
    `Organización: ${value('organization') || 'No informado'} · Sector: ${sector || 'No informado'}`,
    `Responsables: ${team.join('; ')}`,
    `Infraestructura: ${infrastructure || 'No informado'}${value('provider') ? ` · Proveedor: ${value('provider')}` : ''}`,
    `Frecuencia de copias de seguridad: ${value('backup') || 'No informado'}`,
    `Datos sensibles o de especial atención: ${categories}`,
    `Número estimado de registros: ${value('recordCount') || 'No informado'}`,
    `Canales declarados: ${channels.join(', ') || 'No informado'}`,
    `Correo de contacto: ${value('contactEmail') || 'No informado'}${value('contactPhone') ? ` · Teléfono: ${value('contactPhone')}` : ''}`,
  ];
  document.querySelector('#breach-summary').value = lines.join('\n');
}

function showStep(index, focus = true) {
  const priorStep = activeStep;
  activeStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== activeStep; });
  form.hidden = false;
  finalSuccess.hidden = true;
  complementary.hidden = true;
  generatedCard.hidden = true;
  document.querySelector('#breach-step-actions').hidden = false;
  stepError.hidden = true;
  updateConditionalFields();
  if (activeStep === 3 && priorStep !== 3) {
    summaryDirty = false;
    updateSummary();
  }
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
  form.querySelectorAll('.breach-error').forEach((error) => { error.hidden = true; });
  form.querySelectorAll('[aria-invalid="true"]').forEach((control) => control.removeAttribute('aria-invalid'));
  stepError.hidden = true;
}

function validateStep() {
  clearErrors();
  const invalidControls = [];
  const fail = (id, control, message) => { setError(id, control, message); if (control) invalidControls.push(control); };

  if (activeStep === 0) {
    const organization = document.querySelector('#breach-organization');
    const sector = document.querySelector('#breach-sector');
    const rut = document.querySelector('#breach-rut');
    if (!organization.value.trim()) fail('breach-organization-error', organization);
    if (!sector.value) fail('breach-sector-error', sector);
    if (sector.value === 'Otro' && !value('sectorOther')) fail('breach-sector-other-error', document.querySelector('#breach-sector-other'));
    if (rut.value && !window.FolioxRut.isComplete(rut.value)) fail('breach-rut-error', rut);
  }

  if (activeStep === 1) {
    const name = document.querySelector('#breach-lead-name');
    if (!name.value.trim()) fail('breach-lead-name-error', name);
    teamMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        const field = memberList.querySelector(`[data-member-name="${index}"]`);
        const error = memberList.querySelector(`[data-member-error="${index}"]`);
        if (error) error.hidden = false;
        field?.setAttribute('aria-invalid', 'true');
        if (field) invalidControls.push(field);
      }
    });
  }

  if (activeStep === 2) {
    if (!selected('infrastructure')) fail('breach-infrastructure-error', form.querySelector('input[name="infrastructure"]'));
    if (!value('backup')) fail('breach-backup-error', document.querySelector('#breach-backup'));
    if (!selected('sensitive')) fail('breach-sensitive-error', form.querySelector('input[name="sensitive"]'));
    if (selected('sensitive') === 'yes' && !value('sensitiveCategories')) fail('breach-sensitive-categories-error', document.querySelector('#breach-sensitive-categories'));
    if (value('recordCount') && !/^\d+$/.test(value('recordCount'))) fail('breach-record-count-error', document.querySelector('#breach-record-count'));
  }

  if (activeStep === 3) {
    const channels = checked('channels');
    const primaryChannels = channels.filter((channel) => channel !== 'Web (complementario)');
    if (!primaryChannels.length) fail('breach-channels-error', form.querySelector('input[name="channels"]'));
    const email = document.querySelector('#breach-contact-email');
    if (!email.value.trim()) fail('breach-contact-email-error', email);
    else if (!email.validity.valid) fail('breach-contact-email-error', email, 'Ingresa un correo de contacto válido.');
  }

  if (invalidControls.length) {
    stepError.hidden = false;
    invalidControls[0].focus();
    return false;
  }
  return true;
}

function renderMembers() {
  memberList.replaceChildren();
  teamMembers.forEach((member, index) => {
    const card = document.createElement('section');
    card.className = 'breach-member';
    card.setAttribute('aria-labelledby', `breach-member-title-${index}`);
    card.innerHTML = `<div class="breach-member-heading"><span id="breach-member-title-${index}">Miembro ${index + 1}</span><button class="breach-remove-member" type="button" data-remove-member="${index}" aria-label="Eliminar miembro ${index + 1}">Eliminar</button></div><div class="breach-member-grid"><div class="member-name-field"><label for="breach-member-name-${index}">Nombre <span aria-hidden="true">*</span></label><input id="breach-member-name-${index}" data-member-name="${index}" type="text" autocomplete="off" value="${escapeHtml(member.name)}" aria-describedby="breach-member-error-${index}"><p class="breach-error" data-member-error="${index}" role="alert" hidden>Ingresa el nombre de este miembro.</p></div><div><label for="breach-member-role-${index}">Cargo (opcional)</label><input id="breach-member-role-${index}" data-member-field="role" data-member-index="${index}" type="text" autocomplete="off" value="${escapeHtml(member.role)}"></div><div><label for="breach-member-contact-${index}">Contacto (opcional)</label><input id="breach-member-contact-${index}" data-member-field="contact" data-member-index="${index}" type="text" autocomplete="off" value="${escapeHtml(member.contact)}"></div></div>`;
    memberList.append(card);
    card.querySelector('[data-member-name]').addEventListener('input', (event) => {
      member.name = event.currentTarget.value;
      event.currentTarget.removeAttribute('aria-invalid');
      card.querySelector('[data-member-error]').hidden = true;
      summaryDirty = false;
    });
    card.querySelectorAll('[data-member-field]').forEach((field) => field.addEventListener('input', (event) => {
      member[event.currentTarget.dataset.memberField] = event.currentTarget.value;
      summaryDirty = false;
    }));
    card.querySelector('[data-remove-member]').addEventListener('click', () => {
      teamMembers.splice(index, 1);
      renderMembers();
    });
  });
}

function channelLabel() {
  const channels = checked('channels');
  return channels.length ? channels.join(', ') : 'No informado';
}

function buildDocument() {
  const org = escapeHtml(value('organization'));
  const sector = escapeHtml(value('sector') === 'Otro' ? value('sectorOther') : value('sector'));
  const contactEmail = escapeHtml(value('contactEmail'));
  const contactPhone = escapeHtml(value('contactPhone'));
  const provider = escapeHtml(value('provider'));
  const infrastructure = escapeHtml(selected('infrastructure'));
  const backup = escapeHtml(value('backup'));
  const sensitiveChoice = selected('sensitive');
  const sensitive = sensitiveChoice === 'yes' ? 'Sí' : 'No';
  const sensitiveCategories = sensitiveChoice === 'yes' ? escapeHtml(value('sensitiveCategories')) : 'No se declaran categorías sensibles o de especial atención.';
  const channels = checked('channels').map(escapeHtml);
  const channelsList = channels.length ? channels.map((channel) => `<li>${channel}</li>`).join('') : '<li>No informado</li>';
  const team = [
    { name: value('leadName'), role: value('leadRole'), contact: value('leadContact'), label: 'Responsable principal' },
    ...teamMembers.map((member, index) => ({ ...member, label: `Miembro ${index + 1}` })),
  ];
  const writeCell = (text = '', lines = 2) => `<td class="breach-write-cell" data-write-lines="${lines}">${escapeHtml(text) || '&nbsp;'}</td>`;
  const teamRows = team.map((member) => `<tr><th scope="row">${escapeHtml(member.label)}</th>${writeCell(member.name, 2)}${writeCell(member.role, 2)}${writeCell(member.contact, 2)}</tr>`).join('');
  const address = escapeHtml(value('address'));
  const rut = escapeHtml(value('rut'));
  const estimatedRecords = escapeHtml(value('recordCount'));
  const editableSummary = escapeHtml(value('editableSummary')).replace(/\n/g, '<br>');
  const date = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date());

  document.querySelector('#breach-document-meta').textContent = `${value('organization')} · Generado el ${date}`;
  output.innerHTML = `
    <div class="breach-doc-brand">FOLIOX STUDIO · BORRADOR PREVENTIVO</div>
    <h1>Protocolo interno de respuesta ante incidentes de seguridad</h1>
    <p><strong>Organización:</strong> ${org} · <strong>Sector:</strong> ${sector}</p>
    <p class="breach-doc-note"><strong>Guía editable.</strong> Este documento organiza una preparación interna. No confirma que haya ocurrido un incidente, no realiza reportes ni envía comunicaciones. No garantiza cumplimiento ni reemplaza una evaluación profesional.</p>

    <section><h2>1. Identificación, alcance y equipo de respuesta</h2>
      <table class="breach-doc-table"><tbody><tr><th>Organización</th><td>${org}</td></tr><tr><th>Sector declarado</th><td>${sector}</td></tr><tr><th>RUT</th><td>${rut}</td></tr><tr><th>Domicilio declarado</th><td>${address}</td></tr></tbody></table>
      <h3>Objetivo y alcance</h3><p>Usar esta guía para coordinar la recepción interna, contención inicial, evaluación, comunicaciones cuando correspondan, remediación y revisión posterior de un evento que pudiera afectar información o sistemas de la organización. La organización debe adaptar funciones, escalamiento y controles a sus operaciones reales.</p>
      <h3>Definición de trabajo para esta guía</h3><p>Para ordenar la revisión interna, se considera incidente un evento sospechoso o confirmado que pudiera comprometer confidencialidad, integridad o disponibilidad de información o sistemas. Esta descripción es operativa para el protocolo y no constituye una calificación legal del evento.</p>
      <h3>Equipo de respuesta declarado</h3><table class="breach-doc-table"><thead><tr><th>Función</th><th>Nombre</th><th>Cargo</th><th>Contacto urgente</th></tr></thead><tbody>${teamRows}</tbody></table>
    </section>

    <section><h2>2. Infraestructura, activos y datos declarados</h2>
      <table class="breach-doc-table"><tbody><tr><th>Proveedor de hosting o nube</th><td>${provider}</td></tr><tr><th>Tipo de infraestructura</th><td>${infrastructure}</td></tr><tr><th>Frecuencia de copias de seguridad</th><td>${backup}</td></tr><tr><th>Datos sensibles o de especial atención declarados</th><td>${sensitive}</td></tr><tr><th>Categorías descritas</th><td>${sensitiveCategories}</td></tr><tr><th>Número estimado de registros de la organización</th><td>${estimatedRecords}</td></tr></tbody></table>
      <p>El número de registros indicado es una estimación de inventario declarada por la organización; no representa el número de titulares o registros comprometidos por un incidente.</p>
    </section>

    <section><h2>3. Fases de respuesta</h2>
      <ol><li><strong>Recepción y coordinación:</strong> anotar quién detectó el evento, cuándo se tuvo conocimiento y cómo contactar al equipo interno. Distinguir los hechos confirmados de hipótesis y mantener un registro de decisiones.</li><li><strong>Contención:</strong> coordinar medidas técnicas con las personas autorizadas; considerar limitar el acceso o aislar sistemas cuando resulte apropiado. Evitar borrar evidencia necesaria para la revisión y documentar las acciones realizadas.</li><li><strong>Evaluación:</strong> determinar sistemas y datos potencialmente involucrados, periodo conocido o pendiente, efectos observados, incertidumbres, posibles titulares afectados y proveedores que deben consultarse. No completar estimaciones como hechos confirmados.</li><li><strong>Comunicación cuando corresponda:</strong> identificar qué norma y obligaciones pueden aplicar a esta organización y a este incidente, quién debe decidir y los canales o plazos verificados. La comunicación externa no se activa desde este documento.</li><li><strong>Remediación y recuperación:</strong> priorizar medidas de corrección y recuperación, revisar la restauración desde copias disponibles y asignar responsables. Registrar qué se ejecutó y qué queda pendiente.</li><li><strong>Cierre y seguimiento:</strong> conservar el expediente con acceso limitado, revisar causas y controles cuando existan antecedentes suficientes, asignar acciones correctivas y fijar quién comprobará su avance.</li></ol>
      <h3>Registro inicial del incidente</h3><table class="breach-doc-table breach-write-table"><tbody><tr><th>Fecha y hora del evento</th><td class="breach-write-cell" data-write-lines="2">&nbsp;</td></tr><tr><th>Hechos observados y fuente</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Sistemas y datos potencialmente involucrados</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Impacto verificado y aspectos pendientes</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Decisiones, acciones realizadas y responsables</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr></tbody></table>
    </section>

    <section><h2>4. Plantilla de comunicación a personas afectadas</h2>
      <p>Plantilla para revisión y eventual adaptación. No implica que se haya producido un incidente ni que la comunicación sea obligatoria o procedente en todos los casos.</p>
      <div class="breach-communication-template"><p><strong>Asunto:</strong> Informaci&oacute;n sobre un incidente que podr&iacute;a involucrar datos personales</p><p>Estimada/o [nombre de la persona, si corresponde]:</p><p>La organizaci&oacute;n [nombre confirmado] informa sobre el evento verificado y su fecha:</p><table class="breach-doc-table breach-write-table"><tbody><tr><th>Datos posiblemente involucrados</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Consecuencias conocidas y aspectos en revisi&oacute;n</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Medidas adoptadas o previstas, confirmadas</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Recomendaciones revisadas para la persona</th><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><th>Fecha de esta comunicaci&oacute;n</th><td class="breach-write-cell" data-write-lines="2">&nbsp;</td></tr></tbody></table><p>Para consultas: ${contactEmail}${contactPhone ? ` · ${contactPhone}` : ''}.</p></div>
      <h3>Canales declarados para esta plantilla</h3><ul>${channelsList}</ul>
    </section>

    <section><h2>5. Checklist postincidente y registro</h2>
      <ul><li>Conservar el registro de hechos, fuentes y decisiones, distinguiendo observaciones de conclusiones.</li><li>Confirmar el inventario de sistemas y datos considerados y actualizar estimaciones solo cuando haya evidencia.</li><li>Registrar las medidas de contención, recuperación y remediación efectivamente ejecutadas.</li><li>Dejar constancia de las comunicaciones realizadas, aprobaciones y asuntos pendientes, si las hubo.</li><li>Asignar responsables y revisar las acciones correctivas acordadas.</li><li>Revisar la aplicabilidad de obligaciones legales, contractuales y sectoriales según los hechos y la fecha.</li></ul>
      <table class="breach-doc-table"><thead><tr><th>Fecha / hora</th><th>Hecho o decisión confirmada</th><th>Responsable</th><th>Acción / estado</th></tr></thead><tbody><tr><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr><tr><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td><td class="breach-write-cell" data-write-lines="3">&nbsp;</td></tr></tbody></table>
    </section>

    <section><h2>6. Contactos de emergencia y revisión del protocolo</h2>
      <h3>Contacto para consultas de titulares</h3><table class="breach-doc-table"><tbody><tr><th>Correo declarado</th>${writeCell(contactEmail, 2)}</tr><tr><th>Teléfono declarado</th>${writeCell(contactPhone, 2)}</tr></tbody></table>
      <h3>Canales de comunicación elegidos</h3><ul>${channelsList}</ul>
      <h3>Revisi&oacute;n interna</h3><table class="breach-doc-table breach-write-table"><tbody><tr><th>Responsable de revisar y aprobar</th><td class="breach-write-cell" data-write-lines="2">&nbsp;</td></tr><tr><th>Fecha de revisi&oacute;n</th><td class="breach-write-cell" data-write-lines="2">&nbsp;</td></tr><tr><th>Pr&oacute;xima fecha o criterio de revisi&oacute;n</th><td class="breach-write-cell" data-write-lines="2">&nbsp;</td></tr></tbody></table>
      <p>Resumen editable aportado en el paso 4:<br>${editableSummary.replace(/\n/g, '<br>')}</p>
    </section>

    <section><h2>Referencias oficiales y revisión legal pendiente</h2>
      <p>La Ley N.º 21.719 fue publicada el 13 de diciembre de 2024 y sus modificaciones a la Ley N.º 19.628 tienen vigencia diferida al 1 de diciembre de 2026. Sus artículos 14 quinquies y 14 sexies describen, respectivamente, medidas de seguridad y el reporte de ciertas vulneraciones, bajo las condiciones señaladas en la ley. La aplicación concreta depende de la fecha, hechos, datos y entidad involucrada; este generador no determina esos elementos ni calcula plazos.</p>
      <ul><li><a href="https://nuevo.leychile.cl/navegar?idNorma=141599" target="_blank" rel="noopener noreferrer">Ley N.º 19.628 · texto consultable en Ley Chile</a>.</li><li><a href="https://nuevo.leychile.cl/navegar?idNorma=1209272" target="_blank" rel="noopener noreferrer">Ley N.º 21.719 · Ley Chile, incluidas las disposiciones transitorias y modificaciones a la Ley N.º 19.628</a>.</li><li><a href="https://www.leychile.cl/leychile/Navegar/imprimir?idNorma=1202434" target="_blank" rel="noopener noreferrer">Ley N.º 21.663 · Marco de Ciberseguridad, para revisar si existe un régimen aplicable a la organización</a>.</li></ul>
      <p class="breach-doc-note">Referencias revisadas el 27 de octubre de 2026. Antes de usar esta guía, confirma el texto vigente y si corresponden otras obligaciones, autoridades o canales para tu organización y el caso concreto. No se incluyen plazos numéricos ni se presume un deber universal de notificación.</p>
      <p>Este protocolo es un borrador de organización interna. No garantiza cumplimiento y no sustituye una evaluación profesional.</p>
    </section>`;
}

function generateProtocol() {
  buildDocument();
  form.hidden = true;
  document.querySelector('#breach-step-actions').hidden = true;
  finalSuccess.hidden = false;
  complementary.hidden = false;
  generatedCard.hidden = false;
  updateProgress();
  finalSuccess.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  document.querySelector('#breach-success-title').focus({ preventScroll: true });
}

document.querySelector('#breach-sector').addEventListener('change', () => {
  updateConditionalFields();
  document.querySelector('#breach-sector-error').hidden = Boolean(value('sector'));
  if (value('sector') !== 'Otro') document.querySelector('#breach-sector-other-error').hidden = true;
});
document.querySelectorAll('input[name="sensitive"]').forEach((input) => input.addEventListener('change', () => {
  updateConditionalFields();
  document.querySelector('#breach-sensitive-error').hidden = Boolean(selected('sensitive'));
  form.querySelectorAll('input[name="sensitive"]').forEach((control) => control.removeAttribute('aria-invalid'));
  if (selected('sensitive') !== 'yes') document.querySelector('#breach-sensitive-categories-error').hidden = true;
}));
document.querySelectorAll('input[name="infrastructure"]').forEach((input) => input.addEventListener('change', () => {
  document.querySelector('#breach-infrastructure-error').hidden = Boolean(selected('infrastructure'));
  form.querySelectorAll('input[name="infrastructure"]').forEach((control) => control.removeAttribute('aria-invalid'));
}));
document.querySelectorAll('input[name="channels"]').forEach((input) => input.addEventListener('change', () => {
  const primary = checked('channels').some((channel) => channel !== 'Web (complementario)');
  document.querySelector('#breach-channels-error').hidden = primary;
  if (primary) form.querySelectorAll('input[name="channels"]').forEach((control) => control.removeAttribute('aria-invalid'));
  if (!summaryDirty) updateSummary();
}));
document.querySelector('#breach-add-member').addEventListener('click', () => {
  teamMembers.push({ name: '', role: '', contact: '' });
  renderMembers();
  memberList.lastElementChild?.querySelector('[data-member-name]')?.focus();
});

document.querySelectorAll('#breach-form input, #breach-form select, #breach-form textarea').forEach((control) => {
  control.addEventListener('input', () => {
    if (activeStep < 3) summaryDirty = false;
    const error = control.closest('.breach-field')?.querySelector('.breach-error');
    if (error) error.hidden = true;
    if (control.id === 'breach-summary') summaryDirty = true;
  });
});

nextButton.addEventListener('click', () => {
  if (!validateStep()) return;
  if (activeStep === steps.length - 1) { generateProtocol(); return; }
  showStep(activeStep + 1);
});
form.addEventListener('submit', (event) => { event.preventDefault(); nextButton.click(); });
previousButton.addEventListener('click', () => { if (activeStep > 0) showStep(activeStep - 1); });
document.querySelector('#breach-print').addEventListener('click', () => window.print());
document.querySelector('#breach-edit-answers').addEventListener('click', () => showStep(3));
document.querySelector('#breach-new-company').addEventListener('click', () => {
  if (!window.confirm('Se borrarán las respuestas de este protocolo en esta sesión. ¿Quieres empezar con una empresa nueva?')) return;
  form.reset();
  teamMembers = [];
  summaryDirty = false;
  renderMembers();
  output.replaceChildren();
  document.querySelector('#breach-document-meta').textContent = '';
  clearErrors();
  showStep(0);
});

updateConditionalFields();
updateProgress();
