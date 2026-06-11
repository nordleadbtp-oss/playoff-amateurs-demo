export type StoredPlayer = {
  id: number;
  initials: string;
  name: string;
  color: string;
  paid: boolean;
  isMe?: boolean;
};

export type Reservation = {
  id: string;
  terrainId: string;
  slot: string;
  date: string;
  players: StoredPlayer[];
  confirmed: boolean;
  updatedAt: number;
};

const LS_LIST = "playoff_reservations";

export function makeId(terrainId: string, date: string, slot: string) {
  return `${terrainId}_${date}_${slot}`;
}

export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_LIST);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Reservation[]) : [];
  } catch {
    return [];
  }
}

export function upsertReservation(r: Omit<Reservation, "id" | "updatedAt"> & { id?: string }) {
  if (typeof window === "undefined") return;
  if (!r.terrainId || !r.slot || !r.date) return;
  try {
    const list = getReservations();
    const id = r.id ?? makeId(r.terrainId, r.date, r.slot);
    const next: Reservation = {
      id,
      terrainId: r.terrainId,
      slot: r.slot,
      date: r.date,
      players: r.players ?? [],
      confirmed: !!r.confirmed,
      updatedAt: Date.now(),
    };
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) list[idx] = next;
    else list.push(next);
    localStorage.setItem(LS_LIST, JSON.stringify(list));
  } catch {}
}

export function removeReservation(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getReservations().filter((x) => x.id !== id);
    localStorage.setItem(LS_LIST, JSON.stringify(list));
  } catch {}
}
