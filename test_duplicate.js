// const fs = require('fs');

// async function testBackend() {
//   try {
//     console.log("==> Starting Backend Validation...");
    
//     // 1. Register a new user
//     console.log("1. Registering user...");
//     const regRes = await fetch('http://localhost:5000/api/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         username: 'test_dupe_' + Date.now(),
//         email: 'test_dupe_' + Date.now() + '@example.com',
//         password: 'password123',
//         role: 'Admin'
//       })
//     });
//     const regData = await regRes.json();
//     if (!regRes.ok) throw new Error(JSON.stringify(regData));
//     const token = regData.token;
//     console.log("   - Success! Token received.\n");

//     // 2. Create a Custom Form
//     console.log("2. Creating Custom Form...");
//     const formRes = await fetch('http://localhost:5000/api/forms', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         title: "Duplicate Block Test",
//         description: "Testing if IP or User tracking works",
//         questions: [
//           { id: "q_text", type: "text", questionText: "Your thoughts?", required: true }
//         ]
//       })
//     });
//     const formData = await formRes.json();
//     if (!formRes.ok) throw new Error(JSON.stringify(formData));
//     const formId = formData._id;
//     console.log(`   - Success! Form ID: ${formId}\n`);

//     // 3. Submit first response (Anonymous / by IP tracking)
//     console.log("3. Submitting first response (Anonymous)...");
//     const submit1 = await fetch(`http://localhost:5000/api/forms/${formId}/responses`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         answers: [{ questionId: "q_text", value: "First answer" }]
//       })
//     });
//     const sub1Data = await submit1.json();
//     if (!submit1.ok) throw new Error(JSON.stringify(sub1Data));
//     console.log("   - Success! First submission accepted.\n");

//     // 4. Submit duplicate response (Should Fail)
//     console.log("4. Attempting duplicate submission (Anonymous)...");
//     const submit2 = await fetch(`http://localhost:5000/api/forms/${formId}/responses`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         answers: [{ questionId: "q_text", value: "Second answer" }]
//       })
//     });
//     const sub2Data = await submit2.json();
//     if (submit2.ok) {
//        throw new Error("Duplicate submission WAS NOT BLOCKED! Test Failed.");
//     } else {
//        console.log(`   - Success! Blocked duplicate via IP: ${sub2Data.message}\n`);
//     }

//     // 5. Test Quick Stats API
//     console.log("5. Fetching Admin Quick Stats...");
//     const statsRes = await fetch('http://localhost:5000/api/forms/stats', {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
//     const statsData = await statsRes.json();
//     if (!statsRes.ok) throw new Error(JSON.stringify(statsData));
//     console.log(`   - Success! Stats returned: Total Forms=${statsData.totalForms}, Total Responses=${statsData.totalResponses}\n`);
    
//     console.log("==> ALL BACKEND TESTS PASSED SUCCESSFULLY! <==");
//   } catch (err) {
//     console.error("==> BACKEND TEST FAILED: ", err.message || err);
//   }
// }

// testBackend();
