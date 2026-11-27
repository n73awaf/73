// Shared layout of the neighbourhood (metres). Street runs along +x, houses on the -z side, camera usually on +z.
export const HOUSES = [
  { x: -30, w: 9, h: 6.2, dx: -1.5, mat: 0, lit: [] },
  { x: -17, w: 10, h: 7.0, dx: 1.5, mat: 1, ours: true },
  { x: -3.5, w: 9.5, h: 6.4, dx: -1.5, mat: 2 },
  { x: 9.5, w: 9, h: 7.2, dx: 1.5, mat: 3 },
  { x: 22, w: 9, h: 6.0, dx: -1.5, mat: 0 },
];
export const doorX = (i) => HOUSES[i].x + HOUSES[i].dx;
export const FRONT_Z = -6;                 // house front wall plane
export const CAR = { x: 44, z: -2.9 }, DUMP = { x: 51.2, z: -3.5 }, WALL_X = 58;
export const SIDE_DOOR = { x: -12, z: -8.2 }; // our back door in the alley, facing +x
export const LAMPS = [-24, -8, 8, 24, 40];
export const ROOMS = { park: [800, 0, 0], wash: [880, 0, 0], bed: [400, 0, 0], living: [460, 0, 0], kitchen: [520, 0, 0], school: [580, 0, 0], wheel: [640, 0, 0], dump: [700, 0, 0] };
