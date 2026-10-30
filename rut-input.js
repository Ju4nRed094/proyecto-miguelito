(() => {
  const fields = [...document.querySelectorAll('[data-rut-input]')];
  if (!fields.length) return;

  const countTokens = (value) => (value.match(/[0-9K]/gi) || []).length;

  function inspect(value) {
    if (value.length > 12 || /[^0-9Kk.\-]/.test(value)) return null;
    const dots = (value.match(/\./g) || []).length;
    if (dots > 2 || (value.match(/-/g) || []).length > 1) return null;

    let body = '';
    let verifier = '';
    let hasHyphen = value.includes('-');
    if (hasHyphen) {
      const split = value.indexOf('-');
      const left = value.slice(0, split).replace(/\./g, '');
      const right = value.slice(split + 1).replace(/\./g, '').toUpperCase();
      if (!/^\d+$/.test(left) || !/^[0-9K]?$/.test(right) || left.length > 8) return null;
      body = left;
      verifier = right;
    } else {
      const compact = value.replace(/\./g, '').toUpperCase();
      if (!/^[0-9K]*$/.test(compact)) return null;
      if (compact.includes('K')) {
        if (!/^[0-9]{7,8}K$/.test(compact)) return null;
        body = compact.slice(0, -1);
        verifier = 'K';
        hasHyphen = true;
      } else {
        if (compact.length > 9) return null;
        body = compact.slice(0, 8);
        if (compact.length === 9) {
          verifier = compact[8];
          hasHyphen = true;
        }
      }
    }
    if (body.length > 8) return null;
    const groupedBody = body.length > 3
      ? `${body.slice(0, body.length % 3 || 3)}.${body.slice(body.length % 3 || 3).match(/.{1,3}/g).join('.')}`
      : body;
    const formatted = groupedBody + (hasHyphen ? `-${verifier}` : '');
    if (formatted.length > 12) return null;
    return { body, verifier, hasHyphen, formatted };
  }

  function caretForTokenCount(value, targetCount) {
    if (targetCount <= 0) return 0;
    let seen = 0;
    for (let index = 0; index < value.length; index += 1) {
      if (/[0-9K]/i.test(value[index])) seen += 1;
      if (seen === targetCount) return index + 1;
    }
    return value.length;
  }

  function write(input, formatted, caretTokenCount, notify = true, afterHyphen = false) {
    input.value = formatted;
    const caret = afterHyphen && formatted.includes('-')
      ? formatted.indexOf('-') + 1
      : caretForTokenCount(formatted, caretTokenCount);
    try { input.setSelectionRange(caret, caret); } catch { /* Some input types do not expose a text caret. */ }
    input.dataset.rutLastValid = formatted;
    if (notify) {
      input.dataset.rutInternalInput = 'true';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      delete input.dataset.rutInternalInput;
    }
  }

  function insert(input, text, start, end) {
    const current = input.value;
    const candidate = current.slice(0, start) + text + current.slice(end);
    const parsed = inspect(candidate);
    if (!parsed) return false;
    const prefix = candidate.slice(0, start + text.length);
    const caretCount = countTokens(prefix);
    write(input, parsed.formatted, caretCount, true, prefix.endsWith('-'));
    return true;
  }

  function deleteTokens(input, inputType) {
    const current = input.value;
    const parsed = inspect(current);
    if (!parsed) return false;
    const selectionStart = input.selectionStart ?? current.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    let from = countTokens(current.slice(0, selectionStart));
    let to = countTokens(current.slice(0, selectionEnd));
    if (from === to) {
      if (inputType === 'deleteContentBackward') from = Math.max(0, from - 1);
      else to = Math.min(parsed.body.length + (parsed.verifier ? 1 : 0), to + 1);
    }
    const bodyLength = parsed.body.length;
    const removed = (index) => index >= from && index < to;
    const body = parsed.body.split('').filter((_, index) => !removed(index)).join('');
    const verifier = parsed.verifier && !removed(bodyLength) ? parsed.verifier : '';
    const hasHyphen = body.length > 0 && (parsed.hasHyphen || Boolean(verifier));
    const candidate = body + (hasHyphen ? `-${verifier}` : '');
    const next = inspect(candidate);
    if (!next) return false;
    write(input, next.formatted, Math.min(from, body.length + (verifier ? 1 : 0)), true, Boolean(next.hasHyphen && !verifier && from >= body.length));
    return true;
  }

  function normalizeCurrent(input) {
    const parsed = inspect(input.value);
    if (!parsed) return false;
    const caret = input.selectionStart ?? input.value.length;
    const logicalCaret = countTokens(input.value.slice(0, caret));
    const afterHyphen = parsed.hasHyphen && input.value.indexOf('-') < caret && logicalCaret === parsed.body.length;
    write(input, parsed.formatted, logicalCaret, false, afterHyphen);
    return true;
  }

  function isComplete(value) {
    const parsed = inspect(String(value));
    return Boolean(parsed && parsed.body.length >= 7 && parsed.body.length <= 8 && /^[0-9K]$/.test(parsed.verifier) && parsed.formatted === value);
  }

  function handleDrop(event, input) {
    const text = event.dataTransfer?.getData('text/plain');
    if (text == null) return;
    event.preventDefault();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    insert(input, text, start, end);
  }

  fields.forEach((input) => {
    input.maxLength = 12;
    input.setAttribute('inputmode', 'text');
    input.setAttribute('autocapitalize', 'characters');
    input.setAttribute('spellcheck', 'false');
    const initial = inspect(input.value);
    if (initial) input.value = initial.formatted;
    input.dataset.rutLastValid = initial?.formatted || '';

    input.addEventListener('beforeinput', (event) => {
      if (event.isComposing) return;
      if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
        event.preventDefault();
        deleteTokens(input, event.inputType);
        return;
      }
      if (!event.inputType.startsWith('insert')) return;
      let text = event.data;
      if (text == null && event.dataTransfer) text = event.dataTransfer.getData('text/plain');
      if (text == null) return; // Paste and drop have dedicated handlers below.
      event.preventDefault();
      insert(input, text, input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length);
    });

    input.addEventListener('paste', (event) => {
      const text = event.clipboardData?.getData('text/plain');
      if (text == null) return;
      event.preventDefault();
      insert(input, text, input.selectionStart ?? input.value.length, input.selectionEnd ?? input.value.length);
    });
    input.addEventListener('drop', (event) => handleDrop(event, input));
    input.addEventListener('input', () => {
      if (input.dataset.rutInternalInput === 'true') return;
      const parsed = inspect(input.value);
      if (!parsed) {
        const lastValid = input.dataset.rutLastValid || '';
        input.value = lastValid;
        try { input.setSelectionRange(lastValid.length, lastValid.length); } catch { /* Ignore unsupported caret APIs. */ }
        return;
      }
      const caret = input.selectionStart ?? input.value.length;
      const logicalCaret = countTokens(input.value.slice(0, caret));
      const afterHyphen = parsed.hasHyphen && input.value.indexOf('-') < caret && logicalCaret === parsed.body.length;
      write(input, parsed.formatted, logicalCaret, false, afterHyphen);
    });
  });

  window.FolioxRut = Object.freeze({ isComplete, normalizeCurrent });
})();
