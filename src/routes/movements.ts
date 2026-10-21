import type { Movement } from '@/types/movement';
import { api } from './api';

export async function getMovements(yardId?: string) {
  const { data } = await api.get<Movement[]>('/movements', { params: yardId ? { yardId } : undefined });
  return data;
}

export async function getMovement(movementId: string) {
  const { data } = await api.get<Movement>(`/movements/${movementId}`);
  return data;
}

export async function createMovement(movement: Movement) {
  const { data } = await api.post<Movement>('/movements', movement);
  return data;
}
