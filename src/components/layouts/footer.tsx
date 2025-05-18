const Footer = () => {
    return (
            <div className="p-2 pt-0 mt-auto text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">© {new Date().getFullYear()}. {process.env.NEXT_PUBLIC_APP_NAME} All rights reserved.</div>
    );
};

export default Footer;
