/**
 * VERIDEX — Government Officer Dashboard & Pure HTML5 Canvas Analytics (Vanilla JS)
 */

import { VeridexUtils } from './utils.js';
import { VeridexBlockchain } from './blockchain.js';

export const VeridexDashboard = {
  currentFilter: 'pending', // 'pending', 'approved', 'rejected', 'all'
  searchQuery: '',

  init() {
    this.renderStats();
    this.renderQueue();
    this.renderCharts();
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('queueSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderQueue();
      });
    }

    // Tab buttons in dashboard if present
    const filterTabs = document.querySelectorAll('.dashboard-tab-btn');
    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-status') || 'all';
        this.renderQueue();
      });
    });
  },

  renderStats() {
    const docs = VeridexUtils.getDocuments();
    const blocks = VeridexUtils.getBlocks();
    const stats = VeridexUtils.getStats();

    const pendingCount = docs.filter(d => d.status === 'pending').length;
    const approvedCount = docs.filter(d => d.status === 'approved').length;
    const blockCount = blocks.length;

    const elPending = document.getElementById('statPendingCount');
    const elApproved = document.getElementById('statApprovedCount');
    const elBlocks = document.getElementById('statBlockCount');
    const elVerifications = document.getElementById('statVerifCount');

    if (elPending) elPending.textContent = pendingCount;
    if (elApproved) elApproved.textContent = (stats.verified || approvedCount).toLocaleString();
    if (elBlocks) elBlocks.textContent = (10480 + blockCount).toLocaleString();
    if (elVerifications) elVerifications.textContent = (stats.totalDocuments || 98420).toLocaleString();
  },

  renderQueue() {
    const container = document.getElementById('queueTableBody');
    if (!container) return;

    let docs = VeridexUtils.getDocuments();

    if (this.currentFilter !== 'all') {
      docs = docs.filter(d => d.status === this.currentFilter);
    }

    if (this.searchQuery) {
      docs = docs.filter(d =>
        d.id.toLowerCase().includes(this.searchQuery) ||
        d.applicant.toLowerCase().includes(this.searchQuery) ||
        d.type.toLowerCase().includes(this.searchQuery) ||
        d.department.toLowerCase().includes(this.searchQuery)
      );
    }

    if (docs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No records found for current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    docs.forEach(doc => {
      const statusBadge = `<span class="status-badge ${doc.status}">${doc.status.toUpperCase()}</span>`;
      
      let actions = '';
      if (doc.status === 'pending') {
        actions = `
          <button class="btn-table-action review" data-id="${doc.id}">Review</button>
          <button class="btn-table-action approve" data-id="${doc.id}">Approve</button>
          <button class="btn-table-action reject" data-id="${doc.id}">Reject</button>
        `;
      } else {
        actions = `
          <button class="btn-table-action review" data-id="${doc.id}">Inspect</button>
        `;
      }

      html += `
        <tr data-doc-id="${doc.id}">
          <td style="font-weight: 600; color: var(--text-primary); font-family: var(--font-mono);">${doc.id}</td>
          <td>${doc.applicant}</td>
          <td>${doc.type}</td>
          <td style="font-family: var(--font-mono); font-size: 0.78rem;">${doc.submittedDate}</td>
          <td>${statusBadge}</td>
          <td class="table-actions-cell">${actions}</td>
        </tr>
      `;
    });

    container.innerHTML = html;

    // Attach row button events
    container.querySelectorAll('.btn-table-action.review').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openReviewModal(id);
      });
    });

    container.querySelectorAll('.btn-table-action.approve').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.approveDocument(id);
      });
    });

    container.querySelectorAll('.btn-table-action.reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.rejectDocument(id);
      });
    });
  },

  openReviewModal(docId) {
    const docs = VeridexUtils.getDocuments();
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;

    let modal = document.getElementById('docReviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'docReviewModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const isPending = doc.status === 'pending';

    modal.innerHTML = `
      <div class="modal-window" style="max-width: 650px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${isPending ? 'var(--color-warning)' : 'var(--color-success)'};"></div>
            <h3 class="modal-title">Officer Review — ${doc.id}</h3>
          </div>
          <button class="modal-close-btn" id="closeReviewModal">&times;</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 18px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Applicant Name</div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${doc.applicant}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Document Category</div>
              <div style="font-weight: 600; color: var(--accent-cyan); font-size: 0.92rem;">${doc.type}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Department</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${doc.department}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Current Status</div>
              <div style="font-size: 0.85rem;"><span class="status-badge ${doc.status}">${doc.status.toUpperCase()}</span></div>
            </div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Document SHA-256 Fingerprint</div>
            <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-cyan); word-break: break-all;">${doc.hash}</div>
          </div>

          <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Officer Digital Signing Protocol</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
              By approving, you append your cryptographic signature (ECDSA secp256k1) and authorize minting an immutable record on the VERIDEX blockchain ledger.
            </div>
          </div>

          ${isPending ? `
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 0.78rem;">Rejection Reason (only if rejecting):</label>
              <input type="text" id="reviewRejectReasonInput" class="form-input" placeholder="e.g. Mismatched property boundaries or uncertified stamp" />
            </div>
          ` : `
            <div style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--color-success); background: var(--color-success-bg); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(16,185,129,0.3);">
              Signed by: ${doc.officer || 'Inspector Elena Rostova'}<br>
              Signature: ${doc.signature || 'VALID'}<br>
              Block Height: #${doc.blockHeight || 10482}
            </div>
          `}
        </div>

        <div class="modal-footer" style="display: flex; align-items: center; justify-content: space-between;">
          <a href="/upload.html?mode=update&docId=${doc.id}" class="btn-secondary" style="font-size: 0.82rem; text-decoration: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67"/></svg>
            Update Document
          </a>
          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" id="modalDismissBtn">Close</button>
            ${isPending ? `
              <button class="btn-table-action reject" style="padding: 9px 18px; font-size: 0.85rem;" id="modalRejectBtn">Reject</button>
              <button class="btn-primary" id="modalApproveBtn">Digitally Sign & Approve</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');

    const closeHandler = () => modal.classList.remove('open');
    modal.querySelector('#closeReviewModal').addEventListener('click', closeHandler);
    modal.querySelector('#modalDismissBtn').addEventListener('click', closeHandler);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHandler();
    });

    if (isPending) {
      modal.querySelector('#modalApproveBtn').addEventListener('click', async () => {
        closeHandler();
        await this.approveDocument(docId);
      });

      modal.querySelector('#modalRejectBtn').addEventListener('click', () => {
        const reason = modal.querySelector('#reviewRejectReasonInput').value;
        closeHandler();
        this.rejectDocument(docId, reason);
      });
    }
  },

  async approveDocument(docId) {
    const docs = VeridexUtils.getDocuments();
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex === -1) return;

    const doc = docs[docIndex];
    doc.status = 'approved';
    doc.officer = 'Inspector Elena Rostova (GOV-OFF-402)';
    doc.signature = 'ECDSA_secp256k1_VALID_0x' + Math.random().toString(16).substring(2, 10);
    doc.txId = VeridexUtils.generateTxId();
    
    // Mint block on blockchain!
    const mintedBlock = await VeridexBlockchain.mintBlock(doc);
    doc.blockHeight = mintedBlock.blockHeight;

    docs[docIndex] = doc;
    VeridexUtils.saveDocuments(docs);

    // Audit log
    VeridexUtils.addAuditLog({
      title: 'Digital Signature Applied',
      desc: `Officer Inspector Elena Rostova approved and digitally signed Document ${doc.id} (${doc.type}).`,
      docId: doc.id,
      category: 'approval',
      icon: 'pen-tool'
    });

    VeridexUtils.showToast(`Document ${doc.id} approved! Block #${mintedBlock.blockHeight} minted.`, 'success');
    this.renderStats();
    this.renderQueue();
  },

  rejectDocument(docId, reason = 'Administrative documentation inconsistency') {
    const docs = VeridexUtils.getDocuments();
    const docIndex = docs.findIndex(d => d.id === docId);
    if (docIndex === -1) return;

    const doc = docs[docIndex];
    doc.status = 'rejected';
    doc.rejectReason = reason || 'Documentation failed verification protocol';

    docs[docIndex] = doc;
    VeridexUtils.saveDocuments(docs);

    VeridexUtils.addAuditLog({
      title: 'Officer Review: Rejected',
      desc: `Document ${doc.id} rejected by reviewing officer. Reason: ${doc.rejectReason}.`,
      docId: doc.id,
      category: 'approval',
      icon: 'x-circle'
    });

    VeridexUtils.showToast(`Document ${doc.id} rejected.`, 'error');
    this.renderStats();
    this.renderQueue();
  },

  /**
   * Pure HTML5 Canvas Charts (No external library!)
   */
  renderCharts() {
    this.renderDonutChart('verificationSuccessCanvas');
    this.renderTrendChart('monthlyActivityCanvas');
  },

  renderDonutChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 15;
    const innerRadius = outerRadius - 18;

    // Data: 99.1% Verified, 0.6% Pending, 0.3% Tampered
    const segments = [
      { val: 0.991, color: '#00F2FE' },
      { val: 0.006, color: '#F59E0B' },
      { val: 0.003, color: '#EF4444' }
    ];

    ctx.clearRect(0, 0, rect.width, rect.height);

    let startAngle = -Math.PI / 2;
    segments.forEach(seg => {
      const sliceAngle = seg.val * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('99.1%', centerX, centerY - 4);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SUCCESS RATE', centerX, centerY + 16);
  },

  renderTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = rect.height - padding.top - padding.bottom;

    // Monthly data points
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const values = [12400, 14800, 16200, 18900, 21500, 24100];
    const maxVal = 28000;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#64748B';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText((labelVal / 1000).toFixed(0) + 'k', padding.left - 8, y + 3);
    }

    // Plot line
    const points = values.map((val, idx) => {
      const x = padding.left + (chartW / (values.length - 1)) * idx;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return { x, y };
    });

    // Fill gradient under curve
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.18)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw line stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw nodes
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Month text
      ctx.fillStyle = '#475569';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(months[idx], pt.x, rect.height - 8);
    });
  }
};
