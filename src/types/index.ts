export interface Profile {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export interface Drug {
  id: string
  user_id: string
  name: string
  production_date: string
  shelf_life_days: number
  expiry_date: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface NewDrugInput {
  name: string
  production_date: string
  shelf_life_days: number
}

export interface UpdateDrugInput {
  name?: string
  production_date?: string
  shelf_life_days?: number
  expiry_date?: string
}
