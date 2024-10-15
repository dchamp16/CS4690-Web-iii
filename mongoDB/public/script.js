$(document).ready(function () {
  // Load courses dynamically
  function loadCourses() {
    $.ajax({
      url: 'api/v1/courses',
      method: 'GET',
      success: function (courses) {
        courses.forEach(function (course) {
          $('#course').append(new Option(course.display, course.id));
        });
      },
      error: function () {
        alert('Failed to load courses. Please try again later.');
      },
    });
  }

  // Initially hide the new log section
  $('.form-group.mt-3, button[data-cy="add_log_btn"]').hide();

  // Show/hide UVU ID input and new log section based on course selection and load logs
  $('#course').change(function () {
    const courseSelected = !!$(this).val();
    $('#uvuIdLabel, #uvuId').toggle(courseSelected);
    $('#uvuIdDisplay').hide();
    $('.form-group.mt-3, button[data-cy="add_log_btn"]').toggle(courseSelected);
    $('ul[data-cy="logs"]').html(
        courseSelected ? '' : '<li class="custom-list-item">No logs available</li>'
    );
    $('button[data-cy="add_log_btn"]').prop('disabled', true);
    if (courseSelected) loadLogs();
  });

  // Fetch and display logs when UVU ID changes
  $('#uvuId').on('input', loadLogs);

  // Fetch and display logs based on selected course and UVU ID
  function loadLogs() {
    const uvuId = $('#uvuId').val();
    const courseId = $('#course').val();

    if (uvuId.length === 8 && /^\d+$/.test(uvuId)) {
      $.ajax({
        url: `/api/v1/logs?courseId=${courseId}&uvuId=${uvuId}`,
        method: 'GET',
        success: function (logs) {
          displayLogs(logs);
          $('#uvuIdDisplay').text(`Student Logs for ${uvuId}`).show();
        },
        error: function () {
          alert('Error fetching logs. Please try again later.');
        },
      });
    } else {
      $('ul[data-cy="logs"]').html(
          '<li class="custom-list-item">No logs available</li>'
      );
      $('button[data-cy="add_log_btn"]').prop('disabled', true);
      $('#uvuIdDisplay').hide();
    }
  }

  // Display logs in the list
  function displayLogs(logs) {
    const logsHTML = logs.length ? logs.map(function (log) {
      return `
        <li class="custom-list-item">
          <div class="log-header"><small>${log.date}</small></div>
          <pre class="log-text mt-2"><p>${log.text}</p></pre>
        </li>`;
    }).join('') : '<li class="custom-list-item">No logs available</li>';
    $('ul[data-cy="logs"]').html(logsHTML).children().click(function () {
      $(this).find('pre').toggle();
    });
    $('button[data-cy="add_log_btn"]').prop('disabled', !$('textarea[data-cy="log_textarea"]').val().trim());
  }

  // Enable or disable the submit button based on textarea input
  $('textarea[data-cy="log_textarea"]').on('input', function () {
    $('button[data-cy="add_log_btn"]').prop('disabled', !$(this).val().trim() && $('ul[data-cy="logs"]').children().length > 0);
  });

  // Submit new log
  $('form').submit(function (event) {
    event.preventDefault();
    const newLog = {
      courseId: $('#course').val(),
      uvuId: $('#uvuId').val(),
      text: $('#newLog').val(),
      date: new Date().toLocaleString(),
    };
    $.ajax({
      url: 'api/v1/logs',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newLog),
      success: function () {
        if ($('ul[data-cy="logs"]').text().includes('No logs available'))
          $('ul[data-cy="logs"]').html('');
        const logItem = $(`
          <li class="custom-list-item">
            <div class="log-header"><small>${newLog.date}</small></div>
            <pre class="log-text mt-2"><p>${newLog.text}</p></pre>
          </li>
        `);
        logItem.click(function () {
          $(this).find('pre').toggle();
        });
        $('ul[data-cy="logs"]').append(logItem);
        $('#newLog').val('');
        $('button[data-cy="add_log_btn"]').prop('disabled', true);
      },
      error: function () {
        alert('Error submitting the log. Please try again later.');
      },
    });
  });

  // Load courses on page load
  loadCourses();
});