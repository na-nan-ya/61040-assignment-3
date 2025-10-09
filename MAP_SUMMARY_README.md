
# MapSummaryGeneration Module

A TypeScript module for generating natural language summaries of body map pain data using Google Gemini API.

## Features

- **AI-Powered Summaries**: Uses Google Gemini API to generate empathetic, patient-friendly summaries
- **Customizable Tone & Audience**: Generate summaries with different tones (compassionate, professional, clinical, encouraging, factual) for different audiences (patient, doctor, caregiver, family, research)
- **Robust Error Handling**: Includes retry logic and fallback to generic summaries when API fails
- **Statistical Analysis**: Computes frequency and median pain scores for body regions
- **Modular Design**: Clean separation between AI calls and core logic
- **TypeScript Support**: Full type safety and IntelliSense support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set API Key

Set your Google Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Or modify the test file to include your API key directly.

### 3. Run the Test Example

```bash
npm run map-summary
```

## Usage

### Basic Usage

```typescript
import { 
    MapSummaryGeneration, 
    Config, 
    SummaryTone, 
    SummaryAudience 
} from './map-summary-generation';

const config: Config = {
    apiKey: process.env.GEMINI_API_KEY || 'your-api-key-here'
};

const generator = new MapSummaryGeneration(config);

// Calculate statistics for a region
const summary = generator.sumRegion('Last Week', painDataMaps, 'Lower Back');

// Generate AI summary with default tone (compassionate) and audience (patient)
const aiSummary = await generator.summariseWithAI(
    'Last Week',
    'Lower Back',
    summary.frequency,
    summary.medianScore,
    config
);

// Generate summary with custom tone and audience
const doctorSummary = await generator.summariseWithAI(
    'Last Week',
    'Lower Back',
    summary.frequency,
    summary.medianScore,
    config,
    {
        tone: SummaryTone.CLINICAL,
        audience: SummaryAudience.DOCTOR
    }
);
```

### Convenience Functions

```typescript
import { 
    createMapSummaryGenerator, 
    generateQuickSummary, 
    generateCustomSummary,
    SummaryTone,
    SummaryAudience 
} from './map-summary-generation';

// Create generator instance
const generator = createMapSummaryGenerator(config);

// Quick summary generation (default: compassionate tone, patient audience)
const summary = await generateQuickSummary(
    'Last Week',
    'Lower Back',
    4,
    6.5,
    config
);

// Custom summary with specific tone and audience
const encouragingSummary = await generateCustomSummary(
    'This Month',
    'Neck',
    8,
    6,
    config,
    SummaryTone.ENCOURAGING,
    SummaryAudience.PATIENT
);
```

### Tone and Audience Options

#### Tones
- **`COMPASSIONATE`**: Empathetic, supportive language
- **`PROFESSIONAL`**: Professional but accessible tone
- **`CLINICAL`**: Medical/clinical language with explanations
- **`ENCOURAGING`**: Positive, motivating tone
- **`FACTUAL`**: Objective, data-focused tone

#### Audiences
- **`PATIENT`**: For the patient themselves
- **`DOCTOR`**: For medical professionals
- **`CAREGIVER`**: For caregivers and care providers
- **`FAMILY`**: For family members
- **`RESEARCH`**: For research and academic purposes

## API Reference

### Classes

#### `MapSummaryGeneration`

Main class for generating pain data summaries.

**Constructor:**
- `constructor(config: Config)` - Creates a new instance with API configuration

**Methods:**
- `sumRegion(period: string, maps: PainDataMaps, region: string): RegionSummary` - Computes frequency and median score
- `summariseWithAI(period: string, region: string, frequency: number, medianScore: number, config: Config, options?: SummaryOptions): Promise<string>` - Generates AI summary

### Interfaces

#### `Config`
```typescript
interface Config {
    apiKey: string;
    maxRetries?: number;
    retryDelay?: number;
}
```

#### `BodyMap`
```typescript
interface BodyMap {
    region: string;
    painScore: number;
    timestamp: Date;
}
```

#### `RegionSummary`
```typescript
interface RegionSummary {
    region: string;
    period: string;
    frequency: number;
    medianScore: number;
    totalEntries: number;
}
```

## Error Handling

The module includes comprehensive error handling:

- **Retry Logic**: Automatically retries failed API calls (default: 3 attempts)
- **Fallback Summaries**: Generates generic summaries when API is unavailable
- **Graceful Degradation**: Continues operation even with API failures

## Example Output

### Different Tone/Audience Combinations:

#### Compassionate for Patient:
```
"Over the past week, you've logged your lower back pain 4 times, with an average discomfort 
level of about a 6.5 out of 10. This tells us that while your pain has been present, we're 
seeing a picture of your experience, and understanding this is a great step towards finding 
ways to help you feel better."
```

#### Clinical for Doctor:
```
"Clinical Summary: Lower Back Pain Data - Last Week
Patient has documented four distinct entries related to lower back pain. The median pain 
intensity reported was 6.5/10 on NRS. This frequency and intensity warrant further clinical 
evaluation, considering musculoskeletal etiologies including lumbar strain/sprain, degenerative 
disc disease, or facet joint arthropathy."
```

#### Encouraging for Patient:
```
"You've been actively tracking your lower back pain this week - that's fantastic! Your 
4 entries show great dedication to understanding your body. Your median pain score of 6.5/10 
gives us valuable insights. This proactive approach opens up exciting possibilities for 
finding what works best for you!"
```

#### Professional for Family:
```
"This past week, your loved one reported experiencing lower back pain on four separate 
occasions, with a median score of 6.5/10. This indicates significant discomfort that may 
impact daily activities. Your understanding and support are invaluable - consider encouraging 
gentle movement and rest periods."
```

#### Factual for Research:
```
"Pain Data Summary: Lower Back Region (Last Week)
Four distinct pain entries recorded. Median pain intensity: 6.5/10 on NRS. This indicates 
moderate to severe pain level within the cohort. Further analysis of raw data required for 
comprehensive statistical evaluation."
```

### Fallback Summary (when API fails):
```
"During last week, you recorded 4 pain entries for your lower back, with a median pain 
level of 6.5/10 (severe). This data helps track your pain patterns over time."
```

## Development

### Build
```bash
npm run build
```

### Run Tests

Run all tests:
```bash
npm start                # Full test suite (recommended)
npm run map-summary      # Quick dev mode (ts-node)
```

Run specific test suites:
```bash
npm run map-validation   # Test API key validation only
npm run map-tones        # Test tone and audience variations only
npm run map-basic        # Test basic summary generation only
```

### TypeScript Compilation
```bash
npx tsc
```

## Requirements

- Node.js 16+
- TypeScript 5+
- Google Gemini API key
- @google/generative-ai package

## License

MIT
