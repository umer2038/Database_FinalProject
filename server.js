// Import Dependencies
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '2236462$',
  database: 'corporatemanagement',
});


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the MySQL database!');
});

app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json());


const transporter = {
  sendMail: (mailOptions, callback) => {
    console.log("Simulated email sent to:", mailOptions.to);
    console.log("Subject:", mailOptions.subject);
    console.log("Message:", mailOptions.text);
    callback(null, { message: 'Email sent successfully' });
  }
};

// --------------------- Routes ---------------------

app.get('/chart-data', (req, res) => {
  const query = 'SELECT Name, CertificationStatus FROM vendor';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching chart data:', err);
      return res.status(500).json({ message: 'Error fetching chart data' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No vendor data available.' });
    }

    const formattedData = results.map((item) => ({
      Name: item.Name,
      CertificationStatus: item.CertificationStatus ? 1 : 0,
    }));

    res.json(formattedData);
  });
});

// Route: Fetch Contract Renewals
app.get('/check-contract-renewals', (req, res) => {
  const { sortBy, filterStatus } = req.query;
  let query = 'SELECT RenewalID, ContractID, RenewalDate, RenewalStatus FROM ContractRenewals';

  if (filterStatus) {
    query += ` WHERE RenewalStatus = '${filterStatus}'`;
  }

  if (sortBy) {
    query += ` ORDER BY ${sortBy}`;
  }

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching contract renewals:', err);
      return res.status(500).json({ message: 'Error fetching contract renewals' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No contract renewals found.' });
    }

    res.json(results);
  });
});

app.get('/get-vendor-phone/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const query = 'SELECT ContactInfo FROM Vendor WHERE VendorID = ?';

  connection.query(query, [vendorId], (err, results) => {
    if (err) {
      console.error('Error fetching vendor phone number:', err);
      return res.status(500).json({ message: 'Error fetching vendor phone number' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const contactInfo = results[0].ContactInfo.split(' - ');
    const phoneNumber = contactInfo[1];

    res.json({ phone_number: phoneNumber });
  });
});

app.get('/check-budget-alerts', (req, res) => {
  const query = 'SELECT NotificationDate, Message FROM Notifications WHERE NotificationDate IS NOT NULL AND Message IS NOT NULL';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching budget alerts:', err);
      return res.status(500).json({ message: 'Error fetching budget alerts' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No budget alerts found.' });
    }

    res.json(results);
  });
});

app.post('/submit-vendor-review', (req, res) => {
  const { vendor_id, rating, review_text, phone_number } = req.body;
  const query = 'SELECT ContactInfo FROM Vendor WHERE VendorID = ?';

  connection.query(query, [vendor_id], (err, results) => {
    if (err) {
      console.error('Error fetching vendor email:', err);
      return res.status(500).json({ message: 'Error fetching vendor email' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    const vendorEmail = results[0].ContactInfo.split(' - ')[0];
    const reviewQuery = 'INSERT INTO VendorReviews (VendorID, Rating, ReviewText, ReviewDate, PhoneNumber) VALUES (?, ?, ?, CURDATE(), ?)';

    connection.query(reviewQuery, [vendor_id, rating, review_text, phone_number], (err) => {
      if (err) {
        console.error('Error submitting review:', err);
        return res.status(500).json({ message: 'Error submitting review' });
      }

      // Simulated email sending
      const mailOptions = {
        from: 'no-reply@example.com',
        to: vendorEmail,
        subject: 'Performance Review Submitted',
        text: `Your performance has been reviewed. Rating: ${rating}. Review: ${review_text}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending email' });
        }
        res.json({ message: 'Vendor performance review submitted successfully!' });
      });
    });
  });
});

app.post('/register-vendor', (req, res) => {
  const { vendor_name, email, phone_number, address } = req.body;

  if (!vendor_name || !email || !phone_number || !address) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ message: 'Invalid phone number format.' });
  }

  const query = 'INSERT INTO Vendor (Name, ContactInfo, CertificationStatus) VALUES (?, ?, FALSE)';
  connection.query(query, [vendor_name, `${email} - ${phone_number} - ${address}`], (err) => {
    if (err) {
      console.error('Error registering vendor:', err);
      return res.status(500).json({ message: 'Error registering vendor' });
    }
    res.json({ message: 'Vendor registered successfully!' });
  });
});

// Route: Fetch Vendor Reviews
app.get('/get-vendor-reviews', (req, res) => {
  const query = 'SELECT VendorID, Rating, ReviewText, ReviewDate FROM VendorReviews';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching vendor reviews:', err);
      return res.status(500).json({ message: 'Error fetching vendor reviews' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No reviews found.' });
    }

    res.json(results);
  });
});

// Route: Fetch Vendor Performance Report
app.get('/get-vendor-performance', (req, res) => {
  const { sortBy } = req.query;
  let query = `
    SELECT 
      v.VendorID, 
      AVG(r.Rating) AS AvgRating, 
      COUNT(r.ReviewID) AS TotalReviews, 
      SUM(CASE WHEN r.Rating = 1 THEN 1 ELSE 0 END) AS Rating_1,
      SUM(CASE WHEN r.Rating = 2 THEN 1 ELSE 0 END) AS Rating_2,
      SUM(CASE WHEN r.Rating = 3 THEN 1 ELSE 0 END) AS Rating_3,
      SUM(CASE WHEN r.Rating = 4 THEN 1 ELSE 0 END) AS Rating_4,
      SUM(CASE WHEN r.Rating = 5 THEN 1 ELSE 0 END) AS Rating_5
    FROM Vendor v
    LEFT JOIN VendorReviews r ON v.VendorID = r.VendorID
    GROUP BY v.VendorID
  `;

  if (sortBy === 'AvgRating') {
    query += ' ORDER BY AvgRating DESC';
  } else if (sortBy === 'TotalReviews') {
    query += ' ORDER BY TotalReviews DESC';
  }

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching vendor performance report:', err);
      return res.status(500).json({ message: 'Error fetching vendor performance report' });
    }

    res.json(results);
  });
});


// --------------------- Start the Server ---------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
