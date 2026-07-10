import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    const { className, ...rest } = props;

    return (
        <img
            src="/Trustlink_logo.png"
            className={`${className || ''} object-contain`}
            alt="TrustGenie Logo"
            {...rest}
        />
    );
}
