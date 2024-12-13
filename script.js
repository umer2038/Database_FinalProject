
function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchContractRenewals();
  fetchBudgetAlerts();
  fetchChartData();


  document.getElementById('performanceReviewForm').addEventListener('submit', submitVendorReview);
  document.getElementById('register-vendor-form').addEventListener('submit', registerVendor);
  document.getElementById('update-renewal-form').addEventListener('submit', updateContractRenewal);
  document.getElementById('generate-report-button').addEventListener('click', fetchVendorPerformanceReport); // Ensure there's a button to generate report
});


function submitVendorReview(event) {
  event.preventDefault();

  const vendorId = document.getElementById('vendor_id').value;
  const rating = document.getElementById('rating').value;
  const reviewText = document.getElementById('review_text').value;


  fetch(`/get-vendor-phone/${vendorId}`)
    .then(response => response.json())
    .then(data => {
      if (data.phone_number) {
        const phoneNumber = data.phone_number;

        const formData = {
          vendor_id: vendorId,
          rating: rating,
          review_text: reviewText,
          phone_number: phoneNumber
        };

        fetch('/submit-vendor-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
          .then(response => response.json())
          .then(data => {
            alert('Review Submitted: ' + data.message);
            fetchVendorReviews(); // Refresh reviews
          })
          .catch(error => {
            console.error('Error submitting review:', error);
            alert('Error submitting review.');
          });
      } else {
        alert('Phone number not found for this vendor.');
      }
    })
    .catch(error => {
      console.error('Error fetching vendor phone number:', error);
      alert('Error fetching vendor phone number.');
    });
}


function displayContractRenewal(renewal) {
  return `<p>Contract ID: ${renewal.ContractID} | Renewal Date: ${formatDate(renewal.RenewalDate)}</p>`;
}


function displayBudgetAlert(alert) {
  return `<p>Alert Date: ${formatDate(alert.NotificationDate)} - Message: ${alert.Message || 'N/A'}</p>`;
}


function fetchContractRenewals() {
  const filterStatus = document.getElementById('filterStatus').value;
  const sortBy = document.getElementById('sortBy').value;
  const url = `/check-contract-renewals?filterStatus=${filterStatus}&sortBy=${sortBy}`;

  fetchListData(url, 'contract-renewals-list', displayContractRenewal);
}


function fetchBudgetAlerts() {
  const url = '/check-budget-alerts';
  fetchListData(url, 'budget-alerts-list', displayBudgetAlert);
}


function registerVendor(event) {
  event.preventDefault();

  const vendorName = document.getElementById('vendor_name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone_number').value;  // Phone Number
  const address = document.getElementById('address').value;

  const formData = { vendor_name: vendorName, email, phone_number: phone, address };

  fetch('/register-vendor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      document.getElementById('vendorForm').reset(); // Reset form after successful submission
    })
    .catch(error => {
      console.error('Error registering vendor:', error);
      alert('Error registering vendor.');
    });
}


function updateContractRenewal(event) {
  event.preventDefault();

  const contractId = document.getElementById('contract-id').value;
  const renewalDate = document.getElementById('renewal-date').value;
  const isRenewed = document.getElementById('is-renewed').checked;

  const formData = { contractId, renewalDate, isRenewed };

  fetch('/update-renewal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
      console.error('Error updating contract renewal:', error);
      alert('Error updating contract renewal.');
    });
}


async function fetchChartData() {
  try {
    const response = await fetch('/chart-data');
    if (!response.ok) throw new Error('Failed to fetch chart data');

    const data = await response.json();
    renderChart(data);
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
}

function renderPerformanceReport(data) {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  

  const ratingDistribution = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      data: [data.Rating_1, data.Rating_2, data.Rating_3, data.Rating_4, data.Rating_5],
      backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
      borderWidth: 1
    }]
  };

  new Chart(ctx, {
    type: 'pie',
    data: ratingDistribution,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const percentage = (tooltipItem.raw / data.TotalReviews) * 100;
              return `${tooltipItem.label}: ${tooltipItem.raw} reviews (${percentage.toFixed(2)}%)`;
            }
          }
        }
      }
    }
  });
}



function fetchPurchaseOrders() {
  fetch('/get-purchase-orders')
    .then(response => response.json())
    .then(data => {
      const ordersList = document.getElementById('purchase-orders-list');
      ordersList.innerHTML = ''; // Clear previous list

      if (data && data.length > 0) {
        let html = '';
        data.forEach(order => {
          html += `<li>PO ID: ${order.POID} | Vendor ID: ${order.VendorID} | Status: ${order.Status} 
                    <button onclick="updatePurchaseOrderStatus(${order.POID})">Update Status</button></li>`;
        });
        ordersList.innerHTML = html;
      } else {
        ordersList.innerHTML = '<p>No purchase orders found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching purchase orders:', error);
      document.getElementById('purchase-orders-list').innerHTML = '<p>Error loading purchase orders.</p>';
    });
}


function updatePurchaseOrderStatus(poid) {
  const newStatus = prompt('Enter new status (Pending/Approved/Completed):');
  if (newStatus) {
    fetch('/update-purchase-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poid, status: newStatus })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        fetchPurchaseOrders(); 
      })
      .catch(error => {
        console.error('Error updating purchase order status:', error);
        alert('Error updating purchase order status.');
      });
}

function fetchVendorPerformanceReport() {
  const sortBy = document.getElementById('performance-sortBy').value;

  fetch(`/get-vendor-performance?sortBy=${sortBy}`)
    .then(response => response.json())
    .then(data => {
      const reportList = document.getElementById('vendor-performance-list');
      reportList.innerHTML = ''; 

      if (data && data.length > 0) {
        let html = '';
        data.forEach(performance => {
          html += `<p>Vendor ID: ${performance.VendorID} | Rating: ${performance.AvgRating.toFixed(2)} | Reviews: ${performance.TotalReviews}</p>`;
        });
        reportList.innerHTML = html;


        renderPerformanceReport(data[0]);  
      } else {
        reportList.innerHTML = '<p>No performance data available.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching vendor performance report:', error);
      document.getElementById('vendor-performance-list').innerHTML = '<p>Error loading performance report.</p>';
    });
}


document.getElementById('generate-report-button').addEventListener('click', fetchVendorPerformanceReport);


fetchChartData();
}