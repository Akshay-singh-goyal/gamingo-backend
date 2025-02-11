require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
const { body, validationResult } = require('express-validator');
const users = require("./routes/users");
const authRoutes = require("./routes/auth");
const passwordResetRoutes = require("./routes/passwordReset");
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const walletRoutes = require('./routes/walletRoutes');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamezone';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Middleware setup
app.use(express.json());
app.use(cors());

// WebSocket setup
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

// Route handling
app.use("/api/users", users);
app.use("/api/auth", authRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/users', dashboardRoutes);

// User Schema and Model (assuming user authentication is handled somewhere else)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// Ticket Schema and Model
const ticketSchema = new mongoose.Schema({
  name: String,
  email: String,
  issueType: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  ticketId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  selectedGames: { type: [String], required: true },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  paymentDate: { type: Date },
});
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  whatsappnumber: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Nodemailer transport setup (for Gmail or SMTP service)
const transporter = nodemailer.createTransport({
  host: process.env.HOST || 'smtp.gmail.com', 
  port: process.env.EMAIL_PORT || 587, 
  secure: false,
  auth: {
    user: process.env.USER,  
    pass: process.env.PASS,  
  },
});

// Send email confirmation to the user
async function sendPaymentConfirmationEmail(email, userName, ticketId, totalPrice, eventName) {
  const mailOptions = {
    from: process.env.SMTP_USER,  
    to: email,  
    subject: 'Payment Confirmation – Your Ticket for ' + eventName,
    html: `
      <h1>Payment Confirmation – ${eventName}</h1>
      <p>Dear ${userName},</p>
      <p>We are pleased to inform you that your payment has been successfully processed.</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
      <p><strong>Event:</strong> ${eventName}</p>

      <p><strong>What to Expect Next:</strong></p>
      <ul>
        <li>The payment confirmation list will be updated and shared every hour in our <strong><a href="${process.env.WHATSAPP_GROUP_URL}" target="_blank">WhatsApp group</a></strong>.</li>
        <li>Kindly check the WhatsApp group regularly for updates on your payment status.</li>
      </ul>

      <p>If you have any questions or need assistance, feel free to contact us:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></li>
        <li><strong>Phone:</strong> ${process.env.SUPPORT_PHONE}</li>
      </ul>

      <p>Thank you for choosing <strong>${process.env.COMPANY_NAME}</strong>. We appreciate your business and look forward to serving you!</p>

      <p>Best regards,<br/>
      The <strong>${process.env.COMPANY_NAME}</strong> Team<br/>
      <strong>${process.env.COMPANY_NAME}</strong> | <a href="${process.env.COMPANY_WEBSITE}">${process.env.COMPANY_WEBSITE}</a></p>

      <p><em>If you did not make this payment, please contact us immediately.</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email: ', error);
  }
}
// Routes

// Fetch user details
app.get('/api/auth', async (req, res) => {
  try {
    // For simplicity, assuming a mock user is returned
    const user = await User.findOne(); // In a real application, you would use authentication middleware to get user details
    res.json({ username: user ? user.username : 'Guest' });
  } catch (error) {
    console.log('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new support ticket
app.post('/api/tickets/create', async (req, res) => {
  const { name, email, issueType, message } = req.body;
  try {
    const newTicket = new Ticket({ name, email, issueType, message });
    await newTicket.save();
    res.status(201).json({ success: true, message: 'Ticket created successfully!' });
  } catch (error) {
    console.log('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket. Please try again later.' });
  }
});
// Define tickets globally at the top of your file
let tickets = [];

// Then the rest of the code goes as follows:
app.post('/api/tickets/purchase', (req, res) => {
  const { name, email, amount, ticketId } = req.body;

  if (!name || !email || !amount || !ticketId) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    // Save the ticket details to the tickets array
    const newTicket = {
      ticketId,
      name,
      email,
      amount,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    tickets.push(newTicket);  // This now works because tickets is defined globally

    // Send success response
    res.status(200).json({ message: 'Ticket purchased successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error occurred while processing the purchase:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});


// Endpoint for payment confirmation
app.post('/api/tickets/confirm-payment', async (req, res) => {
  const { email, ticketId, totalPrice, userName, eventName } = req.body;

  if (!email || !ticketId || !totalPrice || !userName || !eventName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find the ticket by email and ticketId
  const ticket = tickets.find(ticket => ticket.ticketId === ticketId && ticket.email === email);

  if (!ticket) {
    return res.status(400).json({ message: 'Ticket not found.' });
  }

  // Update ticket status to 'Paid'
  ticket.status = 'Paid';

  // Send email confirmation
  await sendPaymentConfirmationEmail(email, userName, ticketId, totalPrice, eventName);

  // Respond with a success message
  res.status(200).json({
    message: 'Payment confirmed! A confirmation email has been sent.',
    ticket,
  });
});

// Define the Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Route to handle newsletter subscriptions
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ error: 'This email is already subscribed' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    res.status(200).json({ message: 'Successfully subscribed to the newsletter' });
  } catch (error) {
    console.error('Error saving newsletter subscription:', error);
    res.status(500).json({ error: 'An error occurred while subscribing. Please try again.' });
  }
});

// Start server
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
