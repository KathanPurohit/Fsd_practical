import React, { Component } from 'react';
import './App.css';

class Counter extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
      firstName: '',
      lastName: ''
    };
  }

  handleIncrement = () => {
    this.setState((prevState) => ({
      count: prevState.count + 1
    }));
  };

  handleDecrement = () => {
    this.setState((prevState) => ({
      count: prevState.count - 1
    }));
  };

  handleIncrement5 = () => {
    this.setState((prevState) => ({
      count: prevState.count + 5
    }));
  };

  handleReset = () => {
    this.setState({ count: 0 });
  };

  handleFirstNameChange = (e) => {
    this.setState({ firstName: e.target.value });
  };

  handleLastNameChange = (e) => {
    this.setState({ lastName: e.target.value });
  };

  render() {
    return (
      <div className='counter-container'>
        <h1 className="counter-title">Count: {this.state.count}</h1>
        <div className='counter-buttons'>
          <button className='reset' onClick={this.handleReset}>Reset</button>
          <button className='increment' onClick={this.handleIncrement}>Increment</button>
          <button className='decrement' onClick={this.handleDecrement}>Decrement</button>
          <button className='increment5' onClick={this.handleIncrement5}>Increment 5</button>
        </div>
        <h1 className="charusat-title">Welcome to CHARUSAT!!!</h1>
        <div className="name-inputs">
          <div className="name-input-row">
            <label>First Name:</label>
            <input
              type="text"
              value={this.state.firstName}
              onChange={this.handleFirstNameChange}
            />
          </div>
          <div className="name-input-row">
            <label>Last Name:</label>
            <input
              type="text"
              value={this.state.lastName}
              onChange={this.handleLastNameChange}
            />
          </div>
        </div>
        <div className="name-display">
          <div>First Name: {this.state.firstName}</div>
          <div>Last Name: {this.state.lastName}</div>
        </div>
      </div>
    );
  }
}

export default Counter;
