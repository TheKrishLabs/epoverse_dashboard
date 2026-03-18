import axios from 'axios';

const api = axios.create({
  baseURL: 'https://project-epoverse-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTlkMzk5NDk5MmQwZjBhYWQ3YzgyYzYiLCJlbWFpbCI6InlvZ2VzaEBnbWFpbC5jb20iLCJyb2xlIjp7Il9pZCI6IjY5OWQzODAxOGJjMmZmYTc2OTNkYTRhMSIsIm5hbWUiOiJTVVBFUiBBRE1JTiIsInBlcm1pc3Npb25zIjp7ImRhc2hib2FyZCI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sImFkdmVydGlzZW1lbnQiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJhbmFseXRpY3MiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJhcmNoaXZlIjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwiY2F0ZWdvcnkiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJjb21tZW50cyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sIm1lZGlhX2xpYnJhcnkiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSIsIiJdLCJtZW51IjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwibmV3cyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sInBhZ2UiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJyZXBvcnRlciI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sInNlbyI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sInNldHRpbmciOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJ0aGVtZV9zZXR1cCI6WyJjcmVhdGUiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIl0sInJvbGUiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJ0c2VyIjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwibWVkaWEiOlsiY3JlYXRlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSJdLCJhcnRpY2xlIjpbImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwibGFuZ3VhZ2UiOlsiY3JlYXRlIiwidXBkYXRlIiwicmVhZCIsImRlbGV0ZSJdLCJzdG9yeSI6WyJjcmVhdGUiLCJyZWFkIiwiZGVsZXRlIl0sImNvb2tpZSI6WyJjcmVhdGUiLCJ1cGRhdGUiLCJkZWxldGUiLCJyZWFkIl19LCJpc0RlbGV0ZWQiOmZhbHNlLCJjcmVhdGVkQXQiOiIyMDI2LTAyLTI0VDA1OjMyOjQ5LjE3MVoiLCJ1cGRhdGVkQXQiOiIyMDI2LTAyLTI0VDA5OjQyOjIxLjkzMFoiLCJfX3YiOjB9LCJpYXQiOjE3NzM4MTU3NzMsImV4cCI6MTc3MzkwMjE3M30.agYZDtVrcqeCJIMZAgm8p7FUssnFa3bbW7Mq55cEXSg'
  },
});

async function debugAccessLogs() {
  try {
    console.log("Fetching access logs (range: today)...");
    const response = await api.get('/access-log', { params: { range: 'today' } });
    console.log("Success:", response.data.success);
    const data = response.data.data || response.data.logs || response.data;
    console.log("Data count:", Array.isArray(data) ? data.length : "Not an array");
    if (Array.isArray(data) && data.length > 0) {
      console.log("Sample Log:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("Full Response for debug:", JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
     console.error("Error:", error.message);
     if (error.response) console.error("Response data:", error.response.data);
  }
}

debugAccessLogs();
