# InviteLink Mobile App

A React Native mobile app built with Expo and TypeScript for the InviteLink smart event access and guest management system.

## 📱 Features

- **Authentication:** Phone-based login with JWT token storage
- **Invite Management:** Create and view invites with QR codes
- **RSVP System:** Submit RSVPs and manage guest lists
- **Check-In:** Scan QR codes for event check-in (coming soon)
- **Real-time Updates:** View invite status and attendance

## 🏗️ Tech Stack

- **Framework:** React Native with Expo (~50.0.0)
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack)
- **State Management:** React Context API
- **API Client:** Axios
- **Storage:** AsyncStorage for token persistence
- **Testing:** Jest
- **Linting:** ESLint with TypeScript support

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go app (for iOS/Android testing)
- iOS Simulator (optional, for iOS development)
- Android Emulator (optional, for Android development)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd apps/mobile
npm install
```

### 2. Configure Backend API URL

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set the backend API URL:

```env
REACT_NATIVE_API_URL=https://pr-123-api.azurewebsites.net
```

**For PR Preview Backends:**
- When a PR is created, the CI/CD pipeline provisions a preview backend
- The URL format is typically: `https://pr-<number>-api.azurewebsites.net`
- Check the PR comments for the exact URL
- Update your `.env` file with this URL

**For Local Backend:**
```env
REACT_NATIVE_API_URL=http://localhost:5000
```

### 3. Start the Development Server

```bash
npm start
```

This will open the Expo DevTools in your browser.

### 4. Run on Device/Emulator

**iOS (Simulator):**
```bash
npm run ios
```

**Android (Emulator):**
```bash
npm run android
```

**Physical Device:**
1. Install Expo Go from App Store/Play Store
2. Scan the QR code from the terminal/DevTools
3. The app will load on your device

## 🧪 Testing

Run tests:
```bash
npm test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## 📁 Project Structure

```
apps/mobile/
├── src/
│   ├── api/              # API client and endpoints
│   │   └── apiClient.ts
│   ├── context/          # React contexts (Auth, etc.)
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── InviteScreen.tsx
│   ├── components/       # Reusable UI components
│   └── types/            # TypeScript type definitions
│       ├── api.ts        # API request/response types
│       └── env.d.ts      # Environment variable types
├── App.tsx               # Root component
├── index.js              # Entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── babel.config.js       # Babel configuration
├── .eslintrc.js          # ESLint configuration
├── jest.config.js        # Jest configuration
└── README.md             # This file
```

## 🔗 Backend Integration

The mobile app integrates with the SmartInvite.Api backend. See [INTEGRATION_REPORT.md](./INTEGRATION_REPORT.md) for detailed API documentation.

### Expected Endpoints

- `POST /api/auth/login` - Authenticate with phone number
- `POST /api/invites` - Create new invite
- `GET /api/invites/{id}` - Get invite details
- `POST /api/invites/{id}/rsvp` - Submit RSVP
- `POST /api/invites/{id}/checkin` - Check in guest

**Note:** Some endpoints may not be implemented yet. The app includes mock implementations for testing.

## 🔐 Authentication Flow

1. User enters phone number on LoginScreen
2. App calls `POST /api/auth/login`
3. Backend returns JWT token
4. Token is stored in AsyncStorage
5. Token is attached to all subsequent API requests via `Authorization: Bearer <token>`
6. User is redirected to HomeScreen

## 📝 TODO & Upcoming Features

- [ ] Generate TypeScript types from OpenAPI spec (once backend implements endpoints)
- [ ] Implement QR code scanning for check-in
- [ ] Add QR code display for invites
- [ ] Implement real-time status updates
- [ ] Add comprehensive test coverage
- [ ] Implement token refresh logic
- [ ] Add offline support
- [ ] Improve loading and error states

## 🐛 Known Issues

- Backend endpoints are not fully implemented yet (as of Jan 2026)
- Some features use mock data/alerts until backend is ready
- Environment variables require app restart to take effect

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests and linting: `npm test && npm run lint`
4. Commit changes: `git commit -m "Add your feature"`
5. Push to branch: `git push origin feature/your-feature`
6. Open a Pull Request

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Backend Integration Report](./INTEGRATION_REPORT.md)

## 📄 License

See the main repository LICENSE file.
