import { getLogoUrl } from '../utils/supabaseStorageUrls';

const Footer = () => (
  <footer className='bg-primary py-12'>
    <div className='container mx-auto text-white flex items-center gap-5 sm:justify-between flex-col sm:flex-row'>
      <a href="/">
        <img src={getLogoUrl('white')} alt="logo" className="w-[120px]" />
      </a>
      <div className="flex flex-col items-center">
        <p>Copyright &copy; {new Date().getFullYear()}, All Right Reserved,</p>
      </div>
    </div>
  </footer>
);

export default Footer;