# MapSummaryGeneration

A TypeScript module for generating natural language summaries of body map pain data with customizable tone and audience options.

## Concept: MapSummaryGeneration

**Purpose**: Transform pain tracking data into readable summaries for different audiences  
**Principle**: Take structured pain data (region, frequency, scores) and generate appropriate summaries based on who will read them

### Core Features
- **Statistical Analysis**: Compute frequency and median pain scores for body regions
- **Customizable Output**: Generate summaries with different tones and for different audiences
- **Data Validation**: Ensure summaries accurately reflect input data without hallucinations
- **Error Handling**: Automatic retries with fallback to generic summaries

### Main Functions
- `sumRegion(period, maps, region)` - Calculate pain statistics for a specific region
- `summariseWithAI(period, region, frequency, medianScore, config, options)` - Generate natural language summary

## Prerequisites

- **Node.js** (version 14 or higher)
- **TypeScript** (will be installed automatically)
- **API Key** for natural language generation (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Access

Copy the template and add your API key:

```bash
cp config.json.template config.json
```

Edit `config.json`:
```json
{
  "apiKey": "YOUR_API_KEY_HERE"
}
```

Get your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run the Application

**Run all tests:**
```bash
npm start
```

**Run individual scenarios:**
```bash
npm run scenario1    # Patient self-tracking
npm run scenario2    # Caregiver monitoring
npm run scenario3    # Research data collection
```

## File Structure

```
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── config.json                   # API key configuration
├── map-summary-generation.ts     # Core module
├── map-summary-test.ts           # Test scenarios
└── dist/                         # Compiled JavaScript output
```

## Test Scenarios

The module includes three comprehensive test scenarios demonstrating real-world usage:

### Scenario 1: Patient Self-Tracking
Sarah tracks her lower back pain over 2 weeks, comparing pain levels before and after ergonomic adjustments. Generates compassionate summaries for herself and clinical summaries for her doctor.

### Scenario 2: Caregiver Monitoring
Michael tracks his mother's arthritis pain across multiple body regions. Generates summaries for caregiving, family updates, and professional healthcare reports.

### Scenario 3: Research Data Collection
Dr. Chen collects standardized pain data for clinical research, generating objective summaries suitable for academic publication and research analysis.

## Usage Example

```typescript
import { MapSummaryGeneration, SummaryTone, SummaryAudience } from './map-summary-generation';

const generator = new MapSummaryGeneration({ apiKey: 'your-api-key' });

// Calculate statistics
const stats = generator.sumRegion('Last Week', painData, 'Lower Back');

// Generate summary for patient
const patientSummary = await generator.summariseWithAI(
    'Last Week', 'Lower Back', stats.frequency, stats.medianScore, config,
    { tone: SummaryTone.COMPASSIONATE, audience: SummaryAudience.PATIENT }
);

// Generate summary for doctor
const doctorSummary = await generator.summariseWithAI(
    'Last Week', 'Lower Back', stats.frequency, stats.medianScore, config,
    { tone: SummaryTone.CLINICAL, audience: SummaryAudience.DOCTOR }
);
```

## Customization Options

**Tones**: Compassionate, Professional, Clinical, Encouraging, Factual  
**Audiences**: Patient, Doctor, Caregiver, Family, Research

## Validation System

The module automatically validates generated summaries to prevent:
- Hallucinated body regions or data
- Missing numerical information
- Inconsistent descriptors
- Medical advice or diagnoses

## Troubleshooting

### "Could not load config.json"
- Ensure `config.json` exists with your API key
- Check JSON format is correct

### API Errors
- Verify API key is correct
- Check internet connection
- Ensure API access is enabled

### Build Issues
- Run `npm run build` to compile TypeScript
- Reinstall dependencies with `npm install`

## Technical Details

- **Language**: TypeScript
- **Module System**: CommonJS
- **Testing**: Integrated scenarios with realistic workflows
- **Validation**: Automated checks for output accuracy

## License

MIT
