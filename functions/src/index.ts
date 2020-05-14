// import * as functions from 'firebase-functions';
// const https = require('https');
// const options = {
//   hostname: 'sechsnimmt-33e6e.firebaseio.com',
//   port: 443,
//   path: '/card.json',
//   method: 'GET',
// };

// function getPromise() {
//   return new Promise((resolve, reject) => {
//     https
//       .request(options, (res: any) => {
//         let chunks_of_data: any[] = [];

//         res.on('data', (fragments: any) => {
//           chunks_of_data.push(fragments);
//         });

//         res.on('end', () => {
//           let response_body = Buffer.concat(chunks_of_data);
//           resolve(response_body.toString());
//         });

//         res.on('error', (error: any) => {
//           reject(error);
//         });
//       })
//       .end();
//   });
// }

// export const helloWorld = functions
//   .region('europe-west1')
//   .https.onRequest(async (request, response) => {
//     try {
//       let http_promise = getPromise();
//       let body = await http_promise;
//       response.set('Content-Type', 'application/json').set('Access-Control-Allow-Origin', '*').send(body);
//     } catch (error) {
//       console.log(error);
//     }
// });
