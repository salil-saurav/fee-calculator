# Australian Migration Fee Calculator

This project is a Node.js application designed to calculate visa fees for the Australian migration process. It provides a user-friendly interface for users to input their details and receive accurate fee calculations based on their visa type and other parameters.

## Project Structure

```
australian-migration-calculator
├── src
│   ├── public
│   │   ├── assets
│   │   │   ├── scripts
│   │   │   │   ├── calculator.js
│   │   │   │   ├── stepManager.js
│   │   │   │   └── slider.js
│   │   │   └── styles
│   │   │       └── main.css
│   │   └── index.html
│   ├── controllers
│   │   └── calculatorController.js
│   ├── models
│   │   └── visaTypes.js
│   ├── routes
│   │   └── index.js
│   ├── services
│   │   └── calculatorService.js
│   └── app.js
├── tests
│   └── calculator.test.js
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd australian-migration-calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

## Usage

- Users can select their visa type and input relevant details.
- The application will calculate the fees based on the provided information and display the results in real-time.

## Testing

To run the unit tests for the calculator functionality, use the following command:

```bash
npm test
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.