const INITIAL_RESERVATIONS = [
  {
    id: 1019,
    firstName: 'Ashish',
    lastName: 'Thombare',
    birthday: '1993-04-12',
    gender: 'Male',
    phoneNumber: '9322835251',
    emailAddress: 'ashish.thombare@example.com',
    numberGuest: 2,
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '106',
    totalBill: 381.99,
    paymentType: 'PayAtHotel',
    cardType: 'None',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    arrivalTime: '2026-09-30',
    leavingTime: '2026-10-02',
    checkIn: true,
    status: 'Checked-In',
    breakfast: 3,
    lunch: 0,
    dinner: 0,
    cleaning: false,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 21,
    createdAt: '2026-09-30T09:00:00Z'
  },
  {
    id: 1018,
    firstName: 'Ashish',
    lastName: 'Thombare',
    birthday: '1993-04-12',
    gender: 'Male',
    phoneNumber: '9322835251',
    emailAddress: 'ashish.thombare@example.com',
    numberGuest: 2,
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '107',
    totalBill: 345.61,
    paymentType: 'PayAtHotel',
    cardType: 'None',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    arrivalTime: '2026-09-30',
    leavingTime: '2026-10-02',
    checkIn: false,
    status: 'Reserved',
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    cleaning: false,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 0,
    createdAt: '2026-09-30T09:05:00Z'
  },
  {
    id: 1017,
    firstName: 'Ashish',
    lastName: 'Thombare',
    birthday: '1993-04-12',
    gender: 'Male',
    phoneNumber: '09322835251',
    emailAddress: 'ashish.thombare@example.com',
    numberGuest: 2,
    streetAddress: '',
    aptSuite: '',
    city: 'Jalgaon',
    state: '',
    zipCode: '',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '102',
    totalBill: 355.86,
    paymentType: 'PayAtHotel',
    cardType: 'None',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    arrivalTime: '2026-09-30',
    leavingTime: '2026-10-02',
    checkIn: false,
    status: 'Reserved',
    breakfast: 3,
    lunch: 0,
    dinner: 0,
    cleaning: false,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 21,
    createdAt: '2026-09-30T09:10:00Z'
  },
  {
    id: 1011,
    firstName: 'Nazim',
    lastName: 'Amin',
    birthday: '1990-05-15',
    gender: 'Male',
    phoneNumber: '(999) 999-9999',
    emailAddress: 'nazim@hotel.com',
    numberGuest: 2,
    streetAddress: '100 Ocean Drive',
    aptSuite: 'Apt 4B',
    city: 'Miami',
    state: 'FL',
    zipCode: '33139',
    roomType: 'Double',
    roomFloor: 2,
    roomNumber: '205',
    totalBill: 378.93,
    paymentType: 'Credit Card',
    cardType: 'Visa',
    cardNumber: '4111222233334444',
    cardExp: '12/28',
    cardCvc: '888',
    arrivalTime: '2026-09-28',
    leavingTime: '2026-10-02',
    checkIn: true,
    status: 'Checked-In',
    breakfast: 2,
    lunch: 1,
    dinner: 2,
    cleaning: true,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 59,
    createdAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 1013,
    firstName: 'Ceaser',
    lastName: 'Krit',
    birthday: '1985-08-22',
    gender: 'Male',
    phoneNumber: '(555) 234-5678',
    emailAddress: 'ceaser.krit@example.com',
    numberGuest: 1,
    streetAddress: '742 Evergreen Terrace',
    aptSuite: '',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62704',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '101',
    totalBill: 173.43,
    paymentType: 'Debit Card',
    cardType: 'MasterCard',
    cardNumber: '5500000012345678',
    cardExp: '08/27',
    cardCvc: '123',
    arrivalTime: '2026-09-29',
    leavingTime: '2026-10-01',
    checkIn: false,
    breakfast: 2,
    lunch: 0,
    dinner: 0,
    cleaning: false,
    towel: true,
    surprise: false,
    supplyStatus: false,
    foodBill: 14,
    createdAt: '2026-09-29T08:30:00Z'
  },
  {
    id: 1014,
    firstName: 'George',
    lastName: 'Zhang',
    birthday: '1992-11-03',
    gender: 'Male',
    phoneNumber: '(415) 888-9999',
    emailAddress: 'george.z@siliconvalley.io',
    numberGuest: 1,
    streetAddress: '500 Market St',
    aptSuite: 'Suite 12',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    roomType: 'Single',
    roomFloor: 1,
    roomNumber: '103',
    totalBill: 169.43,
    paymentType: 'Credit Card',
    cardType: 'Amex',
    cardNumber: '378282246310005',
    cardExp: '11/29',
    cardCvc: '2020',
    arrivalTime: '2026-09-27',
    leavingTime: '2026-09-30',
    checkIn: true,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    cleaning: true,
    towel: false,
    surprise: false,
    supplyStatus: true,
    foodBill: 0,
    createdAt: '2026-09-27T14:15:00Z'
  },
  {
    id: 1015,
    firstName: 'Sophia',
    lastName: 'Loren',
    birthday: '1988-03-20',
    gender: 'Female',
    phoneNumber: '(212) 555-0199',
    emailAddress: 'sophia.loren@luxury.com',
    numberGuest: 3,
    streetAddress: '789 5th Avenue',
    aptSuite: 'Penthouse 3',
    city: 'New York',
    state: 'NY',
    zipCode: '10022',
    roomType: 'Duplex',
    roomFloor: 4,
    roomNumber: '402',
    totalBill: 456.93,
    paymentType: 'Credit Card',
    cardType: 'Visa',
    cardNumber: '4242424242424242',
    cardExp: '04/28',
    cardCvc: '456',
    arrivalTime: '2026-09-29',
    leavingTime: '2026-10-04',
    checkIn: true,
    breakfast: 2,
    lunch: 0,
    dinner: 0,
    cleaning: true,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 14,
    createdAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 1016,
    firstName: 'Alexander',
    lastName: 'Vance',
    birthday: '1979-12-14',
    gender: 'Male',
    phoneNumber: '(312) 555-8821',
    emailAddress: 'avance@globalholdings.com',
    numberGuest: 2,
    streetAddress: '110 N Michigan Ave',
    aptSuite: '',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    roomType: 'Suite',
    roomFloor: 5,
    roomNumber: '501',
    totalBill: 563.93,
    paymentType: 'Credit Card',
    cardType: 'Visa',
    cardNumber: '4000123456789010',
    cardExp: '09/27',
    cardCvc: '999',
    arrivalTime: '2026-09-30',
    leavingTime: '2026-10-05',
    checkIn: false,
    breakfast: 2,
    lunch: 1,
    dinner: 0,
    cleaning: false,
    towel: true,
    surprise: true,
    supplyStatus: false,
    foodBill: 29,
    createdAt: '2026-09-29T11:00:00Z'
  }
];

const STORAGE_KEY = 'hotel_reservations_db_v2';

export const storageService = {
  getReservations: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESERVATIONS));
        return INITIAL_RESERVATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_RESERVATIONS;
    }
  },

  saveReservations: (reservations) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  },

  addReservation: (data) => {
    const list = storageService.getReservations();
    const roomNum = String(data.roomNumber).trim();
    if (roomNum) {
      const conflicting = list.find(r => 
        r.status !== 'Cancelled' && 
        r.status !== 'Checked-Out' && 
        String(r.roomNumber).trim() === roomNum
      );
      if (conflicting) {
        throw new Error(`Room ${roomNum} is already ${conflicting.checkIn || conflicting.status === 'Checked-In' ? 'occupied' : 'reserved'} by ${conflicting.firstName} ${conflicting.lastName}. Double booking prevented.`);
      }
    }

    const newId = list.length > 0 ? Math.max(...list.map(r => r.id)) + 1 : 1001;
    const newReservation = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString()
    };
    list.unshift(newReservation);
    storageService.saveReservations(list);
    return newReservation;
  },

  updateReservation: (id, updatedFields) => {
    const list = storageService.getReservations();
    const index = list.findIndex(r => r.id === Number(id));
    if (index === -1) throw new Error('Reservation not found');

    if (updatedFields.roomNumber) {
      const roomNum = String(updatedFields.roomNumber).trim();
      const conflicting = list.find(r => 
        r.id !== Number(id) &&
        r.status !== 'Cancelled' && 
        r.status !== 'Checked-Out' && 
        String(r.roomNumber).trim() === roomNum
      );
      if (conflicting) {
        throw new Error(`Room ${roomNum} is already assigned to ${conflicting.firstName} ${conflicting.lastName}. Double booking prevented.`);
      }
    }

    list[index] = { ...list[index], ...updatedFields };
    storageService.saveReservations(list);
    return list[index];
  },

  deleteReservation: (id) => {
    const list = storageService.getReservations();
    const filtered = list.filter(r => r.id !== Number(id));
    storageService.saveReservations(filtered);
    return true;
  },

  toggleCheckIn: (id) => {
    const list = storageService.getReservations();
    const item = list.find(r => r.id === Number(id));
    if (item) {
      if (item.status === 'Checked-In' || item.checkIn) {
        // Checking out -> transitions to terminal Checked-Out state
        item.checkIn = false;
        item.status = 'Checked-Out';
        item.checkedOutAt = new Date().toISOString();
      } else if (item.status !== 'Checked-Out') {
        // Checking in -> transitions to Checked-In state
        item.checkIn = true;
        item.status = 'Checked-In';
        item.checkedInAt = new Date().toISOString();
      }
      storageService.saveReservations(list);
      return item;
    }
    return null;
  },

  checkOutReservation: (id) => {
    const list = storageService.getReservations();
    const item = list.find(r => r.id === Number(id));
    if (item) {
      item.checkIn = false;
      item.status = 'Checked-Out';
      item.checkedOutAt = new Date().toISOString();
      storageService.saveReservations(list);
      return item;
    }
    return null;
  },

  updateSupplyStatus: (id, status) => {
    const list = storageService.getReservations();
    const item = list.find(r => r.id === Number(id));
    if (item) {
      item.supplyStatus = status;
      storageService.saveReservations(list);
      return item;
    }
    return null;
  }
};
