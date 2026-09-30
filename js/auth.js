/**
 * VERIDEX — Role-Based Access Control Simulation (Vanilla JS)
 * Supported Roles: Citizen, Government Officer, Administrator
 */

import { VeridexUtils } from './utils.js';

export const VeridexAuth = {
  ROLES: {
    CITIZEN: 'citizen',
    OFFICER: 'officer',
    ADMIN: 'admin'
  },

  getCurrentRole() {
    return localStorage.getItem('veridex_user_role') || this.ROLES.OFFICER;
  },

  setCurrentRole(role) {
    if (Object.values(this.ROLES).includes(role)) {
      localStorage.setItem('veridex_user_role', role);
      VeridexUtils.showToast(`Switched active persona to ${this.getRoleLabel(role)}`, 'info');
      this.updateHeaderUI();
      // Dispatch custom event so pages can reactively re-render
      window.dispatchEvent(new CustomEvent('veridex:roleChanged', { detail: { role } }));
    }
  },

  getRoleLabel(role) {
    switch (role) {
      case this.ROLES.CITIZEN:
        return 'Citizen / Applicant';
      case this.ROLES.OFFICER:
        return 'Government Officer';
      case this.ROLES.ADMIN:
        return 'System Administrator';
      default:
        return 'Authorized User';
    }
  },

  getRoleBadgeColor(role) {
    switch (role) {
      case this.ROLES.CITIZEN:
        return 'role-dot citizen';
      case this.ROLES.OFFICER:
        return 'role-dot officer';
      case this.ROLES.ADMIN:
        return 'role-dot admin';
      default:
        return 'role-dot';
    }
  },

  initRoleModal() {
    const modal = document.getElementById('roleAuthModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Handle role card selections
    const roleCards = modal.querySelectorAll('.role-choice-card');
    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        const selectedRole = card.getAttribute('data-role');
        if (selectedRole) {
          this.setCurrentRole(selectedRole);
          modal.classList.remove('open');
          
          // If on a role-restricted page and switched to citizen, offer upload or verify
          if (window.location.pathname.includes('dashboard.html') && selectedRole === this.ROLES.CITIZEN) {
            VeridexUtils.showToast('Citizen mode: Switch to Upload or Verification', 'info');
          }
        }
      });
    });

    const switchBtns = document.querySelectorAll('.trigger-role-modal');
    switchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openRoleModal();
      });
    });
  },

  openRoleModal() {
    const modal = document.getElementById('roleAuthModal');
    if (!modal) return;
    const current = this.getCurrentRole();
    const roleCards = modal.querySelectorAll('.role-choice-card');
    roleCards.forEach(card => {
      if (card.getAttribute('data-role') === current) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
    modal.classList.add('open');
  },

  updateHeaderUI() {
    const current = this.getCurrentRole();
    const labelEls = document.querySelectorAll('.current-role-label');
    labelEls.forEach(el => {
      el.textContent = this.getRoleLabel(current);
    });

    const dotEls = document.querySelectorAll('.current-role-dot');
    dotEls.forEach(el => {
      el.className = this.getRoleBadgeColor(current);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VeridexAuth.initRoleModal();
  VeridexAuth.updateHeaderUI();
});
