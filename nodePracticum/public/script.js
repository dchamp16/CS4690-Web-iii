document.addEventListener('DOMContentLoaded', () => {
  const courseSelect = document.getElementById('course');
  const uvuIdInput = document.getElementById('uvuId');
  const uvuIdLabel = document.getElementById('uvuIdLabel');
  const uvuIdDisplay = document.getElementById('uvuIdDisplay');
  const logsContainer = document.querySelector("[data-cy='logs']");
  const textareaContainer = document.querySelector('.form-group.mt-3'); // container for textarea
  const textarea = document.querySelector("[data-cy='log_textarea']");
  const submitButton = document.querySelector("[data-cy='add_log_btn']");

  // Initially hide the textarea and the button
  textareaContainer.style.display = 'none';
  submitButton.style.display = 'none';

  console.log('Textarea element:', textarea);

  // Load courses dynamically
  async function loadCourses() {
    try {
      const response = await fetch('http://localhost:4000/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const courses = await response.json();
      courses.forEach((course) => {
        courseSelect.add(new Option(course.display, course.id));
      });
    } catch (error) {
      console.error('Error loading courses:', error);
      alert('Failed to load courses. Please try again later.');
    }
  }


  // Show/hide UVU ID input based on course selection and load logs
  courseSelect.addEventListener('change', () => {
    const courseSelected = !!courseSelect.value;
    uvuIdLabel.style.display = uvuIdInput.style.display = courseSelected
      ? 'block'
      : 'none';
    uvuIdDisplay.style.display = 'none';
    logsContainer.innerHTML = courseSelected
      ? ''
      : '<li class="list-group-item">No logs available</li>';
    submitButton.disabled = true;

    // Hide the textarea and button until a valid UVU ID is entered
    textareaContainer.style.display = 'none';
    submitButton.style.display = 'none';

    if (courseSelected) loadLogs();
  });

  // Fetch and display logs when UVU ID changes
  uvuIdInput.addEventListener('input', loadLogs);

  // Fetch and display logs based on selected course and UVU ID
  async function loadLogs() {
    const uvuId = uvuIdInput.value;
    const courseId = courseSelect.value;

    if (uvuId.length === 8 && /^\d+$/.test(uvuId)) {
      try {
        // Update the URL to point to your local server
        const response = await fetch(
            `http://localhost:4000/logs?courseId=${courseId}&uvuId=${uvuId}`
        );
        if (!response.ok) throw new Error('Failed to fetch logs');
        const logs = await response.json();
        displayLogs(logs);
        uvuIdDisplay.textContent = `Student Logs for ${uvuId}`;
        uvuIdDisplay.style.display = 'block';

        textareaContainer.style.display = 'block';
        submitButton.style.display = 'block';
      } catch (error) {
        console.error('Error fetching logs:', error);
        alert('Error fetching logs. Please try again later.');
      }
    } else {
      logsContainer.innerHTML = '<li class="list-group-item">No logs available</li>';
      submitButton.disabled = true;
      uvuIdDisplay.style.display = 'none';

      // Hide textarea and button if UVU ID is invalid
      textareaContainer.style.display = 'none';
      submitButton.style.display = 'none';
    }
  }

  // Display logs in the list
  function displayLogs(logs) {
    logsContainer.innerHTML = logs.length
      ? logs
          .map(
            (log) => `
      <li class="list-group-item">
        <div class="d-flex justify-content-between">
          <small>${log.date}</small>
        </div>
        <pre class="mt-2"><p>${log.text}</p></pre>
      </li>`
          )
          .join('')
      : '<li class="list-group-item">No logs available</li>';

    Array.from(logsContainer.children).forEach((logItem) =>
      logItem.addEventListener('click', () => {
        const logText = logItem.querySelector('pre');
        logText.style.display =
          logText.style.display === 'none' ? 'block' : 'none';
      })
    );
    submitButton.disabled = !textarea.value.trim();
  }

  // Enable or disable the submit button based on conditions
  textarea.addEventListener('input', () => {
    submitButton.disabled = !(
      textarea.value.trim() && logsContainer.children.length > 0
    );
  });

  // Submit new log
  document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const newLog = {
      courseId: courseSelect.value,
      uvuId: uvuIdInput.value,
      text: textarea.value,
      date: new Date().toLocaleString(),
    };
    try {
      const response = await fetch(
          'http://localhost:4000/logs',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLog),
        }
      );
      if (!response.ok) throw new Error('Failed to submit new log');
      if (logsContainer.textContent.includes('No logs available'))
        logsContainer.innerHTML = '';
      const logItem = document.createElement('li');
      logItem.classList.add('list-group-item');
      logItem.innerHTML = `
        <div class="d-flex justify-content-between">
          <small>${newLog.date}</small>
        </div>
        <pre class="mt-2"><p>${newLog.text}</p></pre>
      `;
      logItem.addEventListener('click', () => {
        const logText = logItem.querySelector('pre');
        logText.style.display =
          logText.style.display === 'none' ? 'block' : 'none';
      });
      logsContainer.appendChild(logItem);
      textarea.value = '';
      submitButton.disabled = true;
    } catch (error) {
      console.error('Error submitting log:', error);
      alert('Error submitting the log. Please try again later.');
    }
  });

  // Load courses on page load
  loadCourses();
});
