class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, errorMessageElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.errorMessageElement = errorMessageElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.hideError();
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.currentOperand === '0' || this.currentOperand.length <= 1) {
            this.currentOperand = '0';
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        this.hideError();
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') {
            this.currentOperand = '';
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.hideError();
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.showError("Cannot divide by zero");
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating point precision issues
        computation = Math.round(computation * 10000000000) / 10000000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.hideError();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === 'Error') {
            this.currentOperandTextElement.innerText = 'Error';
            this.previousOperandTextElement.innerText = '';
            // Adjust font size for long numbers
            this.currentOperandTextElement.style.fontSize = '2.8rem';
            return;
        }

        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);

        // Dynamic font resizing
        const length = this.currentOperand.length;
        if (length > 12) {
            this.currentOperandTextElement.style.fontSize = '1.5rem';
        } else if (length > 9) {
            this.currentOperandTextElement.style.fontSize = '2rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '2.8rem';
        }

        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    showError(message) {
        this.errorMessageElement.innerText = message;
        this.errorMessageElement.classList.add('show');
    }

    hideError() {
        this.errorMessageElement.innerText = '';
        this.errorMessageElement.classList.remove('show');
    }
}

const previousOperandTextElement = document.querySelector('[id="previous-operand"]');
const currentOperandTextElement = document.querySelector('[id="current-operand"]');
const errorMessageElement = document.querySelector('[id="error-message"]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, errorMessageElement);

// Event Listeners for Buttons
document.querySelectorAll('.number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.value);
        calculator.updateDisplay();
        animateButton(button);
    });
});

document.querySelectorAll('.operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.value);
        calculator.updateDisplay();
        animateButton(button);
    });
});

document.querySelector('.equals').addEventListener('click', (e) => {
    calculator.compute();
    calculator.updateDisplay();
    animateButton(e.target);
});

document.querySelector('.ac').addEventListener('click', (e) => {
    calculator.clear();
    calculator.updateDisplay();
    animateButton(e.target);
});

document.querySelector('.delete').addEventListener('click', (e) => {
    calculator.delete();
    calculator.updateDisplay();
    animateButton(e.target);
});

// Button Animation Helper
function animateButton(button) {
    if (!button) return;
    button.style.transform = 'translateY(2px) scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

// Keyboard Support
document.addEventListener('keydown', e => {
    let buttonToAnimate = null;

    if (e.key >= 0 && e.key <= 9) {
        calculator.appendNumber(e.key);
        buttonToAnimate = document.querySelector(`.number[data-value="${e.key}"]`);
    }
    if (e.key === '.') {
        calculator.appendNumber(e.key);
        buttonToAnimate = document.querySelector(`.number[data-value="."]`);
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        buttonToAnimate = document.querySelector('.equals');
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        buttonToAnimate = document.querySelector('.delete');
    }
    if (e.key === 'Escape') {
        calculator.clear();
        buttonToAnimate = document.querySelector('.ac');
    }

    // Map keyboard operators to UI operators
    const operatorMap = {
        '/': '÷',
        '*': '×',
        '-': '−',
        '+': '+'
    };

    if (['+', '-', '*', '/'].includes(e.key)) {
        calculator.chooseOperation(operatorMap[e.key]);
        buttonToAnimate = document.querySelector(`.operator[data-value="${operatorMap[e.key]}"]`);
    }

    if (buttonToAnimate) {
        animateButton(buttonToAnimate);
    }

    calculator.updateDisplay();
});
