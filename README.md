# SENTION HR-Map Prototype

This is a prototype of the SENTION HR-Map application, a web platform for HR mapping and resource management. The prototype demonstrates the core functionality of the application without backend integration.

## Features

- View and manage items across different risk categories:
  - Low Risk (Ej risk)
  - Medium Risk (Risk)
  - High Risk (Hög risk)
- Organize items by stakeholder groups (HR, Företagshälsovård, etc.)
- Add new items to specific risk categories
- Add new stakeholder groups
- Navigate between different sections (Anställd, Grupp, Organisation, etc.)
- Visual indicators for risk levels with color coding

## Technology Stack

- **Frontend**: React.js with Next.js framework
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS
- **Typography**: Rajdhani font

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/hr-map.git
   cd hr-map
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

```
hr-map/
├── app/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── RiskMatrix.tsx
│   │   └── [other components]
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── store.ts
│   └── types.ts
├── public/
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Future Enhancements

- Backend integration with FastAPI
- Authentication system
- Real-time updates with WebSockets
- Drag-and-drop functionality for item positioning
- Resource management
- System overview page
- Admin features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Icons](https://react-icons.github.io/react-icons/) 