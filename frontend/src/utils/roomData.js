export const FLOORS = [
  { floor: 1, type: 'Single', price: 149, rooms: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'] },
  { floor: 2, type: 'Double', price: 299, rooms: ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210'] },
  { floor: 3, type: 'Twin', price: 349, rooms: ['301', '302', '303', '304', '305', '306', '307', '308', '309', '310'] },
  { floor: 4, type: 'Duplex', price: 399, rooms: ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410'] },
  { floor: 5, type: 'Suite', price: 499, rooms: ['501', '502', '503', '504', '505', '506', '507', '508', '509', '510'] },
];

export const ALL_ROOM_NUMBERS = FLOORS.flatMap(f => f.rooms);

export function getRoomDetails(roomNumber) {
  const numStr = String(roomNumber).trim();
  const floorNum = parseInt(numStr.charAt(0), 10);
  const floorConfig = FLOORS.find(f => f.floor === floorNum);
  if (!floorConfig) return null;
  return {
    roomNumber: numStr,
    floor: floorNum,
    type: floorConfig.type,
    price: floorConfig.price
  };
}
