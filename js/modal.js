class AccessibleModal {
  constructor(element) {
    this.modal = element;
    this.overlay = this.modal.parentElement; // Assuming overlay wraps the dialog
    this.closeButtons = this.modal.querySelectorAll('[data-modal-close]');
    this.triggerButton = null;
    this.focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;

    this.init();
  }

  init() {
    // Attach close event listeners
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on Escape key
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
      
      // Trap focus
      if (e.key === 'Tab') {
        this.trapFocus(e);
      }
    });
  }

  open(triggerElement) {
    this.triggerButton = triggerElement;
    
    // Show modal
    this.overlay.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Update focusable elements
    this.updateFocusableElements();

    // Set focus to the modal dialog or first focusable element
    setTimeout(() => {
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      } else {
        this.modal.focus();
      }
    }, 50); // slight delay to allow animation to start
  }

  close() {
    // Hide modal
    this.overlay.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scrolling

    // Return focus to trigger button
    if (this.triggerButton) {
      this.triggerButton.focus();
    }
  }

  updateFocusableElements() {
    this.focusableElements = Array.from(this.modal.querySelectorAll(this.focusableElementsString));
    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }

  trapFocus(e) {
    if (this.focusableElements.length === 0) return;

    const isShiftPressed = e.shiftKey;

    if (isShiftPressed) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }
}

function initModals() {
  const modalEl = document.getElementById('demo-modal');
  if (modalEl && !modalEl.dataset.initialized) {
    const modalInstance = new AccessibleModal(modalEl);
    modalEl.dataset.initialized = 'true';
    
    // Attach trigger buttons
    const triggers = document.querySelectorAll('[data-modal-target="demo-modal"]');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        modalInstance.open(trigger);
      });
    });
  }
}

// Initialize on DOM Load and SPA navigation
document.addEventListener('DOMContentLoaded', initModals);
document.addEventListener('pageContentLoaded', initModals);
