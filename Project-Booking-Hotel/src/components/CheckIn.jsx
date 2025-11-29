import { BsCalendar } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/datepicker.css';
import { useRoomContext } from '../context/RoomContext';

const CheckIn = () => {
  const { checkInDate, setCheckInDate, checkOutDate, setCheckOutDate } = useRoomContext();

  const handleChange = (date) => {
    setCheckInDate(date);
    if (checkOutDate && date && date >= checkOutDate) {
      setCheckOutDate(null);
    }
  };

  return (
    <div className='relative flex items-center justify-end h-full'>
      <div className='absolute z-10 pr-8'>
        <div><BsCalendar className='text-accent text-base' /></div>
      </div>

      <DatePicker
        className='w-full h-full'
        selected={checkInDate}
        placeholderText='Check in'
        minDate={new Date()}
        onChange={handleChange}
      />
    </div>
  );
};

export default CheckIn;
