const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3100;

app.use(express.static(__dirname));
app.use(express.json()); // To parse JSON body data

// Load students data from data.json
const loadStudentsData = () => {
    const data = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    return JSON.parse(data);
};

// Save students data to data.json
const saveStudentsData = (students) => {
    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(students, null, 2));
};

// Endpoint to get all students
app.get('/api/students', (req, res) => {
    const students = loadStudentsData();
    res.json(students);
});

// Endpoint to add a new student
app.post('/api/students', (req, res) => {
    const { rollNumber, studentName, attendance = 'present' } = req.body;
    const students = loadStudentsData();

    // Check if the roll number already exists
    if (students.some(student => student.rollNumber === rollNumber)) {
        return res.status(400).json({ message: "Roll Number already exists!" });
    }

    // Add the new student
    students.push({ rollNumber, studentName, attendance });
    saveStudentsData(students);

    res.status(201).json({ message: "Student added successfully!" });
});

// Endpoint to update a student's name or attendance
// Endpoint to update a student's name or attendance
app.put('/api/students/:rollNumber', (req, res) => {
    const { rollNumber } = req.params;
    const { studentName, attendance } = req.body;  // Get new student name and attendance from request body
    const students = loadStudentsData();

    // Find student by rollNumber
    const student = students.find(student => student.rollNumber === rollNumber);

    if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Update student details
    if (studentName) student.studentName = studentName;
    if (attendance) student.attendance = attendance;

    // Save the updated list to data.json
    saveStudentsData(students);

    res.status(200).json({ message: "Student details updated successfully!" });
});




// Endpoint to delete a student
app.delete('/api/students/:rollNumber', (req, res) => {
    const { rollNumber } = req.params;
    const students = loadStudentsData();

    // Find index of the student to delete
    const studentIndex = students.findIndex(student => student.rollNumber === rollNumber);

    if (studentIndex === -1) {
        return res.status(404).json({ message: "Student not found" });
    }

    // Remove the student from the array
    students.splice(studentIndex, 1);

    // Save the updated students list to data.json
    saveStudentsData(students);

    res.status(200).json({ message: "Student deleted successfully!" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
