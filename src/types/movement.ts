export enum TypeMovement {
  add = 'add',
  transfer = 'transfer',
  sold = 'sold',
  dead = 'dead',
  define = 'define'
}

export enum TypeGender {
  male = 'male',
  female = 'female',
  notDefined = 'notDefined'
}

export type Movement = {
  id?: string
  createdAt?: string
  fromYardId: string
  toYardId?: string | null
  type: TypeMovement
  genderFrom: TypeGender
  // Solo para define, nunca puede ser notDefined
  genderTo?: Exclude<TypeGender, TypeGender.notDefined> | null
  quantity: number
  price?: number | null
  reason?: string | null
}
