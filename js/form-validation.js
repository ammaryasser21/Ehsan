// ============================================
// Validation Configuration
// ============================================
const ValidationConfig = {
  errorMessages: {
    ar: {
      name: "الاسم مطلوب",
      message: "نص الرسالة مطلوب",
      messageMin: "نص الرسالة يجب أن يكون {length} أحرف على الأقل",
      subject: "موضوع الرسالة مطلوب",
      email: "البريد الإلكتروني غير صحيح",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى استخدام الحروف الإنجليزية فقط في البريد الإلكتروني",
      phone: "رقم الجوال مطلوب",
      phoneLength: "رقم الجوال يجب أن يكون 10 أرقام",
      phoneFormat: "رقم الجوال يجب أن يبدأ بـ 05",
      fullName: "الاسم الكامل مطلوب",
      nameFormat: "الاسم يجب أن يحتوي على حرفين على الأقل",
      job: "الوظيفة مطلوبة",
      location: "مكان الإقامة مطلوب",
      description: "وصف الحالة مطلوب",
      nationalId: "رقم الهوية الوطنية مطلوب",
      nationalIdLength: "رقم الهوية الوطنية يجب أن يكون 10 أرقام",
      nationalIdDigits: "يجب أن يحتوي على أرقام فقط",
      cardNumber: "رقم البطاقة مطلوب",
      cardNumberInvalid: "رقم البطاقة غير صحيح",
      cardNumberLength: "رقم البطاقة يجب أن يكون بين 13-19 رقم",
      cardholderName: "اسم حامل البطاقة مطلوب",
      cardholderNameInvalid: "اسم حامل البطاقة يجب أن يكون أحرف إنجليزية فقط",
      expiryDate: "تاريخ الانتهاء مطلوب",
      expiryPast: "البطاقة منتهية الصلاحية",
      cvv: "CVV مطلوب",
      cvvInvalid: "CVV يجب أن يكون 3 أو 4 أرقام",
      amount: "المبلغ مطلوب",
      amountMin: "المبلغ يجب أن يكون أكبر من 0",
    }
  },
};

// ============================================
// Utility Functions
// ============================================

function validateCreditCard(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function validateExpiryDate(monthStr, yearStr) {
  const month = parseInt(monthStr);
  const year = parseInt(yearStr);
  if (!month || !year) return false;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const fullYear = year < 100 ? 2000 + year : year;
  if (fullYear < now.getFullYear()) return false;
  if (fullYear === now.getFullYear() && month < now.getMonth() + 1) return false;
  return true;
}

function validateSaudiPhone(phone) {
  return /^05\d{8}$/.test(phone.replace(/\s+/g, ''));
}

function sanitizeInput(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function showSuccessPopup(selector = "#paymentSuccessPopup") {
  const popup = document.querySelector(selector);
  if (!popup) return;
  popup.classList.add("active");
  document.body.style.overflow = "hidden";

  const closePopup = () => {
    popup.classList.remove("active");
    document.body.style.overflow = "";
  };

  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  }, { once: true });

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handler);
    }
  });
}

// ============================================
// Input Formatting Helpers (auto-run on page)
// ============================================
function setupInputFormatters() {
  // Card number: auto-space every 4 digits, digits only
  const cardNumberInput = document.getElementById('card-number');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 16) v = v.substring(0, 16);
      e.target.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });
  }

  // Cardholder name: English letters and spaces only
  const cardHolderInput = document.getElementById('card-holder');
  if (cardHolderInput) {
    cardHolderInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // CVV: digits only
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  // Phone fields (#number with type=tel): digits only
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  });
}

// ============================================
// Form Validators
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const m = ValidationConfig.errorMessages.ar;

  setupInputFormatters();

  // ──────────────────────────────────────────
  // 1. Contact Form  (send-message.html)
  // ──────────────────────────────────────────
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => e.preventDefault());
    new JustValidate(contactForm, { validateBeforeSubmitting: true })
      .addField("#name", [
        { rule: "required", errorMessage: m.fullName },
        { rule: "minLength", value: 2, errorMessage: m.nameFormat },
      ])
      .addField("#email", [
        { rule: "required", errorMessage: m.emailRequired },
        { rule: "email", errorMessage: m.email },
        { validator: (v) => !/[\u0600-\u06FF]/.test(v), errorMessage: m.emailInvalid },
      ])
      .addField("#number", [
        { rule: "required", errorMessage: m.phone },
        { rule: "minLength", value: 10, errorMessage: m.phoneLength },
        { rule: "maxLength", value: 10, errorMessage: m.phoneLength },
        { validator: (v) => validateSaudiPhone(v), errorMessage: m.phoneFormat },
      ])
      .addField("#text", [
        { rule: "required", errorMessage: m.subject },
      ])
      .addField("#message", [
        { rule: "required", errorMessage: m.message },
        { rule: "minLength", value: 10, errorMessage: m.messageMin.replace('{length}', 10) },
      ])
      .onSuccess(() => {
        contactForm.reset();
        showSuccessPopup();
      });
  }

  // ──────────────────────────────────────────
  // 2. Request Help Form  (request-help.html)
  // ──────────────────────────────────────────
  const requestHelpForm = document.querySelector("#request-help-form");
  if (requestHelpForm) {
    requestHelpForm.addEventListener('submit', (e) => e.preventDefault());
    new JustValidate(requestHelpForm, { validateBeforeSubmitting: true })
      .addField("#name", [
        { rule: "required", errorMessage: m.fullName },
        { rule: "minLength", value: 2, errorMessage: m.nameFormat },
      ])
      .addField("#number", [
        { rule: "required", errorMessage: m.phone },
        { rule: "minLength", value: 10, errorMessage: m.phoneLength },
        { rule: "maxLength", value: 10, errorMessage: m.phoneLength },
        { validator: (v) => validateSaudiPhone(v), errorMessage: m.phoneFormat },
      ])
      .addField("#id", [
        { rule: "required", errorMessage: m.nationalId },
        { rule: "minLength", value: 10, errorMessage: m.nationalIdLength },
        { rule: "maxLength", value: 10, errorMessage: m.nationalIdLength },
        { validator: (v) => /^\d+$/.test(v), errorMessage: m.nationalIdDigits },
      ])
      .addField("#job", [
        { rule: "required", errorMessage: m.job },
      ])
      .addField("#location", [
        { rule: "required", errorMessage: m.location },
      ])
      .addField("#description", [
        { rule: "required", errorMessage: m.description },
      ])
      .onSuccess(() => {
        requestHelpForm.reset();
        showSuccessPopup();
      });
  }

  // ──────────────────────────────────────────
  // 3. Donation Data Form  (payment-data.html)
  // ──────────────────────────────────────────
  const donationDataForm = document.querySelector("#donation-data-form");
  if (donationDataForm) {
    donationDataForm.addEventListener('submit', (e) => e.preventDefault());
    new JustValidate(donationDataForm, { validateBeforeSubmitting: true })
      .addField("#name", [
        { rule: "required", errorMessage: m.fullName },
      ])
      .addField("#email", [
        { rule: "required", errorMessage: m.emailRequired },
        { rule: "email", errorMessage: m.email },
      ])
      .addField("#phone", [
        { rule: "required", errorMessage: m.phone },
        { rule: "minLength", value: 10, errorMessage: m.phoneLength },
        { rule: "maxLength", value: 10, errorMessage: m.phoneLength },
        { validator: (v) => validateSaudiPhone(v), errorMessage: m.phoneFormat },
      ])
      .addField("#amount", [
        { rule: "required", errorMessage: m.amount },
        { validator: (v) => parseFloat(v) > 0, errorMessage: m.amountMin },
      ])
      .onSuccess(() => {
        window.location.href = './payment.html';
      });
  }

  // ──────────────────────────────────────────
  // 4. Payment Form  (payment.html)
  // ──────────────────────────────────────────
  const paymentForm = document.querySelector("#payment-process-form");
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => e.preventDefault());

    const isCard = () => {
      const el = document.getElementById('card');
      return el && el.checked;
    };

    new JustValidate(paymentForm, { validateBeforeSubmitting: true })
      // Cardholder Name
      .addField("#card-holder", [
        {
          validator: (v) => { if (!isCard()) return true; return v.trim().length > 0; },
          errorMessage: m.cardholderName,
        },
        {
          validator: (v) => { if (!isCard()) return true; return /^[a-zA-Z\s]+$/.test(v); },
          errorMessage: m.cardholderNameInvalid,
        },
      ])
      // Card Number
      .addField("#card-number", [
        {
          validator: (v) => { if (!isCard()) return true; return v.replace(/\s/g, '').length > 0; },
          errorMessage: m.cardNumber,
        },
        {
          validator: (v) => { if (!isCard()) return true; const d = v.replace(/\s/g, ''); return d.length >= 13 && d.length <= 19; },
          errorMessage: m.cardNumberLength,
        },
        {
          validator: (v) => { if (!isCard()) return true; return validateCreditCard(v); },
          errorMessage: m.cardNumberInvalid,
        },
      ])
      // Expiry Date (type="month" gives YYYY-MM)
      .addField("#expiry-date", [
        {
          validator: (v) => { if (!isCard()) return true; return v.length > 0; },
          errorMessage: m.expiryDate,
        },
        {
          validator: (v) => {
            if (!isCard()) return true;
            if (!v) return false;
            // type="month" produces "YYYY-MM"
            if (v.includes('-')) {
              const [year, month] = v.split('-');
              return validateExpiryDate(month, year);
            }
            return false;
          },
          errorMessage: m.expiryPast,
        },
      ])
      // CVV
      .addField("#cvv", [
        {
          validator: (v) => { if (!isCard()) return true; return v.length > 0; },
          errorMessage: m.cvv,
        },
        {
          validator: (v) => { if (!isCard()) return true; return /^\d{3,4}$/.test(v); },
          errorMessage: m.cvvInvalid,
        },
      ])
      .onSuccess(() => {
        showSuccessPopup();
      });

    // Re-validate when payment method changes so card errors clear
    document.querySelectorAll('input[name="payment"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        // Clear card field errors when switching away from card
        if (!isCard()) {
          ['card-holder', 'card-number', 'expiry-date', 'cvv'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
              el.classList.remove('just-validate-error-field');
              const errLabel = el.parentElement?.querySelector('.just-validate-error-label');
              if (errLabel) errLabel.remove();
            }
          });
        }
      });
    });
  }
});
