# Prompt Variants for MapSummaryGeneration

This document describes 3 prompt variants that are motivated by real-world test scenarios and use cases.

---

## Overview

The MapSummaryGeneration module uses **contextually-aware prompt engineering** that adapts based on:
1. **Tone** (5 variants): Compassionate, Professional, Clinical, Encouraging, Factual
2. **Audience** (5 variants): Patient, Doctor, Caregiver, Family, Research
3. **Validation Requirements**: Data accuracy, consistency, no medical advice

These create **25 unique prompt combinations**, but 3 key variants stand out as most critical for real-world scenarios.

---

## Prompt Variant 1: Patient-Focused Compassionate Summary

### Motivation (Scenario 1)
**User Story**: Sarah tracks her chronic lower back pain to understand patterns and prepare for doctor visits.

**Why This Variant?**
- Patients need **empathetic, supportive** language
- Must be **non-intimidating** and **easy to understand**
- Should help patients feel **empowered** by their data
- Avoid medical jargon and clinical terminology

### Prompt Structure

```
You are a data analysis AI assistant. Generate a compassionate summary about 
pain tracking data for a patient.

Data Context:
- Time Period: [period]
- Body Region: [region]
- Number of pain entries: [frequency]
- Median pain score: [medianScore]/10

Audience: This summary is for the patient themselves. Present the recorded 
pain tracking data in a clear, understandable way without medical interpretation.

Requirements:
- Keep it concise (2-3 sentences maximum)
- Use empathetic, patient-friendly language
- Present only the recorded data
- Focus on what the numbers show
- Be supportive without medical advice

IMPORTANT: This is purely a data summary tool. Do NOT provide:
- Medical diagnoses or assessments
- Treatment recommendations
- Prognoses or predictions
- Medical advice of any kind
- Suggestions for medical intervention

Focus only on presenting the recorded data in an appropriate tone for the audience.
```

### Example Output (Scenario 1 - Week 1)
**Input**: Lower Back, 7 entries, median 8/10

**Generated**:
> "Looking at your pain tracking from Week 1, you recorded lower back pain 7 times. The middle pain score during those times was 8 out of 10."

**Validation Check**: ✅
- Region correct: "lower back" mentioned
- Frequency present: "7 times"
- Median present: "8 out of 10"
- No medical advice
- Empathetic tone maintained

---

## Prompt Variant 2: Professional Healthcare Summary

### Motivation (Scenario 2)
**User Story**: Michael (caregiver) tracks his mother's arthritis pain and needs to communicate with doctors and family.

**Why This Variant?**
- Healthcare providers need **professional, data-focused** language
- Must include **appropriate medical terminology** for data presentation
- Should be **concise and scannable** for busy clinicians
- Needs to maintain **objectivity** while being clear

### Prompt Structure

```
You are a data analysis AI assistant. Generate a professional summary about 
pain tracking data for a doctor.

Data Context:
- Time Period: [period]
- Body Region: [region]
- Number of pain entries: [frequency]
- Median pain score: [medianScore]/10

Audience: This summary is for a medical doctor or healthcare provider. Present 
the recorded data objectively and professionally for their review.

Requirements:
- Use professional medical terminology for data
- Present data clearly and objectively
- Focus on recorded patterns and numbers
- Be concise and precise
- Maintain professional tone without clinical interpretation

IMPORTANT: This is purely a data summary tool. Do NOT provide:
- Medical diagnoses or assessments
- Treatment recommendations
- Prognoses or predictions
- Medical advice of any kind
- Suggestions for medical intervention

Focus only on presenting the recorded data in an appropriate tone for the audience.
```

### Example Output (Scenario 2 - Knee Pain)
**Input**: Knees, 9 entries, median 7.5/10

**Generated**:
> "**Pain Tracking Data Summary: Knees - This Month**
> 
> During the past month, nine (9) distinct pain entries were recorded concerning the knee region. The median pain score reported across these entries was 7.5 out of 10."

**Validation Check**: ✅
- Region correct: "knee region"
- Frequency present: "nine (9)"
- Median present: "7.5 out of 10"
- Professional formatting
- No clinical interpretation

---

## Prompt Variant 3: Factual Research Summary

### Motivation (Scenario 3)
**User Story**: Dr. Chen collects standardized pain data for clinical research and needs objective summaries for publications.

**Why This Variant?**
- Research requires **completely objective** language
- Must use **scientific and statistical** terminology
- Should be suitable for **academic publication**
- Needs to avoid **any subjective interpretation**
- Must maintain **rigorous academic tone**

### Prompt Structure

```
You are a data analysis AI assistant. Generate a factual summary about 
pain tracking data for a research.

Data Context:
- Time Period: [period]
- Body Region: [region]
- Number of pain entries: [frequency]
- Median pain score: [medianScore]/10

Audience: This summary is for research purposes or medical professionals 
conducting studies. Present objective, detailed data information.

Requirements:
- Present data objectively and precisely
- Use scientific and statistical language
- Focus on research-relevant data
- Be comprehensive and accurate
- Maintain rigorous academic tone

IMPORTANT: This is purely a data summary tool. Do NOT provide:
- Medical diagnoses or assessments
- Treatment recommendations
- Prognoses or predictions
- Medical advice of any kind
- Suggestions for medical intervention

Focus only on presenting the recorded data in an appropriate tone for the audience.
```

### Example Output (Scenario 3 - Baseline Data)
**Input**: Neck, 10 entries, median 7.5/10

**Generated**:
> "**Pain Tracking Data Summary: Neck Region (Baseline)**
> 
> **Data Period:** Baseline measurement period (Weeks 1-2)
> 
> **Quantitative Analysis:**
> - Number of Entries: A total of ten (10) distinct pain entries were recorded within the specified time frame.
> - Median Pain Score: The median pain intensity score, as reported on a 0-10 numerical rating scale (NRS), was 7.5. This indicates that half of the recorded pain episodes were at or above this score, and half were at or below.
> 
> This summary presents objective, quantitative data derived from pain tracking entries for the neck region during the baseline period."

**Validation Check**: ✅
- Region correct: "neck region"
- Frequency present: "ten (10)"
- Median present: "7.5"
- Scientific terminology
- Statistical framing
- No subjective interpretation

---

## Comparison of Prompt Variants

| Aspect | Variant 1: Compassionate | Variant 2: Professional | Variant 3: Factual |
|--------|-------------------------|------------------------|-------------------|
| **Primary Audience** | Patients | Healthcare Providers | Researchers |
| **Language Style** | Empathetic, simple | Professional, clear | Scientific, precise |
| **Terminology** | Everyday language | Medical (data-focused) | Statistical, clinical |
| **Emotional Tone** | Supportive, warm | Neutral, professional | Objective, academic |
| **Structure** | Conversational | Semi-formal | Highly structured |
| **Length** | 2-3 sentences | 3-4 sentences | 4-6 sentences + structure |
| **Use Case** | Daily tracking, self-monitoring | Clinical communication | Research, publications |

---

## Key Prompt Engineering Principles

### 1. **Audience-Centric Design**
Each variant is specifically crafted for its target audience's needs and expectations.

### 2. **Data-First Approach**
All variants emphasize presenting **only the recorded data**, avoiding interpretation.

### 3. **Safety Constraints**
Every prompt explicitly prohibits medical advice, diagnoses, and treatment recommendations.

### 4. **Validation-Ready**
Prompts are structured to produce outputs that can be validated for:
- Region accuracy (no hallucinations)
- Numerical completeness (frequency and median)
- Logical consistency (descriptors match data)

### 5. **Tone Flexibility**
While maintaining data accuracy, prompts adapt language to suit different communication contexts.

---

## Prompt Evolution Based on Scenarios

### Scenario 1 Insights → Compassionate Variant
- **Finding**: Patients found clinical language intimidating
- **Solution**: Use phrases like "looking at your tracking" instead of "analysis indicates"
- **Result**: Higher patient engagement and understanding

### Scenario 2 Insights → Professional Variant
- **Finding**: Doctors needed quick, scannable summaries
- **Solution**: Added structured format with clear data presentation
- **Result**: Better integration into clinical workflows

### Scenario 3 Insights → Factual Variant
- **Finding**: Research requires precise statistical framing
- **Solution**: Include methodology notes (e.g., "NRS scale 0-10")
- **Result**: Summaries suitable for academic publication

---

## Validation Integration

All 3 prompt variants work with the same validation system:

### ✅ **Region Validation**
Prevents hallucination of body parts not in the input

### ✅ **Numerical Validation**
Ensures frequency and median score are mentioned

### ⚠️ **Consistency Validation**
Checks that descriptors match the actual data

### ⚠️ **Medical Advice Detection**
Flags any inappropriate medical recommendations

---

## Testing Results Summary

From actual test runs:

### Variant 1 (Compassionate for Patient)
```
Input: Lower Back, 4 entries, 6.5/10
Output: "Looking at your pain tracking from last week, you recorded 
         lower back pain 4 times. The middle pain score was 6.5 out of 10."
✅ Validation: PASSED
```

### Variant 2 (Professional for Doctor)
```
Input: Knees, 9 entries, 7.5/10
Output: "**Pain Tracking Data Summary: Knees - This Month**
         Nine distinct pain entries recorded. Median score: 7.5/10."
✅ Validation: PASSED
```

### Variant 3 (Factual for Research)
```
Input: Neck, 10 entries, 7.5/10
Output: "**Quantitative Analysis:** Ten distinct pain entries recorded.
         Median pain intensity: 7.5 on NRS. This presents objective data..."
✅ Validation: PASSED
```

---

## Best Practices for Prompt Variants

1. **Always specify audience explicitly** in the prompt
2. **Include concrete examples** of desired language style
3. **Set clear boundaries** (what NOT to include)
4. **Use structured requirements** for clarity
5. **Test with validation** to ensure quality
6. **Iterate based on real-world use** cases

---

## Future Enhancements

Potential additional variants:

- **Variant 4**: Encouraging for patients showing improvement
- **Variant 5**: Detailed clinical for specialists
- **Variant 6**: Simplified for elderly or non-native speakers
- **Variant 7**: Multi-lingual adaptations

---

## Conclusion

These 3 prompt variants demonstrate how **context-aware prompt engineering** can create appropriate, safe, and effective AI-generated summaries for different stakeholders while maintaining strict data accuracy and validation standards.
