# SpendWatcher icon map

The app uses [`react-icons`](https://react-icons.github.io/react-icons/) — Font Awesome solid (`Fa*`) and Material Design (`Md*`). This kit ships a **self-hosted inline-SVG set** (`assets/icons.js`) so glyphs render offline and in screenshot captures. Names below are the `swIcon()` / `<Icon name>` keys; ⚑ marks a Material-origin glyph approximated with a close filled equivalent.

```html
<script src="assets/icons.js"></script>
<!-- then: -->
<span data-icon></span>
<script>document.querySelector('[data-icon]').innerHTML = swIcon('house', 20, '#fff')</script>
```

Usage: `swIcon('house', 20, '#fff')` returns an `<svg>` string.

## Navigation
| Route | react-icon | icon key |
|---|---|---|
| Dashboard | `FaHome` | `house` |
| Savings | `MdSavings` ⚑ | `piggy-bank` |
| Recurring spending | `FaHistory` | `history` |
| Trends | `FaChartPie` | `chart-pie` |
| Trips | `FaPlaneDeparture` | `plane` |

## Misc UI
| Use | react-icon | FA solid class |
|---|---|---|
| Row affordance | `FaChevronRight` | `fa-chevron-right` |
| Alert | `FaInfoCircle` | `fa-circle-info` |
| Recurring badge | `MdRefresh` ⚑ | `fa-arrows-rotate` |
| Log / add | — | `fa-plus` |
| Gain / loss arrows | — | `fa-caret-up` / `fa-caret-down` |
| Account menu | — | `fa-ellipsis` |

## Spending categories — icon + fixed color
Each category has ONE color (`--theme-color-spend-category-<ID>`) and is rendered as a 12px-rounded square filled with that color, glyph knocked out near-white. FA solid class is the kit's choice; ⚑ marks a Material-origin glyph remapped to FA.

| Category | Color | react-icon | FA solid class |
|---|---|---|---|
| AIRFARE | `#49c165` | `MdLocalAirport` ⚑ | `fa-plane-up` |
| BUSINESS | `#ae9209` | `MdBusinessCenter` ⚑ | `fa-briefcase` |
| CANNABIS | `#4c8d1b` | `FaCannabis` | `fa-cannabis` |
| CLOTHING | `#cebe79` | `FaTshirt` | `fa-shirt` |
| DRINKS | `#50667f` | `MdSportsBar` ⚑ | `fa-beer-mug-empty` |
| EDUCATION | `#48bcb0` | `MdSchool` ⚑ | `fa-graduation-cap` |
| ENTERTAINMENT | `#de2682` | `MdMovieFilter` ⚑ | `fa-film` |
| EV_CHARGING | `#0dcd1d` | `FaChargingStation` | `fa-charging-station` |
| FITNESS | `#3f3f3f` | `MdFitnessCenter` ⚑ | `fa-dumbbell` |
| FUEL | `#b77b43` | `FaGasPump` | `fa-gas-pump` |
| GAMES | `#4884bc` | `MdVideogameAsset` ⚑ | `fa-gamepad` |
| GIFTS | `#b191ff` | `FaGift` | `fa-gift` |
| GROOMING | `#972acf` | `MdContentCut` ⚑ | `fa-scissors` |
| GROCERIES | `#82aa46` | `MdLocalGroceryStore` ⚑ | `fa-cart-shopping` |
| HEALTH | `#a30015` | `MdHealing` ⚑ | `fa-heart-pulse` |
| HOBBY | `#df81c1` | `MdBrush` ⚑ | `fa-paintbrush` |
| HOUSING | `#577590` | `FaHome` | `fa-house` |
| INSURANCE | `#bc4848` | `MdShield` ⚑ | `fa-shield-halved` |
| LODGING | `#a4433d` | `MdHotel` ⚑ | `fa-hotel` |
| MATERIAL_ITEMS | `#f20d2b` | `MdShoppingBag` ⚑ | `fa-bag-shopping` |
| NICOTINE | `#707670` | `FaSmoking` | `fa-smoking` |
| OTHER | `#776871` | `FaDollarSign` | `fa-dollar-sign` |
| PETS | `#888d53` | `MdPets` ⚑ | `fa-paw` |
| RESTAURANTS | `#ff8442` | `MdFastfood` ⚑ | `fa-utensils` |
| TAXES | `#f15f62` | `FaMoneyBillAlt` | `fa-money-bill` |
| TRANSPORTATION | `#e5ad04` | `MdTrain` ⚑ | `fa-train` |
| TREATS | `#f1b7df` | `FaCookieBite` | `fa-cookie-bite` |
| UTILITIES | `#2ba1d4` | `MdWaterDrop` ⚑ | `fa-bolt` |
| VEHICLE | `#fc440f` | `FaCar` | `fa-car` |

## Account categories
| Category | Color | react-icon | FA solid class |
|---|---|---|---|
| CHECKING | `#4884bc` | `MdAccountBalance` ⚑ | `fa-building-columns` |
| SAVINGS | `#f20d2b` | `MdSavings` ⚑ | `fa-piggy-bank` |
| INVESTING | `#84b63a` | `MdTrendingUp` ⚑ | `fa-arrow-trend-up` |
| BONDS | `#e87217` | `MdReceiptLong` ⚑ | `fa-receipt` |
