const Student = require("../models/Student");

const sampleStudents = [
  {
    name: "Aarav Sharma",
    registrationNumber: "REG2024001",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    course: "Computer Science",
    department: "Computer Science & Engineering",
    year: "2",
    gender: "Male"
  },
  {
    name: "Priya Patel",
    registrationNumber: "REG2024002",
    email: "priya.patel@example.com",
    phone: "9876543211",
    course: "Information Technology",
    department: "Information Technology",
    year: "2",
    gender: "Female"
  },
  {
    name: "Rohan Verma",
    registrationNumber: "REG2024003",
    email: "rohan.verma@example.com",
    phone: "9876543212",
    course: "Mechanical Engineering",
    department: "Mechanical Engineering",
    year: "3",
    gender: "Male"
  },
  {
    name: "Ananya Iyer",
    registrationNumber: "REG2024004",
    email: "ananya.iyer@example.com",
    phone: "9876543213",
    course: "Electronics & Communication",
    department: "Electronics & Communication",
    year: "1",
    gender: "Female"
  },
  {
    name: "Vikram Singh",
    registrationNumber: "REG2024005",
    email: "vikram.singh@example.com",
    phone: "9876543214",
    course: "Civil Engineering",
    department: "Civil Engineering",
    year: "4",
    gender: "Male"
  },
  {
    name: "Sneha Reddy",
    registrationNumber: "REG2024006",
    email: "sneha.reddy@example.com",
    phone: "9876543215",
    course: "Electrical Engineering",
    department: "Electrical Engineering",
    year: "2",
    gender: "Female"
  },
  {
    name: "Aditya Nair",
    registrationNumber: "REG2024007",
    email: "aditya.nair@example.com",
    phone: "9876543216",
    course: "Computer Science",
    department: "Computer Science & Engineering",
    year: "1",
    gender: "Male"
  },
  {
    name: "Ishita Sen",
    registrationNumber: "REG2024008",
    email: "ishita.sen@example.com",
    phone: "9876543217",
    course: "Biotechnology",
    department: "Biotechnology",
    year: "3",
    gender: "Female"
  }
];

// Add student
exports.addStudent = async (req, res) => {
  try {
    const studentData = { ...req.body };
    if (studentData.registrationNumber) {
      studentData.registrationNumber = studentData.registrationNumber.trim().toUpperCase();
    }
    if (!studentData.course && studentData.department) {
      studentData.course = studentData.department;
    }
    if (!studentData.department && studentData.course) {
      studentData.department = studentData.course;
    }

    const student = await Student.create(studentData);
    res.status(201).json({
      message: "Student added successfully",
      student,
      data: student
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createStudent = exports.addStudent;

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    if (count === 0) {
      await Student.insertMany(sampleStudents);
    }

    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { registrationNumber: searchRegex },
        { course: searchRegex },
        { department: searchRegex },
        { roomNumber: searchRegex }
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one student
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.registrationNumber) {
      updateData.registrationNumber = updateData.registrationNumber.trim().toUpperCase();
    }
    if (!updateData.course && updateData.department) {
      updateData.course = updateData.department;
    }
    if (!updateData.department && updateData.course) {
      updateData.department = updateData.course;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
