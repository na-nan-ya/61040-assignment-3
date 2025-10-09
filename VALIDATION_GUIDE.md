# LLM Output Validation System

## Overview

The MapSummaryGeneration module includes a comprehensive validation system to ensure LLM-generated summaries are accurate, consistent, and don't hallucinate information.

## Validation Features

### 1. Hallucinated Region Detection ✅

**Problem**: LLM might mention body regions that weren't in the input data.

**Example of Error**:
- Input: "Neck" pain
- Bad Output: "Your neck and back pain..."
- Detection: `Hallucinated region(s) detected: "back" (expected only "Neck")`

**How it works**:
- Maintains a list of common body regions
- Checks if summary mentions regions other than the specified one
- Handles partial matches (e.g., "lower back" vs "back")

**Action**: Triggers retry or falls back to generic summary

---

### 2. Missing Numerical Data Detection ✅

**Problem**: LLM might omit key statistics (frequency or median score).

**Example of Error**:
- Input: frequency=4, medianScore=6.5
- Bad Output: "You experienced some lower back pain"
- Detection: `Missing frequency data: Expected mention of 4 entries/occurrences`

**How it works**:
- Searches for numeric values in both digit and word form
- Allows reasonable variations (e.g., "4", "four", "4 times", "4 entries")
- For scores, accepts both exact and rounded values

**Action**: Triggers retry or falls back to generic summary

---

### 3. Logical Consistency Checking ⚠️

**Problem**: LLM might use descriptors that contradict the actual numbers.

**Example of Warning**:
- Input: frequency=10 (high)
- Bad Output: "You had a few instances of pain..."
- Detection: `Inconsistent frequency: frequency is 10 (high) but summary uses "low" descriptor`

**Frequency thresholds**:
- Low: ≤2 entries
- Moderate: 3-6 entries
- High: ≥7 entries

**Severity thresholds**:
- Mild: ≤3/10
- Moderate: 4-6/10
- Severe: ≥7/10

**Action**: Generates warning but allows summary (doesn't trigger retry)

---

### 4. Medical Advice Detection ⚠️

**Problem**: LLM might provide medical advice, which violates the tool's purpose.

**Detected phrases**:
- "should see a doctor"
- "consult a physician"
- "seek medical attention"
- "diagnosis"
- "medication"
- "this indicates"
- "you may have"
- And more...

**Example of Warning**:
- Bad Output: "This could be a sign of chronic pain. You should see a doctor."
- Detection: `Possible medical advice detected: "could be a sign of", "should see a doctor"`

**Action**: Generates warning (strict prompts should prevent this)

---

### 5. Length Validation ✅ ⚠️

**Checks**:
- **Too short** (< 20 characters): Error - triggers retry
- **Too verbose** (> 1000 characters): Warning only

**Purpose**: Ensures summaries are meaningful and concise

---

## Validation Results

Each validation returns:

```typescript
interface ValidationResult {
    isValid: boolean;      // false if any errors exist
    errors: string[];      // Critical issues - trigger retry
    warnings: string[];    // Non-critical issues - logged only
}
```

---

## Configuration

Enable/disable validation:

```typescript
const summary = await generator.summariseWithAI(
    period,
    region,
    frequency,
    medianScore,
    config,
    {
        enableValidation: true  // Default: true
    }
);
```

---

## Example Validation Flow

### Scenario 1: Hallucinated Region

```
Input: region="Neck", frequency=3, medianScore=6

LLM Output 1 (attempt 1):
"Your neck and back pain was recorded 3 times with a score of 6/10."

⚠️ Validation Error: Hallucinated region "back"
🔄 Retrying (attempt 2/2)...

LLM Output 2 (attempt 2):
"Your neck pain was recorded 3 times with a score of 6/10."

✅ Validation Passed
```

### Scenario 2: Inconsistent Descriptor

```
Input: region="Lower Back", frequency=10, medianScore=6

LLM Output:
"You had a few instances of lower back pain with a median score of 6/10."

⚠️ Warning: Inconsistent frequency (10 is high but uses "few")
✅ Validation Passed (with warnings)
```

### Scenario 3: Missing Data

```
Input: region="Shoulders", frequency=4, medianScore=5

LLM Output 1 (attempt 1):
"You experienced shoulder discomfort during this period."

⚠️ Validation Error: Missing frequency data
⚠️ Validation Error: Missing median score data
🔄 Retrying (attempt 2/3)...

LLM Output 2 (attempt 2):
"You recorded 4 instances of shoulder pain with a median score of 5/10."

✅ Validation Passed
```

---

## Benefits

1. **Data Integrity**: Ensures summaries accurately reflect input data
2. **Consistency**: Detects logical contradictions
3. **Safety**: Prevents medical advice from being generated
4. **Reliability**: Automatic retries improve output quality
5. **Transparency**: Clear error messages for debugging

---

## Best Practices

1. **Keep validation enabled** (default) for production use
2. **Monitor warnings** - they indicate potential prompt improvements
3. **Review error patterns** - recurring errors suggest prompt refinement needed
4. **Use fallback summaries** as a safety net
5. **Log validation results** for quality monitoring

---

## Technical Details

### Region Detection
- Case-insensitive matching
- Handles compound regions (e.g., "lower back")
- Smart filtering of substring matches

### Number Detection
- Supports digits (4) and words (four)
- Allows common variations (4 times, 4 entries)
- Tolerates rounding for decimal scores

### Consistency Logic
- Rule-based thresholds
- Keyword matching for descriptors
- Clear categorization (low/moderate/high)

---

## Future Enhancements

Potential additions:
- Sentiment analysis validation
- Pattern detection across multiple summaries
- ML-based consistency checking
- Custom validation rules per audience type
- Validation metrics and scoring
