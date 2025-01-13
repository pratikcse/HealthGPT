async function loadCSV(fileName, updateFrequency, elementId, displayMessage) {
    try {
        const response = await fetch(fileName);
        const text = await response.text();
  
        const rows = text.split('\n').slice(1).map(row => {
            const [timestamp, value] = row.split(',');
            return { timestamp, value };
        }).filter(row => row.timestamp && row.value);
        let index = 0;
        function displayRow() {
            if (index < rows.length) {
                const displayDiv = document.getElementById(elementId);
                const { timestamp, value } = rows[index];
                displayDiv.innerHTML = `${value.trim()} ${displayMessage}`;
                index++;
                setTimeout(displayRow, updateFrequency);
            } else {
                const displayDiv = document.getElementById(elementId);
                displayDiv.innerHTML = 'All data displayed!';
            }
        }
  
        displayRow();
  
    } catch (error) {
        console.error(`Error loading the CSV file (${fileName}):`, error);
    }
  }
  
  loadCSV('/static/calories.csv', 20000, 'caloriesBurned', 'cal');
  loadCSV('/static/heartbeat.csv', 5000, 'pulseRate', 'BPM');
  loadCSV('/static/sleep.csv', 86400000, 'sleepDuration', 'hrs');
  loadCSV('/static/steps.csv', 20000, 'stepsCount', 'steps');
  
  document.addEventListener('DOMContentLoaded', function () {
      const generateButton = document.getElementById('generate-prompt');
      const responseArea = document.getElementById('ai-response');
  
      generateButton.addEventListener('click', async () => {
          const pulseRate = document.getElementById('pulseRate').textContent.split(' ')[0];
          const caloriesBurned = document.getElementById('caloriesBurned').textContent.split(' ')[0];
          const sleepDuration = document.getElementById('sleepDuration').textContent.split(' ')[0];
          const stepsCount = document.getElementById('stepsCount').textContent.split(' ')[0];
  
          const prompt = `The user has provided the following current health metrics:
                          - Pulse Rate: ${pulseRate} bpm
                          - Calories Burned: ${caloriesBurned} kcal
                          - Sleep Duration: ${sleepDuration} hours
                          - Steps Count: ${stepsCount} steps
  
                          This is the user's **current situation**. Do not repeat the provided data or give insights for each metric separately. Instead, analyze the overall health situation and provide **3-5 short, relevant tips or recommendations** that address the user's well-being as a whole.
                          `;
  
          responseArea.textContent = "Generating response...";
  
          try {
              const response = await fetch('/gemini-api', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ prompt: prompt }),
              });
  
              if (!response.ok) {
                  const errorData = await response.json();
                  console.error("API Error:", errorData);
                  responseArea.textContent = `Error: ${errorData.error || 'An unexpected error occurred'}`;
                  return;
              }
  
              const data = await response.json();

              document.getElementById("ai-response").style.textAlign = "left";
  
              responseArea.innerHTML = '<h3>AI Response:</h3><ul>';
  
              const tips = data.response.split('\n').filter(line => line.trim().length > 0);
  
              tips.forEach(tip => {
                  const listItem = document.createElement('li');
                  listItem.textContent = tip.trim();
                  responseArea.appendChild(listItem);
              });
  
              responseArea.innerHTML += '</ul>';
          } catch (error) {
              console.error("Fetch error:", error);
              responseArea.textContent = "Error: Could not connect to the server.";
          }
      });
  });
  


function toggleHiddenForm() {
    const aiButton = document.getElementById('generate-prompt');

    aiButton.setAttribute('onclick', 'detailed_response()');

    const hiddenForm = document.getElementById('hiddenForm');
    if (hiddenForm.style.display === 'none' || hiddenForm.style.display === '') {
      hiddenForm.style.display = 'block';
    } else {
      hiddenForm.style.display = 'none';
    }
  }

  function detailed_response() {
    const responseArea = document.getElementById('ai-response');

    const chronicIllnesses = document.querySelector('textarea[name="chronic_illnesses"]').value;
    const medications = document.querySelector('textarea[name="medications"]').value;
    const allergies = document.querySelector('textarea[name="allergies"]').value;
    const surgeries = document.querySelector('textarea[name="surgeries"]').value;

    const smoke = document.querySelector('input[name="smoke"]:checked').value;
    const alcohol = document.querySelector('input[name="alcohol"]:checked').value;
    const exercise = document.querySelector('input[name="exercise"]').value;
    const sleep = document.querySelector('input[name="sleep"]').value;
    const diet = document.querySelector('input[name="diet"]').value;

    const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(symptom => symptom.value);
    const otherSymptom = document.querySelector('input#other').value;
    if (otherSymptom) {
        symptoms.push(otherSymptom);
    }

    const concerns = document.querySelector('textarea[name="concerns"]').value;
    const recommendations = document.querySelector('textarea[name="recommendations"]').value;


    const prompt = `
        Based on the user's provided health information, offer effective and actionable suggestions:

        - Pulse Rate: ${pulseRate} bpm
                          - Calories Burned: ${caloriesBurned} kcal
                          - Sleep Duration: ${sleepDuration} hours
                          - Steps Count: ${stepsCount} steps
        - **Medical History**:
          - Chronic Illnesses: ${chronicIllnesses || "None provided"}
          - Current Medications: ${medications || "None provided"}
          - Allergies: ${allergies || "None provided"}
          - Past Surgeries or Major Illnesses: ${surgeries || "None provided"}

        - **Lifestyle**:
          - Smoking: ${smoke}
          - Alcohol Consumption: ${alcohol}
          - Exercise Frequency: ${exercise || "Not specified"}
          - Average Sleep (hours per night): ${sleep || "Not specified"}
          - Diet Description: ${diet || "Not specified"}

        - **Symptoms**: ${symptoms.length > 0 ? symptoms.join(", ") : "No symptoms reported"}

        - **Concerns**:
          - ${concerns || "None provided"}

        - **Additional Professional Recommendations**:
          - ${recommendations || "None provided"}

        Based on the above details, provide:
        1. General health improvement tips.
        2. Suggested lifestyle changes or adjustments.
        3. Medications or treatments (if applicable) for the mentioned symptoms.
        4. Preventive care measures for overall wellness.

        Do not repeat the provided data or give insights for each metric separately.don't give educational response,act like you are a doctor or a nurse.The Response Shouldn't be too long and should have points format.
    `;


    responseArea.textContent = "Generating detailed response...";

    fetch('/gemini-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'An unexpected error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            responseArea.innerHTML = '<h3>AI Detailed Response:</h3><ul>';

            const tips = data.response.split('\n').filter(line => line.trim().length > 0);

            tips.forEach(tip => {
                const listItem = document.createElement('li');
                listItem.textContent = tip.trim();
                responseArea.appendChild(listItem);
            });

            responseArea.innerHTML += '</ul>';
        })
        .catch(error => {
            console.error("Fetch error:", error);
            responseArea.textContent = "Error: Could not connect to the server.";
        });
}
