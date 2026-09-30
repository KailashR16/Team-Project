/**
 * VERIDEX — Blockchain Simulation & Explorer Engine (Vanilla JS)
 */

import { VeridexUtils } from './utils.js';

export const VeridexBlockchain = {
  getChain() {
    return VeridexUtils.getBlocks();
  },

  /**
   * Mints a new block on the immutable ledger upon government officer approval
   */
  async mintBlock(doc) {
    const chain = this.getChain();
    const lastBlock = chain[chain.length - 1];
    const newHeight = lastBlock ? lastBlock.blockHeight + 1 : 10001;
    const prevHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000';
    
    // Hash block payload using real crypto
    const blockPayload = `${newHeight}-${prevHash}-${doc.hash}-${doc.id}-${Date.now()}`;
    const currentHash = await VeridexUtils.sha256(blockPayload);

    const now = new Date();
    const timeFormatted = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} ${now.toTimeString().split(' ')[0]}`;

    const newBlock = {
      blockHeight: newHeight,
      prevHash: prevHash,
      currentHash: currentHash,
      timestamp: timeFormatted,
      txId: doc.txId || VeridexUtils.generateTxId(),
      docHash: doc.hash,
      docId: doc.id,
      applicant: doc.applicant,
      officer: doc.officer || 'Inspector Elena Rostova (GOV-OFF-402)',
      officerSignature: 'VALID (ECDSA secp256k1)',
      merkleRoot: '0x' + currentHash.substring(0, 16) + '...' + currentHash.substring(48),
      nonce: Math.floor(10000 + Math.random() * 90000)
    };

    chain.push(newBlock);
    VeridexUtils.saveBlocks(chain);

    // Record audit event
    VeridexUtils.addAuditLog({
      title: 'Blockchain Registration Completed',
      desc: `Block #${newHeight} appended to ledger for Document ${doc.id}. Merkle root locked.`,
      docId: doc.id,
      category: 'blockchain',
      icon: 'link'
    });

    // Update stats
    VeridexUtils.updateStats(stats => {
      stats.verified = (stats.verified || 0) + 1;
      stats.pending = Math.max(0, (stats.pending || 0) - 1);
    });

    return newBlock;
  },

  /**
   * Searches blockchain by height, TX ID, or doc hash
   */
  search(query) {
    if (!query) return this.getChain();
    const q = query.trim().toLowerCase();
    return this.getChain().filter(b => 
      b.blockHeight.toString().includes(q) ||
      (b.txId && b.txId.toLowerCase().includes(q)) ||
      (b.docHash && b.docHash.toLowerCase().includes(q)) ||
      (b.docId && b.docId.toLowerCase().includes(q)) ||
      (b.applicant && b.applicant.toLowerCase().includes(q))
    );
  },

  /**
   * Renders the blocks to the container on blockchain.html
   */
  renderBlocks(containerId = 'blockchainContainer', filterQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const blocks = this.search(filterQuery);

    if (blocks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No blocks matched your query</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Try searching for a valid block number, document ID, or cryptographic hash.</div>
        </div>
      `;
      return;
    }

    // Render in reverse chronological order (latest block first)
    const reversed = [...blocks].reverse();

    let html = '';
    reversed.forEach((b, idx) => {
      html += `
        <div class="block-card" data-block="${b.blockHeight}">
          <div class="block-card-header">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span class="block-number">BLOCK #${b.blockHeight}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">${b.timestamp}</span>
            </div>
            <span class="block-immutable-badge">● Immutable Record</span>
          </div>

          <div class="block-data-grid">
            <div class="block-field-item">
              <span class="block-field-label">Previous Hash</span>
              <span class="block-field-value" title="${b.prevHash}">${VeridexUtils.truncateHash(b.prevHash, 8, 8)}</span>
            </div>

            <div class="block-field-item">
              <span class="block-field-label">Current Block Hash</span>
              <span class="block-field-value" style="color: var(--accent-cyan);" title="${b.currentHash}">${VeridexUtils.truncateHash(b.currentHash, 8, 8)}</span>
            </div>

            <div class="block-field-item">
              <span class="block-field-label">Transaction ID</span>
              <span class="block-field-value" style="color: var(--accent-violet);">${b.txId}</span>
            </div>

            <div class="block-field-item">
              <span class="block-field-label">Document Hash (SHA-256)</span>
              <span class="block-field-value" title="${b.docHash}">${VeridexUtils.truncateHash(b.docHash, 8, 8)}</span>
            </div>

            <div class="block-field-item">
              <span class="block-field-label">Document ID & Applicant</span>
              <span class="block-field-value" style="color: var(--text-primary); font-weight: 600;">${b.docId || 'GOV-CERT'} · ${b.applicant}</span>
            </div>

            <div class="block-field-item">
              <span class="block-field-label">Officer Signature</span>
              <span class="block-field-value" style="color: var(--color-success); font-weight: 600;">✓ ${b.officerSignature}</span>
            </div>
          </div>
        </div>
      `;

      if (idx < reversed.length - 1) {
        html += `
          <div class="block-connector-visual">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 0 L12 28 M8 20 L12 26 L16 20" stroke="var(--accent-cyan)" />
            </svg>
          </div>
        `;
      }
    });

    container.innerHTML = html;

    // Attach click for inspecting block details
    const cards = container.querySelectorAll('.block-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const height = parseInt(card.getAttribute('data-block'), 10);
        this.openBlockModal(height);
      });
    });
  },

  openBlockModal(height) {
    const chain = this.getChain();
    const block = chain.find(b => b.blockHeight === height);
    if (!block) return;

    let modal = document.getElementById('blockDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'blockDetailModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-window" style="max-width: 680px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--color-success);"></div>
            <h3 class="modal-title">Block Details — #${block.blockHeight}</h3>
          </div>
          <button class="modal-close-btn" id="closeBlockModal">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Full Block Hash</div>
            <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-cyan); word-break: break-all;">${block.currentHash}</div>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Document SHA-256 Digest</div>
            <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary); word-break: break-all;">${block.docHash}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; color: var(--text-muted);">Timestamp</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${block.timestamp}</div>
            </div>
            <div style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; color: var(--text-muted);">Merkle Root</div>
              <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--accent-violet);">${block.merkleRoot}</div>
            </div>
            <div style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; color: var(--text-muted);">Signing Officer</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${block.officer}</div>
            </div>
            <div style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; color: var(--text-muted);">Cryptographic Nonce</div>
              <div style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--text-secondary);">${block.nonce}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" id="doneBlockModal">Close Inspector</button>
        </div>
      </div>
    `;

    modal.classList.add('open');

    const closeHandler = () => modal.classList.remove('open');
    modal.querySelector('#closeBlockModal').addEventListener('click', closeHandler);
    modal.querySelector('#doneBlockModal').addEventListener('click', closeHandler);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHandler();
    });
  }
};
