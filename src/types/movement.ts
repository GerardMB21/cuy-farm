export enum TypeMovement {
  add = 'add',
  transfer = 'transfer',
  takeAway = 'takeAway',
  sold = 'sold'
}

export enum TypeGender {
  male = 'male',
  female = 'female',
  notDefined = 'notDefined'
}

export type Movement = {
  fromYardId: string
  toYardId?: string | null
  type: TypeMovement
  gender: TypeGender
  quantity: number
  price?: number | null
  reason?: string | null
}
