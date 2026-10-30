(() => {
  const form = document.querySelector('#clause-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.employment-step')];
  const labels = [...document.querySelectorAll('.employment-step-labels li')];
  const count = document.querySelector('#step-count');
  const stepName = document.querySelector('#step-name');
  const progress = document.querySelector('#progress');
  const progressFill = document.querySelector('#progress-fill');
  const errorBox = document.querySelector('#step-error');
  const names = ['Partes', 'Datos', 'Condiciones', 'Extras'];
  let current = 0;

  const val = (name) => form.elements[name]?.value?.trim() || '';
  const checked = (name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((el) => el.value);
  const setError = (id, show) => { const el = document.getElementById(id); if (el) el.hidden = !show; };

  function updateConditional() {
    const remote = val('modality') === 'remote' || val('modality') === 'hybrid';
    document.querySelector('#remote-details-wrap').hidden = !remote;
  }

  function updateSummary() {
    const items = ['Identificación de las partes', 'Alcance del acceso y uso permitido de datos', 'Confidencialidad', 'Uso de equipos y sistemas', `Medidas para modalidad ${({ onsite: 'presencial', remote: 'remota / teletrabajo', hybrid: 'híbrida' })[val('modality')] || 'por definir'}`];
    if (checked('extras').includes('return')) items.push('Devolución o eliminación de información y revocación de accesos');
    if (checked('extras').includes('consequences')) items.push('Consecuencias del incumplimiento (sujetas a revisión)');
    if (checked('extras').includes('monitoring')) items.push('Monitoreo, control o auditoría, sujeto a revisión');
    items.push('Espacios para firmas, RUT del trabajador, fecha y lugar');
    const list = document.querySelector('#summary-list');
    list.replaceChildren(...items.map((item) => { const li = document.createElement('li'); li.textContent = item; return li; }));
  }

  function showStep(index, focus = true) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== index; labels[i].toggleAttribute('aria-current', i === index); if (i === index) labels[i].setAttribute('aria-current', 'step'); else labels[i].removeAttribute('aria-current'); });
    count.textContent = `Paso ${index + 1} de 4`;
    stepName.textContent = names[index];
    progress.setAttribute('aria-valuenow', String(index + 1));
    progressFill.style.width = `${((index + 1) / 4) * 100}%`;
    document.querySelector('#back').hidden = index === 0;
    document.querySelector('#next').hidden = index === 3;
    document.querySelector('#generate').hidden = index !== 3;
    errorBox.hidden = true;
    updateConditional();
    if (index === 3) updateSummary();
    if (focus) steps[index].querySelector('h3')?.focus();
  }

  function validStep() {
    let valid = true;
    if (current === 0) {
      const employer = document.querySelector('#employer');
      setError('error-employer', !employer.value.trim()); employer.setAttribute('aria-invalid', String(!employer.value.trim())); valid &&= !!employer.value.trim();
      const rut = document.querySelector('#employer-rut');
      const rutValid = !rut.value || window.FolioxRut.isComplete(rut.value);
      setError('error-rut', !rutValid); rut.setAttribute('aria-invalid', String(!rutValid)); valid &&= rutValid;
    }
    if (current === 1) { const ok = !!val('access'); setError('error-access', !ok); form.querySelector('[name="access"]').setAttribute('aria-invalid', String(!ok)); valid &&= ok; }
    if (current === 2) {
      const hasEquipment = checked('equipment').length > 0; setError('error-equipment', !hasEquipment); form.querySelector('[name="equipment"]').setAttribute('aria-invalid', String(!hasEquipment)); valid &&= hasEquipment;
      const hasModality = !!val('modality'); setError('error-modality', !hasModality); form.querySelector('[name="modality"]').setAttribute('aria-invalid', String(!hasModality)); valid &&= hasModality;
    }
    if (!valid) { errorBox.textContent = 'Revisa los campos señalados para continuar.'; errorBox.hidden = false; steps[current].querySelector('[aria-invalid="true"]')?.focus(); }
    return valid;
  }

  function esc(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
  function text(value, fallback = 'Por completar') { return esc(value || fallback); }
  function generateDocument() {
    const employer = val('employer');
    const access = ({ customers: 'clientes o proveedores', workers: 'trabajadores', both: 'clientes o proveedores y trabajadores', indirect: 'acceso indirecto, sin acceso directo a bases de datos' })[val('access')];
    const modality = ({ onsite: 'presencial', remote: 'remota / teletrabajo', hybrid: 'híbrida' })[val('modality')];
    const devices = checked('equipment').map((item) => item === 'company' ? 'equipos proporcionados por el empleador' : 'equipos personales (BYOD)');
    const sensitive = ({ yes: 'Sí', no: 'No', unknown: 'Por determinar' })[val('sensitive')];
    const policy = ({ yes: 'La organización declara contar con una política interna de datos; se deberá identificar y facilitar la versión aplicable.', no: 'La organización declara no contar actualmente con una política interna de datos.', unknown: 'La existencia y versión de una política interna de datos quedan por confirmar.' })[val('policy')];
    const additions = checked('extras');
    const rows = [];
    rows.push(`<p>Entre <strong>${text(employer)}</strong>${val('employerRut') ? `, RUT ${text(val('employerRut'))}` : ''}, en adelante el “Empleador”, y quien suscribe, en adelante el “Trabajador”, se propone incorporar las siguientes condiciones relacionadas con el acceso y tratamiento de información personal en el contexto de sus funciones${val('jobTitle') ? ` como <strong>${text(val('jobTitle'))}</strong>` : ''}. Los datos de identificación del Trabajador y las condiciones contractuales deberán completarse y revisarse antes de usar este borrador.</p>`);
    rows.push(`<h3>1. Alcance y uso permitido</h3><p>En el desempeño de sus funciones, el Trabajador podrá acceder a datos personales de <strong>${text(access)}</strong>${val('dataDetails') ? `, incluyendo las categorías o ejemplos generales indicados: ${text(val('dataDetails'))}` : ''}. El acceso se limitará a lo necesario para las tareas asignadas. El Trabajador deberá utilizar la información solo para dichas tareas, seguir las instrucciones y procedimientos internos que le sean comunicados y evitar su copia, comunicación, consulta o uso para fines ajenos a sus funciones.</p><p>La organización indica que el tratamiento de datos sensibles u otras categorías especiales es: <strong>${text(sensitive)}</strong>. Esta respuesta describe una declaración pendiente de contraste con las operaciones reales y no determina por sí misma la legitimidad del tratamiento.</p>`);
    rows.push('<h3>2. Confidencialidad y resguardo</h3><p>El Trabajador mantendrá reserva sobre los datos personales y demás información a la que acceda por razón de su trabajo. Deberá evitar su divulgación o exposición no autorizada, proteger credenciales y sesiones, informar oportunamente los incidentes o accesos inusuales por los canales internos definidos y observar las instrucciones de seguridad que el Empleador le comunique. Esta obligación deberá revisarse junto con el contrato, las políticas aplicables y las obligaciones que correspondan.</p>');
    rows.push(`<h3>3. Equipos, sistemas y modalidad de trabajo</h3><p>Se contempla el uso de ${devices.length ? devices.map(esc).join(' y ') : 'equipos por definir'}. La modalidad declarada es <strong>${text(modality)}</strong>${checked('vpn').includes('yes') ? ' y se contempla el uso de VPN corporativa para acceder a sistemas cuando corresponda.' : '.'} ${val('remoteDetails') && ['remote', 'hybrid'].includes(val('modality')) ? `Para el trabajo remoto se propone considerar estas medidas: ${text(val('remoteDetails'))}.` : ['remote', 'hybrid'].includes(val('modality')) ? 'Las medidas concretas para el trabajo remoto deberán definirse y documentarse según los sistemas y tareas involucrados.' : ''}</p><p>El Trabajador utilizará los accesos asignados de forma individual y seguirá las instrucciones de protección de dispositivos y sesiones que le sean comunicadas. Cualquier medida técnica u organizativa concreta debe confirmarse con la práctica efectiva de la organización.</p>`);
    rows.push(`<h3>4. Política interna</h3><p>${esc(policy)} La política aplicable y sus procedimientos deberán ponerse en conocimiento del Trabajador de forma adecuada.</p>`);
    if (additions.includes('return')) rows.push('<h3>5. Cierre de accesos e información</h3><p>Al término de las funciones o cuando el Empleador lo instruya, se coordinará la devolución o eliminación segura de la información de trabajo que corresponda y la revocación de los accesos asociados, de acuerdo con los procedimientos internos y las obligaciones de conservación aplicables. El Trabajador no deberá mantener copias personales de información de la organización salvo autorización documentada.</p>');
    if (additions.includes('monitoring')) rows.push('<h3>Monitoreo, control o auditoría</h3><p>Si la organización contempla controles sobre el uso de sistemas o dispositivos, su alcance, finalidad, información al personal, resguardos y forma de aplicación deben definirse y revisarse previamente con arreglo a las reglas aplicables. Esta cláusula no constituye por sí sola autorización suficiente ni determina la licitud, proporcionalidad o alcance de un monitoreo.</p>');
    if (additions.includes('consequences')) rows.push('<h3>Consecuencias del incumplimiento</h3><p>Todo incumplimiento deberá ser analizado según sus circunstancias, los antecedentes disponibles, el contrato y las normas aplicables. Las medidas que eventualmente correspondan requieren revisión individual y profesional; este borrador no establece sanciones automáticas ni anticipa una causal o resultado laboral.</p>');
    rows.push(`<h3>Revisión de la cláusula</h3><p>${esc(policy)} El contenido debe adecuarse al contrato, a las funciones reales, a las políticas vigentes y a la normativa aplicable. Las expresiones que describen políticas, controles, equipos y prácticas deben contrastarse con la realidad antes de incorporar este borrador a un documento laboral.</p>`);
    const sections = rows.join('');
    document.querySelector('#document').innerHTML = `<div class="document-brand"><img src="img/Logotipo moderno FOLIOX Studio.png" alt="FOLIOX Studio"></div><p class="document-label">BORRADOR PARA REVISIÓN Y ADAPTACIÓN</p><h2>Cláusula sobre acceso y tratamiento de datos personales en el trabajo</h2>${sections}<section class="document-closing" aria-label="Firmas">
        <p class="document-place"><span><strong>Lugar:</strong><i></i></span><span><strong>Fecha:</strong><i></i></span></p>
        <div class="signature-grid">
          <div class="signature-block"><i class="signature-line"></i><strong>Firma del Empleador</strong><p><span>Nombre:</span><b>${text(employer)}</b></p><p><span>RUT:</span><b>${val('employerRut') ? text(val('employerRut')) : ''}</b></p></div>
          <div class="signature-block"><i class="signature-line"></i><strong>Firma del Trabajador</strong><p><span>Nombre:</span><b></b></p><p><span>RUT:</span><b></b></p></div>
        </div>
      </section><aside class="document-review-note"><strong>Nota:</strong> Documento generado a partir de las respuestas proporcionadas. Requiere revisión y adaptación al caso concreto antes de su uso. No constituye asesoría ni garantiza cumplimiento.</aside>`;
    document.querySelector('#wizard-card').hidden = true;
    document.querySelector('#result-view').hidden = false;
    document.querySelector('#result-title').focus?.();
    window.scrollTo({ top: document.querySelector('#result-view').offsetTop - 20, behavior: 'smooth' });
  }

  document.querySelector('#next').addEventListener('click', () => { if (validStep()) showStep(current + 1); });
  document.querySelector('#back').addEventListener('click', () => showStep(current - 1));
  document.querySelector('#generate').addEventListener('click', () => { if (validStep()) generateDocument(); });
  document.querySelector('#edit').addEventListener('click', () => { document.querySelector('#result-view').hidden = true; document.querySelector('#wizard-card').hidden = false; showStep(0); });
  document.querySelector('#print').addEventListener('click', () => window.print());
  document.querySelector('#new-draft').addEventListener('click', () => { if (window.confirm('¿Iniciar una cláusula nueva? Se borrarán las respuestas actuales.')) { form.reset(); document.querySelector('#result-view').hidden = true; document.querySelector('#wizard-card').hidden = false; showStep(0); updateSummary(); document.querySelector('#employer').focus(); } });
  form.addEventListener('change', () => { updateConditional(); updateSummary(); });
  form.addEventListener('input', (event) => { if (event.target.matches('#employer-rut')) setError('error-rut', false); updateSummary(); });
  showStep(0, false);
  updateSummary();
})();
