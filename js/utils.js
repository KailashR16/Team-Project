/**
 * VERIDEX — Core Utilities & Cryptographic Helper Library (Vanilla JS)
 * Uses Web Crypto API for authentic SHA-256 hashing.
 */

export const VeridexUtils = {
  /**
   * Generates a real cryptographic SHA-256 hash using the browser's Web Crypto API.
   * @param {ArrayBuffer|string} data 
   * @returns {Promise<string>} Hex-encoded 64-character hash string
   */
  async sha256(data) {
    let buffer;
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data);
    } else if (data instanceof ArrayBuffer) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = data.buffer;
    } else {
      throw new Error('Unsupported data format for SHA-256 calculation');
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  /**
   * Formats a byte size into human readable string
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Truncates long hex or strings for display
   */
  truncateHash(hash, startLen = 8, endLen = 8) {
    if (!hash || hash.length <= startLen + endLen) return hash;
    return `${hash.substring(0, startLen)}...${hash.substring(hash.length - endLen)}`;
  },

  /**
   * Generates a realistic mock transaction ID
   */
  generateTxId() {
    const chars = '0123456789ABCDEF';
    let res = '0x';
    for (let i = 0; i < 16; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  },

  /**
   * Generates a unique Document ID
   */
  generateDocId(prefix = 'GOV-DOC') {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  },

  /**
   * Formats a date nicely
   */
  formatDateTime(isoOrDateString) {
    const d = isoOrDateString ? new Date(isoOrDateString) : new Date();
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },

  /**
   * Shows a toast notification on screen
   */
  showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Simulated Groth16 Zero-Knowledge Proof payload generator
   */
  generateZkProof(docHash, applicantId) {
    return {
      protocol: 'Groth16 (BN254 curve)',
      proof: {
        pi_a: ['0x18f92a3...', '0x0d8c11e...'],
        pi_b: [['0x28ab4...', '0x15f7...'], ['0x09bc...', '0x22de...']],
        pi_c: ['0x199fa2...', '0x33dc1b...']
      },
      publicSignals: [
        this.truncateHash(docHash, 6, 6),
        '0x0000000000000000000000000000000000000001'
      ],
      verifierKeyHash: '0x7e83f...c941',
      zeroKnowledgeClaim: 'Holder possesses authentic government certificate without disclosing full biometric or financial payload'
    };
  },

  /**
   * Initial Data Store initialization (Seed Database)
   */
  initStorage() {
    if (!localStorage.getItem('veridex_initialized')) {
      const initialDocs = [
        {
          id: 'GOV-DOC-2026-8941',
          applicant: 'Dr. Aris Thorne',
          type: 'Land Record',
          department: 'Land Administration & Deeds',
          submittedDate: '2026-09-28 09:30:00',
          status: 'approved',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          txId: '0x8F4A19C25E73BD01',
          blockHeight: 10482,
          officer: 'Inspector Elena Rostova (GOV-OFF-402)',
          signature: 'ECDSA_secp256k1_VALID_0x9b4f2c...',
          zkProofId: 'ZK-GROTH16-7782',
          fileName: 'Deed_Parcel_7749_Registry.pdf',
          fileSize: '2.4 MB'
        },
        {
          id: 'GOV-DOC-2026-8942',
          applicant: 'Sarah Jenkins',
          type: 'Income Certificate',
          department: 'Department of Revenue & Tax',
          submittedDate: '2026-09-29 11:15:20',
          status: 'approved',
          hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
          txId: '0x3D72AF9018CE92A4',
          blockHeight: 10483,
          officer: 'Director Marcus Vance (GOV-OFF-109)',
          signature: 'ECDSA_secp256k1_VALID_0x11ce90...',
          zkProofId: 'ZK-GROTH16-8910',
          fileName: 'Annual_Income_Assessment_2025.pdf',
          fileSize: '1.1 MB'
        },
        {
          id: 'GOV-DOC-2026-8943',
          applicant: 'David K. O\'Connor',
          type: 'Education Certificate',
          department: 'Higher Education Council',
          submittedDate: '2026-09-30 08:45:10',
          status: 'approved',
          hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
          txId: '0x99A82D016B4CE712',
          blockHeight: 10484,
          officer: 'Inspector Elena Rostova (GOV-OFF-402)',
          signature: 'ECDSA_secp256k1_VALID_0x88ea31...',
          zkProofId: 'ZK-GROTH16-9214',
          fileName: 'Doctorate_Engineering_Accredited.pdf',
          fileSize: '3.6 MB'
        },
        {
          id: 'GOV-DOC-2026-8944',
          applicant: 'Amara Chen',
          type: 'Birth Certificate',
          department: 'Civil Registry & Vital Statistics',
          submittedDate: '2026-09-30 14:12:00',
          status: 'pending',
          hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
          txId: null,
          blockHeight: null,
          officer: null,
          signature: null,
          zkProofId: null,
          fileName: 'Vital_Record_Certificate_Chen.pdf',
          fileSize: '1.8 MB'
        },
        {
          id: 'GOV-DOC-2026-8945',
          applicant: 'Robert Sterling',
          type: 'Community Certificate',
          department: 'Social Welfare Commission',
          submittedDate: '2026-09-30 15:40:22',
          status: 'pending',
          hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          txId: null,
          blockHeight: null,
          officer: null,
          signature: null,
          zkProofId: null,
          fileName: 'Community_Affidavit_Sterling.pdf',
          fileSize: '950 KB'
        },
        {
          id: 'GOV-DOC-2026-8946',
          applicant: 'Lydia Novak',
          type: 'Land Record',
          department: 'Land Administration & Deeds',
          submittedDate: '2026-09-30 16:02:11',
          status: 'pending',
          hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
          txId: null,
          blockHeight: null,
          officer: null,
          signature: null,
          zkProofId: null,
          fileName: 'Metropolitan_Survey_Plot_14.pdf',
          fileSize: '4.2 MB'
        }
      ];

      const initialBlocks = [
        {
          blockHeight: 10482,
          prevHash: '7a92bf6c221e8d0092fa07b145167b5e4860b73df721',
          currentHash: '9c31fa816d25514f7b60882e307c91a03a48e77c8af2',
          timestamp: '28 Sep 2026 10:42:21',
          txId: '0x8F4A19C25E73BD01',
          docHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          docId: 'GOV-DOC-2026-8941',
          applicant: 'Dr. Aris Thorne',
          officer: 'Inspector Elena Rostova (GOV-OFF-402)',
          officerSignature: 'VALID (ECDSA)',
          merkleRoot: '0x994821a8...37ce',
          nonce: 84920
        },
        {
          blockHeight: 10483,
          prevHash: '9c31fa816d25514f7b60882e307c91a03a48e77c8af2',
          currentHash: '3d88192a0e5b774fa4418903c7e10052bc97d00f7194',
          timestamp: '29 Sep 2026 12:04:15',
          txId: '0x3D72AF9018CE92A4',
          docHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
          docId: 'GOV-DOC-2026-8942',
          applicant: 'Sarah Jenkins',
          officer: 'Director Marcus Vance (GOV-OFF-109)',
          officerSignature: 'VALID (ECDSA)',
          merkleRoot: '0x44fa7110...19bc',
          nonce: 92318
        },
        {
          blockHeight: 10484,
          prevHash: '3d88192a0e5b774fa4418903c7e10052bc97d00f7194',
          currentHash: 'b441f7e0992a514833c829038d1720491ac9e550992b',
          timestamp: '30 Sep 2026 09:12:44',
          txId: '0x99A82D016B4CE712',
          docHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
          docId: 'GOV-DOC-2026-8943',
          applicant: 'David K. O\'Connor',
          officer: 'Inspector Elena Rostova (GOV-OFF-402)',
          officerSignature: 'VALID (ECDSA)',
          merkleRoot: '0x17b38820...42e8',
          nonce: 104921
        }
      ];

      const initialAudit = [
        {
          id: 'AUD-001',
          timestamp: '30 Sep 2026 10:42',
          timeFull: '2026-09-30 10:42:15',
          title: 'Document Submitted',
          desc: 'Citizen Amara Chen uploaded Vital Record Certificate for validation.',
          docId: 'GOV-DOC-2026-8944',
          category: 'submission',
          icon: 'upload'
        },
        {
          id: 'AUD-002',
          timestamp: '30 Sep 2026 10:43',
          timeFull: '2026-09-30 10:43:00',
          title: 'Hash Generated',
          desc: 'Client-side SHA-256 calculation computed digest 4e07...9fce.',
          docId: 'GOV-DOC-2026-8944',
          category: 'submission',
          icon: 'hash'
        },
        {
          id: 'AUD-003',
          timestamp: '30 Sep 2026 10:44',
          timeFull: '2026-09-30 10:44:20',
          title: 'Officer Review Started',
          desc: 'Assigned to Inspector Elena Rostova for official departmental review.',
          docId: 'GOV-DOC-2026-8944',
          category: 'approval',
          icon: 'search'
        },
        {
          id: 'AUD-004',
          timestamp: '30 Sep 2026 10:46',
          timeFull: '2026-09-30 10:46:12',
          title: 'Digital Signature Applied',
          desc: 'Authorized key (GOV-OFF-402) signed document hash via secp256k1.',
          docId: 'GOV-DOC-2026-8943',
          category: 'approval',
          icon: 'pen-tool'
        },
        {
          id: 'AUD-005',
          timestamp: '30 Sep 2026 10:47',
          timeFull: '2026-09-30 10:47:33',
          title: 'Blockchain Registration Completed',
          desc: 'Block #10484 minted on immutable ledger. TX 0x99A82D016B4CE712.',
          docId: 'GOV-DOC-2026-8943',
          category: 'blockchain',
          icon: 'link'
        },
        {
          id: 'AUD-006',
          timestamp: '30 Sep 2026 10:48',
          timeFull: '2026-09-30 10:48:50',
          title: 'Verification Successful',
          desc: 'Third-party verifier confirmed Groth16 zero-knowledge proof validity.',
          docId: 'GOV-DOC-2026-8943',
          category: 'verification',
          icon: 'check-circle'
        },
        {
          id: 'AUD-007',
          timestamp: '30 Sep 2026 11:05',
          timeFull: '2026-09-30 11:05:14',
          title: 'Security Anomaly Intercepted',
          desc: 'Tampered byte sequence detected during verification check; rejected.',
          docId: 'SEC-PROBE-091',
          category: 'security',
          icon: 'shield-alert'
        }
      ];

      localStorage.setItem('veridex_docs', JSON.stringify(initialDocs));
      localStorage.setItem('veridex_blocks', JSON.stringify(initialBlocks));
      localStorage.setItem('veridex_audit', JSON.stringify(initialAudit));
      localStorage.setItem('veridex_user_role', 'officer'); // default view is officer dashboard
      localStorage.setItem('veridex_stats', JSON.stringify({
        totalDocuments: 98420,
        verified: 97535,
        pending: 642,
        tamperedAttempts: 243
      }));
      localStorage.setItem('veridex_initialized', 'true');
    }
  },

  getDocuments() {
    this.initStorage();
    return JSON.parse(localStorage.getItem('veridex_docs') || '[]');
  },

  saveDocuments(docs) {
    localStorage.setItem('veridex_docs', JSON.stringify(docs));
  },

  getBlocks() {
    this.initStorage();
    return JSON.parse(localStorage.getItem('veridex_blocks') || '[]');
  },

  saveBlocks(blocks) {
    localStorage.setItem('veridex_blocks', JSON.stringify(blocks));
  },

  getAuditLogs() {
    this.initStorage();
    return JSON.parse(localStorage.getItem('veridex_audit') || '[]');
  },

  addAuditLog(entry) {
    const logs = this.getAuditLogs();
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const newEntry = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: timeStr,
      timeFull: d.toISOString(),
      ...entry
    };
    logs.unshift(newEntry);
    localStorage.setItem('veridex_audit', JSON.stringify(logs));
    return newEntry;
  },

  getStats() {
    this.initStorage();
    return JSON.parse(localStorage.getItem('veridex_stats') || '{}');
  },

  updateStats(mutator) {
    const stats = this.getStats();
    mutator(stats);
    localStorage.setItem('veridex_stats', JSON.stringify(stats));
  }
};

VeridexUtils.initStorage();
