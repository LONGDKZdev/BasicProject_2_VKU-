import { useRoomContext } from '../context/RoomContext';
import { BsChevronDown } from 'react-icons/bs';
import { kidsList } from '../constants/data';
import { Menu } from '@headlessui/react';


const KidsDropdown = () => {

  const { kids, setKids } = useRoomContext();


  return (
    <Menu as='div' className='w-full h-full bg-white relative'>


      <Menu.Button className='w-full h-full flex items-center justify-between px-8 hover:bg-accent/5 transition'>
        {kids === '0 Kid' ? 'No Kid' : kids}
        <BsChevronDown className='text-base text-accent-hover' />
      </Menu.Button>


      <Menu.Items as='ul' className='bg-white absolute w-full flex flex-col z-50 mt-1 shadow-lg border border-[#eadfcf] max-h-60 overflow-y-auto'>
        {
          kidsList.map(({ name }, idx) =>
            <Menu.Item
              as='li'
              key={idx}
              onClick={() => setKids(name)}
              className='border-b last-of-type:border-b-0 h-12 hover:bg-accent hover:text-white w-full flex items-center justify-center cursor-pointer transition px-4'
            >
              {name === '0 Kid' ? 'No Kid' : name}
            </Menu.Item>
          )
        }
      </Menu.Items>


    </Menu>
  );
};

export default KidsDropdown;
