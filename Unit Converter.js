document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.converter-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(tabName).classList.add('active');
        });
    });
    
    // Weight Converter
    const weightConvertBtn = document.getElementById('weight-convert');
    weightConvertBtn.addEventListener('click', convertWeight);
    
    function convertWeight() {
        const value = parseFloat(document.getElementById('weight-value').value);
        if (isNaN(value)) {
            document.getElementById('weight-result').textContent = 'Please enter a valid number';
            return;
        }
        
        const fromUnit = document.getElementById('weight-from').value;
        const toUnit = document.getElementById('weight-to').value;
        
        // Convert to grams first
        let grams;
        switch(fromUnit) {
            case 'kg':
                grams = value * 1000;
                break;
            case 'g':
                grams = value;
                break;
            case 'lb':
                grams = value * 453.592;
                break;
            case 'oz':
                grams = value * 28.3495;
                break;
        }
        
        // Convert from grams to target unit
        let result;
        switch(toUnit) {
            case 'kg':
                result = grams / 1000;
                break;
            case 'g':
                result = grams;
                break;
            case 'lb':
                result = grams / 453.592;
                break;
            case 'oz':
                result = grams / 28.3495;
                break;
        }
        
        document.getElementById('weight-result').innerHTML = `
            ${value} ${getWeightUnitName(fromUnit)} = <strong>${result.toFixed(4)} ${getWeightUnitName(toUnit)}</strong>
        `;
    }
    
    function getWeightUnitName(unit) {
        const units = {
            'kg': 'Kilograms',
            'g': 'Grams',
            'lb': 'Pounds',
            'oz': 'Ounces'
        };
        return units[unit];
    }
    
    // Temperature Converter
    const tempConvertBtn = document.getElementById('temp-convert');
    tempConvertBtn.addEventListener('click', convertTemperature);
    
    function convertTemperature() {
        const value = parseFloat(document.getElementById('temp-value').value);
        if (isNaN(value)) {
            document.getElementById('temp-result').textContent = 'Please enter a valid number';
            return;
        }
        
        const fromUnit = document.getElementById('temp-from').value;
        const toUnit = document.getElementById('temp-to').value;
        
        // Convert to Celsius first
        let celsius;
        switch(fromUnit) {
            case 'c':
                celsius = value;
                break;
            case 'f':
                celsius = (value - 32) * 5/9;
                break;
            case 'k':
                celsius = value - 273.15;
                break;
        }
        
        // Convert from Celsius to target unit
        let result;
        switch(toUnit) {
            case 'c':
                result = celsius;
                break;
            case 'f':
                result = (celsius * 9/5) + 32;
                break;
            case 'k':
                result = celsius + 273.15;
                break;
        }
        
        document.getElementById('temp-result').innerHTML = `
            ${value}${getTempSymbol(fromUnit)} = <strong>${result.toFixed(2)}${getTempSymbol(toUnit)}</strong>
        `;
    }
    
    function getTempSymbol(unit) {
        const symbols = {
            'c': '°C',
            'f': '°F',
            'k': 'K'
        };
        return symbols[unit];
    }
    
    // Currency Converter
    const currencyConvertBtn = document.getElementById('currency-convert');
    currencyConvertBtn.addEventListener('click', convertCurrency);
    
    // Exchange rates (these would normally come from an API)
    const exchangeRates = {
        USD: { EUR: 0.85, GBP: 0.73, JPY: 110.15, CAD: 1.25, AUD: 1.30, INR: 86.50 },
        EUR: { USD: 1.18, GBP: 0.86, JPY: 129.53, CAD: 1.47, AUD: 1.53, INR: 89.20 },
        GBP: { USD: 1.37, EUR: 1.16, JPY: 150.40, CAD: 1.71, AUD: 1.78, INR: 103.45 },
        JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, CAD: 0.011, AUD: 0.012, INR: 0.68 },
        CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 88.71, AUD: 1.04, INR: 60.30 },
        AUD: { USD: 0.77, EUR: 0.65, GBP: 0.56, JPY: 83.33, CAD: 0.96, INR: 58.10 },
        INR: { USD: 0.013, EUR: 0.011, GBP: 0.0097, JPY: 1.47, CAD: 0.017, AUD: 0.017 }
    };
    
    // Function to fetch real exchange rates (commented out as it requires an API key)
    /*
    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates.USD = data.rates;
            // Update other base rates as needed
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
        }
    }
    
    // Fetch rates when page loads and then every 24 hours
    fetchExchangeRates();
    setInterval(fetchExchangeRates, 24 * 60 * 60 * 1000);
    */
    
    function convertCurrency() {
        const value = parseFloat(document.getElementById('currency-value').value);
        if (isNaN(value)) {
            document.getElementById('currency-result').textContent = 'Please enter a valid number';
            return;
        }
        
        const fromCurrency = document.getElementById('currency-from').value;
        const toCurrency = document.getElementById('currency-to').value;
        
        if (fromCurrency === toCurrency) {
            document.getElementById('currency-result').textContent = 'Please select different currencies';
            return;
        }
        
        let result;
        if (fromCurrency === 'USD') {
            result = value * exchangeRates.USD[toCurrency];
        } else if (toCurrency === 'USD') {
            result = value / exchangeRates.USD[fromCurrency];
        } else if (fromCurrency === 'INR') {
            result = value * exchangeRates.INR[toCurrency];
        } else if (toCurrency === 'INR') {
            result = value / exchangeRates.INR[fromCurrency];
        } else {
            // Convert fromCurrency to USD first, then to toCurrency
            const usdValue = value / exchangeRates.USD[fromCurrency];
            result = usdValue * exchangeRates.USD[toCurrency];
        }
        
        document.getElementById('currency-result').innerHTML = `
            ${value} ${fromCurrency} = <strong>${result.toFixed(2)} ${toCurrency}</strong>
        `;
    }
});