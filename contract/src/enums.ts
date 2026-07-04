// Single source of truth for the category enums. The api (`@type/categoryTypes`) and the
// ui (`Types/SpendingCategory`, `Types/accountTypes`) re-export from here so there's only one
// definition to keep in sync — these used to be hand-duplicated across both packages.

export enum SpendingCategory {
  AIRFARE = 'AIRFARE',
  BUSINESS = 'BUSINESS',
  CANNABIS = 'CANNABIS',
  CLOTHING = 'CLOTHING',
  DRINKS = 'DRINKS',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EV_CHARGING = 'EV_CHARGING',
  FITNESS = 'FITNESS',
  FUEL = 'FUEL',
  GAMES = 'GAMES',
  GIFTS = 'GIFTS',
  GROOMING = 'GROOMING',
  GROCERIES = 'GROCERIES',
  HEALTH = 'HEALTH',
  HOBBY = 'HOBBY',
  HOUSING = 'HOUSING',
  INSURANCE = 'INSURANCE',
  LODGING = 'LODGING',
  MATERIAL_ITEMS = 'MATERIAL_ITEMS',
  NICOTINE = 'NICOTINE',
  OTHER = 'OTHER',
  PETS = 'PETS',
  RESTAURANTS = 'RESTAURANTS',
  TAXES = 'TAXES',
  TRANSPORTATION = 'TRANSPORTATION',
  TREATS = 'TREATS',
  UTILITIES = 'UTILITIES',
  VEHICLE = 'VEHICLE',
}

export enum AccountCategory {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTING = 'INVESTING',
  BONDS = 'BONDS',
}
