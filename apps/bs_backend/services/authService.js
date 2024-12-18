// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const prisma = require('../prisma-client');

// // Register
// const register = async (name, email, password, role) => {
//     try {
//         // Check if email already exists
//         const isEmailExists = await prisma.user.findUnique({
//             where: {
//                 email,
//             },
//         });

//         if (isEmailExists) {
//             return res.status(409).json({
//                 message: 'Email already exists.',
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user
//         const user = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//                 role,
//             },
//         });

//         function excludePassword(obj) {
//             const { password, ...rest } = obj; // Destructure password and exclude it
//             return rest;
//         }

//         const updatedUser = excludePassword(user);

//         return updatedUser;
// };

// // Login
// const login = async (req, res) => {
//     const { email, password } = req.body;
//     console.log(req.body);

//     try {
//         // Check if user exists
//         const user = await prisma.user.findUnique({ where: { email } });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Validate password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         // Generate JWT
//         const token = jwt.sign(
//             {
//                 id: user.id,
//                 role: user.role,
//                 name: user.name,
//             },
//             process.env.JWT_SECRET_KEY,
//             { expiresIn: '1h' }
//         );

//         res.json({ token, role: user.role });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
