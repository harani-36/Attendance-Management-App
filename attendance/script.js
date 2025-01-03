window.onload = function() {
    fetchStudents(); // Fetch and display students when the page loads
};

// Fetch students from the server and populate the table
// Fetch students from the server and populate the table
function fetchStudents() {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const tableBody = document.getElementById('studentTableBody');
            tableBody.innerHTML = ''; // Clear existing rows

            students.forEach(student => {
                const row = document.createElement('tr');
                row.id = student.rollNumber;

                row.innerHTML = `
                    <td>${student.rollNumber}</td>
                    <td class="student-name">${student.studentName}</td>
                    <td class="attendance ${attendanceClass}" onclick="toggleAttendance(this, ${student.rollNumber})">
                        ${student.attendance}
                    </td>
                    <td>
                        <button class="update" onclick="updateStudent(${student.rollNumber})">Update</button>
                        <button class="delete" onclick="deleteStudent(${student.rollNumber})">Delete</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching students:', error));
}



// Function to toggle between present and absent
// Function to toggle between present and absent
function toggleAttendance(cell, rollNumber) {
    const currentAttendance = cell.textContent.trim();
    const newAttendance = currentAttendance === 'present' ? 'absent' : 'present';

    // Update the UI immediately
    cell.textContent = newAttendance;
    cell.style.backgroundColor = newAttendance === 'absent' ? 'red' : '';

    // Send updated data to the server
    fetch(`/api/students/${rollNumber}`, {
        method: 'PUT', // Use PUT or POST depending on your API design
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: newAttendance })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update attendance');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Attendance updated for Roll No: ${rollNumber}`);
        })
        .catch(error => {
            console.error('Error updating attendance:', error);
            // Revert changes in the UI in case of error
            cell.textContent = currentAttendance;
            cell.style.backgroundColor = currentAttendance === 'absent' ? 'red' : '';
        });
}



// Function to delete a student row and update the database
function deleteStudent(rollNumber) {
    fetch(`/api/students/${rollNumber}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Student deleted successfully!") {
            const row = document.getElementById(rollNumber);
            row.remove(); // Remove the row from the table
        }
    })
    .catch(error => console.error('Error deleting student:', error));
}

// Function to update a student's name and update the database
function updateStudent(rollNumber) {
    const row = document.getElementById(rollNumber);
    const currentName = row.querySelector('.student-name').textContent;

    const newName = prompt("Enter the new name for Roll Number " + rollNumber, currentName);

    if (newName) {
        // Update the student's name in the UI
        row.querySelector('.student-name').textContent = newName;

        // Update the student's name in the database
        fetch(`/api/students/${rollNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentName: newName })
        })
        .catch(error => console.error('Error updating student name:', error));
    }
}

// Function to add a new student and update the database
document.getElementById('addStudentButton').addEventListener('click', function() {
    const rollNumber = prompt("Enter the student's Roll Number:");
    const studentName = prompt("Enter the student's Name:");

    if (rollNumber && studentName) {
        const studentData = { rollNumber, studentName, attendance: 'present' };

        // Send new student data to the server
        fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Student added successfully!") {
                fetchStudents(); // Refresh the table
            } else {
                alert(data.message); // Show error if student already exists
            }
        })
        .catch(error => console.error('Error adding student:', error));
    }
});

// Function to download the table data as a CSV file
document.getElementById('submitButton').addEventListener('click', function() {
    // Fetch the data from the JSON file
    fetch('data.json')
        .then(response => response.json()) // Parse the JSON data
        .then(data => {
            // Check if data is empty
            if (!data || data.length === 0) {
                alert('No data available');
                return;
            }

            // Define the date you want to use in the CSV
            const date = new Date().toLocaleDateString(); // Use today's date

            // Create the CSV content with title, date, and headings
            let csvContent = 'Attendance\n'; // Title
            csvContent += `Date : ${date}\n`; // Date label
            csvContent += 'Roll Number,Student Name,Attendance\n'; // Headings in separate cells

            // Loop through the data and add each row
            data.forEach(row => {
                const rollNumber = row['rollNumber'];  // Correct key name
                const studentName = row['studentName'];  // Correct key name
                const attendance = row['attendance'];  // Correct key name

                // Format each row with separate cells for each data point
                csvContent += `${rollNumber},${studentName},${attendance}\n`; // Data in separate cells, comma separated
            });

            // Create a Blob from the CSV content
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a link element for downloading the file
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'students_attendance.csv');
                link.style.visibility = 'hidden';

                // Append the link to the body and trigger the click event to download the file
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
            alert('There was an error fetching the data');
        });
});
