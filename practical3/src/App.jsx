import React, { useState, useEffect } from "react";
import "./App.css";

const DateTimeApp = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="date-time-container">
            <h2>Welcome to CHARUSAT !!!</h2>
            <h3>It is  {dateTime.toLocaleDateString()}</h3>
            <h3>It is  {dateTime.toLocaleTimeString()}</h3>
        </div>
    );
};

export default DateTimeApp;