/**
 * MapSummaryGeneration Module
 * 
 * Provides functionality to generate natural language summaries of body map pain data
 * using Google Gemini API. Includes robust error handling and fallback mechanisms.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Configuration interface for API access
 */
export interface Config {
    apiKey: string;
    maxRetries?: number;
    retryDelay?: number;
}

/**
 * Body map data structure
 */
export interface BodyMap {
    region: string;
    painScore: number;
    timestamp: Date;
}

/**
 * Summary data for a specific region and period
 */
export interface RegionSummary {
    region: string;
    period: string;
    frequency: number;
    medianScore: number;
    totalEntries: number;
}

/**
 * Pain data maps organized by period
 */
export interface PainDataMaps {
    [period: string]: BodyMap[];
}

/**
 * Tone options for the summary
 */
export enum SummaryTone {
    COMPASSIONATE = 'compassionate',
    PROFESSIONAL = 'professional',
    CLINICAL = 'clinical',
    ENCOURAGING = 'encouraging',
    FACTUAL = 'factual'
}

/**
 * Audience options for the summary
 */
export enum SummaryAudience {
    PATIENT = 'patient',
    DOCTOR = 'doctor',
    CAREGIVER = 'caregiver',
    FAMILY = 'family',
    RESEARCH = 'research'
}

/**
 * Options for summary generation
 */
export interface SummaryOptions {
    maxRetries?: number;
    retryDelay?: number;
    fallbackEnabled?: boolean;
    tone?: SummaryTone;
    audience?: SummaryAudience;
    enableValidation?: boolean;
}

/**
 * Validation result for LLM output
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Main class for generating pain data summaries using AI
 */
export class MapSummaryGeneration {
    private apiKey: string;
    private maxRetries: number;
    private retryDelay: number;

    constructor(config: Config) {
        this.apiKey = config.apiKey;
        this.maxRetries = config.maxRetries || 3;
        this.retryDelay = config.retryDelay || 1000; // 1 second default
    }

    /**
     * Computes frequency and median score for a specific region and period
     * @param period - Time period identifier
     * @param maps - Pain data maps organized by period
     * @param region - Body region to analyze
     * @returns RegionSummary with computed statistics
     */
    sumRegion(period: string, maps: PainDataMaps, region: string): RegionSummary {
        const periodData = maps[period] || [];
        const regionData = periodData.filter(entry => entry.region === region);
        
        if (regionData.length === 0) {
            return {
                region,
                period,
                frequency: 0,
                medianScore: 0,
                totalEntries: 0
            };
        }

        // Calculate frequency (number of entries for this region)
        const frequency = regionData.length;
        
        // Calculate median score
        const scores = regionData.map(entry => entry.painScore).sort((a, b) => a - b);
        const medianScore = this.calculateMedian(scores);

        return {
            region,
            period,
            frequency,
            medianScore,
            totalEntries: regionData.length
        };
    }

    /**
     * Generates a summary using Google Gemini API with customizable tone and audience
     * @param period - Time period for the summary
     * @param region - Body region being summarized
     * @param frequency - Number of pain entries for the region
     * @param medianScore - Median pain score for the region
     * @param config - API configuration
     * @param options - Additional options for summary generation including tone and audience
     * @returns Promise<string> - AI-generated summary
     */
    async summariseWithAI(
        period: string, 
        region: string, 
        frequency: number, 
        medianScore: number, 
        config: Config,
        options: SummaryOptions = {}
    ): Promise<string> {
        const maxRetries = options.maxRetries || this.maxRetries;
        const retryDelay = options.retryDelay || this.retryDelay;
        const fallbackEnabled = options.fallbackEnabled !== false;
        const tone = options.tone || SummaryTone.COMPASSIONATE;
        const audience = options.audience || SummaryAudience.PATIENT;

        // Create the prompt for Gemini with tone and audience
        const prompt = this.createSummaryPrompt(period, region, frequency, medianScore, tone, audience);

        const enableValidation = options.enableValidation !== false; // Default to true

        // Attempt API call with retries
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const summary = await this.callGeminiAPI(prompt, config);
                
                // Validate the LLM output
                if (enableValidation) {
                    const validation = this.validateSummary(summary, region, frequency, medianScore, period);
                    
                    if (!validation.isValid) {
                        console.warn('⚠️ Validation failed for LLM output:');
                        const truncatedSummary = summary.length > 150 ? summary.substring(0, 150) + '...' : summary;
                        console.warn(`  Summary: "${truncatedSummary}"`);
                        validation.errors.forEach(error => console.warn(`  - ERROR: ${error}`));
                        validation.warnings.forEach(warning => console.warn(`  - WARNING: ${warning}`));
                        
                        // If there are critical errors, retry or fallback
                        if (validation.errors.length > 0 && attempt < maxRetries) {
                            console.log(`🔄 Retrying due to validation errors (attempt ${attempt + 1}/${maxRetries})...`);
                            await this.delay(retryDelay);
                            continue;
                        } else if (validation.errors.length > 0 && fallbackEnabled) {
                            console.log('🔄 Falling back to generic summary due to validation errors');
                            return this.generateFallbackSummary(period, region, frequency, medianScore);
                        }
                    } else if (validation.warnings.length > 0) {
                        console.log('⚠️ Summary passed validation with warnings:');
                        const truncatedSummary = summary.length > 150 ? summary.substring(0, 150) + '...' : summary;
                        console.log(`  Summary: "${truncatedSummary}"`);
                        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
                    }
                }
                
                return summary;
            } catch (error) {
                console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);
                
                if (attempt === maxRetries) {
                    if (fallbackEnabled) {
                        console.log('🔄 Falling back to generic summary');
                        return this.generateFallbackSummary(period, region, frequency, medianScore);
                    } else {
                        throw new Error(`Failed to generate summary after ${maxRetries} attempts: ${(error as Error).message}`);
                    }
                }
                
                // Wait before retrying
                await this.delay(retryDelay * attempt);
            }
        }

        // This should never be reached, but TypeScript requires it
        throw new Error('Unexpected error in summariseWithAI');
    }

    /**
     * Creates a well-structured prompt for Gemini API with customizable tone and audience
     */
    private createSummaryPrompt(
        period: string, 
        region: string, 
        frequency: number, 
        medianScore: number,
        tone: SummaryTone = SummaryTone.COMPASSIONATE,
        audience: SummaryAudience = SummaryAudience.PATIENT
    ): string {
        const toneInstructions = this.getToneInstructions(tone, audience);
        const audienceContext = this.getAudienceContext(audience);
        
        return `You are a data analysis AI assistant. Generate a ${tone} summary about pain tracking data for a ${audience}.

Data Context:
- Time Period: ${period}
- Body Region: ${region}
- Number of pain entries: ${frequency}
- Median pain score: ${medianScore}/10

${audienceContext}

${toneInstructions}

IMPORTANT: This is purely a data summary tool. Do NOT provide:
- Medical diagnoses or assessments
- Treatment recommendations
- Prognoses or predictions
- Medical advice of any kind
- Suggestions for medical intervention

Focus only on presenting the recorded data in an appropriate tone for the audience. Generate a concise data summary:`;
    }

    /**
     * Gets tone-specific instructions for the prompt
     */
    private getToneInstructions(tone: SummaryTone, audience: SummaryAudience): string {
        const instructions = {
            [SummaryTone.COMPASSIONATE]: {
                [SummaryAudience.PATIENT]: `Requirements:
- Keep it concise (2-3 sentences maximum)
- Use empathetic, patient-friendly language
- Present only the recorded data
- Focus on what the numbers show
- Be supportive without medical advice`,
                [SummaryAudience.DOCTOR]: `Requirements:
- Keep it concise and professional
- Present data clearly and objectively
- Use appropriate medical terminology for data presentation
- Focus on the recorded patterns and numbers
- Maintain professional tone without clinical interpretation`,
                [SummaryAudience.CAREGIVER]: `Requirements:
- Keep it clear and factual
- Present data in accessible terms
- Focus on what was recorded
- Avoid suggesting specific care actions
- Be supportive while staying data-focused`,
                [SummaryAudience.FAMILY]: `Requirements:
- Use simple, clear language
- Present data in everyday terms
- Focus on what the numbers show
- Avoid medical interpretations
- Be supportive without medical advice`,
                [SummaryAudience.RESEARCH]: `Requirements:
- Be factual and objective
- Include statistical details
- Use appropriate terminology for data
- Focus on data patterns and trends
- Maintain neutral, scientific tone`
            },
            [SummaryTone.PROFESSIONAL]: {
                [SummaryAudience.PATIENT]: `Requirements:
- Keep it professional but accessible
- Use clear, non-technical language
- Focus on the recorded data facts
- Present information objectively
- Be informative without medical advice`,
                [SummaryAudience.DOCTOR]: `Requirements:
- Use professional medical terminology for data
- Present data clearly and objectively
- Focus on recorded patterns and numbers
- Be concise and precise
- Maintain professional tone without clinical interpretation`,
                [SummaryAudience.CAREGIVER]: `Requirements:
- Be clear and professional
- Present data factually
- Focus on what was recorded
- Avoid care recommendations
- Balance professionalism with empathy`,
                [SummaryAudience.FAMILY]: `Requirements:
- Use professional but understandable language
- Focus on the recorded data
- Present information clearly
- Avoid medical interpretations
- Be informative without medical advice`,
                [SummaryAudience.RESEARCH]: `Requirements:
- Use scientific and appropriate terminology
- Be precise and objective
- Include relevant statistical measures
- Focus on data patterns
- Maintain academic tone`
            },
            [SummaryTone.CLINICAL]: {
                [SummaryAudience.PATIENT]: `Requirements:
- Use clinical language but explain clearly
- Focus on the recorded data facts
- Be direct but not harsh
- Present data objectively
- Maintain professional tone without medical interpretation`,
                [SummaryAudience.DOCTOR]: `Requirements:
- Use precise clinical terminology for data
- Include all relevant recorded details
- Focus on data patterns and numbers
- Be comprehensive but concise
- Maintain formal tone without clinical assessment`,
                [SummaryAudience.CAREGIVER]: `Requirements:
- Use clinical language with explanations
- Focus on what the data shows
- Present information clearly
- Be informative about recorded data
- Maintain professional tone without care recommendations`,
                [SummaryAudience.FAMILY]: `Requirements:
- Use clinical terms but explain them
- Focus on the recorded data
- Present information clearly
- Be informative but not alarming
- Maintain professional tone without medical advice`,
                [SummaryAudience.RESEARCH]: `Requirements:
- Use formal clinical and scientific language
- Include comprehensive data details
- Focus on data patterns and statistical significance
- Be precise and technical
- Maintain academic tone`
            },
            [SummaryTone.ENCOURAGING]: {
                [SummaryAudience.PATIENT]: `Requirements:
- Keep it positive and motivating
- Use uplifting, hopeful language
- Focus on the data tracking effort
- Be encouraging about data collection
- Maintain optimistic but realistic tone without medical advice`,
                [SummaryAudience.DOCTOR]: `Requirements:
- Balance encouragement with data accuracy
- Focus on positive aspects of data collection
- Use professional but supportive language
- Highlight data value
- Maintain encouraging professional tone without clinical interpretation`,
                [SummaryAudience.CAREGIVER]: `Requirements:
- Be encouraging and supportive
- Focus on the value of data tracking
- Provide motivation about data collection
- Be uplifting about monitoring efforts
- Maintain positive, supportive tone without care recommendations`,
                [SummaryAudience.FAMILY]: `Requirements:
- Use encouraging and hopeful language
- Focus on the importance of data tracking
- Be uplifting and motivating about monitoring
- Encourage family support of tracking
- Maintain positive, supportive tone without medical advice`,
                [SummaryAudience.RESEARCH]: `Requirements:
- Be encouraging about research potential
- Focus on positive data collection aspects
- Use optimistic scientific language
- Highlight data value for research
- Maintain encouraging academic tone`
            },
            [SummaryTone.FACTUAL]: {
                [SummaryAudience.PATIENT]: `Requirements:
- Present facts clearly and objectively
- Use simple, clear language
- Focus on recorded data and patterns
- Avoid emotional language
- Be informative and straightforward without medical interpretation`,
                [SummaryAudience.DOCTOR]: `Requirements:
- Present data facts precisely
- Use appropriate medical terminology for data
- Focus on recorded information
- Be objective and comprehensive
- Maintain factual accuracy without clinical assessment`,
                [SummaryAudience.CAREGIVER]: `Requirements:
- Present facts clearly about recorded data
- Use clear, practical language
- Focus on what was recorded
- Be objective about data
- Maintain factual, helpful tone without care recommendations`,
                [SummaryAudience.FAMILY]: `Requirements:
- Present information clearly and simply
- Use understandable language
- Focus on recorded data facts
- Be objective and informative
- Maintain clear, factual tone without medical advice`,
                [SummaryAudience.RESEARCH]: `Requirements:
- Present data objectively and precisely
- Use scientific and statistical language
- Focus on research-relevant data
- Be comprehensive and accurate
- Maintain rigorous academic tone`
            }
        };

        return instructions[tone][audience] || instructions[SummaryTone.COMPASSIONATE][SummaryAudience.PATIENT];
    }

    /**
     * Gets audience-specific context for the prompt
     */
    private getAudienceContext(audience: SummaryAudience): string {
        const contexts = {
            [SummaryAudience.PATIENT]: `Audience: This summary is for the patient themselves. Present the recorded pain tracking data in a clear, understandable way without medical interpretation.`,
            [SummaryAudience.DOCTOR]: `Audience: This summary is for a medical doctor or healthcare provider. Present the recorded data objectively and professionally for their review.`,
            [SummaryAudience.CAREGIVER]: `Audience: This summary is for a caregiver (family member, friend, or professional caregiver). Present the recorded data in accessible terms without care recommendations.`,
            [SummaryAudience.FAMILY]: `Audience: This summary is for family members. Present the recorded pain tracking data clearly without medical interpretations or advice.`,
            [SummaryAudience.RESEARCH]: `Audience: This summary is for research purposes or medical professionals conducting studies. Present objective, detailed data information.`
        };

        return contexts[audience] || contexts[SummaryAudience.PATIENT];
    }

    /**
     * Validates the LLM-generated summary for accuracy and consistency
     */
    private validateSummary(
        summary: string, 
        region: string, 
        frequency: number, 
        medianScore: number,
        period: string
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // 1. Check for hallucinated regions
        const regionValidation = this.validateRegionMention(summary, region);
        if (!regionValidation.valid) {
            errors.push(regionValidation.error!);
        }

        // 2. Check for numerical data presence
        const numericalValidation = this.validateNumericalData(summary, frequency, medianScore);
        if (!numericalValidation.frequencyFound) {
            errors.push(`Missing frequency data: Expected mention of ${frequency} entries/occurrences`);
        }
        if (!numericalValidation.medianFound) {
            errors.push(`Missing median score data: Expected mention of score ${medianScore}/10`);
        }

        // 3. Check for logical consistency
        const consistencyValidation = this.validateLogicalConsistency(summary, frequency, medianScore);
        if (consistencyValidation.length > 0) {
            warnings.push(...consistencyValidation);
        }

        // 4. Check for medical advice (should not be present)
        const medicalAdviceCheck = this.checkForMedicalAdvice(summary);
        if (medicalAdviceCheck.found) {
            warnings.push(`Possible medical advice detected: "${medicalAdviceCheck.phrases.join('", "')}"`);
        }

        // 5. Check summary length
        if (summary.length < 20) {
            errors.push('Summary too short (less than 20 characters)');
        }
        if (summary.length > 1000) {
            warnings.push('Summary might be too verbose (over 1000 characters)');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validates that only the correct region is mentioned
     */
    private validateRegionMention(summary: string, expectedRegion: string): { valid: boolean; error?: string } {
        const summaryLower = summary.toLowerCase();
        const expectedRegionLower = expectedRegion.toLowerCase();

        // Common body regions that might be hallucinated
        const bodyRegions = [
            'lower back', 'upper back', 'back', 'neck', 'shoulder', 'shoulders',
            'arm', 'arms', 'elbow', 'elbows', 'wrist', 'wrists', 'hand', 'hands',
            'hip', 'hips', 'knee', 'knees', 'ankle', 'ankles', 'foot', 'feet',
            'leg', 'legs', 'chest', 'abdomen', 'head', 'jaw', 'face'
        ];

        // Check if the expected region is mentioned
        const expectedMentioned = summaryLower.includes(expectedRegionLower);
        
        // Check for hallucinated regions (other regions mentioned)
        const hallucinatedRegions = bodyRegions.filter(region => {
            const regionLower = region.toLowerCase();
            // Skip if it's the expected region or a substring of it
            if (expectedRegionLower.includes(regionLower) || regionLower.includes(expectedRegionLower)) {
                return false;
            }
            return summaryLower.includes(regionLower);
        });

        if (!expectedMentioned && hallucinatedRegions.length === 0) {
            // Expected region not mentioned, but no hallucinations either (might use pronouns)
            return { valid: true };
        }

        if (hallucinatedRegions.length > 0) {
            return {
                valid: false,
                error: `Hallucinated region(s) detected: "${hallucinatedRegions.join('", "')}" (expected only "${expectedRegion}")`
            };
        }

        return { valid: true };
    }

    /**
     * Validates that numerical data is present in the summary
     */
    private validateNumericalData(
        summary: string, 
        frequency: number, 
        medianScore: number
    ): { frequencyFound: boolean; medianFound: boolean } {
        const summaryLower = summary.toLowerCase();

        // Convert numbers to words for matching
        const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        
        // Check for frequency mention (with tolerance)
        const frequencyPattern = new RegExp(`\\b(${frequency}|${numberWords[frequency] || ''})\\b`, 'i');
        const frequencyVariations = [
            `${frequency}`,
            `${frequency} time`,
            `${frequency} entr`,
            `${frequency} occurrence`,
            `${frequency} instance`,
            numberWords[frequency]
        ].filter(Boolean);
        
        const frequencyFound = frequencyVariations.some(variation => 
            summaryLower.includes(variation.toLowerCase())
        );

        // Check for median score mention (allow for rounding)
        const medianInt = Math.round(medianScore);
        const medianPatterns = [
            `${medianScore}`,
            `${medianInt}`,
            `${medianScore}/10`,
            `${medianInt}/10`,
            `${medianScore} out of 10`,
            `${medianInt} out of 10`,
            numberWords[medianInt]
        ].filter(Boolean);

        const medianFound = medianPatterns.some(pattern => 
            summaryLower.includes(pattern.toLowerCase())
        );

        return { frequencyFound, medianFound };
    }

    /**
     * Validates logical consistency between descriptors and actual numbers
     */
    private validateLogicalConsistency(summary: string, frequency: number, medianScore: number): string[] {
        const warnings: string[] = [];
        const summaryLower = summary.toLowerCase();

        // Frequency consistency checks - use word boundaries to avoid false positives
        const frequencyDescriptors = {
            low: ['\\blow\\b', '\\brare\\b', '\\binfrequent\\b', '\\boccasional\\b', '\\bfew\\b', '\\bminimal\\b'],
            moderate: ['\\bmoderate\\b', '\\bseveral\\b', '\\bsome\\b', '\\bregular\\b'],
            high: ['\\bhigh\\b', '\\bfrequent\\b', '\\boften\\b', '\\bmany\\b', '\\bnumerous\\b', '\\bconsiderable\\b']
        };

        // Pain severity descriptors - use word boundaries to avoid false positives
        const severityDescriptors = {
            low: ['\\bmild\\b', '\\bslight\\b', '\\bminimal\\b', '\\bminor\\b'],
            moderate: ['\\bmoderate\\b', '\\bnoticeable\\b', '\\bsignificant\\b'],
            high: ['\\bsevere\\b', '\\bintense\\b', '\\bextreme\\b', '\\bmajor\\b', '\\bsubstantial\\b']
        };

        // Check frequency consistency with regex for word boundaries
        if (frequency <= 2) {
            // Low frequency
            for (const desc of frequencyDescriptors.high) {
                if (new RegExp(desc, 'i').test(summaryLower)) {
                    warnings.push(`Inconsistent frequency: frequency is ${frequency} (low) but summary uses "high" descriptor`);
                    break;
                }
            }
        } else if (frequency >= 7) {
            // High frequency
            for (const desc of frequencyDescriptors.low) {
                if (new RegExp(desc, 'i').test(summaryLower)) {
                    warnings.push(`Inconsistent frequency: frequency is ${frequency} (high) but summary uses "low" descriptor`);
                    break;
                }
            }
        }

        // Check pain severity consistency with regex for word boundaries
        if (medianScore <= 3) {
            // Low severity
            for (const desc of severityDescriptors.high) {
                if (new RegExp(desc, 'i').test(summaryLower)) {
                    warnings.push(`Inconsistent severity: median score is ${medianScore}/10 (mild) but summary uses "severe" descriptor`);
                    break;
                }
            }
        } else if (medianScore >= 7) {
            // High severity
            for (const desc of severityDescriptors.low) {
                if (new RegExp(desc, 'i').test(summaryLower)) {
                    warnings.push(`Inconsistent severity: median score is ${medianScore}/10 (severe) but summary uses "mild" descriptor`);
                    break;
                }
            }
        }

        return warnings;
    }

    /**
     * Checks for medical advice that should not be present
     */
    private checkForMedicalAdvice(summary: string): { found: boolean; phrases: string[] } {
        const summaryLower = summary.toLowerCase();
        const medicalAdvicePhrases = [
            'should see a doctor',
            'consult a physician',
            'seek medical attention',
            'recommend treatment',
            'diagnosis',
            'prescribe',
            'medication',
            'you should take',
            'try this treatment',
            'this indicates',
            'this suggests you have',
            'you may have',
            'likely suffering from',
            'probably have',
            'could be a sign of'
        ];

        const foundPhrases = medicalAdvicePhrases.filter(phrase => 
            summaryLower.includes(phrase)
        );

        return {
            found: foundPhrases.length > 0,
            phrases: foundPhrases
        };
    }

    /**
     * Makes the actual API call to Google Gemini
     */
    private async callGeminiAPI(prompt: string, config: Config): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(config.apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.7,
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            if (!text) {
                throw new Error('Empty response from Gemini API');
            }

            return text;
        } catch (error) {
            console.error('❌ Gemini API Error:', (error as Error).message);
            throw error;
        }
    }

    /**
     * Generates a fallback summary when API fails
     */
    private generateFallbackSummary(period: string, region: string, frequency: number, medianScore: number): string {
        const severity = this.getSeverityDescription(medianScore);
        const frequencyDesc = frequency === 1 ? 'entry' : 'entries';
        
        return `During ${period.toLowerCase()}, you recorded ${frequency} pain ${frequencyDesc} for your ${region.toLowerCase()}, with a median pain level of ${medianScore}/10 (${severity}). This data helps track your pain patterns over time.`;
    }

    /**
     * Gets a human-readable description of pain severity
     */
    private getSeverityDescription(score: number): string {
        if (score <= 2) return 'mild';
        if (score <= 4) return 'moderate';
        if (score <= 6) return 'moderate to severe';
        if (score <= 8) return 'severe';
        return 'very severe';
    }

    /**
     * Calculates the median value from a sorted array
     */
    private calculateMedian(sortedArray: number[]): number {
        const length = sortedArray.length;
        if (length === 0) return 0;
        
        const middle = Math.floor(length / 2);
        if (length % 2 === 0) {
            return (sortedArray[middle - 1] + sortedArray[middle]) / 2;
        } else {
            return sortedArray[middle];
        }
    }

    /**
     * Utility method to add delay between retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Convenience function to create a MapSummaryGeneration instance
 */
export function createMapSummaryGenerator(config: Config): MapSummaryGeneration {
    return new MapSummaryGeneration(config);
}

/**
 * Convenience function for quick summary generation
 */
export async function generateQuickSummary(
    period: string,
    region: string,
    frequency: number,
    medianScore: number,
    config: Config
): Promise<string> {
    const generator = new MapSummaryGeneration(config);
    return generator.summariseWithAI(period, region, frequency, medianScore, config);
}

/**
 * Convenience function for summary generation with custom tone and audience
 */
export async function generateCustomSummary(
    period: string,
    region: string,
    frequency: number,
    medianScore: number,
    config: Config,
    tone: SummaryTone = SummaryTone.COMPASSIONATE,
    audience: SummaryAudience = SummaryAudience.PATIENT
): Promise<string> {
    const generator = new MapSummaryGeneration(config);
    return generator.summariseWithAI(period, region, frequency, medianScore, config, {
        tone,
        audience
    });
}
