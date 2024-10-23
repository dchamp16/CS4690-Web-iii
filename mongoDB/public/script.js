$(document).ready(function () {
    // Initially hide elements
    $('.form-group.mt-3').hide();
    $('button[data-cy="add_log_btn"]').hide();
    $('#uvuIdLabel').hide();
    $('#uvuId').hide();

    // Load courses
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
            $('#uvuIdLabel, #uvuId').show();
            $('.form-group.mt-3, button[data-cy="add_log_btn"]').show();
            $('#deleteCourseBtn').show();
            loadLogs();
        } else {
            $('#uvuIdLabel, #uvuId').hide();
            $('.form-group.mt-3, button[data-cy="add_log_btn"]').hide();
            $('#deleteCourseBtn').hide();
        }
    });

    $('#deleteCourseBtn').click(function () {
        const courseId = $('#course').val();
        if (courseId && confirm('Are you sure you want to delete this course? All associated logs will be deleted.')) {
            $.ajax({
                url: `http://localhost:8000/api/v1/courses/${courseId}`,
                method: 'DELETE',
                success: function () {
                    alert('Course and associated logs deleted successfully!');
                    loadCourses();
                },
                error: function () {
                    alert('Error deleting course. Please try again.');
                }
            });
        }
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
            $('ul[data-cy="logs"]').html('<li class="custom-list-item">No logs available</li>');
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

        $('ul[data-cy="logs"]').html(logsHTML).children().click(function () {
            $(this).find('pre').toggle();
        });

        $('.delete-log').click(function (event) {
            event.stopPropagation();
            const logId = $(this).closest('li').attr('data-log-id');
            deleteLog(logId);
        });

        $('button[data-cy="add_log_btn"]').prop(
            'disabled',
            !$('textarea[data-cy="log_textarea"]').val().trim()
        );
    }

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

    loadCourses();
});