// Fee structure data
const feeData = {
   visa_482: {
      name: "Skills in Demand (Sc 482)",
      nomination: 540,
      visa_main_18_over_onshore: 1770,
      visa_main_18_over_offshore: 1770,
      visa_main_under_18: 440,
      visa_dependent_18_over: 1770,
      visa_dependent_under_18: 440,
      saf_small: 1800, // per year for businesses < $10M
      saf_large: 5000  // per year for businesses > $10M
   },
   visa_482_transfer: {
      name: "Skills in Demand (Sc 482) - Transfer Only",
      nomination: 540,
      visa_main_18_over_onshore: 0,
      visa_main_18_over_offshore: 0,
      visa_main_under_18: 0,
      visa_dependent_18_over: 0,
      visa_dependent_under_18: 0,
      saf_small: 1800,
      saf_large: 5000
   },
   visa_186: {
      name: "Employer Nomination Scheme (Sc 186)",
      nomination: 540,
      visa_main_18_over_onshore: 4770,
      visa_main_18_over_offshore: 4770,
      visa_main_under_18: 2385,
      visa_dependent_18_over: 2385,
      visa_dependent_under_18: 1195,
      saf_small: 0,
      saf_large: 0
   }
};

// State management
let currentStep = 1;
let formData = {
   visaType: '',
   turnover: '',
   duration: 2,
   dependents: 0,
   dependentAges: [],
   applicantAge: '',
   applicationLocation: ''
};

// DOM elements
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const nextBtn = document.getElementById('next_step');
const backBtn = document.getElementById('back_step');
const calculateBtn = document.getElementById('calculate_fees');
const resultsContainer = document.getElementById('results');
const visaDescription = document.getElementById('visa_description');
const claimBtn = document.getElementById('claim_btn');
const progressBar = document.querySelector('.progress-bar');
const currentPageSpan = document.querySelector('.current_page');
const progressNum = document.querySelector('.progress_num');

// Visa type change handler
document.getElementById('visa_type').addEventListener('change', function () {
   const selectedValue = this.value;
   formData.visaType = selectedValue;

   // Show/hide business turnover question
   const turnoverGroup = document.querySelector('[data-name="businessTernover"]');
   const durationGroup = document.querySelector('[data-name="Visaduration"]');
   const dependentsGroup = document.querySelector('[data-name="dependents"]');

   if (selectedValue === '1' || selectedValue === '2') {
      // Skills in Demand visa
      turnoverGroup.classList.remove('d-none');
      durationGroup.classList.remove('d-none');
      dependentsGroup.classList.remove('d-none');
   } else if (selectedValue === '3') {
      // ENS visa
      turnoverGroup.classList.add('d-none');
      durationGroup.classList.add('d-none');
      dependentsGroup.classList.remove('d-none');
   } else {
      turnoverGroup.classList.add('d-none');
      durationGroup.classList.add('d-none');
      dependentsGroup.classList.add('d-none');
   }

   validateStep1();
});

// Business turnover radio buttons
document.querySelectorAll('input[name="turnover_check"]').forEach(radio => {
   radio.addEventListener('change', function () {
      formData.turnover = this.value;
      validateStep1();
   });
});

// Duration slider
const durationSlider = document.getElementById('duration_slider');
const durationBubble = document.getElementById('duration-bubble');

durationSlider.addEventListener('input', function () {
   const value = parseInt(this.value);
   formData.duration = value;
   durationBubble.textContent = value;
   durationBubble.style.left = ((value - 1) / 3) * 100 + '%';
   validateStep1();
});

// Dependents slider
const dependentsSlider = document.getElementById('dependents_slider');
const dependentsBubble = document.getElementById('dependents-bubble');
const dependentInputs = document.getElementById('dependentInputs');

dependentsSlider.addEventListener('input', function () {
   const value = parseInt(this.value);
   formData.dependents = value;
   dependentsBubble.textContent = value;
   dependentsBubble.style.left = (value / 10) * 100 + '%';

   // Generate dependent age inputs
   generateDependentInputs(value);
   validateStep1();
});

function generateDependentInputs(count) {
   dependentInputs.innerHTML = '';
   formData.dependentAges = [];

   if (count > 0) {
      dependentInputs.classList.remove('d-none');
      for (let i = 0; i < count; i++) {
         const inputGroup = document.createElement('div');
         inputGroup.className = 'input-group';
         inputGroup.innerHTML = `
                       <label for="dependent_age_${i}">Dependent ${i + 1} Age</label>
                       <select id="dependent_age_${i}" name="dependent_age_${i}" style="width: 100%; padding: 1rem 1.25rem; border: 2px solid var(--border); border-radius: 12px; background: white; font-size: 0.95rem; color: var(--text-primary); transition: all 0.3s ease; font-weight: 500;">
                           <option value="">Select age</option>
                           <option value="under_18">Under 18</option>
                           <option value="18_and_over">18 and over</option>
                       </select>
                   `;
         dependentInputs.appendChild(inputGroup);

         // Add event listener for dependent age
         document.getElementById(`dependent_age_${i}`).addEventListener('change', function () {
            formData.dependentAges[i] = this.value;
            validateStep1();
         });
      }
   } else {
      dependentInputs.classList.add('d-none');
   }
}

// Step 2 form handlers
document.getElementById('applicant_age').addEventListener('change', function () {
   formData.applicantAge = this.value;
   validateStep2();
});

document.querySelectorAll('input[name="application_location"]').forEach(radio => {
   radio.addEventListener('change', function () {
      formData.applicationLocation = this.value;
      validateStep2();
   });
});

// Navigation
nextBtn.addEventListener('click', function () {
   if (validateStep1()) {
      goToStep(2);
   }
});

backBtn.addEventListener('click', function () {
   goToStep(1);
});

calculateBtn.addEventListener('click', function () {
   if (validateStep2()) {
      calculateFees();
   }
});

function goToStep(step) {
   currentStep = step;

   if (step === 1) {
      step1.classList.remove('d-none');
      step2.classList.add('d-none');
      progressBar.style.width = '50%';
      currentPageSpan.textContent = '1';
      progressNum.textContent = '50%';
   } else {
      step1.classList.add('d-none');
      step2.classList.remove('d-none');
      progressBar.style.width = '100%';
      currentPageSpan.textContent = '2';
      progressNum.textContent = '100%';
   }
}

function validateStep1() {
   const isValid = formData.visaType !== '' && formData.visaType !== '0' &&
      (formData.visaType === '3' || formData.turnover !== '') &&
      (formData.dependents === 0 || formData.dependentAges.length === formData.dependents &&
         formData.dependentAges.every(age => age !== ''));

   nextBtn.disabled = !isValid;
   nextBtn.style.opacity = isValid ? '1' : '0.5';
   return isValid;
}

function validateStep2() {
   const isValid = formData.applicantAge !== '' && formData.applicantAge !== '0' &&
      formData.applicationLocation !== '';

   calculateBtn.disabled = !isValid;
   calculateBtn.style.opacity = isValid ? '1' : '0.5';
   return isValid;
}

function calculateFees() {
   let visaData;
   let fees = [];
   let total = 0;

   // Determine visa type and get fee data
   switch (formData.visaType) {
      case '1':
         visaData = feeData.visa_482;
         break;
      case '2':
         visaData = feeData.visa_482_transfer;
         break;
      case '3':
         visaData = feeData.visa_186;
         break;
   }

   // Nomination fee
   if (formData.visaType !== '2') {
      fees.push({
         type: 'Nomination Fee',
         description: 'Employer nomination application',
         quantity: 1,
         amount: visaData.nomination
      });
      total += visaData.nomination;
   }

   // Main applicant visa fee
   if (formData.visaType !== '2') {
      let mainVisaFee;
      if (formData.applicantAge === 'under_18') {
         mainVisaFee = visaData.visa_main_under_18;
      } else {
         mainVisaFee = formData.applicationLocation === 'onshore' ?
            visaData.visa_main_18_over_onshore :
            visaData.visa_main_18_over_offshore;
      }

      fees.push({
         type: 'Main Applicant Visa Fee',
         description: 'Primary visa application fee',
         quantity: 1,
         amount: mainVisaFee
      });
      total += mainVisaFee;
   }

   // Dependent visa fees
   if (formData.dependents > 0 && formData.visaType !== '2') {
      formData.dependentAges.forEach((age, index) => {
         const dependentFee = age === 'under_18' ?
            visaData.visa_dependent_under_18 :
            visaData.visa_dependent_18_over;

         fees.push({
            type: `Dependent ${index + 1} Visa Fee`,
            description: `Dependent applicant (${age.replace('_', ' ')})`,
            quantity: 1,
            amount: dependentFee
         });
         total += dependentFee;
      });
   }

   // SAF Levy (for 482 visas only)
   if (formData.visaType === '1' || formData.visaType === '2') {
      const safRate = formData.turnover === 'yes' ? visaData.saf_large : visaData.saf_small;
      const safTotal = safRate * formData.duration;

      fees.push({
         type: 'SAF Levy',
         description: `Skilling Australians Fund (${formData.duration} years)`,
         quantity: formData.duration,
         amount: safTotal
      });
      total += safTotal;
   }

   // Display results
   displayResults(fees, total, visaData.name);
}

function displayResults(fees, total, visaName) {
   // Show visa description
   visaDescription.innerHTML = `<strong>Selected Visa:</strong> ${visaName}`;
   visaDescription.classList.remove('d-none');

   // Clear previous results
   const feeBreakdown = document.getElementById('fee_breakdown');
   feeBreakdown.innerHTML = '';

   // Add fee rows
   fees.forEach(fee => {
      const row = document.createElement('div');
      row.className = 'result_body';
      row.innerHTML = `
                   <div>${fee.type}</div>
                   <div>${fee.description}</div>
                   <div>${fee.quantity}</div>
                   <div class="price_container">$${fee.amount.toLocaleString()}</div>
               `;
      feeBreakdown.appendChild(row);
   });

   // Add total row
   const totalRow = document.createElement('div');
   totalRow.className = 'result_body total';
   totalRow.innerHTML = `
               <div><strong>Total</strong></div>
               <div><strong>All fees included</strong></div>
               <div><strong>-</strong></div>
               <div class="price_container"><strong>$${total.toLocaleString()}</strong></div>
           `;
   feeBreakdown.appendChild(totalRow);

   // Show results
   resultsContainer.classList.remove('d-none');
   claimBtn.classList.remove('d-none');
}

// Initialize
validateStep1();
validateStep2();

// Claim button handler
claimBtn.addEventListener('click', function () {
   alert('This would typically redirect to a professional consultation service.');
});