/**
 * @class VisaCalculator
 * @description Handles calculation of visa fees based on various parameters including visa type, turnover, duration, and dependents
 * 
 * @property {Object} config - Configuration object containing visa types and their associated fees
 * @property {Object} config.visaTypes - Object containing different visa type configurations
 * @property {Object} state - Current state of the calculator including selected options
 * @property {number} state.visaType - Selected visa type ID
 * @property {boolean} state.isHighTurnover - Whether high turnover rates apply
 * @property {number} state.duration - Duration of the visa in years
 * @property {number} state.dependentsOver18 - Number of dependents over 18 years
 * @property {number} state.dependentsUnder18 - Number of dependents under 18 years
 * @property {Object} elements - Cached DOM elements used by the calculator
 * 
 * @example
 * const calculator = new VisaCalculator();
 * // Calculator will automatically initialize and bind to form elements
 */
class VisaCalculator {
   constructor() {
      this.config = {
         visaTypes: {
            1: {
               name: 'Nomination & Visa',
               nomination: 330,
               visa: 3115,
               dependentAdult: 3115,
               dependentChild: 780,
               levy: { standard: 1200, high: 1800 },
               usesDuration: true,
               showPrimaryVisa: true,
               showDependents: true,
            },
            2: {
               name: 'Nomination Transfer',
               nomination: 330,
               visa: 0,
               dependentAdult: 0,
               dependentChild: 0,
               levy: { standard: 1200, high: 1800 },
               usesDuration: false,
               showPrimaryVisa: false,
               showDependents: false
            },
            3: {
               name: 'Employer Nomination',
               nomination: 540,
               visa: 4770,
               dependentAdult: 2385,
               dependentChild: 1190,
               levy: { standard: 3000, high: 5000 },
               usesDuration: false,
               showPrimaryVisa: true,
               showDependents: true

            }
         }
      };

      this.state = {
         visaType: 0,
         isHighTurnover: false,
         duration: 1,
         dependentsOver18: 0,
         dependentsUnder18: 0
      };

      this.elements = this.cacheElements();
      this.bindEvents();
      this.updateDisplay();
   }

   cacheElements() {
      return {
         visaType: document.getElementById('visa_type'),
         turnover: document.querySelectorAll('input[name="turnover_check"]'),
         duration: document.querySelector('input[name="visa_duration"]'),
         over18: document.querySelector('input[name="over18"]'),
         under18: document.querySelector('input[name="under18"]'),
         finalPrice: document.getElementById('final_price'),
         businessTurnover: document.querySelector('div[data-name="businessTernover"]'),
         visaDuration: document.querySelector('div[data-name="Visaduration"]'),
         dependentWrap: document.querySelector('div.dependentWrap'),
         secondryVisaApplication: document.querySelectorAll('.secondryApplication'),
         dependentOver18: document.querySelector('.secondryApplication.over18'),
         dependentUnder18: document.querySelector('.secondryApplication.under18'),
         currentVisaDescription: document.querySelectorAll('.visa_description_current'),
         primaryVisaApplication: document.querySelector('.visaApplication'),
         orApplicant: document.querySelector('.orApplicant'),
      };
   }

   bindEvents() {
      // Single event handler for all inputs
      this.elements.visaType?.addEventListener('change', (evt) => this.handleInputChange(evt));
      this.elements.turnover.forEach(radio =>
         radio.addEventListener('change', (evt) => this.handleInputChange(evt))
      );
      this.elements.duration?.addEventListener('input', (evt) => this.handleInputChange(evt));
      this.elements.over18?.addEventListener('input', (evt) => this.handleInputChange(evt));
      this.elements.under18?.addEventListener('input', (evt) => this.handleInputChange(evt));
   }

   handleInputChange(evt) {
      const input = evt.target;

      if (input.type === 'number' || input.type === 'text') {
         input.value = this.sanitizeNumericValue(input.value);
      }

      this.updateState();
      this.updateVisibility();
      this.updateDisplay();
   }

   sanitizeNumericValue(value) {
      const parsed = parseInt(value.trim(), 10);
      return isNaN(parsed) ? 0 : parsed;
   }

   updateState() {
      this.state = {
         visaType: parseInt(this.elements.visaType?.value || 0),
         isHighTurnover: document.querySelector('input[name="turnover_check"]:checked')?.value === 'yes',
         duration: parseInt(this.elements.duration?.value || 1),
         dependentsOver18: parseInt(this.elements.over18?.value || 0),
         dependentsUnder18: parseInt(this.elements.under18?.value || 0)
      };
   }
   updateVisibility() {
      const { visaType, dependentsUnder18, dependentsOver18 } = this.state;
      const visaConfig = this.config.visaTypes[visaType];
      const showFields = visaType > 0;

      // Update dependent visibility
      if (visaConfig?.showDependents) {
         this.elements.secondryVisaApplication?.forEach(el =>
            this.toggleElement(el, true));
         this.toggleElement(this.elements.dependentOver18, dependentsOver18 > 0);
         this.toggleElement(this.elements.dependentUnder18, dependentsUnder18 > 0);
      } else {
         this.elements.secondryVisaApplication?.forEach(el =>
            this.toggleElement(el, false));
      }

      // Update main form sections
      this.toggleElement(this.elements.businessTurnover, showFields);
      this.toggleElement(this.elements.visaDuration, showFields && visaConfig?.usesDuration);
      this.toggleElement(this.elements.dependentWrap, visaConfig?.showDependents);
      this.toggleElement(this.elements.primaryVisaApplication, showFields && visaConfig?.showPrimaryVisa);

      // Update visa descriptions
      this.elements.currentVisaDescription?.forEach(el => {
         this.toggleElement(el, parseInt(el.dataset.visaType) === visaType);
      });

      // Update dependent wrap spacing
      this.elements.dependentWrap?.classList.toggle('mt-5', !showFields);

      // Update orApplicant 
      this.toggleElement(this.elements.orApplicant, visaType === 3);
   }

   toggleElement(element, show) {
      if (!element) return;
      element.classList.toggle('d-none', !show);
   }

   calculateFees() {
      const { visaType, isHighTurnover, duration, dependentsOver18, dependentsUnder18 } = this.state;

      if (visaType === 0) return this.getZeroFees();

      const config = this.config.visaTypes[visaType];
      if (!config) return this.getZeroFees();

      const levyMultiplier = config.usesDuration ? duration : 1;
      const levyAmount = (isHighTurnover ? config.levy.high : config.levy.standard) * levyMultiplier;

      return {
         visa: { quantity: visaType === 2 ? 0 : 1, price: config.visa },
         nomination: { quantity: 1, price: config.nomination },
         levy: { quantity: levyMultiplier, price: levyAmount },
         dependents: {
            under18: {
               quantity: dependentsUnder18,
               price: config.dependentChild * dependentsUnder18
            },
            over18: {
               quantity: dependentsOver18,
               price: config.dependentAdult * dependentsOver18
            },
         }
      };
   }

   getZeroFees() {
      return {
         visa: { quantity: 0, price: 0 },
         nomination: { quantity: 0, price: 0 },
         levy: { quantity: 0, price: 0 },
         dependents: {
            under18: {
               quantity: 0,
               price: 0
            },
            over18: {
               quantity: 0,
               price: 0
            },
         }
      };
   }

   updateDisplay() {
      const fees = this.calculateFees();

      // Update individual fee displays
      this.updateFeeDisplay('visaApplication', fees.visa);
      this.updateFeeDisplay('nominationFee', fees.nomination);
      this.updateFeeDisplay('safLevy', fees.levy);
      this.updateFeeDisplay('secondryApplication.over18', fees.dependents.over18);
      this.updateFeeDisplay('secondryApplication.under18', fees.dependents.under18);


      // Update total
      const total = fees.visa.price +
         fees.nomination.price +
         fees.levy.price +
         fees.dependents.over18.price +
         fees.dependents.under18.price;
      this.animatePrice(this.elements.finalPrice, total);
   }

   updateFeeDisplay(className, fee) {
      const element = document.querySelector(`.${className}`);
      if (!element) return;

      const quantityEl = element.querySelector('.quantity');
      const priceEl = element.querySelector('.price');

      if (quantityEl) quantityEl.textContent = fee.quantity;
      if (priceEl) this.animatePrice(priceEl, fee.price);
   }

   animatePrice(element, targetValue, duration = 500) {
      if (!element) return;

      const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
      const startTime = performance.now();

      element.dataset.price = targetValue;

      const animate = (currentTime) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / duration, 1);
         const currentValue = startValue + (targetValue - startValue) * progress;

         element.textContent = Math.round(currentValue).toLocaleString();

         if (progress < 1) {
            requestAnimationFrame(animate);
         }
      };

      requestAnimationFrame(animate);
   }

   reset() {
      // Reset form inputs
      if (this.elements.visaType) this.elements.visaType.value = '0';
      if (this.elements.duration) this.elements.duration.value = '1';
      if (this.elements.over18) this.elements.over18.value = '0';
      if (this.elements.under18) this.elements.under18.value = '0';

      // Reset radio buttons
      this.elements.turnover.forEach(radio => radio.checked = false);

      // Update state and display
      this.updateState();
      this.updateVisibility();
      this.updateDisplay();
   }
}

// Simplified Step Manager
class StepManager {
   constructor() {
      this.currentStep = 1;
      this.claimButton = document.getElementById('claim_btn');
      this.elements = {
         step1: document.getElementById('step-1'),
         step2: document.getElementById('step-2'),
         progressBar: document.querySelector('.progress-bar'),
         currentPage: document.querySelector('.page_progress .current_page'),
         progressNum: document.querySelector('.page_progress .progress_num'),
         heading: document.querySelector('h1')
      };

      this.claimButton?.addEventListener('click', () => this.toggleStep());
   }

   toggleStep() {
      this.currentStep = this.currentStep === 1 ? 2 : 1;
      const isStep2 = this.currentStep === 2;

      // Update UI in one place
      const updates = {
         step1: { toggle: 'd-none', condition: isStep2 },
         step2: { toggle: 'd-none', condition: !isStep2 },
         progressBar: { style: 'width', value: `${isStep2 ? 100 : 50}%` },
         currentPage: { text: isStep2 ? '2' : '1' },
         progressNum: { text: `${isStep2 ? 100 : 50}%` },
         heading: { text: isStep2 ? 'Government Visa Cost Calculator' : 'Government Fee Calculator' }
      };

      Object.entries(updates).forEach(([key, config]) => {
         const element = this.elements[key];
         if (!element) return;

         if (config.toggle) {
            element.classList.toggle(config.toggle, config.condition);
         } else if (config.style) {
            element.style[config.style] = config.value;
         } else if (config.text) {
            element.textContent = config.text;
         }
      });

      this.claimButton.textContent = isStep2 ? 'Go back' : 'Claim Your FREE consultation';
   }
}

// Simple Slider (if you want to keep the bubble slider)
class SimpleSlider {
   constructor(selector) {
      this.slider = document.querySelector(selector);
      this.bubble = document.getElementById('bubble');

      if (!this.slider || !this.bubble) return;

      this.slider.addEventListener('input', () => this.updateBubble());
      this.updateBubble();
   }

   updateBubble() {

      const value = this.slider.value;
      const min = this.slider.min || 0;
      const max = this.slider.max || 100;
      const percentage = ((value - min) / (max - min)) * 100;

      this.bubble.textContent = Math.round(value);

      // Get slider and thumb dimensions
      const sliderRect = this.slider.getBoundingClientRect();
      const bubbleWidth = this.bubble.offsetWidth;
      const thumbWidth = 16; // Default thumb width (adjust if needed)

      // Calculate bubble position (accounting for thumb width)
      const sliderTrackWidth = sliderRect.width - thumbWidth;
      const thumbOffset = thumbWidth / 2;
      const bubbleLeft = (sliderTrackWidth * percentage / 100) + thumbOffset - (bubbleWidth / 2);


      if (value === min) {
         this.bubble.style.left = '-5px';
      } else if (value === max) {
         this.bubble.style.left = `${sliderRect.width - bubbleWidth + 7}px`;
      } else {
         this.bubble.style.left = `${Math.max(0, Math.min(sliderRect.width - bubbleWidth, bubbleLeft))}px`;
      }

      this.slider.style.background = `linear-gradient(to right, #5e7f88 ${percentage}%, #ddd ${percentage}%)`;

   }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
   // Move consultation form if needed
   const consultationForm = document.getElementById('consultationForm');
   const step2 = document.getElementById('step-2');
   if (consultationForm && step2) {
      step2.appendChild(consultationForm);
   }

   // Initialize components
   window.visaCalculator = new VisaCalculator();
   window.stepManager = new StepManager();
   window.slider = new SimpleSlider('.slider');

   // Initialize NiceSelect if it exists
   if (typeof NiceSelect !== 'undefined') {
      NiceSelect.bind(document.getElementById("visa_type"));
   }
});