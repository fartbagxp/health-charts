import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetch COVID-19 hospitalization data from CDC
 * Dataset: Weekly United States COVID-19 Hospitalization Metrics by Jurisdiction
 * Dataset ID: 7dk4-g6vg (ARCHIVED - contains historical 2020-2023 data)
 */
async function fetchCovidData() {
  console.log('Fetching COVID-19 hospitalization data...');

  const url = 'https://data.cdc.gov/resource/7dk4-g6vg.json?' +
    '$where=state=\'USA\'' +
    '&$order=week_ending_date ASC' +
    '&$limit=500';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform to match project format
    const transformed = data.map(d => ({
      date: d.week_ending_date.split('T')[0],
      hospitalizations: Math.round(parseFloat(d.total_adm_all_covid_confirmed || 0)),
      avgDaily: parseFloat(d.avg_adm_all_covid_confirmed || 0).toFixed(2)
    }));

    // Save to file
    const outputPath = path.join(DATA_DIR, 'covid-hospitalizations.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));

    console.log(`✓ Fetched ${transformed.length} COVID-19 data points`);
    console.log(`  Date range: ${transformed[0].date} to ${transformed[transformed.length - 1].date}`);
    console.log(`  Saved to: ${outputPath}`);

    return transformed;
  } catch (error) {
    console.error('✗ Error fetching COVID-19 data:', error.message);
    throw error;
  }
}

/**
 * Fetch RSV hospitalization data from CDC
 * Dataset: Weekly Rates of Laboratory-Confirmed RSV Hospitalizations
 * Dataset ID: 29hc-w46k
 */
async function fetchRSVData() {
  console.log('\nFetching RSV hospitalization data...');

  // Fetch multiple seasons
  const seasons = ['2020-21', '2021-22', '2022-23', '2023-24'];
  const whereClause = seasons.map(s => `season='${s}'`).join(' OR ');

  const url = 'https://data.cdc.gov/resource/29hc-w46k.json?' +
    `$where=(${whereClause}) AND state='RSV-NET' AND age_category='All' AND sex='All' AND race='All'` +
    '&$order=week_ending_date ASC' +
    '&$limit=2000';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform to match project format
    const transformed = data
      .filter(d => d.week_ending_date) // Filter out entries without dates
      .map(d => ({
        date: d.week_ending_date,
        rate: parseFloat(d.rate || 0),
        cumulativeRate: parseFloat(d.cumulative_rate || 0),
        season: d.season
      }));

    // Save to file
    const outputPath = path.join(DATA_DIR, 'rsv-hospitalizations.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));

    console.log(`✓ Fetched ${transformed.length} RSV data points`);
    console.log(`  Seasons: ${seasons.join(', ')}`);
    if (transformed.length > 0) {
      console.log(`  Date range: ${transformed[0].date} to ${transformed[transformed.length - 1].date}`);
    }
    console.log(`  Saved to: ${outputPath}`);

    return transformed;
  } catch (error) {
    console.error('✗ Error fetching RSV data:', error.message);
    throw error;
  }
}

/**
 * Fetch combined respiratory virus data from NHSN
 * This is a newer dataset that includes COVID-19, Flu, and RSV together
 */
async function fetchRespiratoryData() {
  console.log('\nFetching combined respiratory virus data...');

  const url = 'https://data.cdc.gov/resource/ua7e-t2fy.json?' +
    '$where=jurisdiction=\'USA\'' +
    '&$order=week_ending_date DESC' +
    '&$limit=100';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform to structured format
    const transformed = data.map(d => ({
      date: d.week_ending_date?.split('T')[0],
      covid: {
        admissions: parseFloat(d.totalconfcovidadmissions || 0),
        bedCoverage: parseFloat(d.totalcovbeds || 0)
      },
      flu: {
        admissions: parseFloat(d.totalconffluadmissions || 0)
      },
      rsv: {
        admissions: parseFloat(d.totalconfrsvadmissions || 0)
      }
    })).filter(d => d.date); // Filter out entries without dates

    // Save to file
    const outputPath = path.join(DATA_DIR, 'respiratory-combined.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));

    console.log(`✓ Fetched ${transformed.length} combined respiratory data points`);
    if (transformed.length > 0) {
      console.log(`  Date range: ${transformed[transformed.length - 1].date} to ${transformed[0].date}`);
    }
    console.log(`  Saved to: ${outputPath}`);

    return transformed;
  } catch (error) {
    console.error('✗ Error fetching combined respiratory data:', error.message);
    console.error('  This may be a newer dataset with limited availability');
    return null;
  }
}

/**
 * Generate summary statistics
 */
function generateSummary(covidData, rsvData, respiratoryData) {
  console.log('\n' + '='.repeat(60));
  console.log('DATA FETCH SUMMARY');
  console.log('='.repeat(60));

  console.log('\nCOVID-19 Data:');
  if (covidData && covidData.length > 0) {
    const maxHosp = Math.max(...covidData.map(d => d.hospitalizations));
    const maxDate = covidData.find(d => d.hospitalizations === maxHosp);
    console.log(`  Total records: ${covidData.length}`);
    console.log(`  Peak hospitalizations: ${maxHosp.toLocaleString()} (week of ${maxDate.date})`);
  }

  console.log('\nRSV Data:');
  if (rsvData && rsvData.length > 0) {
    const maxRate = Math.max(...rsvData.map(d => d.rate));
    const maxDate = rsvData.find(d => d.rate === maxRate);
    console.log(`  Total records: ${rsvData.length}`);
    console.log(`  Peak rate: ${maxRate} per 100,000 (week of ${maxDate.date}, ${maxDate.season})`);
  }

  console.log('\nCombined Respiratory Data:');
  if (respiratoryData && respiratoryData.length > 0) {
    console.log(`  Total records: ${respiratoryData.length}`);
    console.log(`  Latest week: ${respiratoryData[0].date}`);
  } else {
    console.log('  Not available (likely newer dataset)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Next steps:');
  console.log('  1. Review the generated JSON files in public/data/');
  console.log('  2. Update chart.js to handle the new data formats');
  console.log('  3. Add visualization selectors for different viruses');
  console.log('  4. See DATA_SOURCES.md for detailed API documentation');
  console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('\nCDC Data Fetcher');
  console.log('='.repeat(60) + '\n');
  console.log('Fetching data from CDC data.cdc.gov Socrata API...\n');

  try {
    const covidData = await fetchCovidData();
    const rsvData = await fetchRSVData();
    const respiratoryData = await fetchRespiratoryData();

    generateSummary(covidData, rsvData, respiratoryData);

    console.log('✓ Data fetch complete!\n');
  } catch (error) {
    console.error('\n✗ Data fetch failed:', error.message);
    process.exit(1);
  }
}

main();
