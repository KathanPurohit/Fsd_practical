import { useState } from 'react';
import './App.css';

function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  const handleCalc = (val) => {
    if (val === 'DEL') {
      setExpression(expression.slice(0, -1));

      
      setResult('');
    } else if (val === 'AC') {
      setExpression('');
      setResult('');
    } else if (val === '=') {
     
        setResult(eval(expression));
    }else {
      setExpression(expression + val);
      setResult('');
    }
  };

  return (
    <div className="calc-main">
      <div className="calc-display">
        <div className="calc-expression">{expression}</div>
        <div className="calc-result">{result !== '' ? result : null}</div>
      </div>
      <div className="calc-buttons">
        <div className="calc-row">
          <button className="btn-op" onClick={() => handleCalc('/')}>/</button>
          <button className="btn-op" onClick={() => handleCalc('*')}>*</button>
          <button className="btn-op" onClick={() => handleCalc('+')}>+</button>
          <button className="btn-op" onClick={() => handleCalc('-')}>-</button>  
          <button className="btn-del" onClick={() => handleCalc('DEL')}>DEL</button>
          <button className="btn-op" onClick={() => handleCalc('AC')}>AC</button>
        </div>
        <div className="calc-row">
          <button className="btn-num" onClick={() => handleCalc('1')}>1</button>
          <button className="btn-num" onClick={() => handleCalc('2')}>2</button>
          <button className="btn-num" onClick={() => handleCalc('3')}>3</button>
        </div>
        <div className="calc-row">
          <button className="btn-num" onClick={() => handleCalc('4')}>4</button>
          <button className="btn-num" onClick={() => handleCalc('5')}>5</button>
          <button className="btn-num" onClick={() => handleCalc('6')}>6</button>
        </div>
        <div className="calc-row">
          <button className="btn-num" onClick={() => handleCalc('7')}>7</button>
          <button className="btn-num" onClick={() => handleCalc('8')}>8</button>
          <button className="btn-num" onClick={() => handleCalc('9')}>9</button>
        </div>
        <div className="calc-row">
          <button className="btn-num" onClick={() => handleCalc('0')}>0</button>
          <button className="btn-num" onClick={() => handleCalc('.')}>.</button>
          <button className="btn-op" onClick={() => handleCalc('=')}>=</button>
        </div>
      </div>
    </div>
  );
}

export default App;