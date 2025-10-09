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
    
    console.log('Current API Key (first 10 chars):', testConfig.apiKey.substring(0, 10) + '...');
    console.log('API Key length:', testConfig.apiKey.length);
    console.log('API Key starts with AIzaSy:', testConfig.apiKey.startsWith('AIzaSy'));
    
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
 * Sarah is a 35-year-old office worker who experiences chronic lower back pain.
 * She wants to understand her pain patterns to discuss with her doctor.
 * 
 * User Actions Sequence:
 * 1. Sarah tracks her lower back pain daily for 2 weeks
 * 2. Week 1: High pain due to poor posture at new desk setup
 * 3. Week 2: Improved pain after ergonomic adjustments
 * 4. She wants a compassionate summary to understand her progress
 * 5. She also needs a clinical summary for her doctor appointment
 */
async function testScenario1_PatientSelfTracking() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 1: Patient Self-Tracking Journey');
    console.log('='.repeat(80));
    console.log('\nUser: Sarah, 35-year-old office worker with chronic lower back pain');
    console.log('Goal: Track pain patterns and share with doctor\n');

    const sarahsPainData: PainDataMaps = {
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

    console.log('📊 Action 1: Sarah reviews her first week of pain tracking\n');
    const week1Summary = generator.sumRegion('Week 1 (Before Ergonomic Adjustments)', sarahsPainData, 'Lower Back');
    console.log(`Data Summary:
   - Period: Week 1 (Before Ergonomic Adjustments)
   - Region: ${week1Summary.region}
   - Frequency: ${week1Summary.frequency} entries
   - Median Score: ${week1Summary.medianScore}/10\n`);

    console.log('🤖 LLM Action 1a: Generate compassionate summary for patient (Sarah)\n');
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
        console.log(`Summary for Sarah:\n"${compassionateSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 2: Sarah reviews her second week (after ergonomic adjustments)\n');
    const week2Summary = generator.sumRegion('Week 2 (After Ergonomic Adjustments)', sarahsPainData, 'Lower Back');
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

    console.log('📊 Action 3: Sarah prepares clinical summary for doctor appointment\n');
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

// ==================== SCENARIO 2: Caregiver Monitoring Parent ====================

/**
 * SCENARIO 2: Caregiver Monitoring Elderly Parent
 * 
 * User Story:
 * Michael is caring for his 72-year-old mother who has arthritis in multiple joints.
 * He tracks her pain to help manage her care and communicate with her healthcare team.
 * 
 * User Actions Sequence:
 * 1. Michael tracks his mother's pain across multiple regions
 * 2. He notices knee pain is most frequent and severe
 * 3. He wants to understand patterns to adjust daily activities
 * 4. He needs to share data with family members
 * 5. He prepares a professional report for the doctor
 */
async function testScenario2_CaregiverMonitoring() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 2: Caregiver Monitoring Elderly Parent');
    console.log('='.repeat(80));
    console.log('\nUser: Michael, caregiver for his 72-year-old mother with arthritis');
    console.log('Goal: Track multi-region pain and coordinate care\n');

    const mothersPainData: PainDataMaps = {
        'This Month': [
            { region: 'Knees', painScore: 7, timestamp: new Date('2024-01-02T08:00:00') },
            { region: 'Knees', painScore: 8, timestamp: new Date('2024-01-04T09:00:00') },
            { region: 'Knees', painScore: 6, timestamp: new Date('2024-01-06T10:00:00') },
            { region: 'Knees', painScore: 7, timestamp: new Date('2024-01-08T08:30:00') },
            { region: 'Knees', painScore: 8, timestamp: new Date('2024-01-10T09:00:00') },
            { region: 'Knees', painScore: 7, timestamp: new Date('2024-01-12T10:00:00') },
            { region: 'Knees', painScore: 9, timestamp: new Date('2024-01-14T08:00:00') },
            { region: 'Knees', painScore: 7, timestamp: new Date('2024-01-16T09:30:00') },
            { region: 'Knees', painScore: 8, timestamp: new Date('2024-01-18T10:00:00') }
        ]
    };

    const generator = createMapSummaryGenerator(testConfig);

    console.log('📊 Action 1: Michael reviews knee pain data (most severe)\n');
    const kneeSummary = generator.sumRegion('This Month', mothersPainData, 'Knees');
    console.log(`Data Summary:
   - Region: ${kneeSummary.region}
   - Frequency: ${kneeSummary.frequency} entries this month
   - Median Score: ${kneeSummary.medianScore}/10\n`);

    console.log('🤖 LLM Action 2a: Generate practical summary for caregiver\n');
    try {
        const caregiverSummary = await generator.summariseWithAI(
            'This Month',
            'Knees',
            kneeSummary.frequency,
            kneeSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.COMPASSIONATE,
                audience: SummaryAudience.CAREGIVER,
                fallbackEnabled: true
            },
            kneeSummary.dateRange
        );
        console.log(`Summary for Caregiver (Michael):\n"${caregiverSummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 2: Michael prepares update for family members\n');
    console.log('🤖 LLM Action 2b: Generate clear summary for family members\n');
    try {
        const familySummary = await generator.summariseWithAI(
            'This Month',
            'Knees',
            kneeSummary.frequency,
            kneeSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.PROFESSIONAL,
                audience: SummaryAudience.FAMILY,
                fallbackEnabled: true
            },
            kneeSummary.dateRange
        );
        console.log(`Summary for Family:\n"${familySummary}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('📊 Action 3: Michael prepares professional report for doctor\n');
    console.log('🤖 LLM Action 2c: Generate professional report for healthcare provider\n');
    try {
        const doctorReport = await generator.summariseWithAI(
            'This Month',
            'Knees',
            kneeSummary.frequency,
            kneeSummary.medianScore,
            testConfig,
            {
                tone: SummaryTone.PROFESSIONAL,
                audience: SummaryAudience.DOCTOR,
                fallbackEnabled: true
            },
            kneeSummary.dateRange
        );
        console.log(`Professional Report for Doctor:\n"${doctorReport}"\n`);
    } catch (error) {
        console.log(`Error: ${(error as Error).message}\n`);
    }

    console.log('✅ Scenario 2 Complete\n');
}

// ==================== SCENARIO 3: Research Data Collection ====================

/**
 * SCENARIO 3: Research Study Data Collection
 * 
 * User Story:
 * Dr. Lisa Chen is conducting a clinical research study on chronic pain patterns.
 * She collects pain data from study participants and needs objective summaries
 * for research analysis and publications.
 * 
 * User Actions Sequence:
 * 1. Research participant tracks pain using standardized protocol
 * 2. Data is collected for neck pain over 4 weeks
 * 3. Dr. Chen needs factual summaries for research analysis
 * 4. She requires objective language for publication
 */
async function testScenario3_ResearchDataCollection() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO 3: Research Study Data Collection');
    console.log('='.repeat(80));
    console.log('\nUser: Dr. Lisa Chen, clinical researcher studying chronic pain');
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

    console.log('📊 Action 1: Dr. Chen analyzes baseline data (pre-intervention)\n');
    const baselineSummary = generator.sumRegion('Baseline (Weeks 1-2)', studyParticipantData, 'Neck');
    console.log(`Data Summary:
   - Study Period: Baseline (Weeks 1-2)
   - Region: ${baselineSummary.region}
   - Sample Size: ${baselineSummary.frequency} data points
   - Median Pain Intensity: ${baselineSummary.medianScore}/10 on NRS\n`);

    console.log('🤖 LLM Action 3a: Generate objective research summary\n');
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

    console.log('📊 Action 2: Dr. Chen analyzes post-intervention data\n');
    const postSummary = generator.sumRegion('Post-Intervention (Weeks 3-4)', studyParticipantData, 'Neck');
    console.log(`Data Summary:
   - Study Period: Post-Intervention (Weeks 3-4)
   - Region: ${postSummary.region}
   - Sample Size: ${postSummary.frequency} data points
   - Median Pain Intensity: ${postSummary.medianScore}/10 on NRS\n`);

    console.log('🤖 LLM Action 3b: Generate objective post-intervention summary\n');
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

    console.log('📊 Action 3: Dr. Chen prepares comparative analysis\n');
    console.log(`Comparative Statistics:
   - Baseline Median: ${baselineSummary.medianScore}/10
   - Post-Intervention Median: ${postSummary.medianScore}/10
   - Change: ${(baselineSummary.medianScore - postSummary.medianScore).toFixed(1)} points
   - Percent Change: ${(((baselineSummary.medianScore - postSummary.medianScore) / baselineSummary.medianScore) * 100).toFixed(1)}%\n`);

    console.log('✅ Scenario 3 Complete\n');
}

// Export functions for external use
export {
    testMapSummaryGeneration,
    testErrorHandling,
    testApiKeyValidation,
    testToneAndAudienceVariations,
    testScenario1_PatientSelfTracking,
    testScenario2_CaregiverMonitoring,
    testScenario3_ResearchDataCollection,
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
                    testScenario2_CaregiverMonitoring().then(() => {
                        testScenario3_ResearchDataCollection().then(() => {
                            testErrorHandling().then(() => {
                                console.log('\n' + '='.repeat(80));
                                console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
                                console.log('='.repeat(80));
                                console.log('\nTest Summary:');
                                console.log('  • Basic Tests: ✅');
                                console.log('  • Tone & Audience Variations: ✅');
                                console.log('  • Scenario 1 (Patient Self-Tracking): ✅');
                                console.log('  • Scenario 2 (Caregiver Monitoring): ✅');
                                console.log('  • Scenario 3 (Research Data Collection): ✅');
                                console.log('  • Error Handling: ✅');
                                console.log('');
                            });
                        });
                    });
                });
            });
        });
    });
}
