const STORAGE_KEY = 'grand_horizon_guest_profiles';

const SEED_PROFILES = [
  {
    guestId: 1,
    email: 'arthur.pendelton@grandhorizon.com',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    phoneNumber: '+1-555-0199',
    tierStatus: 'Platinum',
    tierMultiplier: 1.5,
    loyaltyPoints: 12500,
    totalNights: 45,
    preferences: {
      pillow: 'Hypoallergenic Goose Feather',
      floorPreference: 'Floor 5 (Penthouse)',
      dietary: 'Low Sodium, Gluten-Free',
      roomView: 'Panoramic Skyline View',
      vipGreeting: 'Chilled Dom Pérignon upon arrival'
    }
  },
  {
    guestId: 2,
    email: 'sarah.connor@skyline.org',
    firstName: 'Sarah',
    lastName: 'Connor',
    phoneNumber: '+1-555-0144',
    tierStatus: 'Gold',
    tierMultiplier: 1.25,
    loyaltyPoints: 4800,
    totalNights: 18,
    preferences: {
      pillow: 'Firm Memory Foam',
      floorPreference: 'Floor 4 (Duplex)',
      dietary: 'Artisan Vegetarian',
      roomView: 'Courtyard Garden'
    }
  },
  {
    guestId: 3,
    email: 'james.h@apexgroup.com',
    firstName: 'James',
    lastName: 'Harrington',
    phoneNumber: '+1-555-0177',
    tierStatus: 'Silver',
    tierMultiplier: 1.0,
    loyaltyPoints: 950,
    totalNights: 4,
    preferences: {
      pillow: 'Standard Soft',
      floorPreference: 'Floor 2 or 3',
      newspaper: 'Financial Times'
    }
  }
];

function getStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROFILES));
      return SEED_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PROFILES;
  }
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save guest profiles:', err);
  }
}

export const guestProfileService = {
  getProfile: async (email) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`/api/guests/profiles/${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const profiles = getStoredProfiles();
    return profiles.find(p => p.email.toLowerCase() === cleanEmail) || null;
  },

  getOrCreateProfile: async ({ email, firstName, lastName, phone }) => {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch('/api/guests/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, firstName, lastName, phone })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const profiles = getStoredProfiles();
    let existing = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (!existing) {
      existing = {
        guestId: profiles.length + 1,
        email: cleanEmail,
        firstName: firstName || 'Valued',
        lastName: lastName || 'Guest',
        phoneNumber: phone || '',
        tierStatus: 'Silver',
        tierMultiplier: 1.0,
        loyaltyPoints: 100,
        totalNights: 0,
        preferences: {}
      };
      profiles.push(existing);
      saveProfiles(profiles);
    }
    return existing;
  },

  updatePreferences: async (email, preferences) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`/api/guests/profiles/${encodeURIComponent(cleanEmail)}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const profiles = getStoredProfiles();
    const target = profiles.find(p => p.email.toLowerCase() === cleanEmail);
    if (target) {
      target.preferences = { ...target.preferences, ...preferences };
      saveProfiles(profiles);
      return target;
    }
    return null;
  },

  getAllVipGuests: async () => {
    try {
      const res = await fetch('/api/guests/vip');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return getStoredProfiles();
  }
};
