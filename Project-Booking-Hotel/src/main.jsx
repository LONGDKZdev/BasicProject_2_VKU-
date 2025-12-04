import { RoomContext } from './context/RoomContext';
import { SimpleAuthContext } from './context/SimpleAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { BookingProvider } from './context/BookingContext';
import ReactDOM from 'react-dom/client'
import React from 'react'
import App from './App'
import './style/index.css';


ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <LanguageProvider>
      <SimpleAuthContext>
        <RoomContext>
          <BookingProvider>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </BookingProvider>
        </RoomContext>
      </SimpleAuthContext>
    </LanguageProvider>,
  )