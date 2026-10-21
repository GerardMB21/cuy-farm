export type Yard = {
  id?: string | null
  name: string
  initialMales?: number | null
  initialFemales?: number | null
  initialBabies?: number | null
  totalMales?: number | null
  totalFemales?: number | null
  totalBabies?: number | null
  // Calculado por el backend, no se envía al crear o actualizar
  total?: number | null
}
