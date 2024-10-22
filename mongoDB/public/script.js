$(document).ready(function () {
    // Initially hide elements that shouldn't be visible
    $('.form-group.mt-3').hide();
    $('button[data-cy="add_log_btn"]').hide();
    $('#uvuIdLabel').hide();
    $('#uvuId').hide();

    // Function to load courses
    async function loadCourses() {
        try {
            const response = await fetch('http://localhost:8000/api/v1/courses');
            const courses = await response.json();
            $('#course').empty().append(new Option("Choose Courses", ""));
            courses.forEach(function (course) {
                $('#course').append(new Option(course.display, course.id));
            });
            $('#course').append(new Option("Add New Course", "add_new"));
        } catch (error) {
            alert('Failed to load courses. Please try again later.');
        }
    }

    // Function to load logs based on selected course and UVU ID
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
            $('ul[data-cy="logs"]').html('<li class="custom-list-item">No logs available</li>');
            $('button[data-cy="add_log_btn"]').prop('disabled', true);
            $('#uvuIdDisplay').hide();
        }
    }

    // Function to display logs in the UI
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

    // Function to delete a log by its ID
    function deleteLog(logId) {
        if (confirm('Are you sure you want to delete this log?')) {
            $.ajax({
                url: `http://localhost:8000/api/v1/logs/${logId}`,
                method: 'DELETE',
                success: function () {
                    $(`li[data-log-id="${logId}"]`).remove();
                    alert('Log deleted successfully!');
                },
                error: function () {
                    alert('Error deleting log. Please try again.');
                }
            });
        }
    }

    // Event listener for course selection change
    $('#course').change(function () {
        const courseSelected = $(this).val();
        if (courseSelected === "add_new") {
            const newCourseId = prompt("Enter course ID (e.g., cs1400 or eng1400):").trim().toLowerCase();
            const newCourseDisplay = formatCourseId(newCourseId);
            if (newCourseId) {
                $.ajax({
                    url: 'http://localhost:8000/api/v1/courses',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ id: newCourseId, display: newCourseDisplay }),
                    success: function () {
                        alert('Course added successfully!');
                        loadCourses();
                    },
                    error: function (xhr) {
                        if (xhr.status === 400) {
                            alert('Course ID already exists. Please try a different ID.');
                        } else {
                            alert('Error adding course. Please try again.');
                        }
                    }
                });
            }
        } else if (courseSelected) {
            $('#deleteCourseBtn').show();
            $('#uvuIdLabel').show();
            $('#uvuId').show();
            $('.form-group.mt-3, button[data-cy="add_log_btn"]').show();
            loadLogs();
        } else {
            $('.form-group.mt-3, button[data-cy="add_log_btn"]').hide();
            $('#uvuIdLabel').hide();
            $('#uvuId').hide();
            $('#deleteCourseBtn').hide();
        }
    });

    // Event listener for UVU ID input changes
    $('#uvuId').on('input', loadLogs);

    // Event listener for form submission (adding new logs)
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

    // Utility function to format course IDs
    function formatCourseId(courseId) {
        const regex = /^([a-zA-Z]+)(\d+)([a-zA-Z]*)$/;
        const match = courseId.match(regex);
        if (match) {
            const prefix = match[1].toUpperCase();
            const number = match[2];
            const suffix = match[3].toUpperCase();
            return `${prefix} ${number}${suffix ? ' ' + suffix : ''}`;
        }
        return courseId.toUpperCase();
    }

    // Load courses initially
    loadCourses();
});
