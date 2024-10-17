async function getLogs() {
  try {
      const fetchLogs = await fetch('http://localhost:8000/api/v1/logs');
      const response = await fetchLogs.json();
      console.log(response);
  } catch (error) {
      console.error('error fetching logs from MongoDB: ', error);
  }
}

getLogs();

async function getCourse() {
  try {
      const fetchCourse = await fetch('http://localhost:8000/api/v1/courses');
      const response = await fetchCourse.json();
      console.log(response);
  } catch (error) {
      console.error('error fetching courses from MongoDB: ', error);
  }
}

getCourse();

function deleteLog(logId) {
  if (confirm('Are you sure you want to delete this log?')) {
      $.ajax({
          url: `http://localhost:8000/api/v1/logs/${logId}`,
          method: 'DELETE',
          success: function () {
              // On successful deletion, remove the log from the UI
              $(`li[data-log-id="${logId}"]`).remove();
              alert('Log deleted successfully!');
          },
          error: function () {
              alert('Error deleting log. Please try again.');
          }
      });
  }
}


$(document).ready(function () {
  function loadCourses() {
      $.ajax({
          url: 'http://localhost:8000/api/v1/courses',
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

  $('.form-group.mt-3, button[data-cy="add_log_btn"]').hide();

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

  $('#uvuId').on('input', loadLogs);

  function loadLogs() {
      const uvuId = $('#uvuId').val();
      const courseId = $('#course').val();

      if (uvuId.length === 8 && /^\d+$/.test(uvuId)) {
          $.ajax({
              url: `http://localhost:8000/api/v1/logs?courseId=${courseId}&uvuId=${uvuId}`,
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

  function displayLogs(logs) {
    const logsHTML = logs.length
        ? logs.map(function (log) {
              return `
      <li class="custom-list-item" data-log-id="${log._id}">
          <div class="log-header">
              <small>${log.date}</small>
              <i class="fas fa-trash delete-log" style="cursor: pointer;"></i>
          </div>
          <pre class="log-text mt-2"><p>${log.text}</p></pre>
      </li>`;
          }).join('')
        : '<li class="custom-list-item">No logs available</li>';

    $('ul[data-cy="logs"]')
        .html(logsHTML)
        .children()
        .click(function () {
            $(this).find('pre').toggle();
        });

    // Attach event listener to delete icons
    $('.delete-log').click(function (event) {
        event.stopPropagation(); // Prevent the click from toggling the log text
        const logId = $(this).closest('li').attr('data-log-id');
        deleteLog(logId); // Call delete function
    });

    $('button[data-cy="add_log_btn"]').prop(
        'disabled',
        !$('textarea[data-cy="log_textarea"]').val().trim()
    );
}


  $('textarea[data-cy="log_textarea"]').on('input', function () {
      $('button[data-cy="add_log_btn"]').prop(
          'disabled',
          !$(this).val().trim() && $('ul[data-cy="logs"]').children().length > 0
      );
  });

  $('form').submit(function (event) {
      event.preventDefault();
      const newLog = {
          courseId: $('#course').val(),
          uvuId: $('#uvuId').val(),
          text: $('#newLog').val(),
          date: new Date().toLocaleString(),
      };
      $.ajax({
          url: 'http://localhost:8000/api/v1/logs',
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

  loadCourses();
});
