import Image from 'next/image';
import Link from 'next/link';

const Logo: React.FC = () => {

  return (
    <Link href="/" className='flex items-center text-black dark:text-white text-2xl font-semibold gap-4'>
      <Image
        src="/images/logo/logo.svg"
        alt="logo"
        width={160}
        height={60}
        style={{ width: 'auto', height: 'auto' }}
        quality={110}
      />
      {/* <Image
        src="/images/logo/logo2.png"
        alt="logo"
        width={160}
        height={50}
        style={{ width: 'auto', height: 'auto' }}
        quality={100}
      /> */}
    </Link>
  );
};

export default Logo;
