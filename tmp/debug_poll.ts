import axios from 'axios';

const api = axios.create({
  baseURL: 'https://project-epoverse-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function debugPolls() {
  try {
    console.log("Fetching all polls...");
    const response = await api.get('/polls');
    const polls = response.data.data || response.data.polls || response.data;
    console.log(`Found ${polls.length} polls.`);
    
    if (polls.length > 0) {
      const firstPoll = polls[0];
      const pollId = firstPoll._id || firstPoll.id;
      console.log(`Inspecting poll: ${pollId} (${firstPoll.status})`);
      
      console.log("Toggling status via PATCH /polls/toggle-inactive/:id ...");
      const toggleResponse = await api.patch(`/polls/toggle-inactive/${pollId}`);
      console.log("Toggle Response Log:", toggleResponse.status);
      
      console.log("Fetching polls again to check for deletion...");
      const response2 = await api.get('/polls');
      const polls2 = response2.data.data || response2.data.polls || response2.data;
      const found = polls2.find((p: any) => (p._id || p.id) === pollId);
      
      if (!found) {
        console.error("BUG CONFIRMED: Poll was DELETED after toggle!");
      } else {
        console.log(`Poll still exists. New status: ${found.status}`);
      }
    }
  } catch (error: any) {
    console.error("Error during debug:", error.message);
    if (error.response) console.error("Response data:", error.response.data);
  }
}

debugPolls();
