# NPM Commands Reference

## MapSummaryGeneration Module

### Main Commands

#### Run Full Test Suite
```bash
npm start
```
Runs all tests including:
- API key validation
- Basic summary generation
- Tone and audience variations
- Error handling tests

#### Quick Development Mode
```bash
npm run map-summary
```
Runs tests using ts-node (faster, no build step)

---

### Specific Test Suites

#### API Key Validation Test
```bash
npm run map-validation
```
**Tests:**
- Validates API key format
- Checks API key functionality
- Simple test API call

**Example Output:**
```
🔑 Testing API Key Validation:
Current API Key (first 10 chars): AIzaSyBWB8...
API Key length: 39
API Key starts with AIzaSy: true
✅ API Key is working!
```

---

#### Basic Summary Generation Test
```bash
npm run map-basic
```
**Tests:**
- Core summary generation functionality
- Multiple body regions (Lower Back, Shoulders, Neck)
- Different time periods (Last Week, This Month)
- Validation system in action
- Convenience functions

**Example Output:**
```
📊 Analyzing Lower Back pain for Last Week:
   - Frequency: 4 entries
   - Median Score: 6.5/10
   - AI Summary: "It looks like you've recorded lower back pain 4 times..."
```

**Shows validation working:**
```
⚠️ Validation failed for LLM output:
  - ERROR: Hallucinated region(s) detected: "back" (expected only "Neck")
🔄 Retrying due to validation errors...
```

---

#### Tone and Audience Variations Test
```bash
npm run map-tones
```
**Tests:**
- 5 different tones (Compassionate, Professional, Clinical, Encouraging, Factual)
- 5 different audiences (Patient, Doctor, Caregiver, Family, Research)
- 7+ tone/audience combinations
- Custom summary convenience function

**Example Output:**
```
📋 Compassionate for Patient:
   "Looking at your pain tracking from last week..."

📋 Clinical for Doctor:
   "**Clinical Summary: Pain Tracking Data**
   **Total Pain Entries Recorded:** 4
   **Median Pain Intensity Score:** 6.5/10"

📋 Factual for Research:
   "**Quantitative Analysis:**
   A total of four distinct pain entries were recorded..."
```

---

### DayPlanner Module (Original)

#### Manual Scheduling
```bash
npm run manual
```
Manual scheduling only

#### LLM Scheduling
```bash
npm run llm
```
LLM-assisted scheduling only

#### Mixed Scheduling
```bash
npm run mixed
```
Combined manual + LLM scheduling

#### Full DayPlanner Test
```bash
npm run dayplanner
```
Complete dayplanner test suite

---

### Build Commands

#### TypeScript Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in `dist/` folder

#### Development Mode
```bash
npm run dev
```
Runs map-summary tests in development mode (ts-node)

#### Full Test Suite
```bash
npm test
```
Builds and runs complete test suite (same as `npm start`)

---

## Quick Reference Table

| Command | Module | Purpose | Speed |
|---------|--------|---------|-------|
| `npm start` | Map Summary | Full test suite | Medium |
| `npm run map-summary` | Map Summary | Dev mode | Fast ⚡ |
| `npm run map-validation` | Map Summary | API key test | Very Fast ⚡⚡ |
| `npm run map-basic` | Map Summary | Core features | Medium |
| `npm run map-tones` | Map Summary | Tone/audience test | Slow 🐌 |
| `npm run manual` | DayPlanner | Manual mode | Medium |
| `npm run llm` | DayPlanner | LLM mode | Medium |
| `npm run mixed` | DayPlanner | Mixed mode | Medium |
| `npm run build` | Both | Compile TS | Fast |

---

## Usage Examples

### Check if API key works
```bash
npm run map-validation
```

### See all tone variations
```bash
npm run map-tones
```

### Quick development testing
```bash
npm run map-summary
```

### Production-like testing
```bash
npm start
```

---

## Tips

1. **First time setup**: Run `npm install` to install dependencies
2. **Quick testing**: Use `npm run map-validation` to verify setup
3. **Development**: Use `npm run map-summary` for fast iterations
4. **Before commit**: Run `npm start` to ensure everything works
5. **Specific features**: Use individual test commands for focused testing

---

## Environment Variables

Set your Gemini API key:

```bash
# Option 1: Environment variable
export GEMINI_API_KEY="your-api-key-here"

# Option 2: config.json (recommended)
# Edit config.json and add your API key

# Option 3: .env file
echo 'GEMINI_API_KEY=your-api-key-here' > .env
```

---

## Troubleshooting

### "API key not valid" errors
```bash
# Check your API key
npm run map-validation

# Verify config.json exists and has your key
cat config.json
```

### Build errors
```bash
# Clean build
rm -rf dist/
npm run build
```

### TypeScript errors
```bash
# Reinstall dependencies
rm -rf node_modules/
npm install
```
