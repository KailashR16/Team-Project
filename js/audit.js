/**
 * VERIDEX — Audit Trail & Immutable Log Explorer (Vanilla JS)
 */

import { VeridexUtils } from './utils.js';

export const VeridexAudit = {
  activeCategory: 'all',
  searchQuery: '',

  init(containerId = 'auditTimelineContainer') {
    this.renderTimeline(containerId);
    this.bindEvents(containerId);
  },

  bindEvents(containerId) {
    const filterBtns = document.querySelectorAll('.audit-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat') || 'all';
        this.renderTimeline(containerId);
      });
    });

    const searchInput = document.getElementById('auditSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderTimeline(containerId);
      });
    }

    const exportBtn = document.getElementById('exportAuditBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportAuditReport();
      });
    }
  },

  getIconSvg(iconType) {
    switch (iconType) {
      case 'upload':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
      case 'hash':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>';
      case 'search':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      case 'pen-tool':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>';
      case 'link':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';
      case 'check-circle':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      case 'shield-alert':
      case 'x-circle':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      default:
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    }
  },

  renderTimeline(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let logs = VeridexUtils.getAuditLogs();

    if (this.activeCategory !== 'all') {
      logs = logs.filter(l => l.category === this.activeCategory);
    }

    if (this.searchQuery) {
      logs = logs.filter(l =>
        l.title.toLowerCase().includes(this.searchQuery) ||
        l.desc.toLowerCase().includes(this.searchQuery) ||
        (l.docId && l.docId.toLowerCase().includes(this.searchQuery))
      );
    }

    if (logs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No audit events found</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Try selecting a different filter or search term.</div>
        </div>
      `;
      return;
    }

    let html = '';
    logs.forEach(item => {
      const isSecurity = item.category === 'security';
      const iconMarkup = this.getIconSvg(item.icon);

      html += `
        <div class="audit-timeline-item" data-id="${item.id}">
          <div class="audit-node-dot ${isSecurity ? 'security-alert' : ''}"></div>
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: ${isSecurity ? 'var(--color-danger-bg)' : 'rgba(2, 132, 199, 0.08)'}; border: 1px solid ${isSecurity ? 'rgba(220, 38, 38, 0.3)' : 'rgba(2, 132, 199, 0.2)'}; display: flex; align-items: center; justify-content: center; color: ${isSecurity ? 'var(--color-danger)' : 'var(--accent-cyan)'}; flex-shrink: 0;">
              ${iconMarkup}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap;">
                <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${item.title}</span>
                <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: var(--radius-sm); background: #F1F5F9; border: 1px solid var(--border-subtle); color: var(--accent-cyan); font-family: var(--font-mono);">
                  ${item.docId || 'SYSTEM'}
                </span>
                <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
                  ${item.category}
                </span>
              </div>
              <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55;">
                ${item.desc}
              </div>
            </div>
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted); text-align: right; white-space: nowrap;">
            ${item.timestamp}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  exportAuditReport() {
    const logs = VeridexUtils.getAuditLogs();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VERIDEX_Audit_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    VeridexUtils.showToast('Audit report exported successfully', 'success');
  }
};
