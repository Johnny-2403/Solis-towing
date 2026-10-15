'use strict';
(function () {
  const config = window.SOLIS_CONFIG;
  if (!config) { console.error('Missing config.js'); return; }
  const $ = (id) => document.getElementById(id);
  const p = config.pricing;
  const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const number = (id) => {
    const el = $(id);
    const n = Number(el.value);
    return el.value.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 10000 ? n : null;
  };
  const toast = (message) => {
    const node = $('toast');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(window.solisToastTimer);
    window.solisToastTimer = setTimeout(() => { node.hidden = true; }, 3500);
  };
  let lastQuote = '';
  const compute = () => {
    const loadedMiles = number('loaded-miles');
    const dispatchMiles = number('dispatch-miles');
    const vehicle = $('vehicle-type').value;
    const afterHours = $('after-hours').checked;
    const valid = loadedMiles !== null && dispatchMiles !== null;
    const isSpecial = vehicle === 'special';
    $('quote-total').closest('.quote-card').classList.toggle('is-special', isSpecial);
    $('copy-quote').disabled = !valid;
    if (!valid) {
      $('quote-total').textContent = 'Enter valid miles';
      $('quote-note').textContent = 'Please enter a distance between 0 and 10,000 miles in both mileage fields.';
      lastQuote = '';
      return;
    }
    if (isSpecial) {
      $('quote-total').textContent = 'Custom quote';
      $('quote-note').textContent = 'This vehicle requires an individually confirmed quote. The standard rate formula is not applicable.';
      $('copy-quote').textContent = 'COPY REQUEST DETAILS ↗';
    } else {
      $('copy-quote').innerHTML = 'COPY QUOTE DETAILS <span aria-hidden="true">↗</span>';
      $('quote-note').textContent = 'Proposed estimate only, excluding truck return travel on longer trips. Contact us to confirm final pricing, taxes, and availability.';
    }
    const base = p.hookup;
    const loaded = loadedMiles * p.loadedPerMile;
    const over = Math.max(0, dispatchMiles - p.dispatchMilesIncluded);
    const dispatch = over * p.extraDispatchPerMile;
    const size = vehicle === 'large' ? p.largeVehicleFee : 0;
    const hours = afterHours ? p.afterHoursFee : 0;
    const raw = base + loaded + dispatch + size + hours;
    const minimum = Math.max(0, p.minimum - raw);
    const subtotal = raw + minimum;
    if (!isSpecial) {
      $('quote-total').innerHTML = `${money(subtotal).split('.')[0]}<span>.${money(subtotal).split('.')[1]}</span>`;
    }
    $('price-hookup').textContent = money(base);
    $('loaded-description').textContent = `${loadedMiles} mi × ${money(p.loadedPerMile)}`;
    $('price-loaded').textContent = money(loaded);
    $('dispatch-description').textContent = over > 0 ? `${over.toFixed(1)} mi × ${money(p.extraDispatchPerMile)} (after ${p.dispatchMilesIncluded} included)` : `First ${p.dispatchMilesIncluded} mi included`;
    $('price-dispatch').textContent = money(dispatch);
    $('vehicle-line').hidden = size === 0;
    $('price-vehicle').textContent = money(size);
    $('hours-line').hidden = !afterHours;
    $('price-hours').textContent = money(hours);
    $('minimum-line').hidden = minimum === 0;
    $('price-minimum').textContent = money(minimum);
    const details = [
      `Solis Towing — ${isSpecial ? 'Request for a custom quote' : 'Estimated towing quote'}`,
      `Pickup: ${$('pickup').value.trim() || 'Not provided'}`,
      `Service coverage: Pickups generally within approximately 2 hours driving from Columbia Heights; drop-offs anywhere within Minnesota with advance approval`,
      `Drop-off: ${$('dropoff').value.trim() || 'Not provided'}`,
      `Loaded miles: ${loadedMiles}`,
      `Truck-to-pickup miles: ${dispatchMiles}`,
      `Vehicle: ${$('vehicle-type').selectedOptions[0].text}`,
      `After hours: ${afterHours ? 'Yes' : 'No'}`,
      isSpecial ? 'Price: Individual quote required' : `Estimated subtotal (before tax): ${money(subtotal)}`,
      'Long-distance trips may require adjustments for truck return travel. Final price, applicable sales tax, fees and availability require confirmation with Solis Towing.'
    ];
    lastQuote = details.join('\n');
    const sms = $('text-quote');
    if (config.phoneE164 && /^\+?\d{10,15}$/.test(config.phoneE164)) {
      sms.hidden = false;
      sms.href = `sms:${config.phoneE164}?body=${encodeURIComponent(lastQuote)}`;
    } else sms.hidden = true;
  };
  const copyText = async (text) => {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; } }
    catch (_) { /* manual fallback below */ }
    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.style.position = 'fixed';tmp.style.left = '-9999px';
    document.body.appendChild(tmp);tmp.select();
    const success = document.execCommand('copy');tmp.remove();
    if (!success) throw new Error('Unable to copy');
  };
  ['pickup','dropoff','loaded-miles','dispatch-miles'].forEach(id => $(id).addEventListener('input', compute));
  ['vehicle-type','after-hours'].forEach(id => $(id).addEventListener('change', compute));
  ['pickup','dropoff'].forEach(id => $(id).addEventListener('input', () => {
    const a = $('pickup').value.trim();const b = $('dropoff').value.trim();
    const params = new URLSearchParams({ api: '1', travelmode: 'driving' });
    if (a) params.set('origin', a);
    if (b) params.set('destination', b);
    $('maps-route').href = (a && b) ? `https://www.google.com/maps/dir/?${params}` : 'https://www.google.com/maps';
  }));
  $('copy-quote').addEventListener('click', async () => {
    if (!lastQuote) return toast('Enter valid distances first.');
    try { await copyText(lastQuote);toast('Quote details copied. Share them with Solis Towing.'); }
    catch (_) { toast('Copy unavailable on this device. Please select and copy your details.'); }
  });
  $('service-region-hero').textContent = config.location.toUpperCase();
  const contact = $('contact-details');
  contact.replaceChildren();
  if (config.phoneE164 && /^\+?\d{10,15}$/.test(config.phoneE164)) {
    const a = document.createElement('a');a.href = `tel:${config.phoneE164}`;a.textContent = config.phoneDisplay || config.phoneE164;contact.appendChild(a);
  }
  if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    const a = document.createElement('a');a.href = `mailto:${config.email}`;a.textContent = config.email;a.className = 'email-link';contact.appendChild(a);
  }
  if (!contact.children.length) {const p = document.createElement('p');p.textContent = 'Business contact details will be added before launch.';contact.appendChild(p);}
  $('contact-service-area').textContent = `Based in ${config.location}. ${config.stateLimit}. ${config.serviceRadius}. Confirm availability for pickup and destination.`;
  $('year').textContent = String(new Date().getFullYear());
  compute();
})();
