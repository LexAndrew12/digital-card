# TheSign Launch OS — Firebase activation

The application code is already prepared for Google sign-in and Firestore sync. Until Firebase is activated, the existing localStorage/GitHub-safe mode keeps working.

## 1. Create a Firebase project
1. Open Firebase Console and create a project.
2. Add a **Web app**.
3. Copy the Firebase web configuration.

## 2. Enable Google sign-in
Firebase Console → Authentication → Sign-in method → Google → Enable.

Add this domain to Authentication → Settings → Authorized domains:
- `lexandrew12.github.io`

## 3. Create Firestore
Firebase Console → Firestore Database → Create database.

Choose a region near Hungary/EU if available for your project.

## 4. Protect the database
Open Firestore → Rules.

Use the repository file:
`thesign-launch-os/firestore.rules`

Replace:
`YOUR_GOOGLE_EMAIL`

with the Google account that should be allowed to access Launch OS, then publish the rules.

The rules require both:
- the verified Google email to match;
- the document path UID to match the authenticated user's UID.

## 5. Add the Firebase config
Edit:
`thesign-launch-os/firebase-config.js`

Paste the Firebase Web App config and change:
`enabled: false`
to:
`enabled: true`

Commit the change to `main`.

## 6. First sign-in / migration
Open the GitHub Pages app. Google sign-in will appear.

On the first successful login, if Firestore does not yet contain Launch OS state, the current local browser state is uploaded automatically. After that Firestore becomes the shared cloud state and localStorage remains a local resilience cache.

## Security notes
- Firebase web configuration values are not treated as secrets.
- Do not put service-account keys, private API keys, passwords, or GitHub tokens in this repository.
- Data access is protected by Firestore Security Rules, not by hiding the Firebase config.
