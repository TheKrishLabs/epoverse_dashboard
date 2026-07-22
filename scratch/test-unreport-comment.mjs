import axios from 'axios';

async function testUnreportComment() {
    const commentId = "6a60ec9a872906567f5fd964"; // From user's JSON
    const url = `https://epoverse-backend.onrender.com/api/comments/${commentId}/unreport`;

    try {
        console.log(`Sending PATCH to ${url}`);
        const response = await axios.patch(url);
        
        console.log("Success! Status:", response.status);
        console.log("Response data:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.error("Failed with status:", e.response.status);
            console.error("Response data:", e.response.data);
        } else {
            console.error("Error:", e.message);
        }
    }
}
testUnreportComment();
