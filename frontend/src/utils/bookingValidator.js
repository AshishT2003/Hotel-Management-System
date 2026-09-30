export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export const isValidPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 7;
};

export const validateSearchCriteria = (checkIn, checkOut, adults = 1) => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!checkIn) {
    errors.checkIn = 'Please select a check-in date.';
  } else {
    const dIn = new Date(checkIn);
    dIn.setHours(0, 0, 0, 0);
    if (dIn < today) {
      errors.checkIn = 'Check-in date cannot be in the past.';
    }
  }

  if (!checkOut) {
    errors.checkOut = 'Please select a check-out date.';
  } else if (checkIn) {
    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    if (dOut <= dIn) {
      errors.checkOut = 'Check-out date must be after check-in date.';
    }
  }

  if (adults < 1) {
    errors.adults = 'At least 1 adult is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateGuestDetails = (guestInfo) => {
  const errors = {};

  if (!guestInfo.firstName || guestInfo.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  }

  if (!guestInfo.lastName || guestInfo.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.';
  }

  if (!guestInfo.email || !isValidEmail(guestInfo.email)) {
    errors.email = 'Please enter a valid email address for confirmation.';
  }

  if (!guestInfo.phone || !isValidPhone(guestInfo.phone)) {
    errors.phone = 'Please provide a valid contact phone number.';
  }

  if (!guestInfo.password || guestInfo.password.trim().length < 4) {
    errors.password = 'Please create a portal password (at least 4 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
