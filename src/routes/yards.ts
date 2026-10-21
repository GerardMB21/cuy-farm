import type { Yard } from '@/types/yard';
import { api } from './api';

export type YardCreate = Pick<Yard, 'name' | 'initialMales' | 'initialFemales' | 'initialBabies'>

export async function getYards() {
  const { data } = await api.get<Yard[]>('/yards');
  return data;
}

export async function getYard(yardId: string) {
  const { data } = await api.get<Yard>(`/yards/${yardId}`);
  return data;
}

export async function createYard(yard: YardCreate) {
  const { data } = await api.post<Yard>('/yards', yard);
  return data;
}

export async function updateYard(yardId: string, yard: Pick<Yard, 'name'>) {
  const { data } = await api.patch<Yard>(`/yards/${yardId}`, yard);
  return data;
}

export async function deleteYard(yardId: string) {
  await api.delete(`/yards/${yardId}`);
}
