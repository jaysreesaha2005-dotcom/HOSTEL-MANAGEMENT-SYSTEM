const Student = require("../models/Student");

const sampleStudents = [
  {
    name: "Aarav Sharma",
    registrationNumber: "REG2024001",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    department: "Computer Science & Engineering",
    year: 2,
    gender: "Male"
  },
  {
    name: "Priya Patel",
    registrationNumber: "REG2024002",
    email: "priya.patel@example.com",
    phone: "9876543211",
    department: "Information Technology",
    year: 2,
    gender: "Female"
  },
  {
    name: "Rohan Verma",
    registrationNumber: "REG2024003",
    email: "rohan.verma@example.com",
    phone: "9876543212",
    department: "Mechanical Engineering",
    year: 3,
    gender: "Male"
  },
  {
    name: "Ananya Iyer",
    registrationNumber: "REG2024004",
    email: "ananya.iyer@example.com",
    phone: "9876543213",
    department: "Electronics & Communication",
    year: 1,
    gender: "Female"
  },
  {
    name: "Vikram Singh",
    registrationNumber: "REG2024005",
    email: "vikram.singh@example.com",
    phone: "9876543214",
    department: "Civil Engineering",
    year: 4,
    gender: "Male"
  },
  {
    name: "Sneha Reddy",
    registrationNumber: "REG2024006",
    email: "sneha.reddy@example.com",
    phone: "9876543215",
    department: "Electrical Engineering",
    year: 2,
    gender: "Female"
  },
  {
    name: "Aditya Nair",
    registrationNumber: "REG2024007",
    email: "aditya.nair@example.com",
    phone: "9876543216",
    department: "Computer Science & Engineering",
    year: 1,
    gender: "Male"
  },
  {
    name: "Ishita Sen",
    registrationNumber: "REG2024008",
    email: "ishita.sen@example.com",
    phone: "9876543217",
    department: "Biotechnology",
    year: 3,
    gender: "Female"
  }
];

// Get all students (auto-seeds if collection is empty)
exports.getStudents = async (req, res) => {
  try {
    let count = await Student.countDocuments();
    if (count === 0) {
      // Auto-populate initial students for seamless integration
      await Student.insertMany(sampleStudents);
    }

    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { registrationNumber: searchRegex },
        { department: searchRegex }
      ];
    }

    const students = await Student.find(query).sort({ registrationNumber: 1 });

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single student
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, registrationNumber, email, phone, department, year, gender } = req.body;

    if (!name || !registrationNumber) {
      return res.status(400).json({
        success: false,
        message: "Student name and registration number are required"
      });
    }

    const existing = await Student.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase()
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student with registration number ${registrationNumber} already exists`
      });
    }

    const student = await Student.create({
      name: name.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone ? phone.trim() : "",
      department: department ? department.trim() : "General",
      year: year ? Number(year) : 1,
      gender: gender || "Male"
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

