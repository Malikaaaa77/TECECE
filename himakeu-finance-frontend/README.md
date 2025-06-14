# Himakeu Finance Frontend

## Overview
Himakeu Finance is a frontend application designed to manage the financial activities of a student organization. It interacts with the Himakeu Finance backend API to provide functionalities for both members and administrators.

## Project Structure
The project is organized as follows:

```
himakeu-finance-frontend
├── public
│   └── index.html          # Main HTML file
├── src
│   ├── api                 # API interaction functions
│   ├── components          # React components for different functionalities
│   ├── pages               # Page components for routing
│   ├── routes              # Application routing setup
│   ├── utils               # Utility functions
│   ├── App.js              # Main application component
│   ├── index.js            # Entry point for the React application
│   └── styles              # CSS styles
├── package.json            # Project metadata and dependencies
└── README.md               # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd himakeu-finance-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## Usage
- **Authentication:** Users can register and log in to access their profiles and functionalities.
- **Member Dashboard:** Members can view their dues status and upload payment proofs.
- **Admin Dashboard:** Administrators can manage transactions, approve payments, and add expenses.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.