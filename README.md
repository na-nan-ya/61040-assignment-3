**Assignment 3 Answers**

1. User Journey

A user has been logging moderate-to-severe knee pain in their BodyMaps almost everyday for a month now. The user's doctor has advised them to only schedule an appointment when the pain has been consistently bad for a month. The user taps the already highlighted knee region of that day's BodyMap and selects the last month's date range, an encouraging tone, and a patient (i.e. user) audience. They want to feel validated that they are not exaggerating the pain in their head. Now, instead of a bland single-sentence stats summary, the summary commends them for consistently logging their pain and presents the numbers. The user screenshots it for their own reference. Then, they repeat the process but select a factual tone and a healthcare professional audience for the summary to be directed at. This time, it is a concsise, professional summary that illustrates the patient's pain. They schedule an appointment and screenshot this as well to show to their PCP.

[UX Sketch](UXSketch.png)

2. 3 test cases

- Single datapoint: The user was recommended this app by a friend and decided to try it. However, they only logged moderate pain in their left leg on the first night they downloaded it. They don't really understand how the summary is meant to be used so they request an LLM-generated summary the very next day. As expected, the LLM was still able to generate a frequency and 'median' score based on the single datapoint. There were no issues encountered with this. However, there could be a function that prompts the LLM to remind the user to log more data for better results based on the size of the given dataset per region whose summary is requested.

- Emotional tone mismatch: The user has been experiencing severe pain in their right leg for 3 days. They request a summary with an encouraging tone for a patient audience. When given a severe pain score and an 'optimistic' tone, the LLM failed the validation checks. It kept providing medical advice in response to the severity of the score or ommitted data in favour of comforting the user, resulting in the fallback string summary being used multiple times. This is still an outstanding issue because, given the sequence of actions and general user freedom, I don't want to limit which tones the user can choose.

- No data: In contrast to the single datapoint case, this requires a separate kind out output. The user has not logged any data for a region yet but mistakenly generates a summary for it. In this case, since the LLM summary fails the validator check, there is alternative fallback String summary that explains that they have not logged anything yet (not that any pain was logged but just low!).

Note: The 'scenarios' in the code just illustrate potential use-cases with the user journey, they are not meant to be test cases!

3. Validators

- Issue 1: Hallucinates regions that were not in the requested data and makes up numbers for them. For example, when asked to summarise a user's lower back pain, it would also include a mention of neck pain and a fake median score of 6.5. This was fixed by creating a set of common body regions and checking the output to see if it contained any of these regions that weren't in the relevant data (function: regionValidation).

- Issue 2: Not including all the relevant information. When the tone was changed, it sometimes omitted the actual important information like frequency and median score in favour of encouraging statements, for example. The code remedies this by checking for mentions of the words 'median' and 'frequency', then throws an error and regenerates the summary if it doesn't contain both (function: numericalValidation).

- Issue 3: It attempts to provide medical advice or push the user to act in a certain way. For example, it would suggest potential home remedies for neck pain. The summary (and the app as a whole) is not intended to substitute a medical professional in any way, it is simply a data-driven tool. The code checks the summary for commonly used phrases in diagnosis/prognosis such as 'this indicates that' or 'you could attempt' and fails the summary's validation check if it does (function: medicalAdviceCheck).
