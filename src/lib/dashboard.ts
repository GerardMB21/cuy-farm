import { TypeGender, TypeMovement, type Movement } from '@/types/movement';
import type { Yard } from '@/types/yard';

export type YardSummary = {
  id: string
  name: string
  total: number
  males: number
  females: number
  notDefined: number
  deaths: number
  births: number
  income: number
}

// Un add de crías (sexo sin definir) se considera nacimiento
const isBirth = (movement: Movement) =>
  movement.type === TypeMovement.add && movement.genderFrom === TypeGender.notDefined;
const isDeath = (movement: Movement) => movement.type === TypeMovement.dead;
const isSale = (movement: Movement) => movement.type === TypeMovement.sold;

const sumQuantity = (movements: Movement[]) => movements.reduce((acc, m) => acc + m.quantity, 0);
// El precio llega en centavos
const sumPrice = (movements: Movement[]) => movements.reduce((acc, m) => acc + (m.price ?? 0), 0) / 100;

export function summarize(yards: Yard[], movements: Movement[]) {
  const yardSummaries: YardSummary[] = yards.map((yard) => {
    const own = movements.filter((m) => m.fromYardId === yard.id);
    return {
      id: yard.id ?? '',
      name: yard.name,
      total: yard.total ?? 0,
      males: yard.totalMales ?? 0,
      females: yard.totalFemales ?? 0,
      notDefined: yard.totalBabies ?? 0,
      deaths: sumQuantity(own.filter(isDeath)),
      births: sumQuantity(own.filter(isBirth)),
      income: sumPrice(own.filter(isSale)),
    };
  });

  return {
    totalPopulation: yards.reduce((acc, yard) => acc + (yard.total ?? 0), 0),
    salesRevenue: sumPrice(movements.filter(isSale)),
    births: sumQuantity(movements.filter(isBirth)),
    deaths: sumQuantity(movements.filter(isDeath)),
    yards: yardSummaries,
  };
}
