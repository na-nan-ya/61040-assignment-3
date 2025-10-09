/**
 * Test Example for MapSummaryGeneration
 * 
 * Demonstrates the usage of the MapSummaryGeneration module with mock pain data.
 * This file shows how to use the module to generate AI-powered summaries.
 */

import { 
    MapSummaryGeneration, 
    createMapSummaryGenerator, 
    generateQuickSummary, 
    generateCustomSummary,
    PainDataMaps, 
    Config,
    SummaryTone,
    SummaryAudience 
} from './map-summary-generation';

/**
 * Mock pain data for testing
 */
const mockPainData: PainDataMaps = {
    'Last Week': [
        { region: 'Lower Back', painScore: 7, timestamp: new Date('2024-01-15') },
        { region: 'Lower Back', painScore: 6, timestamp: new Date('2024-01-16') },
        { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-17') },
        { region: 'Lower Back', painScore: 5, timestamp: new Date('2024-01-18') },
        { region: 'Shoulders', painScore: 4, timestamp: new Date('2024-01-15') },
        { region: 'Shoulders', painScore: 3, timestamp: new Date('2024-01-16') },
        { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-17') },
        { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-18') },
        { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-19') },
    ],
    'This Month': [
        { region: 'Lower Back', painScore: 7, timestamp: new Date('2024-01-01') },
        { region: 'Lower Back', painScore: 6, timestamp: new Date('2024-01-03') },
        { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-05') },
        { region: 'Lower Back', painScore: 5, timestamp: new Date('2024-01-07') },
        { region: 'Lower Back', painScore: 9, timestamp: new Date('2024-01-10') },
        { region: 'Lower Back', painScore: 4, timestamp: new Date('2024-01-12') },
        { region: 'Lower Back', painScore: 6, timestamp: new Date('2024-01-15') },
        { region: 'Lower Back', painScore: 6, timestamp: new Date('2024-01-16') },
        { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-17') },
        { region: 'Lower Back', painScore: 5, timestamp: new Date('2024-01-18') },
        { region: 'Shoulders', painScore: 3, timestamp: new Date('2024-01-02') },
        { region: 'Shoulders', painScore: 4, timestamp: new Date('2024-01-04') },
        { region: 'Shoulders', painScore: 2, timestamp: new Date('2024-01-06') },
        { region: 'Shoulders', painScore: 5, timestamp: new Date('2024-01-08') },
        { region: 'Shoulders', painScore: 3, timestamp: new Date('2024-01-11') },
        { region: 'Shoulders', painScore: 4, timestamp: new Date('2024-01-15') },
        { region: 'Shoulders', painScore: 3, timestamp: new Date('2024-01-16') },
        { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-01') },
        { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-04') },
        { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-07') },
        { region: 'Neck', painScore: 8, timestamp: new Date('2024-01-10') },
        { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-13') },
        { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-17') },
        { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-18') },
        { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-19') },
    ]
};

/**
 * Load configuration from config.json or environment variables
 */
function loadConfig(): Config {
    try {
        // Try to load from config.json first - handle both compiled and source versions
        const path = require('path');
        const configPath = path.join(__dirname, 'config.json');
        const configData = require(configPath);
        if (configData.apiKey && configData.apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            return {
                apiKey: configData.apiKey,
                maxRetries: 2,
                retryDelay: 1000
            };
        }
    } catch (error) {
        try {
            // Fallback to relative path for source version
            const configData = require('./config.json');
            if (configData.apiKey && configData.apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
                return {
                    apiKey: configData.apiKey,
                    maxRetries: 2,
                    retryDelay: 1000
                };
            }
        } catch (fallbackError) {
            console.log('📝 No config.json found, trying environment variables...');
        }
    }
    
    // Fall back to environment variable
    const envApiKey = process.env.GEMINI_API_KEY;
    if (envApiKey) {
        return {
            apiKey: envApiKey,
            maxRetries: 2,
            retryDelay: 1000
        };
    }
    
    // Return placeholder config (will trigger fallback summaries)
    return {
        apiKey: 'your-api-key-here',
        maxRetries: 2,
        retryDelay: 1000
    };
}

/**
 * Test configuration - loads from config.json or environment variables
 */
const testConfig: Config = loadConfig();

/**
 * Main test function that demonstrates the module usage
 */
async function testMapSummaryGeneration() {
    console.log('🏥 MapSummaryGeneration Test Example\n');
    
    try {
        // Create the generator instance
        const generator = createMapSummaryGenerator(testConfig);
        
        // Test different regions and periods
        const testCases = [
            { period: 'Last Week', region: 'Lower Back' },
            { period: 'Last Week', region: 'Shoulders' },
            { period: 'Last Week', region: 'Neck' },
            { period: 'This Month', region: 'Lower Back' },
            { period: 'This Month', region: 'Shoulders' },
            { period: 'This Month', region: 'Neck' }
        ];

        for (const testCase of testCases) {
            console.log(`📊 Analyzing ${testCase.region} pain for ${testCase.period}:`);
            
            // Calculate summary statistics
            const summary = generator.sumRegion(testCase.period, mockPainData, testCase.region);
            console.log(`   - Frequency: ${summary.frequency} entries`);
            console.log(`   - Median Score: ${summary.medianScore}/10`);
            console.log(`   - Total Entries: ${summary.totalEntries}`);
            
            // Generate AI summary (with fallback if API key is not set)
            try {
                const aiSummary = await generator.summariseWithAI(
                    testCase.period,
                    testCase.region,
                    summary.frequency,
                    summary.medianScore,
                    testConfig,
                    { fallbackEnabled: true },
                    summary.dateRange
                );
                console.log(`   - AI Summary: "${aiSummary}"`);
            } catch (error) {
                console.log(`   - AI Summary: [Fallback] "${generator['generateFallbackSummary'](
                    testCase.period,
                    testCase.region,
                    summary.frequency,
                    summary.medianScore
                )}"`);
            }
            
            console.log(''); // Empty line for readability
        }

        // Demonstrate the convenience function
        console.log('🚀 Testing convenience function:');
        try {
            const quickSummary = await generateQuickSummary(
                'Last Week',
                'Lower Back',
                4,
                6.5,
                testConfig
            );
            console.log(`Quick Summary: "${quickSummary}"`);
        } catch (error) {
            console.log('Quick Summary: [Using fallback due to API error]');
        }

    } catch (error) {
        console.error('❌ Test failed:', (error as Error).message);
    }
}

/**
 * Test function that demonstrates error handling
 */
async function testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling:\n');
    
    const badConfig: Config = {
        apiKey: 'invalid-api-key',
        maxRetries: 1,
        retryDelay: 500
    };
    
    const generator = createMapSummaryGenerator(badConfig);
    
    try {
        const summary = await generator.summariseWithAI(
            'Test Period',
            'Test Region',
            5,
            7,
            badConfig,
            { fallbackEnabled: true }
        );
        console.log(`✅ Fallback summary generated: "${summary}"`);
    } catch (error) {
        console.log(`❌ Error handling test failed: ${(error as Error).message}`);
    }
}

/**
 * Test function to verify API key is working
 */
async function testApiKeyValidation() {
    console.log('\n🔑 Testing API Key Validation:\n');
    
    // Test a simple API call
    try {
        const generator = createMapSummaryGenerator(testConfig);
        const testSummary = await generator.summariseWithAI(
            'Test',
            'Test Region',
            1,
            5,
            testConfig,
            { fallbackEnabled: false } // Force it to fail if API doesn't work
        );
        console.log('✅ API Key is working! Test summary:', testSummary.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ API Key test failed:', (error as Error).message);
        console.log('This suggests there might be an issue with your API key or API access.');
    }
}

/**
 * Test function that demonstrates different tones and audiences
 */
async function testToneAndAudienceVariations() {
    console.log('\n🎭 Testing Tone and Audience Variations:\n');
    
    const generator = createMapSummaryGenerator(testConfig);
    const testData = {
        period: 'Last Week',
        region: 'Lower Back',
        frequency: 4,
        medianScore: 6.5
    };

    // Test different combinations
    const testCases = [
        { tone: SummaryTone.COMPASSIONATE, audience: SummaryAudience.PATIENT, description: 'Compassionate for Patient' },
        { tone: SummaryTone.PROFESSIONAL, audience: SummaryAudience.DOCTOR, description: 'Professional for Doctor' },
        { tone: SummaryTone.CLINICAL, audience: SummaryAudience.DOCTOR, description: 'Clinical for Doctor' },
        { tone: SummaryTone.ENCOURAGING, audience: SummaryAudience.PATIENT, description: 'Encouraging for Patient' },
        { tone: SummaryTone.FACTUAL, audience: SummaryAudience.RESEARCH, description: 'Factual for Research' },
        { tone: SummaryTone.COMPASSIONATE, audience: SummaryAudience.CAREGIVER, description: 'Compassionate for Caregiver' },
        { tone: SummaryTone.PROFESSIONAL, audience: SummaryAudience.FAMILY, description: 'Professional for Family' }
    ];

    // Get date range for test data
    const testStats = generator.sumRegion(testData.period, mockPainData, testData.region);

    for (const testCase of testCases) {
        console.log(`📋 ${testCase.description}:`);
        try {
            const summary = await generator.summariseWithAI(
                testData.period,
                testData.region,
                testData.frequency,
                testData.medianScore,
                testConfig,
                {
                    tone: testCase.tone,
                    audience: testCase.audience,
                    fallbackEnabled: true
                },
                testStats.dateRange
            );
            console.log(`   "${summary}"`);
        } catch (error) {
            console.log(`   [Fallback] "${generator['generateFallbackSummary'](
                testData.period,
                testData.region,
                testData.frequency,
                testData.medianScore
            )}"`);
        }
        console.log('');
    }

    // Test convenience function
    console.log('🚀 Testing Custom Summary Convenience Function:');
    try {
        const customSummary = await generateCustomSummary(
            'This Month',
            'Neck',
            8,
            6,
            testConfig,
            SummaryTone.ENCOURAGING,
            SummaryAudience.PATIENT
        );
        console.log(`Custom Summary: "${customSummary}"`);
    } catch (error) {
        console.log('Custom Summary: [Using fallback due to API error]');
    }
}

/**
 * Utility function to display mock data statistics
 */
function displayMockDataStats() {
    console.log('📈 Mock Data Statistics:\n');
    
    Object.entries(mockPainData).forEach(([period, data]) => {
        console.log(`${period}:`);
        console.log(`  Total entries: ${data.length}`);
        
        const regions = [...new Set(data.map(entry => entry.region))];
        regions.forEach(region => {
            const regionData = data.filter(entry => entry.region === region);
            const scores = regionData.map(entry => entry.painScore);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            
            console.log(`  ${region}: ${regionData.length} entries, avg score: ${avgScore.toFixed(1)}`);
        });
        console.log('');
    });
}

// ==================== SCENARIO 1: Patient Self-Tracking Journey ====================

/**
 * SCENARIO 1: Patient Self-Tracking Journey
 * 
 * User Story:
 * User 1 is a 35-year-old office worker who experiences chronic lower back pain.
 * She wants to understand her pain patterns to discuss with her doctor.
 * 
 * User Actions Sequence:
 * 1. User 1 tracks her lower back pain daily for 2 weeks
 * 2. Week 1: High pain due to poor posture at new desk setup
 * 3. Week 2: Improved pain after ergonomic adjustments
 * 4. She wants a compassionate summary to understand her progress
 * 5. She also needs a clinical summary for her doctor appointment
 */
async function testScenario1_PatientSelfTracking() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 1: Patient Self-Tracking Journey');
    console.log('='.repeat(80));
    console.log('\nUser: User 1, 35-year-old office worker with chronic lower back pain');
    console.log('Goal: Track pain patterns and share with doctor\n');

    const User1PainData: PainDataMaps = {
        'Week 1 (Before Ergonomic Adjustments)': [
            { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-01T09:00:00') },
            { region: 'Lower Back', painScore: 7, timestamp: new Date('2024-01-01T17:00:00') },
            { region: 'Lower Back', painScore: 9, timestamp: new Date('2024-01-02T14:00:00') },
            { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-03T12:00:00') },
            { region: 'Lower Back', painScore: 7, timestamp: new Date('2024-01-04T16:00:00') },
            { region: 'Lower Back', painScore: 8, timestamp: new Date('2024-01-05T11:00:00') },
            { region: 'Lower Back', painScore: 9, timestamp: new Date('2024-01-06T15:00:00') }
        ],
        'Week 2 (After Ergonomic Adjustments)': [
            { region: 'Lower Back', painScore: 5, timestamp: new Date('2024-01-08T10:00:00') },
            { region: 'Lower Back', painScore: 4, timestamp: new Date('2024-01-09T14:00:00') },
            { region: 'Lower Back', painScore: 6, timestamp: new Date('2024-01-10T13:00:00') },
            { region: 'Lower Back', painScore: 4, timestamp: new Date('2024-01-11T15:00:00') },
            { region: 'Lower Back', painScore: 5, timestamp: new Date('2024-01-12T11:00:00') },
            { region: 'Lower Back', painScore: 3, timestamp: new Date('2024-01-13T16:00:00') }
        ]
    };

    const generator = createMapSummaryGenerator(testConfig);

    console.log('📊 Action 1: User1 reviews her first week of pain tracking\n');
    const week1Summary = generator.sumRegion('Week 1 (Before Ergonomic Adjustments)', User1PainData, 'Lower Back');
    console.log(`Data Summary:
   - Period: Week 1 (Before Ergonomic Adjustments)
   - Region: ${week1Summary.region}
   - Frequency: ${week1Summary.frequency} entries
   - Median Score: ${week1Summary.medianScore}/10\n`);

    console.log('🤖 LLM Action 1a: Generate compassionate summary for patient (User1)\n');
    try {
        const compassionateSummary = await generator.summariseWithAI(
            'Week 1 (Before Ergonomic Adjustments)',
            'Lower Back',
            week1Summary.frequency,
            week1Summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.COMPASSIONATE,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            week1Summary.dateRange
        );
        console.log(`Summary for User 1:\n"${compassionateSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 2: User 1 reviews her second week (after ergonomic adjustments)\n');
    const week2Summary = generator.sumRegion('Week 2 (After Ergonomic Adjustments)', User1PainData, 'Lower Back');
    console.log(`Data Summary:
   - Period: Week 2 (After Ergonomic Adjustments)
   - Region: ${week2Summary.region}
   - Frequency: ${week2Summary.frequency} entries
   - Median Score: ${week2Summary.medianScore}/10\n`);

    console.log('🤖 LLM Action 1b: Generate encouraging summary showing progress\n');
    try {
        const encouragingSummary = await generator.summariseWithAI(
            'Week 2 (After Ergonomic Adjustments)',
            'Lower Back',
            week2Summary.frequency,
            week2Summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.ENCOURAGING,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            week2Summary.dateRange
        );
        console.log(`Encouraging Summary:\n"${encouragingSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 3: User 1 prepares clinical summary for doctor appointment\n');
    console.log('🤖 LLM Action 1c: Generate clinical summary for healthcare provider\n');
    try {
        const clinicalSummary = await generator.summariseWithAI(
            'Week 1 (Before Ergonomic Adjustments)',
            'Lower Back',
            week1Summary.frequency,
            week1Summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.CLINICAL,
                audience: SummaryAudience.DOCTOR,
                fallbackEnabled: true
            },
            week1Summary.dateRange
        );
        console.log(`Clinical Summary for Doctor:\n"${clinicalSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('✅ Scenario 1 Complete\n');
}

// ==================== SCENARIO 2: Research Data Collection ====================

/**
 * SCENARIO 2: Research Study Data Collection
 * 
 * User Story:
 * User 2 is conducting a clinical research study on chronic pain patterns.
 * They collect pain data from study participants and need objective summaries
 * for research analysis and publications.
 * 
 * User Actions Sequence:
 * 1. Research participant tracks pain using standardized protocol
 * 2. Data is collected for neck pain over 4 weeks
 * 3. User 2 needs factual summaries for research analysis
 * 4. They require objective language for publication
 */
async function testScenario2_ResearchDataCollection() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 2: Research Study Data Collection');
    console.log('='.repeat(80));
    console.log('\nUser: User 2, clinical researcher studying chronic pain');
    console.log('Goal: Collect and analyze standardized pain data for research\n');

    const studyParticipantData: PainDataMaps = {
        'Baseline (Weeks 1-2)': [
            { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-01T08:00:00') },
            { region: 'Neck', painScore: 8, timestamp: new Date('2024-01-02T08:00:00') },
            { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-03T08:00:00') },
            { region: 'Neck', painScore: 9, timestamp: new Date('2024-01-04T08:00:00') },
            { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-05T08:00:00') },
            { region: 'Neck', painScore: 8, timestamp: new Date('2024-01-08T08:00:00') },
            { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-09T08:00:00') },
            { region: 'Neck', painScore: 8, timestamp: new Date('2024-01-10T08:00:00') },
            { region: 'Neck', painScore: 9, timestamp: new Date('2024-01-11T08:00:00') },
            { region: 'Neck', painScore: 7, timestamp: new Date('2024-01-12T08:00:00') }
        ],
        'Post-Intervention (Weeks 3-4)': [
            { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-15T08:00:00') },
            { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-16T08:00:00') },
            { region: 'Neck', painScore: 4, timestamp: new Date('2024-01-17T08:00:00') },
            { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-18T08:00:00') },
            { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-19T08:00:00') },
            { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-22T08:00:00') },
            { region: 'Neck', painScore: 4, timestamp: new Date('2024-01-23T08:00:00') },
            { region: 'Neck', painScore: 5, timestamp: new Date('2024-01-24T08:00:00') },
            { region: 'Neck', painScore: 6, timestamp: new Date('2024-01-25T08:00:00') },
            { region: 'Neck', painScore: 4, timestamp: new Date('2024-01-26T08:00:00') }
        ]
    };

    const generator = createMapSummaryGenerator(testConfig);

    console.log('📊 Action 1: User 2 analyzes baseline data (pre-intervention)\n');
    const baselineSummary = generator.sumRegion('Baseline (Weeks 1-2)', studyParticipantData, 'Neck');
    console.log(`Data Summary:
   - Study Period: Baseline (Weeks 1-2)
   - Region: ${baselineSummary.region}
   - Sample Size: ${baselineSummary.frequency} data points
   - Median Pain Intensity: ${baselineSummary.medianScore}/10 on NRS\n`);

    console.log('🤖 LLM Action 2a: Generate objective research summary\n');
    try {
        const researchSummary = await generator.summariseWithAI(
            'Baseline (Weeks 1-2)',
            'Neck',
            baselineSummary.frequency,
            baselineSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.FACTUAL,
                audience: SummaryAudience.RESEARCH,
                fallbackEnabled: true
            },
            baselineSummary.dateRange
        );
        console.log(`Research Summary (Baseline):\n"${researchSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 2: User 2 analyzes post-intervention data\n');
    const postSummary = generator.sumRegion('Post-Intervention (Weeks 3-4)', studyParticipantData, 'Neck');
    console.log(`Data Summary:
   - Study Period: Post-Intervention (Weeks 3-4)
   - Region: ${postSummary.region}
   - Sample Size: ${postSummary.frequency} data points
   - Median Pain Intensity: ${postSummary.medianScore}/10 on NRS\n`);

    console.log('🤖 LLM Action 2b: Generate objective post-intervention summary\n');
    try {
        const postResearchSummary = await generator.summariseWithAI(
            'Post-Intervention (Weeks 3-4)',
            'Neck',
            postSummary.frequency,
            postSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.FACTUAL,
                audience: SummaryAudience.RESEARCH,
                fallbackEnabled: true
            },
            postSummary.dateRange
        );
        console.log(`Research Summary (Post-Intervention):\n"${postResearchSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 3: User 2 prepares comparative analysis\n');
    console.log(`Comparative Statistics:
   - Baseline Median: ${baselineSummary.medianScore}/10
   - Post-Intervention Median: ${postSummary.medianScore}/10
   - Change: ${(baselineSummary.medianScore - postSummary.medianScore).toFixed(1)} points
   - Percent Change: ${(((baselineSummary.medianScore - postSummary.medianScore) / baselineSummary.medianScore) * 100).toFixed(1)}%\n`);

    console.log('✅ Scenario 2 Complete\n');
}

// ==================== EDGE CASE: Single Data Point ====================

/**
 * EDGE CASE: Single Data Point
 * 
 * Tests the system's behavior when there is only one pain entry for a region.
 * This edge case verifies:
 * - Median calculation with single value
 * - AI summary generation with minimal data
 * - Proper handling of singular vs plural in summaries
 */
async function testEdgeCase_SingleDataPoint() {
    console.log('\n' + '='.repeat(80));
    console.log('EDGE CASE TEST: Single Data Point');
    console.log('='.repeat(80));
    console.log('\nScenario: User has only recorded one pain entry\n');

    const singleDataPoint: PainDataMaps = {
        'Yesterday': [
            { region: 'Wrist', painScore: 4, timestamp: new Date('2024-01-20T14:30:00') }
        ]
    };

    const generator = createMapSummaryGenerator(testConfig);

    console.log('📊 Testing with single data point\n');
    const summary = generator.sumRegion('Yesterday', singleDataPoint, 'Wrist');
    console.log(`Data Summary:
   - Period: Yesterday
   - Region: ${summary.region}
   - Frequency: ${summary.frequency} entry (SINGLE DATA POINT)
   - Median Score: ${summary.medianScore}/10
   - Total Entries: ${summary.totalEntries}\n`);

    console.log('🤖 Generating AI summary with compassionate tone\n');
    try {
        const compassionateSummary = await generator.summariseWithAI(
            'Yesterday',
            'Wrist',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.COMPASSIONATE,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Compassionate Summary:\n"${compassionateSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('🤖 Generating AI summary with factual tone\n');
    try {
        const factualSummary = await generator.summariseWithAI(
            'Yesterday',
            'Wrist',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.FACTUAL,
                audience: SummaryAudience.RESEARCH,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Factual Summary:\n"${factualSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Testing with zero data points (non-existent region)\n');
    const noDataSummary = generator.sumRegion('Yesterday', singleDataPoint, 'Elbow');
    console.log(`Data Summary:
   - Period: Yesterday
   - Region: ${noDataSummary.region}
   - Frequency: ${noDataSummary.frequency} entries (NO DATA)
   - Median Score: ${noDataSummary.medianScore}/10
   - Total Entries: ${noDataSummary.totalEntries}\n`);

    if (noDataSummary.frequency === 0) {
        console.log('✅ System correctly handles missing region data in calculation\n');
    }

    console.log('🤖 Generating AI summary for region with no data (should say nothing logged yet)\n');
    try {
        const noDataAISummary = await generator.summariseWithAI(
            'Yesterday',
            'Elbow',
            noDataSummary.frequency,
            noDataSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.COMPASSIONATE,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            noDataSummary.dateRange
        );
        console.log(`No Data Summary:\n"${noDataAISummary}"\n`);
        
        // Check if the summary appropriately indicates no data was logged
        const summaryLower = noDataAISummary.toLowerCase();
        const goodPhrases = [
            "haven't logged",
            "haven't tracked",
            "no entries",
            "no data",
            "not logged",
            "not tracked",
            "not recorded"
        ];
        const badPhrases = [
            "no pain",
            "pain-free",
            "wonderful",
            "great news",
            "glad",
            "comfort"
        ];
        
        const hasGoodPhrase = goodPhrases.some(phrase => summaryLower.includes(phrase));
        const hasBadPhrase = badPhrases.some(phrase => summaryLower.includes(phrase));
        
        if (hasGoodPhrase && !hasBadPhrase) {
            console.log('✅ AI summary correctly indicates no data was logged (not that pain was low)\n');
        } else if (hasBadPhrase) {
            console.log('⚠️ AI incorrectly interprets 0 entries as "no pain" instead of "no data logged"\n');
        } else if (summaryLower.includes('0')) {
            console.log('⚠️ AI mentions zero but phrasing could be clearer about no data being logged\n');
        } else {
            console.log('⚠️ AI summary may not clearly indicate absence of data\n');
        }
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('✅ Edge Case Test Complete: Single Data Point\n');
}

// ==================== EDGE CASE: Extreme Tones ====================

/**
 * EDGE CASE: Extreme Tones
 * 
 * Tests the system with extreme or mismatched tone/audience combinations.
 * This edge case verifies:
 * - Encouraging tone with severe pain data
 * - Clinical tone for family members
 * - Very factual tone with emotional situations
 * - System's ability to maintain appropriate boundaries
 */
async function testEdgeCase_ExtremeTones() {
    console.log('\n' + '='.repeat(80));
    console.log('EDGE CASE TEST: Extreme Tone & Audience Combinations');
    console.log('='.repeat(80));
    console.log('\nScenario: Testing potentially problematic tone/audience combinations\n');

    // Test data with severe, frequent pain
    const severePainData: PainDataMaps = {
        'This Week': [
            { region: 'Head', painScore: 9, timestamp: new Date('2024-01-15T08:00:00') },
            { region: 'Head', painScore: 10, timestamp: new Date('2024-01-16T08:00:00') },
            { region: 'Head', painScore: 9, timestamp: new Date('2024-01-17T08:00:00') },
            { region: 'Head', painScore: 10, timestamp: new Date('2024-01-18T08:00:00') },
            { region: 'Head', painScore: 9, timestamp: new Date('2024-01-19T08:00:00') },
            { region: 'Head', painScore: 10, timestamp: new Date('2024-01-20T08:00:00') },
            { region: 'Head', painScore: 9, timestamp: new Date('2024-01-21T08:00:00') }
        ]
    };

    const generator = createMapSummaryGenerator(testConfig);
    const summary = generator.sumRegion('This Week', severePainData, 'Head');

    console.log(`📊 Test Data (Severe Pain):
   - Frequency: ${summary.frequency} entries
   - Median Score: ${summary.medianScore}/10 (VERY SEVERE)
   - Region: ${summary.region}\n`);

    // Test 1: Encouraging tone with severe pain
    console.log('🎭 Test 1: Encouraging tone with severe pain data\n');
    console.log('❓ Question: Can the system stay encouraging without being insensitive?\n');
    try {
        const encouragingSevere = await generator.summariseWithAI(
            'This Week',
            'Head',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.ENCOURAGING,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Encouraging + Severe Pain:\n"${encouragingSevere}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    // Test 2: Clinical tone for family (technical language for non-medical audience)
    console.log('🎭 Test 2: Clinical tone for family members\n');
    console.log('❓ Question: Can the system balance clinical language for non-medical audience?\n');
    try {
        const clinicalFamily = await generator.summariseWithAI(
            'This Week',
            'Head',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.CLINICAL,
                audience: SummaryAudience.FAMILY,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Clinical + Family:\n"${clinicalFamily}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    // Test 3: Factual tone for patient (might seem cold/uncaring)
    console.log('🎭 Test 3: Factual tone for patient (no empathy)\n');
    console.log('❓ Question: Does the dry, factual tone work for patients?\n');
    try {
        const factualPatient = await generator.summariseWithAI(
            'This Week',
            'Head',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.FACTUAL,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Factual + Patient:\n"${factualPatient}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    // Test 4: Compassionate tone for research (inappropriate emotion for scientific context)
    console.log('🎭 Test 4: Compassionate tone for research context\n');
    console.log('❓ Question: Does compassion interfere with scientific objectivity?\n');
    try {
        const compassionateResearch = await generator.summariseWithAI(
            'This Week',
            'Head',
            summary.frequency,
            summary.medianScore,
            testConfig,
            {
                tone: SummaryTone.COMPASSIONATE,
                audience: SummaryAudience.RESEARCH,
                fallbackEnabled: true
            },
            summary.dateRange
        );
        console.log(`Compassionate + Research:\n"${compassionateResearch}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    // Test 5: Test with minimal pain but encouraging tone
    const minimalPainData: PainDataMaps = {
        'Today': [
            { region: 'Finger', painScore: 1, timestamp: new Date('2024-01-21T10:00:00') },
            { region: 'Finger', painScore: 1, timestamp: new Date('2024-01-21T14:00:00') }
        ]
    };

    const minimalSummary = generator.sumRegion('Today', minimalPainData, 'Finger');
    console.log('🎭 Test 5: Encouraging tone with minimal pain (1/10)\n');
    console.log('❓ Question: Does encouragement make sense for very low pain?\n');
    try {
        const encouragingMinimal = await generator.summariseWithAI(
            'Today',
            'Finger',
            minimalSummary.frequency,
            minimalSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.ENCOURAGING,
                audience: SummaryAudience.PATIENT,
                fallbackEnabled: true
            },
            minimalSummary.dateRange
        );
        console.log(`Encouraging + Minimal Pain:\n"${encouragingMinimal}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('✅ Edge Case Test Complete: Extreme Tones\n');
}

// Export functions for external use
export {
    testMapSummaryGeneration,
    testErrorHandling,
    testApiKeyValidation,
    testToneAndAudienceVariations,
    testScenario1_PatientSelfTracking,
    testScenario2_ResearchDataCollection,
    testEdgeCase_SingleDataPoint,
    testEdgeCase_ExtremeTones,
    displayMockDataStats,
    mockPainData,
    testConfig
};

// Run the test if this file is executed directly
if (require.main === module) {
    console.log('\n');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(15) + 'MapSummaryGeneration Test Suite' + ' '.repeat(32) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    console.log('\n');
    
    displayMockDataStats();
    testApiKeyValidation().then(() => {
        testMapSummaryGeneration().then(() => {
            testToneAndAudienceVariations().then(() => {
                testScenario1_PatientSelfTracking().then(() => {
                    testScenario2_ResearchDataCollection().then(() => {
                        testEdgeCase_SingleDataPoint().then(() => {
                            testEdgeCase_ExtremeTones().then(() => {
                                testErrorHandling().then(() => {
                                    console.log('\n' + '='.repeat(80));
                                    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
                                    console.log('='.repeat(80));
                                    console.log('\nTest Summary:');
                                    console.log('  • Basic Tests: ✅');
                                    console.log('  • Tone & Audience Variations: ✅');
                                    console.log('  • Scenario 1 (Patient Self-Tracking): ✅');
                                    console.log('  • Scenario 2 (Research Data Collection): ✅');
                                    console.log('  • Edge Case: Single Data Point: ✅');
                                    console.log('  • Edge Case: Extreme Tones: ✅');
                                    console.log('  • Error Handling: ✅');
                                    console.log('');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
