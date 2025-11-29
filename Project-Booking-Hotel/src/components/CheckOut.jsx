import { BsCalendar } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/datepicker.css';
import { useRoomContext } from '../context/RoomContext';

const CheckOut = () => {
  const { checkInDate, checkOutDate, setCheckOutDate } = useRoomContext();

  const minDate = checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date();

  return (
    <div className='relative flex items-center justify-end h-full'>
      <div className='absolute z-10 pr-8'>
        <div><BsCalendar className='text-accent text-base' /></div>
      </div>

      <DatePicker
        className='w-full h-full'
        selected={checkOutDate}
        placeholderText='Check out'
        minDate={minDate}
        onChange={(date) => setCheckOutDate(date)}
        disabled={!checkInDate}
      />

    </div>
  );
};

export default CheckOut;
