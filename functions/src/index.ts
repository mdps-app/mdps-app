import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

export const checkAuthorizedUser = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(403).send('Unauthorized');
      return;
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;
      const usersRef = db.collection('users');
      const querySnapshot = await usersRef.where('email', '==', email).get();

      if (querySnapshot.empty) {
        res.status(403).send('User is not authorized.');
        return;
      }

      res.status(200).send({ message: 'User is authorized' });
    } catch (error) {
      res.status(403).send('Unauthorized');
    }
  });
});
