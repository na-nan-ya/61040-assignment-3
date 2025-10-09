**ORIGINAL CONCEPT DESIGN**

**concept** MapSummaryGeneration
**purpose** concisely summarise all body map logs until present-day
**principle** 
**state **
a set of Users with
   a set of body Maps

a set of body Maps with
   a set of Regions
   a date Range

	a set of Regions with
	   a frequency Number
	   a median score Number
	   a summary String   
**actions** 
	sumRegion(period: Range, mapSet: Maps, region: Region): (score: Number, frequency: Number)
	   requires the Region must exist
	   effects scans Maps in date Range, counts Region hits, returns Region with associated Numbers
     
	summarise(period: Range, region: Region, score: Number, frequency: Number): (summary: String)
   requires the Region and its Numbers must exist
   effects returns a String incorporating the given values of Range, Region, and the Numbers


**AI-AUGMENTED CONCEPT DESIGN**

**concept** LLMMapSummaryGeneration
**purpose** concisely summarise all body map logs in a region-specific manner within given date range
**principle** users log region-specific pain scores;
              an LLM summarises this data over a user-provided date range;
              users can change the tone and audience of the summary
              based on what they want to use it for

**state **
a set of Users with
   a set of body Maps

a set of body Maps with
   a set of Regions
   a date Range

a set of Regions with
  a frequency Number
  a median score Number
  a fallback summary String
  an LLM Summary  

a set of LLM Summaries with
  an llm
  an emotional Tone
  a target Audience

**actions** 
	sumRegion(period: Range, mapSet: Maps, region: Region): (score: Number, frequency: Number)
	   **requires** the Region must exist
	   **effects** scans Maps in date Range, counts Region hits, returns Region with associated Numbers
     
	summarise(period: Range, region: Region, score: Number, frequency: Number): (summary: String)
   **requires** the Region and its Numbers must exist
   **effects** returns a String incorporating the given values of Range, Region, and the Numbers

  summariseWithLLM(period: Range, region: Region, score: Number, frequency: Number, 
                          tone: Tone, audience: Audience, llm: GeminiLLM): (summary: Summary)
   **requires** the Region must exist
   **effects** returns a Summary with Numbers attuned to the Tone and intended for the Audience
 

 notes
  I kept the summarise action because the code has a fallback option in the case that the LLM doesn't provide the necessary data after multiple prompts, which uses the manual way of concatenating the data as a static String. 