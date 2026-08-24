// Canonical registry of the CDC (and NCI) surveillance systems behind every
// chart. This is the single source of truth for the "Data Sources" section and
// DATA_SOURCES.md, and mirrors what fartbagxp/health archives. Each entry names
// the collecting program, how the data is collected, the CDC center that runs
// it, the CDC system name, how often it refreshes, and what it contains.
//
// Fields:
//   system   — the CDC/NCI system name (WONDER, NHSN, RSV-NET, NWSS, ...)
//   program  — the full program that collects the data
//   collection — how it is collected (survey, state/lab reporting, wastewater, ...)
//   center   — the center/agency that runs it (NCHS, NCIRD, NCEZID, CFA, ...)
//   frequency — how often it is collected/published
//   contents — what it measures (what the charts draw from it)
//   url      — canonical landing page or dataset

export const DATA_SOURCES = [
  {
    system: 'NHSN',
    program: 'National Healthcare Safety Network — Hospital Respiratory Data',
    collection: 'Mandatory electronic reporting from acute-care hospitals',
    center: 'NCEZID — Division of Healthcare Quality Promotion',
    frequency: 'Weekly',
    contents: 'COVID-19, influenza, and RSV new hospital admissions, inpatient/ICU census, and bed occupancy',
    url: 'https://data.cdc.gov/d/ua7e-t2fy'
  },
  {
    system: 'RESP-NET (COVID-NET · RSV-NET · FluSurv-NET)',
    program: 'Respiratory Virus Hospitalization Surveillance Network',
    collection: 'Population-based surveillance: lab-confirmed hospitalizations found through EIP/IHSP catchment labs and medical-record review',
    center: 'NCIRD — respiratory surveillance programs',
    frequency: 'Weekly (seasonal)',
    contents: 'Lab-confirmed influenza, COVID-19, and RSV hospitalization rates by age, sex, and race',
    url: 'https://www.cdc.gov/resp-net/dashboard/index.html'
  },
  {
    system: 'NVSS (Vital Statistics Rapid Release)',
    program: 'National Vital Statistics System — provisional mortality & natality',
    collection: 'Death and birth certificates filed by state and jurisdiction vital-records offices',
    center: 'NCHS — Division of Vital Statistics',
    frequency: 'Weekly to quarterly (provisional)',
    contents: 'Provisional mortality rates, share of deaths from COVID/flu/RSV, quarterly birth indicators, monthly deaths by cause, life expectancy',
    url: 'https://www.cdc.gov/nchs/nvss/index.htm'
  },
  {
    system: 'WONDER',
    program: 'Wide-ranging ONline Data for Epidemiologic Research, over NVSS & NNDSS',
    collection: 'Vital records (birth/death certificates) and notifiable-disease case counts, exposed as a query system',
    center: 'NCHS (platform)',
    frequency: 'Annual (long historical runs)',
    contents: 'Births since 1995, deaths by cause since 1979, maternal mortality, and Lyme/tick-borne cases',
    url: 'https://wonder.cdc.gov/'
  },
  {
    system: 'NIS (Adult COVID / Fall Respiratory modules)',
    program: 'National Immunization Survey',
    collection: 'Random-digit-dial and probability-panel telephone survey',
    center: 'NCIRD — Immunization Services Division',
    frequency: 'Weekly (respiratory season)',
    contents: 'Flu, COVID-19, and RSV vaccination coverage among adults, national and by state',
    url: 'https://data.cdc.gov/d/5c6r-xi2t'
  },
  {
    system: 'SchoolVaxView',
    program: 'School Vaccination Assessment Program',
    collection: 'State and local immunization programs report kindergarten school-entry records',
    center: 'NCIRD — Immunization Services Division',
    frequency: 'Annual (school year)',
    contents: 'Kindergarten MMR/DTaP/polio/HepB/varicella coverage and exemption rates, national and by state',
    url: 'https://data.cdc.gov/d/ijqb-a7ye'
  },
  {
    system: 'NHSN — Long-Term Care Facility component',
    program: 'National Healthcare Safety Network (nursing homes)',
    collection: 'Nursing-home facilities report resident cases and vaccination',
    center: 'NCEZID — Division of Healthcare Quality Promotion',
    frequency: 'Weekly',
    contents: 'Nursing-home resident COVID/flu/RSV cases and up-to-date vaccination rates',
    url: 'https://data.cdc.gov/d/tscn-ryh9'
  },
  {
    system: 'NWSS',
    program: 'National Wastewater Surveillance System',
    collection: 'RNA/DNA quantification from community wastewater samples at treatment plants (environmental sampling + labs)',
    center: 'CDC NWSS program (OPHDST, with NCIRD/CFA analytics)',
    frequency: 'Weekly',
    contents: 'SARS-CoV-2, influenza A, RSV, measles, H5 avian flu, and mpox concentrations plus interpreted activity levels',
    url: 'https://www.cdc.gov/nwss/about.html'
  },
  {
    system: 'BEAM Dashboard',
    program: 'Bacteria, Enterics, Amoeba and Mycotics surveillance',
    collection: 'State and local public-health laboratories report pathogen isolates',
    center: 'NCEZID — Division of Foodborne, Waterborne, and Environmental Diseases',
    frequency: 'Monthly',
    contents: 'Salmonella, STEC, Campylobacter, Shigella, and Vibrio human isolate counts',
    url: 'https://www.cdc.gov/beam/dashboard/index.html'
  },
  {
    system: 'WISQARS',
    program: 'Web-based Injury Statistics Query and Reporting System',
    collection: 'Compiled from NVSS death certificates (fatal injury) and related systems',
    center: 'NCIPC — National Center for Injury Prevention and Control',
    frequency: 'Annual, with monthly provisional',
    contents: 'Firearm, suicide, homicide, and drug-overdose death rates by geography',
    url: 'https://wisqars.cdc.gov/'
  },
  {
    system: 'NCHS DQS (Health, United States)',
    program: 'NCHS Data Query System over NVSS and the CMS National Health Expenditure Accounts',
    collection: 'Vital records and administrative/financial accounts (national surveys for other topics)',
    center: 'NCHS',
    frequency: 'Annual',
    contents: 'Age-adjusted drug-overdose death rates by opioid type, and national health spending per capita',
    url: 'https://www.cdc.gov/nchs/dqs/'
  },
  {
    system: 'Epidemic Trends (Rt nowcast)',
    program: 'Center for Forecasting and Outbreak Analytics — Epidemic Trends',
    collection: 'Model-based nowcast synthesizing ED-visit, wastewater, and hospitalization signals',
    center: 'CFA — Center for Forecasting and Outbreak Analytics',
    frequency: 'Several times weekly (nowcast)',
    contents: 'Growing/declining epidemic-trend classification per state for COVID-19, influenza, and RSV',
    url: 'https://data.cdc.gov/d/5dqz-y4ea'
  },
  {
    system: 'Measles Surveillance (NNDSS)',
    program: 'National Notifiable Diseases Surveillance System — measles',
    collection: 'Case reporting from state and local health departments',
    center: 'NCIRD — Division of Viral Diseases (via NNDSS)',
    frequency: 'Weekly (annual history since 1962)',
    contents: 'Confirmed U.S. measles cases, weekly since 2022 and annually since 1962',
    url: 'https://www.cdc.gov/measles/data-research/index.html'
  },
  {
    system: 'PLACES',
    program: 'PLACES: Local Data for Better Health',
    collection: 'Small-area estimates modeled from the Behavioral Risk Factor Surveillance System (BRFSS) telephone survey',
    center: 'NCCDPHP — National Center for Chronic Disease Prevention and Health Promotion',
    frequency: 'Annual',
    contents: 'County-level chronic-disease prevalence (obesity, diabetes, high blood pressure, and more)',
    url: 'https://data.cdc.gov/d/swc5-untb'
  },
  {
    system: 'SEER*Explorer',
    program: 'Surveillance, Epidemiology, and End Results Program',
    collection: 'Population-based cancer registries',
    center: 'National Cancer Institute (NCI) — part of NIH, not CDC',
    frequency: 'Annual',
    contents: 'Cancer incidence and U.S. mortality by site, sex, race, and age',
    url: 'https://seer.cancer.gov/statistics-network/explorer/'
  }
];
