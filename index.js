uibuilder.start();


// When a new msg arrives from Node-RED...

uibuilder.onChange('msg', function (msg) {
    hidePleaseWait();
    // window.stop();
    console.log("✅ Received msg from Node-RED:", msg);
    if(msg.payload.pleaseWait!=undefined)
    {
      hidePleaseWait();
      showToast();
    }
    if(msg.payload.moreDetails!=undefined) {
      showMoreDetails(msg.payload.moreDetails);
      hidePleaseWait();
    }
    const pct = (num, den) => den > 0 ? (num / den) * 100 : 0;
    const set = (el, name, value) => el && el.style.setProperty(name, value + '%');

    // Use the pagination-aware renderer instead of direct rendering.
    // If payload includes an asnList, hand it to updateASNtable which will
    // store the array and render the current page + pagination controls.
    if (Array.isArray(msg.payload?.asnList)) {
      updateASNtable(msg);
    }


    // console.log("This is details", msg.payload);
    const detailSummary = msg.payload.details
    if(detailSummary!=undefined && detailSummary.asn!='N/A')
    {
      const pct = (num, den) => den > 0 ? (num / den) * 100 : 0;
      const set = (el, name, value) => el && el.style.setProperty(name, value + '%');
      const outer = document.querySelector('.donut-outer');
      const inner = document.querySelector('.donut-inner');
      if (!outer || !inner) return;

      const pass    = Number(detailSummary.blink_pass || 0);
      const fail    = Number(detailSummary.blink_fail || 0);
      const inProg  = Number(detailSummary.pick_in_progress || 0);
      const done    = Number(detailSummary.pick_done || 0);
      const notDone = Number(detailSummary.pick_not_done || 0);

      const total   = pass + fail;
      const passPct = pct(pass, total);
      const failPct = 100 - passPct;
      set(outer, '--pass', passPct);
      set(outer, '--fail', failPct);

      let inProgPct = 0, donePct = 0, notDonePct = 0;
      if (pass > 0) {
        inProgPct  = pct(inProg, pass);
        donePct    = pct(done,   pass);
        notDonePct = pct(notDone,pass);
        const drift = 100 - (inProgPct + donePct + notDonePct);
        notDonePct += drift;
      }
      set(inner, '--inprog', inProgPct);
      set(inner, '--done',   donePct);
      set(inner, '--notdone',notDonePct);

      // helper for safe assignment
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      // usage
      setText('ks-total', total);
      setText('kpi-pass', pass);
      setText('kpi-fail', fail);
      setText('kpi-done', done);
      setText('kpi-inprog', inProg);
      setText('kpi-notdone', notDone);
      setText('ks-asn', detailSummary.asn);
      setText('ks-line', 'TRIM 2 A');
      setText('ks-clr', detailSummary.color);

      window.currentAsn = detailSummary.asn;

      const viewAllBtn = document.getElementById('ks-viewAll');
        if (viewAllBtn) {
            viewAllBtn.onclick = () => {
                closeModal('kittingModal');
                if (typeof viewDetails === 'function') {
                    viewMoreDetails(window.currentAsn);
                }
            };
        }

      hidePleaseWait();
      document.getElementById('kittingModal').style.display = 'grid';
    }

    // if(msg.vc!=null){
    //     let vc=msg.vc;
    //     console.log(vc);
    //     document.getElementById(vc).style.background ="linear-gradient(135deg, #ff7e00, #ffaa00)";
    // }
    if (msg.err != null) {
        alert(msg.err);
    }
    // if (msg.init != 0)
    // {
    //     fetch('/get-models');
    // }
});

init();

function showMoreDetails(data) {
  // console.log(data);
  const container = document.getElementById('km-tbody');
    container.innerHTML = '' // Clear old content

    // STEP 3: For each model, create a button
    data.forEach(m => {
        // Row
      const tr = document.createElement('tr');

      const partno = document.createElement('td');
      partno.textContent = m.partno;
      const partdesc = document.createElement('td');
      partdesc.textContent = m.partdesc;
      const qty = document.createElement('td');
      qty.textContent = m.qty;
      const tagid = document.createElement('td');
      tagid.textContent = m.tagid;
      const tagcode = document.createElement('td');
      tagcode.textContent = m.tagcode;
      const stdatetime = document.createElement('td');
      stdatetime.textContent = formatToIST(m.stdatetime);
      const eddatetime = document.createElement('td');
      eddatetime.textContent = formatToIST(m.eddatetime);
      // Status cell
      const tdStatus = document.createElement('td');
      const statusChip = document.createElement('span');

      // numeric mapping
      switch (parseInt(m.statuss)) {
        case 0:
          statusChip.textContent = 'Req not sent';
          statusChip.className = 'chip chip-grey';
          break;
        case 1:
          statusChip.textContent = 'Req Sent';
          statusChip.className = 'chip chip-blue';
          break;
        case 2:
          statusChip.textContent = 'Blink Failed';
          statusChip.className = 'chip chip-err';
          break;
        case 3:
          statusChip.textContent = 'Blink Success';
          statusChip.className = 'chip chip-ok';
          break;
        case 4:
          // console.log("Switch case working");
          statusChip.textContent = 'Pickup done';
          statusChip.className = 'chip chip-green';
          break;
        case 5:
          // console.log("Switch case working");
          statusChip.textContent = 'Pickup not done';
          statusChip.className = 'chip chip-warn';
          break;
        default:
          statusChip.textContent = 'Unknown';
          statusChip.className = 'chip';
      }
      tdStatus.appendChild(statusChip);
      const tdAction = document.createElement('td');
      tdAction.className = 'actions-col';

      document.getElementById("km-asn").innerText=m.asn;
      document.getElementById('km-color-dot').style.backgroundColor = m.color;
      document.getElementById('km-color-name').textContent = String(m.color);


      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'Blink LED';

      btn.id = String(m.tagcode);
      
        btn.onclick = () => openLEDModal(m.tagcode);
        tdAction.appendChild(btn)

        tr.appendChild(partno)
        tr.appendChild(partdesc)
        tr.appendChild(qty)
        tr.appendChild(tagid)
        tr.appendChild(tagcode)
        tr.appendChild(stdatetime)
        tr.appendChild(eddatetime)
        tr.appendChild(tdStatus)
        // console.log(tdStatus)
        tr.appendChild(tdAction)

        container.appendChild(tr)
    })
    const overlay = document.querySelector('.km-overlay');
    const modal = document.querySelector('.km-modal');
    overlay.classList.add('is-open');
    modal.classList.add('is-open');

    // === FILTER LOGIC ===
    document.getElementById('statusFilter')?.addEventListener('change', function() {
      const selected = this.value;
      const rows = document.querySelectorAll('#km-tbody tr');
      
      rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-last-child(2) span'); // Status column before Actions
        if (!statusCell) return;

        const label = statusCell.textContent.trim();
        const codeMap = {
          'Req not sent': '0',
          'Req Sent': '1',
          'Blink Failed': '2',
          'Blink Success': '3',
          'Pickup done': '4',
          'Pickup not done': '5',
        };
        const rowCode = codeMap[label] || '';

        if (selected === 'all' || selected === rowCode) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
}

function closeMoreDetails() {
  console.log("Close function called");
  const overlay = document.querySelector('.km-overlay');
  const modal = document.querySelector('.km-modal');
  overlay.classList.remove('is-open');
  modal.classList.remove('is-open');
  location.reload(true);
}

function viewMoreDetails(asnNo) {
  console.log("View more details");
  document.getElementById('kittingModal').style.display = 'none';
  document.getElementById('waitPageDialogue').innerText = "Getting Data from Server…";
  showPleaseWait();
  fetch('/viewMoreDetailsA/?asn=' + asnNo, { cache: 'no-store' });
}

function toggleButtons(disabled) {
  document.querySelectorAll('.button').forEach(b => {
      b.disabled = disabled
      b.style.opacity = disabled ? '0.7' : ''
      b.style.pointerEvents = disabled ? 'none' : 'auto'
  })
}
function showPleaseWait() {
  document.getElementById('pleaseWait')?.classList.remove('hidden');
  toggleButtons(true);
}
function hidePleaseWait() {
  document.getElementById('pleaseWait')?.classList.add('hidden');
  toggleButtons(false);
  window.stop();

}

function init() {
  document.getElementById('waitPageDialogue').innerText = "Getting Data from Server...";
  showPleaseWait();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 200);
  fetch('/get-modelsA', { signal: controller.signal });
}

function kittingStart(vc, model, asn_no, qrCode) {
  console.log(vc)

  // show the overlay immediately
  document.getElementById('waitPageDialogue').innerText = "Sending command to devices…";
  showPleaseWait()

  // Always keep the overlay for 5 seconds
  const MIN_WAIT = 5000
  const endOverlay = () => setTimeout(hidePleaseWait, MIN_WAIT)

  // Your existing fetch (quick abort after 200ms)
  const controller = new AbortController()
  // setTimeout(() => controller.abort(), 200)
  fetch('/kittingStartA/?vc=' + vc + '&model=' + model + '&asn_no=' + asn_no + '&qr=' + qrCode, { signal: controller.signal })
      .catch(() => { /* ignore; visual wait still applies */ })
      .finally(endOverlay)
}

function kittingStart_rfid(vc, model, asn_no) {
  console.log(vc)

  // show the overlay immediately
  document.getElementById('waitPageDialogue').innerText = "Sending command to devices…";
  showPleaseWait()

  // Always keep the overlay for 5 seconds
  const MIN_WAIT = 5000
  const endOverlay = () => setTimeout(hidePleaseWait, MIN_WAIT)

  // Your existing fetch (quick abort after 200ms)
  const controller = new AbortController()
  // setTimeout(() => controller.abort(), 200)
  fetch('/kittingStartA/?vc=' + vc + '&model=' + model + '&asn_no=' + asn_no, { signal: controller.signal })
      .catch(() => { /* ignore; visual wait still applies */ })
      .finally(endOverlay)
}

function manualComplete(asnNo) {
  currentAsn = asnNo;
  document.getElementById('manualAsn').textContent = asnNo;  // <-- just display text
  // document.getElementById('manualUserId').value = '';
  // document.getElementById('manualPassword').value = '';
  document.getElementById('manualCompleteModal').style.display = 'flex';
}

// function viewDetails(asnNo) {
//   currentAsn = asnNo;
//   document.getElementById('waitPageDialogue').innerText = "Getting Data from Server...";
//   showPleaseWait()
//   fetch('/viewDetails/?asn=' + currentAsn);
// }

async function viewDetails(asnNo) {
    _expectingMoreDetails = true;
    try {
        document.getElementById('waitPageDialogue').innerText = "Getting Data from Server...";
        showPleaseWait();

        const res = await fetch('/viewDetailsA/?asn=' + asnNo, { cache: 'no-store' });
        const data = await res.json();
        uibuilder.send({ payload: data });  // or handle locally

    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        const overlay = document.querySelector('.km-overlay');
        const modal = document.querySelector('.km-modal');
        overlay.classList.remove('is-open');
        modal.classList.remove('is-open');
        hidePleaseWait();
    }
}

let _expectingMoreDetails = false;

function closeMoreDetailsIfOpen() {
  const overlay = document.querySelector('.km-overlay');
  const modal   = document.querySelector('.km-modal');
  overlay?.classList.remove('is-open');
  modal?.classList.remove('is-open');
}

function confirmManualComplete() {
  currentAsn = document.getElementById('manualAsn').textContent;
  userId = document.getElementById('manualUserId').value;
  password = document.getElementById('manualPassword').value;
  // console.log(currentAsn, userId, password);
  document.getElementById('manualUserId').value = '';
  document.getElementById('manualPassword').value = '';
  document.getElementById('manualCompleteModal').style.display = 'none';
  const controller = new AbortController()
  // setTimeout(() => controller.abort(), 200)
  fetch('/manualCompleteA/?asn=' + currentAsn + '&user=' + userId + '&pwd=' + password, { signal: controller.signal })
      .catch(() => { /* ignore; visual wait still applies */ })
      // .finally(endOverlay)
}

function closeModal(modal) {
  document.getElementById(modal).style.display = 'none';
  document.getElementById('manualUserId').value = '';
  document.getElementById('manualPassword').value = '';
  fetch('/get-modelsA', { });
//   location.reload(true);

}

function renderStatusCell(status) {
  const td = document.createElement('td')
  const span = document.createElement('span')

  // map numeric → label + color class
  let label = ''
  let cls = ''
  switch (status) {
    case 0:
      label = 'Not Started'
      cls = 'chip chip-grey'
      break
    case 1:
      label = 'WIP'
      cls = 'chip chip-blue'
      break
    case 2:
      label = 'Completed'
      cls = 'chip chip-green'
      break
    default:
      label = 'Unknown'
      cls = 'chip'
  }

  span.textContent = label
  span.className = cls
  td.appendChild(span)
  return td
}

function openLEDModal(tagid) {
  // Prefill Tag ID and sensible defaults
  document.getElementById('led_tagid').value = tagid || '';
  document.getElementById('led_pattern').value = '1';
  document.getElementById('led_power').value = 'On';
  document.getElementById('led_color').value = 'RED';

  document.getElementById('ledControlModal').style.display = 'flex';
}

async function confirmLEDSettings() {
  const tagid   = document.getElementById('led_tagid').value.trim();
  const pattern = document.getElementById('led_pattern').value;
  const power   = document.getElementById('led_power').value; // "On" | "Off"
  const color   = document.getElementById('led_color').value; // RED|GREEN|...

  if (!tagid) {
    alert('Missing tagid');
    return;
  }

  // Optional “please wait” overlay you already use
  document.getElementById('waitPageDialogue').innerText = "Sending LED command…";
  showPleaseWait();
  document.getElementById('ledControlModal').style.display = 'none';

  try {
    // send to backend (adjust path/params if your API differs)
    const url = `/blinkLEDA?tagid=${encodeURIComponent(tagid)}&pattern=${encodeURIComponent(pattern)}&state=${encodeURIComponent(power)}&color=${encodeURIComponent(color)}`;
    await fetch(url, { cache: 'no-store' });
  } catch (e) {
    console.error('LED command failed:', e);
  } finally {
    hidePleaseWait();
    closeModal('ledControlModal');
  }
}

function showToast(message = "All commands sent", duration = 1000){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = message;
  el.style.display = 'block';
  // trigger transition
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    // wait for transition to finish, then hide
    setTimeout(() => { el.style.display = 'none'; }, 250);
  }, duration);
  location.reload(true);
}


let allASNData = [];
let currentPage = 1;
let rowsPerPage = 10;

function updateASNtable(msg) {
  allASNData = msg.payload?.asnList || [];
  currentPage = 1;
  renderTable();
  
    // Add
    const todaySpan = document.getElementById('todayCompletedCount');
    if(todaySpan) todaySpan.textContent = getTodayCompletedCount();
    //

}

function renderTable() {
  const container = document.getElementById('statusTbody');
  container.innerHTML = '';

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = allASNData.slice(start, end);

  pageData.forEach(m => {
    const tr = document.createElement('tr');

    // ASN cell
    const tdASN = document.createElement('td');
    tdASN.textContent = m.asn_no;

    // ENG cell
    const tdProdDate = document.createElement('td');
    if (m.prod_date) {
      const dt = new Date(m.datetime);
      tdProdDate.textContent = dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } else {
      tdDT.textContent = '';
    }

    // VC cell
    const tdVC = document.createElement('td');
    tdVC.textContent = m.vc_no;

    // Model cell
    const tdModel = document.createElement('td');
    tdModel.textContent = m.model;

    // Color cell
    const tdColor = document.createElement('td');
    const wrapper = document.createElement('div');
    wrapper.className = 'color-wrapper';
    const circle = document.createElement('div');
    circle.className = 'color-circle';
    circle.style.backgroundColor = m.color || '#ccc';
    const label = document.createElement('span');
    label.textContent = m.color || '';
    wrapper.appendChild(circle);
    wrapper.appendChild(label);
    tdColor.appendChild(wrapper);

    // datetime cell
    const tdDT = document.createElement('td');
    if (m.datetime) {
      const dt = new Date(m.datetime);
      tdDT.textContent = dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      tdDT.textContent = '';
    }


    // Start Time cell
    const tdST = document.createElement('td');
    if (m.start_time) {
      const dt = new Date(m.start_time);
      tdST.textContent = dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      tdST.textContent = '';
    }

    // End Time cell
    const tdED = document.createElement('td');
    if (m.end_time) {
      const dt = new Date(m.end_time);
      tdED.textContent = dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      tdED.textContent = '';
    }

    // Status cell
    const tdStatus = renderStatusCell(m.selection_status);

    // Action cell
    const tdAction = document.createElement('td');
    tdAction.className = 'actions-col';

    if (m.selection_status == 1) {
      // Details button
      const btn1 = document.createElement('button');
      btn1.className = 'btn btn-viewDetails';
      btn1.textContent = 'Details';
      btn1.id = String(m.vc);
      btn1.onclick = () => viewDetails(m.asn_no);

      // Manual Complete button
      const btn2 = document.createElement('button');
      btn2.className = 'btn btn-manualComplete';
      btn2.textContent = 'Manual Complete';
      btn2.id = String(m.vc);
      btn2.onclick = () => manualComplete(m.asn_no);

      tdAction.appendChild(btn1);
      tdAction.appendChild(btn2);
    } if (m.selection_status == 2) {
      // Details button
      const btn1 = document.createElement('button');
      btn1.className = 'btn btn-viewDetails';
      btn1.textContent = 'Details';
      btn1.id = String(m.vc);
      btn1.onclick = () => viewDetails(m.asn_no);

      // // Manual Complete button
      // const btn2 = document.createElement('button');
      // btn2.className = 'btn btn-manualComplete';
      // btn2.textContent = 'Manual Complete';
      // btn2.id = String(m.vc);
      // btn2.onclick = () => manualComplete(m.asn_no);

      tdAction.appendChild(btn1);
      // tdAction.appendChild(btn2);
    } else {
      // Start Kitting button
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'Start Kitting';
      btn.id = String(m.vc);
      btn.onclick = () => scanQRcode(m.vc_no, m.model, m.asn_no);
      tdAction.appendChild(btn);
    }

    // Append all cells in the correct order
    tr.appendChild(tdASN);
    tr.appendChild(tdProdDate);
    tr.appendChild(tdVC);
    tr.appendChild(tdModel);
    tr.appendChild(tdColor);
    tr.appendChild(tdDT);
    tr.appendChild(tdST);
    tr.appendChild(tdED);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAction);

    container.appendChild(tr);
  });
  renderPagination();
}

function renderStatusLabel(status) {
  switch (status) {
    case 0: return '<span class="chip chip-grey">Not Started</span>';
    case 1: return '<span class="chip chip-blue">WIP</span>';
    case 2: return '<span class="chip chip-green">Completed</span>';
    default: return '<span class="chip">Unknown</span>';
  }
}

function renderPagination() {
  const totalPages = Math.ceil(allASNData.length / rowsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '◀ Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { currentPage--; renderTable(); };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active-page');
    btn.onclick = () => { currentPage = i; renderTable(); };
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ▶';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { currentPage++; renderTable(); };
  pagination.appendChild(nextBtn);
}

document.getElementById('rowsPerPage').addEventListener('change', e => {
  rowsPerPage = parseInt(e.target.value, 10);
  currentPage = 1;
  renderTable();
});

function scanQRcode(vc, model, asn) {
  // Store pending data so manual submit can use it
  window._pendingQR = { vc, model, asn };

  openQRCodeScanner((qrData) => {
      if (!qrData || qrData.trim() === "") return;

      console.log("Got QR:", qrData);
      document.getElementById('waitPageDialogue').innerText = "Sending command to devices…";
      showPleaseWait();

      kittingStart(vc, model, asn, qrData);

      window._pendingQR = null; // clear
  });
}

window.manualQRHandler = function (qrData) {
  // Find which job is waiting for a QR
  if (!window._pendingQR) {
      alert("No active kitting job is waiting for a QR code.");
      return;
  }

  const { vc, model, asn } = window._pendingQR;

  console.log("Manual QR applied to:", window._pendingQR, "QR:", qrData);

  document.getElementById('waitPageDialogue').innerText = "Sending command to devices…";
  showPleaseWait();

  kittingStart(vc, model, asn, qrData);

  // Clear pending state
  window._pendingQR = null;
};


function myQRHandler(qrData) {
  // Called when QR is scanned and validated
  console.log('Got QR:', qrData);
  // Example: send to server (fetch)
  // fetch('/api/qr', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({qr:qrData})});
}

/*
  QR modal scanner.
  Usage:
    openQRCodeScanner(function(qrData){
      // handle scanned data (send to server / call other function)
      console.log('scanned:', qrData);
    });
*/

(function () {
  const modal = document.getElementById('qrModal');
  const video = document.getElementById('qrVideo');
  const canvas = document.getElementById('qrCanvas');
  const closeBtn = document.getElementById('qrCloseBtn');
  const cancelBtn = document.getElementById('qrCancelBtn');
  const messageEl = document.getElementById('qrMessage');

  let streamTracks = [];
  let scanning = false;
  let rafId = null;
  let onResult = null;
  let didScan = false;

  function showModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function hideModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function stopCamera() {
    if (streamTracks && streamTracks.length) {
      streamTracks.forEach(t => {
        try { t.stop(); } catch (e) {}
      });
    }
    streamTracks = [];
    if (video) { video.srcObject = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function cleanupAndClose() {
    stopCamera();
    scanning = false;
    didScan = false;
    onResult = null;
    hideModal();
    messageEl.textContent = 'Point camera at QR code';
  }

  function handleResult(data) {
    if (didScan) return; // debounce
    didScan = true;
    messageEl.textContent = 'QR detected — handling...';
    // give a short visual pause then call the handler
    setTimeout(() => {
      try {
        if (typeof onResult === 'function') onResult(data);
      } catch (err) {
        console.error('qr handler error', err);
      } finally {
        cleanupAndClose();
      }
    }, 200);
  }

  // draw bounding box helper
  function drawLine(ctx, begin, end, color, width) {
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = width || 4;
    ctx.strokeStyle = color || '#FF3B30';
    ctx.stroke();
  }

  function scanLoop() {
    if (!scanning) return;
    const ctx = canvas.getContext('2d');
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) {
      rafId = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    // jsQR is provided by CDN: include <script src="https://unpkg.com/jsqr/dist/jsQR.js"></script>
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data && code.data.trim() !== "") {
        // ✅ only handle non-empty QR data
        drawLine(ctx, code.location.topLeftCorner, code.location.topRightCorner, '#00FF00', 6);
        drawLine(ctx, code.location.topRightCorner, code.location.bottomRightCorner, '#00FF00', 6);
        drawLine(ctx, code.location.bottomRightCorner, code.location.bottomLeftCorner, '#00FF00', 6);
        drawLine(ctx, code.location.bottomLeftCorner, code.location.topLeftCorner, '#00FF00', 6);

        messageEl.textContent = 'QR detected';
        handleResult(code.data.trim());
        return;
      } else {
        messageEl.textContent = 'Point camera at QR code';
      }
    } catch (err) {
      console.error('jsQR error', err);
    }

    rafId = requestAnimationFrame(scanLoop);
  }

  async function startScanner() {
    didScan = false;
    try {
      // Prefer environment-facing camera if available
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamTracks = stream.getTracks ? stream.getTracks() : [];
      video.srcObject = stream;
      await video.play();
      scanning = true;
      rafId = requestAnimationFrame(scanLoop);
      messageEl.textContent = 'Scanning...';
    } catch (err) {
      console.error('Camera access denied or not available', err);
      messageEl.textContent = 'Unable to access camera';
      // Provide fallback: call handler with null or error if desired
      // setTimeout(() => {
      //   cleanupAndClose();
      // }, 1500);
    }
  }

  // Public open function
  window.openQRCodeScanner = function (resultCallback) {
    if (!window.jsQR) {
      console.warn('jsQR library not found. Add: <script src="https://unpkg.com/jsqr/dist/jsQR.js"></script>');
      alert('QR library missing. Please include jsQR (see console).');
      return;
    }

    onResult = resultCallback;
    showModal();
    startScanner();
  };

  // User Controls
  closeBtn.addEventListener('click', function () {
    cleanupAndClose();
  });
  cancelBtn.addEventListener('click', function () {
    cleanupAndClose();
  });

  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      cleanupAndClose();
    }
  });

  // Ensure stop camera when modal hidden by other means
  const observer = new MutationObserver(() => {
    if (modal.getAttribute('aria-hidden') === 'true') {
      stopCamera();
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });

})();

// Helper function for IST formatting
function formatToIST(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',   // e.g. "Nov"
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

document.getElementById("qrSubmitBtn").onclick = function () {
  const input = document.getElementById("manualQrCode");
  const qr = input.value.trim();

  if (!qr) {
      alert("Please enter a QR code");
      return;
  }

  // Close QR modal if open
  const modal = document.getElementById('qrModal');
  if (modal) modal.setAttribute('aria-hidden', 'true');

  console.log("Manual QR submitted:", qr);

  // Trigger the same flow as auto-scan
  if (typeof window.manualQRHandler === "function") {
      window.manualQRHandler(qr);
  }
};
// =====================================================
// KITTING IN PROCESS DATA HANDLER
// =====================================================

function getKittingInProcessData() {

  // return only WIP data
  return allASNData.filter(item =>
    Number(item.selection_status) === 1
  );

}


// OPTIONAL HELPER
// console use:
// console.log(getKittingInProcessData());


// OPTIONAL COUNT HELPERS

function getPlanCount() {
  return allASNData.length;
}

function getWIPCount() {
  return allASNData.filter(item =>
    Number(item.selection_status) === 1
  ).length;
}

function getCompletedCount() {
  return allASNData.filter(item =>
    Number(item.selection_status) === 2
  ).length;
}
// Add
function getTodayCompletedCount() {
  const today = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return allASNData.filter(item => {
    if (Number(item.selection_status) !== 2) return false;

    // end_time pe check karo, nahi hai to datetime pe
    const dateField = item.end_time || item.datetime;
    if (!dateField) return false;

    const itemDate = new Date(dateField).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return itemDate === today;
  }).length;
}
//
// =====================================================
// OPEN KITTING PROCESS MODAL
// =====================================================

function openKittingProcessModal() {

  const tbody =
    document.getElementById(
      'kittingProcessBody'
    );

  tbody.innerHTML = '';

  const processData =
    getKittingInProcessData();

  // NO DATA
  if (processData.length === 0) {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td colspan="4"
          style="text-align:center; padding:20px;">
        No ASN currently in process
      </td>
    `;

    tbody.appendChild(tr);

  } else {

    processData.forEach(m => {

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${m.asn_no || ''}</td>
        <td>${m.vc_no || ''}</td>
        <td>${m.model || ''}</td>
        <td>
          <span class="chip chip-blue">
            WIP
          </span>
        </td>
      `;

      tbody.appendChild(tr);

    });
  }

  const modal =
    document.getElementById(
      'kittingProcessModal'
    );

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function openCompletedModal() {

  const tbody = document.getElementById('completedBody');
  tbody.innerHTML = '';

  const today = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const completedData = allASNData.filter(item => {
    if (Number(item.selection_status) !== 2) return false;
    const dateField = item.end_time || item.datetime;
    if (!dateField) return false;
    const itemDate = new Date(dateField).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return itemDate === today;
  });


  if (completedData.length === 0) {

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" style="text-align:center; padding:20px;">
        No ASN completed yet
      </td>
    `;
    tbody.appendChild(tr);

  } else {

    completedData.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.asn_no || ''}</td>
        <td>${m.vc_no || ''}</td>
        <td>${m.model || ''}</td>
        <td>
          <span class="chip chip-green">Completed</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  const modal = document.getElementById('completedModal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}
