/*
 * Motor y modelo de datos de la Calculadora FOLIOX.
 * Revisión: 28-10-2026. Fuentes oficiales:
 * Ley 21.719 (BCN/Ley Chile), versión diferida 01-12-2026 y modificación
 * Ley 21.806 (05-02-2026): arts. 2, 14 quinquies, 34 bis–quáter, 35–37,
 * 49, 51 y transitorios primero y sexto.
 * https://www.bcn.cl/leychile/navegar?idNorma=1209272
 * Ley 20.416, art. segundo: https://www.bcn.cl/leychile/Navegar?idNorma=1010668
 * Art. 35 fija máximos, no multas mínimas generales ni fórmula de cuantía.
 */
(() => {
  const form = document.querySelector('#fine-form');
  const steps = [...document.querySelectorAll('.step')];
  const progressItems = [...document.querySelectorAll('#steps li')];
  const progress = document.querySelector('#progress');
  const progressFill = progress.querySelector('span');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const stepError = document.querySelector('#step-error');
  const result = document.querySelector('#result');
  const resultBody = document.querySelector('#result-body');
  const stepsNav = document.querySelector('#steps');
  const formActions = document.querySelector('#form-actions');
  let activeStep = 0;
  let readFromModel = false;
  // Estado explícito independiente de la pantalla visible. Los valores DOM
  // se conservan además para permitir retroceder y editar sin perder respuestas.
  const answers = Object.create(null);

  const field = (name) => form.elements.namedItem(name);
  const value = (name) => {
    if (readFromModel && Object.prototype.hasOwnProperty.call(answers,name)) return typeof answers[name] === 'string' ? answers[name].trim() : '';
    const el = field(name);
    if (!el) return '';
    if (el instanceof RadioNodeList) return el.value || '';
    return String(el.value ?? '').trim();
  };
  const isChecked = (id) => {
    const control = document.querySelector(`#${id}`);
    return readFromModel && control && control.name in answers ? Boolean(answers[control.name]) : Boolean(control?.checked);
  };
  const checkedValues = (name) => readFromModel && Array.isArray(answers[name]) ? answers[name] : [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((el) => el.value);
  const esc = (input) => String(input ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function captureAnswers() {
    const radioNames = new Set([...form.querySelectorAll('input[type="radio"]')].map((radio) => radio.name));
    for (const name of radioNames) answers[name] = form.querySelector(`input[type="radio"][name="${name}"]:checked`)?.value || '';
    for (const el of form.querySelectorAll('input,select,textarea')) {
      if (!el.name) continue;
      if (el.type === 'radio') continue;
      if (el.type === 'checkbox') {
        if (el.name === 'data') answers.data = checkedValues('data');
        else answers[el.name] = el.checked;
      } else answers[el.name] = el.value;
    }
  }
  function markInvalid(control, invalid) {
    if (invalid) control.setAttribute('aria-invalid','true');
    else control.removeAttribute('aria-invalid');
  }
  function validateStep() {
    let valid = true;
    if (activeStep === 0) {
      const sizeInvalid = !value('size');
      const dpoInvalid = !value('dpo');
      const temporalInvalid = !value('temporal');
      markInvalid(document.querySelector('#company-group'),sizeInvalid);
      markInvalid(document.querySelector('#dpo-group'),dpoInvalid);
      markInvalid(document.querySelector('#temporal-group'),temporalInvalid);
      document.querySelector('#size-error').hidden = !sizeInvalid;
      document.querySelector('#dpo-error').hidden = !dpoInvalid;
      document.querySelector('#temporal-error').hidden = !temporalInvalid;
      if (sizeInvalid || dpoInvalid || temporalInvalid) valid = false;
    }

    const people = field('people');
    const peopleInvalid = activeStep === 1 && (people.value === '' && !isChecked('people-unknown') || people.value !== '' && (!Number.isSafeInteger(Number(people.value)) || Number(people.value) < 0));
    markInvalid(people,peopleInvalid); document.querySelector('#people-error').hidden = !peopleInvalid;
    if (peopleInvalid) valid = false;
    if (activeStep === 2) {
      const conductQuestions = [
        ['notified','notified-group','notified-error'],
        ['affectedNotice','affected-group','affected-error'],
        ['protocol','protocol-group','protocol-error'],
        ['priorSanctions','recurrence-group','recurrence-error']
      ];
      if (value('temporal') === 'yes') conductQuestions.push(
        ['conductProcessing','conduct-processing',''],['conductTransparency','conduct-transparency',''],
        ['conductDisclosure','conduct-disclosure',''],['conductQuality','conduct-quality',''],['conductRights','conduct-rights',''],['conductSecurity','conduct-security',''],
        ['conductSpecialData','conduct-special-data',''],['conductSecrecy','conduct-secrecy',''],['conductTransfer','conduct-transfer',''],['conductFalseData','conduct-false-data',''],['conductIntent','conduct-intent',''],
        ['conductAuthority','conduct-authority',''],['recurrenceVerified','recurrence-proof-group','']
      );
      else if (value('temporal') === 'no') conductQuestions.push(['legacyFine','legacy-fine','']);
      for (const [name,groupId,errorId] of conductQuestions) {
        const invalid = !value(name);
        markInvalid(document.querySelector('#' + groupId),invalid);
        if (errorId) document.querySelector('#' + errorId).hidden = !invalid;
        if (invalid) valid = false;
      }
    }
    stepError.hidden = valid;
    if (!valid) {
      if (activeStep === 0 && !value('size')) form.querySelector('input[name="size"]')?.focus();
      else if (activeStep === 0 && !value('dpo')) form.querySelector('input[name="dpo"]')?.focus();
      else if (activeStep === 0 && !value('temporal')) form.querySelector('input[name="temporal"]')?.focus();
      else if (activeStep === 2) {
        const requiredNames = ['notified','affectedNotice','protocol','priorSanctions'];
        if (value('temporal') === 'yes') requiredNames.push('conductProcessing','conductDisclosure','conductQuality','conductTransparency','conductRights','conductSecurity','conductSpecialData','conductSecrecy','conductTransfer','conductFalseData','conductIntent','conductAuthority','recurrenceVerified');
        else if (value('temporal') === 'no') requiredNames.push('legacyFine');
        const missing = requiredNames.find((name) => !value(name));
        if (missing) form.querySelector('[name="' + missing + '"]')?.focus();
      }
      else form.querySelector('[aria-invalid="true"]')?.focus();
    }
    return valid;
  }
  function showStep(index, moveFocus = true) {
    activeStep = index;
    document.body.classList.toggle('is-step-0', index === 0);
    document.body.classList.toggle('is-step-1', index === 1);
    document.body.classList.toggle('is-step-2', index === 2);
    steps.forEach((step,i) => { step.hidden = i !== index; });
    progressItems.forEach((item,i) => {
      if (i === index) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('is-complete',i < index);
    });
    progress.setAttribute('aria-valuenow',String(index+1));
    progress.setAttribute('aria-valuetext',`Paso ${index+1} de 3`);
    progressFill.style.width = `${((index+1)/3)*100}%`;
    document.querySelector('#legacy-fine-group').hidden = value('temporal') !== 'no';
    document.querySelector('#current-law-questions').hidden = value('temporal') !== 'yes';
    previous.disabled = index === 0;
    previous.innerHTML = index > 0 ? '← Anterior' : 'Anterior';
    next.innerHTML = index === 2 ? 'Calcular multa' : 'Siguiente <span aria-hidden="true">→</span>';
    stepError.hidden = true;
    if (moveFocus) steps[index].querySelector('h2').focus();
  }

  const sizeLabels = {micro:'Microempresa (hasta 2.400 UF)',small:'Pequeña (> 2.400 y hasta 25.000 UF)',medium:'Mediana (> 25.000 y hasta 100.000 UF)',large:'Grande (> 100.000 UF)'};
  // Valor oficial publicado por el SII: UTM de octubre de 2026.
  // Mantener el valor como entero evita errores de precisión en la conversión.
  const UTM_CLP = 72151;
  const UTM_REFERENCE = 'octubre de 2026';
  const formatClp = (utm) => new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP',maximumFractionDigits:0}).format(utm * UTM_CLP);

  // Matriz de reglas para cada respuesta visible. Cada entrada documenta:
  // valores; norma relacionada; condiciones adicionales; efecto real y límite
  // de lo que puede concluirse con los antecedentes del formulario.
  const CONTROL_RULE_MATRIX = {
    temporal:{values:{yes:'Supuesto desde la entrada en vigor',no:'Supuesto anterior a la entrada en vigor'},legal:'Ley 21.719, disposición transitoria primera',condition:'La entrada en vigor de las modificaciones está fijada para el 01-12-2026; Sí/No es una premisa temporal, no una fecha acreditada.',effect:'Sí permite mostrar los topes de la Ley 21.719. No evita aplicar esos topes y deriva al régimen anterior.',insufficient:'No permite decidir prescripción, reglas transitorias por fecha exacta ni una sanción del régimen previo.'},
    size:{values:{micro:'Empresa de menor tamaño declarada',small:'Empresa de menor tamaño declarada',medium:'Empresa de menor tamaño declarada',large:'Empresa fuera de menor tamaño declarada'},legal:'Ley 20.416, artículo segundo; Ley 21.719, artículo 35 inciso cuarto y disposición transitoria sexta',condition:'La categoría legal depende de ingresos del último año y exclusiones adicionales; el formulario solo conserva la opción seleccionada.',effect:'No clasifica la infracción. Menor tamaño excluye el límite porcentual del art. 35 inciso cuarto y puede ser relevante para la amonestación escrita transitoria; empresa grande solo abre esa posibilidad si hay reincidencia grave/gravísima acreditada.',insufficient:'No se verifica la categoría legal ni se cuantifica el porcentaje porque no hay campo de ingresos.'},
    dpo:{values:{yes:'DPO declarado',no:'DPO no declarado'},legal:'Ley 21.719, artículos 36 N.º 5, 49 a 51',condition:'La atenuante exige diligencia de dirección y supervisión verificada mediante certificado de modelo de prevención; un DPO solo no acredita el modelo.',effect:'Contexto sin cambio automático de clase, tope o monto.',insufficient:'La respuesta Sí/No no acredita implementación, facultades, certificación ni diligencia.'},
    people:{values:{integer:'Número entero declarado de titulares afectados'},legal:'Ley 21.719, artículo 37 N.º 3',condition:'La Agencia pondera perjuicio y especialmente número de titulares.',effect:'Factor cualitativo de graduación; no crea umbral, categoría ni multiplicador.',insufficient:'Sin perjuicio probado, el número por sí solo no fija monto.'},
    data:{values:{identification:'Identificación',contact:'Contacto',economic:'Económicos/financieros/comerciales',health:'Salud',biometric:'Biométricos',sensitive:'Otras categorías sensibles',minors:'Niños, niñas o adolescentes',credentials:'Credenciales'},legal:'Ley 21.719, artículos 14 sexies, 34 ter letra g, 34 quáter letras d/e/f y 37 N.º 5',condition:'Sensibilidad/menores son criterios de graduación. La infracción gravísima exige además la conducta y elementos del tipo (por ejemplo, conocimiento, contravención o deliberación). Art. 14 sexies establece comunicación a titulares solo en categorías y supuestos expresos.',effect:'Salud, biometría, otros sensibles y menores aparecen como factor art. 37; económicos pueden activar deber de aviso al titular si se cumplen los requisitos del art. 14 sexies. Ningún tipo de dato asigna clase automáticamente.',insufficient:'Identificación, contacto, credenciales y seleccionar una categoría no prueban tratamiento ilícito, intención, riesgo ni comunicación obligatoria.'},
    incident:{values:{access:'Acceso no autorizado',loss:'Pérdida o destrucción',disclosure:'Divulgación o comunicación',alteration:'Alteración',other:'Otro',unknown:'No se sabe',empty:'No seleccionada'},legal:'Ley 21.719, artículos 14 quinquies/sexies y tipos de los artículos 34 bis a quáter',condition:'Se deben identificar deber vulnerado, contexto, riesgo y elementos subjetivos expresos del tipo.',effect:'Describe el incidente; no asigna infracción ni tope.',insufficient:'Las opciones no recogen hechos suficientes para subsumir una conducta.'},
    notified:{values:{yes:'Sí',no:'No',na:'No aplica'},legal:'Ley 21.719, artículos 14 sexies, 34 ter letra k y 34 quáter letra f',condition:'El deber de reportar exige vulneración de seguridad con riesgo razonable; el tipo gravísimo de omisión exige deliberación.',effect:'Antecedente. No aplica excluye inferencias; Sí o No no cambian por sí solos la clase o multa.',insufficient:'La respuesta no acredita que existiera el deber, que se cumplió tarde o que hubo omisión deliberada.'},
    affectedNotice:{values:{yes:'Sí',partial:'Parcialmente',no:'No'},legal:'Ley 21.719, artículo 14 sexies incisos segundo y tercero',condition:'Aviso a titulares en vulneraciones referidas a datos sensibles, datos de menores de 14 años o datos económicos/financieros/bancarios/comerciales.',effect:'Antecedente de cumplimiento; sin clase ni ajuste automático.',insufficient:'El formulario no prueba edad, tipo exacto de datos, vulneración ni demás condiciones del deber.'},
    protocol:{values:{yes:'Sí',no:'No'},legal:'Ley 21.719, artículos 14 quinquies y 49',condition:'Seguridad exige medidas apropiadas al riesgo; protocolo es un elemento de un modelo voluntario de prevención, no el único.',effect:'Contexto, sin agravante ni atenuante automática.',insufficient:'Tener o no un protocolo escrito no demuestra por sí solo suficiencia o incumplimiento de medidas.'},
    priorSanctions:{values:{zero:'Primer incidente declarado',one:'Una sanción previa declarada',twoPlus:'Dos o más sanciones previas declaradas'},legal:'Ley 21.719, artículos 35 inciso tercero y 36 N.º 3 y letra a)',condition:'Reincidencia: dos o más sanciones por infracciones a esta ley en los últimos 30 meses, con resoluciones firmes o ejecutoriadas. Ausencia de sanciones previas puede atenuar si se confirma.',effect:'El formulario no acredita fechas, firmeza ni número de sanciones legales; por eso no aplica triplicación ni límite porcentual. La opción cero solo identifica una posible atenuante, sin ponderación numérica.',insufficient:'“Segunda” o “tercera o más” no prueban reincidencia legal.'}
  };

  function renderResult({badge, title, summary, detail = '', amountPanel = '', disclaimer = ''}) {
    resultBody.innerHTML = `
      <article class="result-main-card">
        <span class="result-classification">${badge}</span>
        <h2 id="result-title" tabindex="-1">${title}</h2>
        <p class="result-summary">${summary}</p>
        ${amountPanel}
        ${detail}
      </article>
      ${disclaimer ? `<p class="result-disclaimer">${disclaimer}</p>` : ''}`;
  }
  function calculate() {
    captureAnswers();
    readFromModel = true;
    const size = value('size');
    const recurrence = value('priorSanctions');
    const temporal = value('temporal');
    const people = isChecked('people-unknown') ? null : (value('people') === '' ? null : Number(value('people')));

    // El selector temporal declara el régimen asumido; no equivale a fecha probada.
    if (temporal === 'no') {
      const legacyRanges = {general:{min:1,max:10,text:'Reclamación acogida en el caso general (art. 16, inciso quinto)'},economic:{min:10,max:50,text:'Reclamación acogida por infracción a los arts. 17/18 (art. 16, inciso quinto)'},noncompliance:{min:2,max:50,text:'Incumplimiento de lo ordenado judicialmente (art. 16, inciso sexto)'}};
      const legacy = legacyRanges[value('legacyFine')];
      const legacyBand = legacy || {min:0,max:50,text:'Banda amplia del artículo 16: depende de cuál de sus procedimientos judiciales específicos se haya aplicado'};
      const legacyPanel = `<section class="result-amount-panel" aria-labelledby="amount-panel-title"><h3 id="amount-panel-title">Rango ${legacy ? 'legal del procedimiento judicial' : 'orientativo más amplio del régimen anterior'}</h3><p class="result-amount-figure">${legacyBand.min.toLocaleString('es-CL')}–${legacyBand.max.toLocaleString('es-CL')} UTM</p><p class="result-amount-clp">${formatClp(legacyBand.min)}–${formatClp(legacyBand.max)} CLP</p><p class="result-amount-intro">${legacyBand.text}. ${legacy ? 'Es el rango legal del procedimiento indicado, no una multa impuesta ni una predicción.' : 'El límite inferior $0 es solo una referencia matemática, no un mínimo legal. La Ley 19.628 anterior no fijaba una multa administrativa general por incidentes de privacidad.'}</p><p class="result-utm-reference">Conversión con 1 UTM = ${formatClp(1)}, valor oficial del SII para ${UTM_REFERENCE}. <a href="https://www.sii.cl/valores_y_fechas/utm/utm2026.htm" target="_blank" rel="noopener">SII, UTM 2026</a>. Referencia mensual actual; no representa el valor histórico de una eventual sentencia.</p></section>`;
      renderResult({
        badge:'RÉGIMEN ANTERIOR A LA REFORMA',
        title:'Aplicaría la Ley 19.628 en su versión entonces vigente',
        summary:'La opción indica un escenario anterior al 1 de diciembre de 2026. No corresponde mostrar los topes nuevos de la Ley 21.719 como si fueran aplicables.',
        amountPanel:legacyPanel,
        detail:`<div class="result-rule-note"><p>Se usa la <a href="https://www.bcn.cl/leychile/Navegar?idNorma=141599&idVersion=2023-05-09" target="_blank" rel="noopener">versión de la Ley 19.628 vigente hasta el 30 de noviembre de 2026</a>. La Ley 21.719 entra en vigor el 1 de diciembre de 2026 (disposición transitoria primera); no se aplican sus máximos a este escenario.</p>${!legacy ? '<p>El rango amplio reúne los máximos de los procedimientos judiciales específicos del artículo 16; las respuestas no permiten seleccionar uno.</p>' : ''}</div>`,
        disclaimer:'El resultado identifica el marco temporal indicado por la opción; no determina la responsabilidad ni una sanción bajo el régimen anterior.'
      });
      readFromModel = false;
      return;
    }

    const increaseFactors = [];
    if (people !== null) increaseFactors.push(`Número declarado: ${people.toLocaleString('es-CL')} titulares. El perjuicio y su número son criterios de ponderación del artículo 37 N.º 3; no constituyen un umbral ni un multiplicador.`);
    const selectedData = checkedValues('data');
    const sensitiveSelected = ['health','biometric','sensitive','minors'].some((key) => selectedData.includes(key));
    if (sensitiveSelected) increaseFactors.push('Los datos sensibles o de niños, niñas y adolescentes son criterios de ponderación del artículo 37 N.º 5; la selección no determina la clase ni una subida automática.');

    const mitigationFactors = [];
    if (recurrence === 'zero') mitigationFactors.push('La opción declara ausencia de sanciones previas. Puede ser atenuante (art. 36 N.º 3) si se confirma; no modifica automáticamente el cálculo.');

    const isEmt = ['micro','small','medium'].includes(size);
    const contextNotes = [];
    contextNotes.push('<p>Las respuestas no identifican por sí solas un tipo de los artículos 34 bis a quáter. Los máximos se muestran separados por clase como escenarios; no se asigna una clase a partir de la causa, el tamaño o el tipo de datos.</p>');
    contextNotes.push(`<p>Tamaño declarado: ${esc(sizeLabels[size] || 'no informado')}. Solo orienta sobre la categoría de empresa de menor tamaño; no se verifican ingresos ni exclusiones de la Ley 20.416, artículo segundo.</p>`);
    if (value('dpo') === 'yes') contextNotes.push('<p>Declaraste que tienes DPO. Es un elemento posible de un modelo de prevención (art. 49), pero no acredita su implementación o certificación ni cambia automáticamente clase o monto (arts. 36 N.º 5 y 51).</p>');
    else contextNotes.push('<p>Declaraste que no tienes DPO. Su ausencia no crea por sí sola una infracción; tampoco se acredita con esta respuesta si existe un modelo de prevención certificado (arts. 49–51).</p>');
    if (value('protocol') === 'yes') contextNotes.push('<p>Declaraste que había protocolo. Su existencia es un antecedente; no demuestra por sí sola que las medidas fueran suficientes y adecuadas al riesgo (art. 14 quinquies).</p>');
    else contextNotes.push('<p>Declaraste que no había protocolo. Esto no es por sí solo una infracción ni una agravante; deben verificarse las medidas de seguridad exigibles según el riesgo (art. 14 quinquies).</p>');
    const incidentDescriptions = {access:'acceso no autorizado',loss:'pérdida o destrucción',disclosure:'divulgación o comunicación',alteration:'alteración',other:'otra causa',unknown:'causa desconocida'};
    if (value('incident')) contextNotes.push(`<p>La causa declarada (${incidentDescriptions[value('incident')] || 'selección informada'}) describe el incidente, pero no identifica por sí sola la obligación infringida ni los elementos de un tipo legal.</p>`);
    if (value('notified') === 'no') contextNotes.push('<p>Un “No” a la notificación no basta para clasificar: el art. 14 sexies exige una vulneración con riesgo razonable y el art. 34 ter letra k sanciona omitir comunicaciones o registros obligatorios; la omisión del art. 34 quáter letra f debe ser deliberada. Esas condiciones no se verifican con esta respuesta.</p>');
    else if (value('notified') === 'yes') contextNotes.push('<p>Un “Sí” a la notificación no demuestra por sí solo que se cumpliera el deber del art. 14 sexies (riesgo razonable, oportunidad y registro), ni genera una atenuante automática.</p>');
    if (value('affectedNotice') === 'yes') contextNotes.push('<p>Declaraste haber avisado a los titulares. La respuesta solo sirve como antecedente: el deber del art. 14 sexies depende de las categorías y condiciones legales, que no se verifican aquí.</p>');
    else if (value('affectedNotice') === 'partial') contextNotes.push('<p>Declaraste un aviso parcial a titulares. No permite concluir incumplimiento sin verificar si el deber del art. 14 sexies se activó y a quiénes debía comunicarse.</p>');
    else if (value('affectedNotice') === 'no') contextNotes.push('<p>Declaraste que no avisaste a titulares. El deber del art. 14 sexies solo opera en supuestos definidos (por ejemplo, ciertos datos sensibles, menores de 14 años o datos económicos); la respuesta no acredita por sí sola una infracción.</p>');
    if (recurrence !== 'zero') contextNotes.push('<p>Las opciones de sanciones previas no acreditan reincidencia: se requieren dos o más sanciones por infracciones a esta ley en 30 meses, con resoluciones firmes o ejecutoriadas (arts. 35 y 36 letra a). Por eso no se aplica triplicación.</p>');
    if (recurrence === 'twoPlus' && size === 'large') contextNotes.push('<p>Solo si se acreditaran además empresa fuera de menor tamaño, reincidencia y una infracción grave o gravísima, el art. 35 contempla la alternativa más gravosa entre hasta tres veces el monto asignado y hasta 2% o 4% de ingresos del último año calendario. No se cuantifica: no se solicitan ingresos y no se han acreditado esos requisitos.</p>');

    let detail = `<div class="result-rule-note">${contextNotes.join('')}<p>El artículo 35 fija topes, no una multa mínima general ni una fórmula para estimar la sanción concreta. El recargo del 50% solo procede si no se adoptan en plazo las medidas correctivas ordenadas por la Agencia; el formulario no consulta ese incumplimiento.</p></div>`;
    if (isEmt) detail += '<div class="result-transition"><strong>Disposición sexta transitoria:</strong> durante los primeros doce meses desde la entrada en vigor, la Agencia podrá aplicar amonestación escrita a empresas legalmente de menor tamaño. Esta respuesta no permite verificar la categoría legal ni cuándo se impondría una sanción; por eso no se aplica automáticamente esta regla.</div>';

    const findings = [];
    const applicabilityNotes = [];
    const addFinding = (label, level, article, condition) => findings.push({label,level,article,condition});
    const CLASSIFICATION_RULE_MATRIX = {
      conductProcessing:{yes:{label:'Tratamiento sin base de licitud o para finalidad distinta',level:2,article:'art. 34 ter letra a',condition:'Debe comprobarse que faltaba consentimiento/base legal o que el propósito difería del informado al recolectar los datos.'}},
      conductDisclosure:{yes:{label:'Comunicación o cesión de datos sin consentimiento necesario o para fin distinto',level:2,article:'art. 34 ter letra b',condition:'Debe confirmarse que el consentimiento era necesario o que el fin excedía el autorizado.'}},
      conductQuality:{unnecessary:{label:'Tratamiento de datos innecesarios para la finalidad',level:2,article:'art. 34 ter letra c',condition:'Debe comprobarse que los datos eran innecesarios en relación con el fin.'},inaccurate:{label:'Tratamiento de datos inexactos, incompletos o desactualizados',level:2,article:'art. 34 ter letra d',condition:'No se aplica si la actualización correspondía al titular por ley o contrato.'}},
      conductTransparency:{yes:{label:'Incumplimiento del deber de información y transparencia',level:1,article:'art. 34 bis letra a',condition:'Debe verificarse el deber del art. 14 ter y el incumplimiento total o parcial.'}},
      conductRights:{incomplete:{label:'Omisión, respuesta incompleta o tardía a solicitud de derechos',level:1,article:'art. 34 bis letra c',condition:'Debe comprobarse una solicitud formulada conforme a la ley y el incumplimiento.'},obstructed:{label:'Obstaculización del ejercicio de derechos',level:2,article:'art. 34 ter letra e',condition:'Debe verificarse que el ejercicio del derecho era legítimo.'},blocking:{label:'Incumplimiento relativo a solicitud fundada de bloqueo temporal',level:2,article:'art. 34 ter letra f',condition:'Debe comprobarse que la solicitud estaba fundada y faltó respuesta o existió retraso/denegación injustificada.'}},
      conductSecurity:{security:{label:'Incumplimiento de obligaciones de seguridad',level:2,article:'art. 34 ter letra j',condition:'Debe comprobarse qué obligación del art. 14 quinquies aplicaba y cómo se infringió.'},report:{label:'Omisión de comunicación o registro obligatorio por vulneración de seguridad',level:2,article:'art. 34 ter letra k',condition:'Debe verificarse que ocurrió una vulneración y que la comunicación o registro era obligatorio.'},deliberateReport:{label:'Omisión deliberada de comunicación de vulneración',level:3,article:'art. 34 quáter letra f',condition:'Debe comprobarse la vulneración, que el aviso era exigible y la deliberación.'}},
      conductSpecialData:{minorsUnlawful:{label:'Tratamiento ilícito de datos de NNA',level:2,article:'art. 34 ter letra g',condition:'Debe precisarse la regla aplicable al tratamiento de NNA y su incumplimiento.',guard:()=>selectedData.includes('minors'),missing:'Se declaró tratamiento ilícito de datos de NNA, pero no se marcaron esos datos; no se asignó clase.'},knowingSensitive:{label:'Tratamiento, comunicación o cesión a sabiendas y contra la ley de datos sensibles o de NNA',level:3,article:'art. 34 quáter letra e',condition:'Debe comprobarse la categoría seleccionada, el conocimiento y la contravención.',guard:()=>sensitiveSelected,missing:'Se declaró una conducta con datos sensibles o de NNA, pero esas categorías no están marcadas; no se asignó clase.'}},
      conductSecrecy:{general:{label:'Vulneración del deber de secreto o confidencialidad',level:2,article:'art. 34 ter letra i',condition:'Debe verificarse el deber aplicable y la divulgación o uso incompatible.'},sensitive:{label:'Vulneración de confidencialidad sobre datos sensibles',level:3,article:'art. 34 quáter letra d',condition:'Debe comprobarse que la conducta afectó los datos sensibles seleccionados y vulneró su deber de confidencialidad.',guard:()=>sensitiveSelected,missing:'Se indicó vulneración de confidencialidad sobre datos sensibles, pero no se marcaron esos datos; no se asignó clase.'}},
      conductTransfer:{ordinary:{label:'Transferencia internacional de datos en contravención a la ley',level:2,article:'art. 34 ter letra m',condition:'Debe identificarse la transferencia y la regla de transferencia internacional infringida.'},knowing:{label:'Transferencia internacional a sabiendas de la contravención',level:3,article:'art. 34 quáter letra h',condition:'Debe acreditarse la transferencia y el conocimiento de que infringía la ley.'}},
      conductFalseData:{yes:{label:'Comunicación o cesión a sabiendas de información no veraz, incompleta, inexacta o desactualizada sobre un titular',level:3,article:'art. 34 quáter letra c',condition:'Debe acreditarse el acto de comunicar/ceder y el conocimiento de la inexactitud.'}},
      conductIntent:{fraudulent:{label:'Tratamiento fraudulento',level:3,article:'art. 34 quáter letra a',condition:'Debe acreditarse fraude; un error o una vulneración no bastan por sí solos.'},maliciousPurpose:{label:'Desvío malicioso de datos a otra finalidad',level:3,article:'art. 34 quáter letra b',condition:'Debe acreditarse la malicia y la finalidad no consentida o autorizada por ley.'}},
      conductAuthority:{general:{label:'Incumplimiento de instrucción general de la Agencia',level:1,article:'art. 34 bis letra e',condition:'Solo es leve si el hecho no está sancionado como grave o gravísimo.'},specific:{label:'Incumplimiento de requerimiento específico y directo',level:2,article:'art. 34 ter letra n',condition:'Debe identificarse el requerimiento de la Agencia y su incumplimiento.'},rightsResolution:{label:'Incumplimiento de resolución sobre reclamación de derechos',level:3,article:'art. 34 quáter letra i',condition:'Debe existir una resolución que resuelva la reclamación y comprobarse su incumplimiento.'}}
    };
    for (const [fieldName, responseRules] of Object.entries(CLASSIFICATION_RULE_MATRIX)) {
      const rule = responseRules[value(fieldName)];
      if (!rule) continue;
      if (rule.guard && !rule.guard()) { applicabilityNotes.push(rule.missing); continue; }
      addFinding(rule.label,rule.level,rule.article,rule.condition);
    }

    const classMeta = {1:{name:'Leve',cap:5000},2:{name:'Grave',cap:10000},3:{name:'Gravísima',cap:20000}};
    const maxLevel = findings.reduce((highest,item)=>Math.max(highest,item.level),0);
    const possibleClass = classMeta[maxLevel] || null;
    const confirmedRecurrence = recurrence === 'twoPlus' && value('recurrenceVerified') === 'yes';
    const recurrenceMismatch = value('recurrenceVerified') !== 'unknown' && (recurrence === 'twoPlus') !== (value('recurrenceVerified') === 'yes');
    const recurrenceUnknown = recurrence === 'twoPlus' && value('recurrenceVerified') === 'unknown';
    const unknownAnswers = ['conductProcessing','conductDisclosure','conductQuality','conductTransparency','conductRights','conductSecurity','conductSpecialData','conductSecrecy','conductTransfer','conductFalseData','conductIntent','conductAuthority'].filter((name)=>value(name)==='unknown');
    const unknownLabels = {conductProcessing:'base legal y finalidad del tratamiento',conductDisclosure:'consentimiento o finalidad de la comunicación/cesión',conductQuality:'necesidad y exactitud de los datos',conductTransparency:'cumplimiento del deber de información',conductRights:'respuesta y trámite de solicitudes de derechos',conductSecurity:'obligaciones de seguridad y comunicaciones exigibles',conductSpecialData:'licitud del tratamiento de datos sensibles o de NNA',conductSecrecy:'deber de secreto o confidencialidad',conductTransfer:'regla aplicable a transferencias internacionales',conductFalseData:'conocimiento de datos comunicados inexactos',conductIntent:'fraude o finalidad maliciosa',conductAuthority:'tipo de instrucción o resolución de la Agencia'};
    const unknownSummary = unknownAnswers.map(name=>unknownLabels[name]).join('; ');
    const classificationIncomplete = unknownAnswers.length > 0 || applicabilityNotes.length > 0 || recurrenceUnknown;
    const identifiedArticles = findings.map(item=>`<li><strong>${item.label}</strong> — ${item.article}. ${item.condition}</li>`).join('');
    const utmNote = `<p class="result-utm-reference">Conversión: 1 UTM = ${formatClp(1)}, valor oficial del SII para ${UTM_REFERENCE}. <a href="https://www.sii.cl/valores_y_fechas/utm/utm2026.htm" target="_blank" rel="noopener">SII, UTM 2026</a>. Referencia mensual, no valor de una futura sanción.</p>`;
    const levelsKnown = [...new Set(findings.map(item=>item.level))].sort((a,b)=>a-b);
    const broadRange = classificationIncomplete || levelsKnown.length === 0;
    const candidateLevels = broadRange ? [1,2,3] : levelsKnown;
    const sizeIncomeNote = confirmedRecurrence && candidateLevels.some(level=>level >= 2) && size === 'large';
    const verifiedCapMultiplier = confirmedRecurrence ? 3 : 1;
    const hasPeopleFactor = people !== null && people > 0;
    const hasSensitiveFactor = sensitiveSelected;
    // Estimación propia de FOLIOX: banda base 5%–25% del tope de cada clase.
    // Los factores del art. 37 solo desplazan esta banda orientativa; no son
    // ponderaciones oficiales ni predicen una decisión administrativa.
    const lowerShift = (hasPeopleFactor ? 0.05 : 0) + (hasSensitiveFactor ? 0.05 : 0) + (confirmedRecurrence ? 0.10 : 0) - (recurrence === 'zero' ? 0.05 : 0);
    const upperShift = (hasPeopleFactor ? 0.10 : 0) + (hasSensitiveFactor ? 0.10 : 0) + (confirmedRecurrence ? 0.20 : 0) - (recurrence === 'zero' ? 0.05 : 0);
    const estimates = candidateLevels.map(level => {
      const cap = classMeta[level].cap * verifiedCapMultiplier;
      const low = broadRange ? 0 : Math.max(0, (0.05 + lowerShift) * cap);
      const high = broadRange ? cap : Math.min(cap, (0.25 + upperShift) * cap);
      return {level, cap, low, high};
    });
    const rangeMinUtm = Math.floor(Math.min(...estimates.map(item=>item.low)));
    const rangeMaxUtm = Math.ceil(Math.max(...estimates.map(item=>item.high)));
    const rangeClassNames = candidateLevels.map(level=>classMeta[level].name);
    const classSummary = broadRange
      ? `Banda amplia: leve (art. 34 bis; tope ${(classMeta[1].cap * verifiedCapMultiplier).toLocaleString('es-CL')} UTM), grave (art. 34 ter; tope ${(classMeta[2].cap * verifiedCapMultiplier).toLocaleString('es-CL')} UTM) y gravísima (art. 34 quáter; tope ${(classMeta[3].cap * verifiedCapMultiplier).toLocaleString('es-CL')} UTM); no todas están confirmadas.`
      : `Clase${rangeClassNames.length > 1 ? 's' : ''} candidata${rangeClassNames.length > 1 ? 's' : ''}: ${candidateLevels.map(level=>`${classMeta[level].name.toLowerCase()} (art. 34 ${level===1?'bis':level===2?'ter':'quáter'}; tope ${(classMeta[level].cap * verifiedCapMultiplier).toLocaleString('es-CL')} UTM${confirmedRecurrence?' con reincidencia':''})`).join('; ')}.`;
    const factorSummary = [
      hasPeopleFactor ? 'número declarado de titulares (art. 37 N.º 3)' : '',
      hasSensitiveFactor ? 'datos sensibles o de NNA (art. 37 N.º 5)' : '',
      recurrence === 'zero' ? 'sin sanciones previas declaradas, posible atenuante (art. 36 N.º 3)' : '',
      confirmedRecurrence ? 'reincidencia declarada con plazo y firmeza confirmados: topes multiplicados por 3 (arts. 35 y 36 letra a)' : ''
    ].filter(Boolean);
    const rangeExplainer = broadRange
      ? `Banda amplia FOLIOX: 0–100% del máximo de los escenarios considerados, porque ${unknownAnswers.length || recurrenceUnknown || applicabilityNotes.length ? 'faltan antecedentes que pueden cambiar la clase' : 'ninguna respuesta confirma una clase'}. $0 es un límite matemático orientativo, no un mínimo legal.`
      : 'Pauta FOLIOX: base 5%–25% del tope aplicable (×3 con reincidencia confirmada); titulares >0: +5/+10 puntos porcentuales, sensibles/NNA: +5/+10, sin sanciones previas: −5/−5, reincidencia confirmada: +10/+20. Los extremos se limitan al tope legal.';
    const factorsShort = `${broadRange ? 'Factores identificados, sin estrechar la banda amplia' : 'Factores aplicados'}: ${factorSummary.length ? factorSummary.join('; ') : 'ninguno adicional'}. DPO, tamaño, causa, avisos y protocolo no ajustan automáticamente el rango.`;
    const incomeNote = sizeIncomeNote ? ' El 2%/4% de ingresos podría ser un límite alternativo solo para empresa fuera de menor tamaño reincidente en infracción grave/gravísima; sin ingresos anuales no se cuantifica ni incorpora al rango.' : '';
    const recurrenceNote = confirmedRecurrence ? ' Se aplicó ×3 al tope legal porque las respuestas declaran dos o más sanciones en 30 meses y firmeza; la herramienta no verifica los documentos.' : recurrence === 'twoPlus' ? ' No se triplica: la reincidencia no quedó confirmada en todos sus requisitos legales.' : '';
    const classArticles = findings.length
      ? `<div class="result-candidate-list"><h4>Conductas y artículos aplicados</h4><ul>${identifiedArticles}</ul></div>`
      : '<p class="result-calc-note">No hay una conducta concreta clasificada; las clases y artículos indicados son solo los escenarios legales que abarca esta banda amplia.</p>';
    const classificationPanel = `<section class="result-amount-panel" aria-labelledby="amount-panel-title"><h3 id="amount-panel-title">${broadRange ? 'Rango orientativo amplio de escenarios legales' : 'Rango aproximado de multa — estimación FOLIOX'}</h3><p class="result-amount-figure">${rangeMinUtm.toLocaleString('es-CL')}–${rangeMaxUtm.toLocaleString('es-CL')} UTM</p><p class="result-amount-clp">${formatClp(rangeMinUtm)}–${formatClp(rangeMaxUtm)} CLP</p><p class="result-utm-reference">Conversión: 1 UTM = ${formatClp(1)}, valor oficial del SII para ${UTM_REFERENCE}. <a href="https://www.sii.cl/valores_y_fechas/utm/utm2026.htm" target="_blank" rel="noopener">Fuente SII, UTM 2026</a>. Referencia mensual; no es el valor futuro de una sanción.</p><p class="result-amount-intro">${classSummary}</p><p class="result-calc-note">${rangeExplainer} ${factorsShort}${recurrenceNote}${incomeNote}</p>${classArticles}<p class="result-calc-note">La ley fija máximos, no mínimos generales ni una fórmula matemática para estimar la multa concreta. Este rango es una orientación propia de FOLIOX, no una fórmula oficial ni una predicción de la decisión de la Agencia.</p></section>`;
    detail = '';

    renderResult({
      badge:broadRange ? 'RANGO ORIENTATIVO AMPLIO' : `ESCENARIO ${rangeClassNames.join(' / ').toUpperCase()}`,
      title:broadRange ? 'Rango amplio por antecedentes no concluyentes' : `Rango orientativo para clase${rangeClassNames.length > 1 ? 's' : ''} ${rangeClassNames.map(item=>item.toLowerCase()).join(' / ')}`,
      summary:'Estimación referencial expresada primero en UTM y luego en CLP; el monto concreto lo determina la autoridad.',
      detail,
      amountPanel:classificationPanel,
      increases:increaseFactors,
      mitigations:mitigationFactors
    });
    readFromModel = false;
  }
  form.addEventListener('input', (event) => {
    const target = event.target;
    captureAnswers();
  });
  form.addEventListener('change', (event) => {
    const target = event.target;
    if (target.name === 'size' && target.checked) {
      form.querySelectorAll('.company-option').forEach((card) => card.classList.toggle('is-selected',card.contains(target)));
    }
    if (target.name === 'temporal') {
      document.querySelector('#legacy-fine-group').hidden = target.value !== 'no';
      document.querySelector('#current-law-questions').hidden = target.value !== 'yes';
    }
    captureAnswers();
  });
  previous.addEventListener('click', () => { captureAnswers(); showStep(Math.max(0,activeStep-1)); });
  next.addEventListener('click', () => {
    if (!validateStep()) return;
    captureAnswers();
    if (activeStep < 2) showStep(activeStep+1);
    else {
      calculate();
      form.hidden = true; stepsNav.hidden = true; progress.hidden = true; formActions.hidden = true;
      result.hidden = false;
      result.querySelector('h2').focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (!form.hidden && event.altKey && event.key === 'ArrowRight' && activeStep < 2) next.click();
    if (!form.hidden && event.altKey && event.key === 'ArrowLeft' && activeStep > 0) previous.click();
  });
  document.querySelector('#again').addEventListener('click', () => {
    result.hidden = true; form.hidden = false; stepsNav.hidden = false; progress.hidden = false; formActions.hidden = false; showStep(0);
  });
  document.querySelector('#reset').addEventListener('click', () => {
    form.reset(); Object.keys(answers).forEach((key) => delete answers[key]);
    form.querySelectorAll('.company-option').forEach((card) => card.classList.remove('is-selected'));
    captureAnswers();
    result.hidden = true; form.hidden = false; stepsNav.hidden = false; progress.hidden = false; formActions.hidden = false; showStep(0);
    form.querySelector('input[name="size"]')?.focus();
  });
  captureAnswers();
  showStep(0,false);
})();
