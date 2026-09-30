/**
 * VERIDEX — Main Application Orchestrator & Interactive Visualizations (Vanilla JS)
 */

import { VeridexUtils } from './utils.js';
import { VeridexAuth } from './auth.js';
import { Motion3D } from './motion3d.js';

export const VeridexApp = {
  init() {
    this.initParticleBackground();
    this.initMobileNav();
    this.initIPhoneDock();
    this.initTimelineStages();
    this.initSecurityArchitectureModal();
    this.initTrustGraph();
    this.initTamperSimulation();
    this.initHeroPipelineFlow();
  },

  /**
   * iPhone Home Screen Dock Navigation Active State & Smooth Scrolling
   */
  initIPhoneDock() {
    const dockItems = document.querySelectorAll('.iphone-dock-item[data-section]');
    if (dockItems.length === 0) return;

    dockItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const secId = item.getAttribute('data-section');
        const target = document.getElementById(secId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          dockItems.forEach(d => d.classList.remove('active'));
          item.classList.add('active');
        }
      });
    });

    const sectionIds = ['home', 'about', 'features', 'how-it-works', 'verification', 'security', 'contact'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const currentId = entry.target.id;
            dockItems.forEach(item => {
              if (item.getAttribute('data-section') === currentId) {
                item.classList.add('active');
              } else {
                item.classList.remove('active');
              }
            });
          }
        });
      }, {
        threshold: 0.25,
        rootMargin: '-10% 0px -40% 0px'
      });

      sections.forEach(sec => observer.observe(sec));
    }
  },

  /**
   * Ambient 3D Motion Design Background on #particleCanvas
   */
  initParticleBackground() {
    Motion3D.init('particleCanvas');
  },

  /**
   * Mobile Navigation Toggle
   */
  initMobileNav() {
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    if (!mobileBtn || !mainNav) return;

    mobileBtn.addEventListener('click', () => {
      const isVisible = mainNav.style.display === 'flex';
      if (isVisible) {
        mainNav.style.display = 'none';
      } else {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = '72px';
        mainNav.style.left = '0';
        mainNav.style.right = '0';
        mainNav.style.background = 'rgba(5, 7, 11, 0.98)';
        mainNav.style.padding = '20px 24px';
        mainNav.style.borderBottom = '1px solid var(--border-subtle)';
        mainNav.style.gap = '16px';
      }
    });
  },

  /**
   * Hero Pipeline Flow Active Step Animation
   */
  initHeroPipelineFlow() {
    const nodes = document.querySelectorAll('.pipeline-node');
    if (nodes.length === 0) return;

    let activeIdx = 0;
    setInterval(() => {
      nodes.forEach((n, idx) => {
        if (idx === activeIdx) {
          n.classList.add('active');
        } else {
          n.classList.remove('active');
        }
      });
      activeIdx = (activeIdx + 1) % nodes.length;
    }, 1800);
  },

  /**
   * How It Works 5-Stage Interactive Timeline
   */
  initTimelineStages() {
    const stageCards = document.querySelectorAll('.stage-card');
    if (stageCards.length === 0) return;

    stageCards.forEach(card => {
      card.addEventListener('click', () => {
        const isSelected = card.classList.contains('selected');
        stageCards.forEach(c => c.classList.remove('selected'));
        if (!isSelected) {
          card.classList.add('selected');
        }
      });
    });
  },

  /**
   * Security Architecture Cards — Modal Deep Dive
   */
  initSecurityArchitectureModal() {
    const deepDiveBtns = document.querySelectorAll('.sec-deepdive-btn');
    if (deepDiveBtns.length === 0) return;

    const details = {
      'sha256': {
        title: 'SHA-256 Cryptographic Hashing Engine',
        content: `
          <p><strong>NIST FIPS 180-4 Standard:</strong> VERIDEX generates a deterministic, 256-bit (64-hex character) irreversible hash from the binary payload of uploaded government documents using client-side Web Crypto API.</p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin: 12px 0; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan);">
            Digest Space: 2^256 potential values (approx 1.15 × 10^77)<br>
            Collision Resistance: Pre-image & second pre-image resistant<br>
            Execution: Pure zero-network client browser sandbox
          </div>
          <p>Even modifying a single punctuation mark or hidden metadata bit produces a completely different hash (Avalanche Effect), making forgery mathematically impossible.</p>
        `
      },
      'signature': {
        title: 'ECDSA Digital Signatures (secp256k1 Curve)',
        content: `
          <p><strong>Non-Repudiation Government Framework:</strong> When an authorized government officer approves a document, their accredited cryptographic hardware key or software certificate signs the document's SHA-256 digest.</p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin: 12px 0; font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-success);">
            Algorithm: Elliptic Curve Digital Signature Algorithm (ECDSA)<br>
            Curve: secp256k1 (256-bit prime field)<br>
            Public Key Verification: Verifier verifies signature without officer private key exposure
          </div>
          <p>This legally ties the document directly to the designated department officer with non-repudiation guarantees.</p>
        `
      },
      'blockchain': {
        title: 'Immutable Blockchain Ledger & Merkle Trees',
        content: `
          <p><strong>Decentralized Tamper Prevention:</strong> Approved document hashes and officer signatures are packaged into sequential cryptographic blocks linked via SHA-256 chaining.</p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin: 12px 0; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-violet);">
            Block Linkage: H(Block_N) = SHA-256(Block_N.PrevHash + Data + Nonce)<br>
            Tamper Detection: Modifying Block 10482 invalidates all downstream blocks<br>
            Public Traceability: Accessible to third-party verifiers without single point of failure
          </div>
          <p>No corrupt official or external attacker can rewrite past history or delete issued permits.</p>
        `
      },
      'zkproof': {
        title: 'Privacy-Preserving Groth16 zk-SNARK Protocol',
        content: `
          <p><strong>Zero-Knowledge Verification:</strong> Citizens often need to prove document authenticity (e.g. valid income above threshold or genuine academic degree) without exposing private financial figures, parent names, or personal biometric records.</p>
          <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin: 12px 0; font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-warning);">
            SNARK Protocol: Groth16 Zero-Knowledge Succinct Non-Interactive Argument<br>
            Pairing-Friendly Curve: BN254 (alt_bn128)<br>
            Proof Size: Constant 128 bytes (3 elliptic curve points pi_a, pi_b, pi_c)
          </div>
          <p>Verifiers evaluate the cryptographic pairing: e(A, B) = e(α, β) · e(x, γ) · e(C, δ) to confirm truth with zero sensitive leakage.</p>
        `
      }
    };

    let modal = document.getElementById('secDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'secDetailModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    deepDiveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sec');
        const item = details[key];
        if (!item) return;

        modal.innerHTML = `
          <div class="modal-window" style="max-width: 620px;">
            <div class="modal-header">
              <h3 class="modal-title">${item.title}</h3>
              <button class="modal-close-btn" id="closeSecModal">&times;</button>
            </div>
            <div class="modal-body" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
              ${item.content}
            </div>
            <div class="modal-footer">
              <button class="btn-primary" id="dismissSecModal">Understood</button>
            </div>
          </div>
        `;

        modal.classList.add('open');
        const close = () => modal.classList.remove('open');
        modal.querySelector('#closeSecModal').addEventListener('click', close);
        modal.querySelector('#dismissSecModal').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) close();
        });
      });
    });
  },

  /**
   * Trust Graph Feature — Visual Network on HTML5 Canvas
   * Nodes: Citizen, Government Officer, Document, Hash, Blockchain, Verifier
   */
  initTrustGraph() {
    const canvas = document.getElementById('trustGraphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const W = rect.width;
    const H = rect.height;

    // Node definitions
    const nodes = [
      { id: 'citizen', label: 'Citizen / Applicant', sub: 'Identity & Submission', x: W * 0.18, y: H * 0.28, color: '#00F2FE', radius: 26 },
      { id: 'document', label: 'Government Document', sub: 'Payload & Metadata', x: W * 0.5, y: H * 0.2, color: '#8B5CF6', radius: 28 },
      { id: 'hash', label: 'SHA-256 Digest', sub: 'Cryptographic Fingerprint', x: W * 0.82, y: H * 0.28, color: '#00F2FE', radius: 26 },
      { id: 'officer', label: 'Government Officer', sub: 'Digital Signature Key', x: W * 0.22, y: H * 0.74, color: '#10B981', radius: 26 },
      { id: 'blockchain', label: 'Blockchain Ledger', sub: 'Immutable Record', x: W * 0.52, y: H * 0.8, color: '#00F2FE', radius: 30 },
      { id: 'verifier', label: 'Verifier / Public', sub: 'Zero-Knowledge Proof', x: W * 0.82, y: H * 0.74, color: '#F59E0B', radius: 26 }
    ];

    // Edges
    const edges = [
      { from: 'citizen', to: 'document', label: 'Submits' },
      { from: 'document', to: 'hash', label: 'Generates' },
      { from: 'officer', to: 'document', label: 'Reviews' },
      { from: 'officer', to: 'blockchain', label: 'Digitally Signs' },
      { from: 'hash', to: 'blockchain', label: 'Anchors' },
      { from: 'blockchain', to: 'verifier', label: 'Proves zk-SNARK' }
    ];

    let selectedNode = nodes[1]; // default 'document'
    let particleT = 0;

    const nodeRelationships = {
      'citizen': {
        title: 'Node: Citizen / Applicant',
        desc: 'Initiates verified document lifecycle. The citizen maintains ownership of raw personal records and selectively shares proofs without surrendering privacy.'
      },
      'document': {
        title: 'Node: Official Government Document',
        desc: 'The authenticated certificate (Land Deed, Birth Certificate, Revenue Assessment). Forms the root of truth for all cryptographic signatures and hashes.'
      },
      'hash': {
        title: 'Node: SHA-256 Hash Digest',
        desc: 'One-way 256-bit cryptographic digest. Ensures that any alteration of file bytes is immediately detectable upon mathematical verification.'
      },
      'officer': {
        title: 'Node: Authorized Government Officer',
        desc: 'Authorized departmental signatory. Uses certified private keys (ECDSA secp256k1) to approve applications and guarantee non-repudiation.'
      },
      'blockchain': {
        title: 'Node: Immutable Blockchain Ledger',
        desc: 'Cryptographically linked block history. Guarantees tamper resistance and timestamped permanence across all municipal records.'
      },
      'verifier': {
        title: 'Node: Third-Party Verifier',
        desc: 'Banks, employers, and government agencies verifying authenticity using Groth16 zk-SNARKs without viewing sensitive underlying details.'
      }
    };

    const updateSidebarInfo = (node) => {
      const titleEl = document.getElementById('graphSelectedNodeTitle');
      const bodyEl = document.getElementById('graphSelectedNodeBody');
      const info = nodeRelationships[node.id];
      if (titleEl && info) titleEl.textContent = info.title;
      if (bodyEl && info) bodyEl.textContent = info.desc;
    };

    updateSidebarInfo(selectedNode);

    // Canvas click listener
    canvas.addEventListener('click', (e) => {
      const clickRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - clickRect.left;
      const mouseY = e.clientY - clickRect.top;

      nodes.forEach(node => {
        const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
        if (dist <= node.radius + 10) {
          selectedNode = node;
          updateSidebarInfo(node);
          VeridexUtils.showToast(`Inspecting: ${node.label}`, 'info');
        }
      });
    });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      particleT = (particleT + 0.008) % 1;

      // Draw edges
      edges.forEach(edge => {
        const n1 = nodes.find(n => n.id === edge.from);
        const n2 = nodes.find(n => n.id === edge.to);
        if (!n1 || !n2) return;

        const isRelated = selectedNode && (selectedNode.id === n1.id || selectedNode.id === n2.id);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = isRelated ? 'rgba(2, 132, 199, 0.8)' : 'rgba(15, 23, 42, 0.12)';
        ctx.lineWidth = isRelated ? 2.5 : 1;
        ctx.stroke();

        // Traveling pulse particle
        const px = n1.x + (n2.x - n1.x) * particleT;
        const py = n1.y + (n2.y - n1.y) * particleT;
        ctx.beginPath();
        ctx.arc(px, py, isRelated ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isRelated ? '#0284C7' : 'rgba(124, 58, 237, 0.8)';
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id;

        // Outer glow
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#0284C7' : node.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Inner center dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node label
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 16);

        // Node subtext
        ctx.fillStyle = '#475569';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(node.sub, node.x, node.y + node.radius + 28);
      });

      requestAnimationFrame(render);
    };

    render();
  },

  /**
   * Tamper Detection Interactive Simulation Demo
   */
  initTamperSimulation() {
    const box = document.getElementById('tamperDemoBox');
    if (!box) return;

    const registeredHashEl = document.getElementById('registeredHashText');
    const currentHashEl = document.getElementById('currentHashText');
    const statusTextEl = document.getElementById('tamperStatusText');
    const triggerBtn = document.getElementById('triggerTamperBtn');
    const resetBtn = document.getElementById('resetTamperBtn');

    const pristineHash = 'a8f94b2c9de14b7289d021c4fa92038162e0842bbd1938501248dca47180bc41';
    const tamperedHash = 'e9c372f88b124a9100fc8201de398411037819aa38914c810427ad77109ff620';

    if (registeredHashEl) registeredHashEl.textContent = pristineHash;
    if (currentHashEl) currentHashEl.textContent = pristineHash;

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        box.classList.add('tampered');
        if (currentHashEl) {
          currentHashEl.textContent = tamperedHash;
          currentHashEl.classList.add('tampered-code');
        }
        if (statusTextEl) {
          statusTextEl.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>⚠ TAMPERING DETECTED — Document fingerprint differs from blockchain record</span>
          `;
        }

        VeridexUtils.showToast('ALERT: Bit alteration detected! Document integrity compromised.', 'error');

        // Increment tampered attempts in storage
        VeridexUtils.updateStats(stats => {
          stats.tamperedAttempts = (stats.tamperedAttempts || 0) + 1;
        });

        VeridexUtils.addAuditLog({
          title: 'Tamper Alarm Triggered',
          desc: 'Simulated byte perturbation caused complete SHA-256 cascade divergence.',
          docId: 'TAMPER-SIM-01',
          category: 'security',
          icon: 'shield-alert'
        });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        box.classList.remove('tampered');
        if (currentHashEl) {
          currentHashEl.textContent = pristineHash;
          currentHashEl.classList.remove('tampered-code');
        }
        if (statusTextEl) {
          statusTextEl.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>✓ MATCH — DOCUMENT INTEGRITY CONFIRMED</span>
          `;
        }
        VeridexUtils.showToast('Document restored to authentic registered state.', 'success');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VeridexApp.init();
});
